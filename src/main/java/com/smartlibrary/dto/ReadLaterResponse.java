package com.smartlibrary.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReadLaterResponse {

    private UUID id;
    private UUID userId;
    private String username;
    private UUID bookId;
    private String bookTitle;
    private String bookAuthor;
    private String bookCoverImageUrl;
    private LocalDateTime addedAt;
}
