package com.budgetwise.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "complaints")
public class Complaint {
    @Id
    private String id;
    private String userId;
    private String userEmail; // To send reply
    private String subject;
    private String description;
    private String status; // 'OPEN', 'RESOLVED'
    private LocalDateTime createdAt = LocalDateTime.now();
}
