package com.budgetwise.controller;

import com.budgetwise.model.Expense;
import com.budgetwise.service.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    @Autowired
    private ExpenseService expenseService;

    @GetMapping
    public ResponseEntity<List<Expense>> getExpenses(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(expenseService.getAllExpenses(userDetails.getUsername()));
    }

    @PostMapping
    public ResponseEntity<?> addExpense(@AuthenticationPrincipal UserDetails userDetails, @RequestBody Expense expense) {
        try {
            return ResponseEntity.ok(expenseService.addExpense(userDetails.getUsername(), expense));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateExpense(@AuthenticationPrincipal UserDetails userDetails, @PathVariable String id, @RequestBody Expense expense) {
        try {
            return ResponseEntity.ok(expenseService.updateExpense(userDetails.getUsername(), id, expense));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteExpense(@AuthenticationPrincipal UserDetails userDetails, @PathVariable String id) {
        try {
            expenseService.deleteExpense(userDetails.getUsername(), id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
