package com.budgetwise.controller;

import com.budgetwise.model.Income;
import com.budgetwise.service.IncomeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incomes")
public class IncomeController {

    @Autowired
    private IncomeService incomeService;

    @GetMapping
    public ResponseEntity<List<Income>> getIncomes(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(incomeService.getAllIncomes(userDetails.getUsername()));
    }

    @PostMapping
    public ResponseEntity<?> addIncome(@AuthenticationPrincipal UserDetails userDetails, @RequestBody Income income) {
        try {
            return ResponseEntity.ok(incomeService.addIncome(userDetails.getUsername(), income));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteIncome(@AuthenticationPrincipal UserDetails userDetails, @PathVariable String id) {
        try {
            incomeService.deleteIncome(userDetails.getUsername(), id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
