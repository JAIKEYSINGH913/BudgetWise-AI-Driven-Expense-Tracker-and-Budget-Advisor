package com.budgetwise.controller;

import com.budgetwise.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<String>> getCategories(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(categoryService.getAllCategories(userDetails.getUsername()));
    }

    @PostMapping("/add")
    public ResponseEntity<?> addCategory(@AuthenticationPrincipal UserDetails userDetails, @RequestBody Map<String, String> body) {
        try {
            categoryService.addCategory(userDetails.getUsername(), body.get("name"));
            return ResponseEntity.ok(Map.of("success", true, "message", "Category added"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteCategory(@AuthenticationPrincipal UserDetails userDetails, @RequestParam String name) {
        try {
            categoryService.deleteCategory(userDetails.getUsername(), name);
            return ResponseEntity.ok(Map.of("success", true, "message", "Category deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
