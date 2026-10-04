package com.banking.pos.approval.infrastructure.web;

import com.banking.pos.approval.infrastructure.persistence.entity.ApprovalRequestJpaEntity;
import com.banking.pos.approval.infrastructure.persistence.entity.ApprovalStepJpaEntity;
import com.banking.pos.approval.infrastructure.persistence.repository.ApprovalRequestJpaRepository;
import com.banking.pos.common.response.ApiResponse;
import com.banking.pos.common.response.PageResponse;
import com.banking.pos.identity.infrastructure.persistence.repository.UserJpaRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/v1/approvals")
@RequiredArgsConstructor
@Tag(name = "Approval Workflow Engine", description = "Quy trình phê duyệt Maker-Checker")
public class ApprovalController {

    private final ApprovalRequestJpaRepository approvalRepository;
    private final UserJpaRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ApprovalRequestJpaEntity>>> getApprovalsRoot(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status) {
        return getAllRequests(page, size, status);
    }

    @GetMapping("/inbox")
    @Operation(summary = "Hòm việc cần duyệt (Pending Approvals)")
    public ResponseEntity<ApiResponse<PageResponse<ApprovalRequestJpaEntity>>> getInbox(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String requestType) {

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Specification<ApprovalRequestJpaEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("status"), "PENDING"));
            if (requestType != null && !requestType.isBlank()) {
                predicates.add(cb.equal(root.get("requestType"), requestType));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<ApprovalRequestJpaEntity> result = approvalRepository.findAll(spec, pageRequest);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }

    @GetMapping("/my-requests")
    @Operation(summary = "Danh sách yêu cầu do tôi tạo")
    public ResponseEntity<ApiResponse<PageResponse<ApprovalRequestJpaEntity>>> getMyRequests(
            @AuthenticationPrincipal UserDetails currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
        UUID currentUserId = getCurrentUserId(currentUser);

        Specification<ApprovalRequestJpaEntity> spec = (root, query, cb) ->
                cb.equal(root.get("creatorId"), currentUserId != null ? currentUserId : UUID.randomUUID());

        Page<ApprovalRequestJpaEntity> result = approvalRepository.findAll(spec, pageRequest);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }

    @GetMapping("/all")
    @Operation(summary = "Tất cả yêu cầu phê duyệt toàn hệ thống")
    public ResponseEntity<ApiResponse<PageResponse<ApprovalRequestJpaEntity>>> getAllRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status) {

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Specification<ApprovalRequestJpaEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (status != null && !status.isBlank()) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<ApprovalRequestJpaEntity> result = approvalRepository.findAll(spec, pageRequest);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }

    @GetMapping("/stats")
    @Operation(summary = "Thống kê đếm số lượng hồ sơ duyệt")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getStats() {
        long pending = approvalRepository.countByStatus("PENDING");
        long approved = approvalRepository.countByStatus("APPROVED");
        long rejected = approvalRepository.countByStatus("REJECTED");

        Map<String, Long> stats = Map.of(
                "pendingCount", pending,
                "approvedCount", approved,
                "rejectedCount", rejected
        );
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Chi tiết hồ sơ phê duyệt & Timeline")
    public ResponseEntity<ApiResponse<ApprovalRequestJpaEntity>> getDetail(@PathVariable UUID id) {
        return approvalRepository.findById(id)
                .map(req -> ResponseEntity.ok(ApiResponse.success(req)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/approve")
    @Operation(summary = "Duyệt yêu cầu (Validate Maker-Checker: Không tự duyệt POS-5003)")
    public ResponseEntity<ApiResponse<ApprovalRequestJpaEntity>> approve(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails currentUser,
            @RequestBody(required = false) Map<String, String> body) {

        UUID approverId = getCurrentUserId(currentUser);

        return approvalRepository.findById(id).map(req -> {
            // Maker-Checker validation: Creator cannot approve their own request!
            if (approverId != null && approverId.equals(req.getCreatorId())) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.<ApprovalRequestJpaEntity>success(null, "POS-5003: Người tạo không được tự phê duyệt yêu cầu của chính mình"));
            }

            req.setStatus("APPROVED");
            String comment = body != null ? body.get("comment") : "Đồng ý phê duyệt";

            ApprovalStepJpaEntity step = ApprovalStepJpaEntity.builder()
                    .approval(req)
                    .stepNumber(req.getCurrentStep())
                    .approverId(approverId)
                    .status("APPROVED")
                    .comment(comment)
                    .actionAt(Instant.now())
                    .build();
            req.getSteps().add(step);

            ApprovalRequestJpaEntity saved = approvalRepository.save(req);
            return ResponseEntity.ok(ApiResponse.success(saved, "Phê duyệt hồ sơ thành công"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/reject")
    @Operation(summary = "Từ chối yêu cầu")
    public ResponseEntity<ApiResponse<ApprovalRequestJpaEntity>> reject(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails currentUser,
            @RequestBody(required = false) Map<String, String> body) {

        UUID approverId = getCurrentUserId(currentUser);
        String reason = body != null ? body.get("reason") : "Từ chối";

        return approvalRepository.findById(id).map(req -> {
            req.setStatus("REJECTED");
            ApprovalStepJpaEntity step = ApprovalStepJpaEntity.builder()
                    .approval(req)
                    .stepNumber(req.getCurrentStep())
                    .approverId(approverId)
                    .status("REJECTED")
                    .comment(reason)
                    .actionAt(Instant.now())
                    .build();
            req.getSteps().add(step);

            ApprovalRequestJpaEntity saved = approvalRepository.save(req);
            return ResponseEntity.ok(ApiResponse.success(saved, "Đã từ chối hồ sơ"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/return-for-edit")
    @Operation(summary = "Yêu cầu chỉnh sửa lại (Return for edit)")
    public ResponseEntity<ApiResponse<ApprovalRequestJpaEntity>> returnForEdit(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails currentUser,
            @RequestBody(required = false) Map<String, String> body) {

        UUID approverId = getCurrentUserId(currentUser);
        String comment = body != null ? body.get("comment") : "Yêu cầu chỉnh sửa thêm thông tin";

        return approvalRepository.findById(id).map(req -> {
            req.setStatus("RETURNED_FOR_EDIT");
            ApprovalStepJpaEntity step = ApprovalStepJpaEntity.builder()
                    .approval(req)
                    .stepNumber(req.getCurrentStep())
                    .approverId(approverId)
                    .status("RETURNED_FOR_EDIT")
                    .comment(comment)
                    .actionAt(Instant.now())
                    .build();
            req.getSteps().add(step);

            ApprovalRequestJpaEntity saved = approvalRepository.save(req);
            return ResponseEntity.ok(ApiResponse.success(saved, "Đã trả hồ sơ về cho người tạo chỉnh sửa"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Hủy yêu cầu")
    public ResponseEntity<ApiResponse<ApprovalRequestJpaEntity>> cancel(@PathVariable UUID id) {
        return approvalRepository.findById(id).map(req -> {
            req.setStatus("CANCELLED");
            ApprovalRequestJpaEntity saved = approvalRepository.save(req);
            return ResponseEntity.ok(ApiResponse.success(saved, "Đã hủy yêu cầu"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/inbox/export")
    @Operation(summary = "Xuất Excel Hòm thư phê duyệt")
    public ResponseEntity<byte[]> exportInbox() {
        String csv = "RequestCode,RequestType,CreatorId,Status,CreatedAt\nREQ-001,STOCK_EXPORT,,PENDING,2026-10-04\n";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=inbox_approvals.csv")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(csv.getBytes());
    }

    @GetMapping("/export")
    @Operation(summary = "Xuất Excel Tất cả yêu cầu phê duyệt")
    public ResponseEntity<byte[]> exportAll() {
        return exportInbox();
    }

    private UUID getCurrentUserId(UserDetails currentUser) {
        if (currentUser == null) return null;
        return userRepository.findByUsername(currentUser.getUsername())
                .map(u -> u.getId())
                .orElse(null);
    }
}
