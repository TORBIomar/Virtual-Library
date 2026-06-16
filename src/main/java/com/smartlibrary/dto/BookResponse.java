package com.smartlibrary.dto;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookResponse {

    private UUID id;
    private String title;
    private String author;
    private String summary;
    private String category;
    private String filePath;
    private String coverImageUrl;
}
