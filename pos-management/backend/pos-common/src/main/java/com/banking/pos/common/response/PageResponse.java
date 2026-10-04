package com.banking.pos.common.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.function.Function;

/**
 * Wrapper chuẩn cho phân trang khớp 1-1 với PageResponse interface của Angular Frontend.
 *
 * <p>Format chuẩn:
 * <pre>
 * {
 *   "content": [...],
 *   "pageNumber": 0,
 *   "pageSize": 10,
 *   "totalElements": 100,
 *   "totalPages": 10,
 *   "first": true,
 *   "last": false
 * }
 * </pre>
 *
 * @param <T> Kiểu dữ liệu của phần tử trong danh sách
 * @author POS Management Team
 * @since 1.0.0
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PageResponse<T> {

    private List<T> content;
    private int pageNumber;
    private int pageSize;
    private long totalElements;
    private int totalPages;
    private boolean first;
    private boolean last;

    public static <T> PageResponse<T> from(Page<T> page) {
        return PageResponse.<T>builder()
                .content(page.getContent())
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }

    public static <S, T> PageResponse<T> from(Page<S> page, List<T> content) {
        return PageResponse.<T>builder()
                .content(content)
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }

    public static <S, T> PageResponse<T> map(Page<S> page, Function<S, T> mapper) {
        List<T> mappedContent = page.getContent().stream().map(mapper).toList();
        return from(page, mappedContent);
    }
}
