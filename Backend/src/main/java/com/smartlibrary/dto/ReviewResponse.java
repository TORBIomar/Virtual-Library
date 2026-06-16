package com.smartlibrary.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewResponse {

    private UUID id;
    private UUID userId;
    private String username;
    private UUID bookId;
    private String bookTitle;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}
