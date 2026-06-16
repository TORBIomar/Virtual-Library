package com.smartlibrary.dto;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReadingProgressResponse {

    private UUID id;
    private UUID userId;
    private String username;
    private UUID bookId;
    private String bookTitle;
    private Integer currentPage;
    private Integer totalPages;
    private Double progressPercentage;
}
