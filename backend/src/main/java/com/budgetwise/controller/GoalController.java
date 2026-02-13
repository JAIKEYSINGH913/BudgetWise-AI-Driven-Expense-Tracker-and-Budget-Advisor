package com.budgetwise.controller;

import com.budgetwise.model.Goal;
import com.budgetwise.service.GoalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goals")
public class GoalController {

    @Autowired
    private GoalService goalService;

    @GetMapping
    public ResponseEntity<List<Goal>> getGoals(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(goalService.getAllGoals(userDetails.getUsername()));
    }

    @PostMapping
    public ResponseEntity<?> addGoal(@AuthenticationPrincipal UserDetails userDetails, @RequestBody Goal goal) {
        try {
            return ResponseEntity.ok(goalService.addGoal(userDetails.getUsername(), goal));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateGoal(@AuthenticationPrincipal UserDetails userDetails, @PathVariable String id, @RequestBody Goal goal) {
         try {
             return ResponseEntity.ok(goalService.updateGoal(userDetails.getUsername(), id, goal));
         } catch (Exception e) {
             return ResponseEntity.badRequest().body(e.getMessage());
         }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteGoal(@AuthenticationPrincipal UserDetails userDetails, @PathVariable String id) {
        try {
            goalService.deleteGoal(userDetails.getUsername(), id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
