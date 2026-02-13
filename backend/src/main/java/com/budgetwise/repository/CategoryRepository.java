package com.budgetwise.repository;

import com.budgetwise.model.Category;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends MongoRepository<Category, String> {
    List<Category> findByUserId(String userId);
    Optional<Category> findByNameAndUserId(String name, String userId);
}
