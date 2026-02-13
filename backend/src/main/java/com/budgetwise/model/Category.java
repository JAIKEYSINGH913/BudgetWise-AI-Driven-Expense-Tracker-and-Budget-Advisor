package com.budgetwise.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

@Data
@Document(collection = "categories")
public class Category {

    @Id
    private String id; // MongoDB ID

    private String name;

    @Indexed
    private String userId; // Reference to the user who owns this category

    // Default constructor
    public Category() {}

    public Category(String name, String userId) {
        this.name = name;
        this.userId = userId;
    }
}
