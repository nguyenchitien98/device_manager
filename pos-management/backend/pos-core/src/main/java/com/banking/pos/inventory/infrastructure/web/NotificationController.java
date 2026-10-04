package com.banking.pos.inventory.infrastructure.web;

import com.banking.pos.common.response.ApiResponse;
import com.banking.pos.common.response.PageResponse;
import com.banking.pos.inventory.infrastructure.persistence.entity.NotificationJpaEntity;
import com.banking.pos.inventory.infrastructure.persistence.repository.NotificationJpaRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationJpaRepository notificationRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<NotificationJpaEntity>>> getNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<NotificationJpaEntity> resultPage = notificationRepository.findAll(
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        );

        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(resultPage)));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount() {
        long count = notificationRepository.countByIsReadFalse();
        return ResponseEntity.ok(ApiResponse.success(Map.of("unreadCount", count)));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable UUID id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
        return ResponseEntity.ok(ApiResponse.success("Đã đánh dấu thông báo là đã đọc"));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
        List<NotificationJpaEntity> unreadList = notificationRepository.findAll()
                .stream().filter(n -> !n.isRead()).toList();

        unreadList.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unreadList);

        return ResponseEntity.ok(ApiResponse.success("Đã đánh dấu tất cả thông báo là đã đọc"));
    }
}
