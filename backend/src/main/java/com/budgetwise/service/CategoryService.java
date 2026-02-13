package com.budgetwise.service;

import com.budgetwise.model.Category;
import com.budgetwise.model.User;
import com.budgetwise.repository.CategoryRepository;
import com.budgetwise.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    private static final List<String> DEFAULT_CATEGORIES = Arrays.asList(
            "Food", "Rent", "Travel", "Shopping", "Utilities", "Health", "Education", "Entertainment");

    public List<String> getAllCategories(String username) {
        User user = userRepository.findByEmail(username)
                .or(() -> userRepository.findByUsername(username))
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Category> userCategories = categoryRepository.findByUserId(user.getId());

        // Lazy Migration: If user has NO categories, initialize defaults
        if (userCategories.isEmpty()) {
            initDefaultCategories(user);
            userCategories = categoryRepository.findByUserId(user.getId());
        }

        return userCategories.stream().map(Category::getName).collect(Collectors.toList());
    }

    public void initDefaultCategories(User user) {
        for (String catName : DEFAULT_CATEGORIES) {
            // Check to avoid duplicates if partially initialized
            if (categoryRepository.findByNameAndUserId(catName, user.getId()).isEmpty()) {
                categoryRepository.save(new Category(catName, user.getId()));
            }
        }
    }

    public void addCategory(String username, String categoryName) {
        User user = userRepository.findByEmail(username)
                .or(() -> userRepository.findByUsername(username))
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (categoryRepository.findByNameAndUserId(categoryName, user.getId()).isPresent()) {
            throw new RuntimeException("Category already exists");
        }

        Category category = new Category(categoryName, user.getId());
        categoryRepository.save(category);
    }

    public void deleteCategory(String username, String categoryName) {
        User user = userRepository.findByEmail(username)
                .or(() -> userRepository.findByUsername(username))
                .orElseThrow(() -> new RuntimeException("User not found"));

        Category category = categoryRepository.findByNameAndUserId(categoryName, user.getId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        categoryRepository.delete(category);
    }
}
