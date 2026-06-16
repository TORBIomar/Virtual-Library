package com.smartlibrary.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReadingProgressRequest {

    @NotNull(message = "User ID is required")
    private UUID userId;

    @NotNull(message = "Book ID is required")
    private UUID bookId;

    @NotNull(message = "Current page is required")
    @Min(value = 0, message = "Current page must be 0 or greater")
    private Integer currentPage;

    @NotNull(message = "Total pages is required")
    @Min(value = 1, message = "Total pages must be at least 1")
    private Integer totalPages;
}
