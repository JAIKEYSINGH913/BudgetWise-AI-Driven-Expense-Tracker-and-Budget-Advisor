package com.budgetwise.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Document(collection = "goals")
public class Goal {

    @Id
    private String id;

    private String title;
    private Double targetAmount;
    private Double currentAmount; // To track progress
    private String deadline; // YYYY-MM-DD

    @Indexed
    private String userId;

    private LocalDateTime createdAt;

    public Goal() {
        this.createdAt = LocalDateTime.now();
        this.currentAmount = 0.0; // Default to 0 start
    }
}
