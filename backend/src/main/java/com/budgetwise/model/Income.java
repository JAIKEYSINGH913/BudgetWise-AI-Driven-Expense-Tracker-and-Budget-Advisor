package com.budgetwise.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;

@Data
@Document(collection = "incomes")
public class Income {

    @Id
    private String id;

    private String source; // e.g. Salary, Freelance
    private Double amount;
    private String date; // YYYY-MM-DD

    @Indexed
    private String userId;

    private LocalDateTime createdAt;

    public Income() {
        this.createdAt = LocalDateTime.now();
    }
}
