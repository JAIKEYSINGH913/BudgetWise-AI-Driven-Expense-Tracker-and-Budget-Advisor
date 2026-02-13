package com.budgetwise.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDate;

@Data
@Document(collection = "expenses")
public class Expense {

    @Id
    private String id;

    private String title;
    private Double amount;
    private String category;

    private String date; // Storing as String (YYYY-MM-DD) for simplicity with frontend

    @Indexed
    private String userId; // Reference to owner

    private java.time.LocalDateTime createdAt;

    public Expense() {
        this.createdAt = java.time.LocalDateTime.now();
    }
}
