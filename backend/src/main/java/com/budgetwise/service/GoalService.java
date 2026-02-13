package com.budgetwise.service;

import com.budgetwise.model.Goal;
import com.budgetwise.model.User;
import com.budgetwise.repository.GoalRepository;
import com.budgetwise.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GoalService {

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private UserRepository userRepository;

    private User getUser(String username) {
        return userRepository.findByEmail(username)
                .or(() -> userRepository.findByUsername(username))
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<Goal> getAllGoals(String username) {
        User user = getUser(username);
        return goalRepository.findByUserId(user.getId());
    }

    public Goal addGoal(String username, Goal goal) {
        User user = getUser(username);
        goal.setUserId(user.getId());
        goal.setId(null);
        return goalRepository.save(goal);
    }

    public Goal updateGoal(String username, String goalId, Goal goalDetails) {
        User user = getUser(username);
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Goal not found"));

        if (!goal.getUserId().equals(user.getId())) {
             throw new RuntimeException("Unauthorized to update this goal");
        }
        
        goal.setTitle(goalDetails.getTitle());
        goal.setTargetAmount(goalDetails.getTargetAmount());
        goal.setCurrentAmount(goalDetails.getCurrentAmount());
        goal.setDeadline(goalDetails.getDeadline());

        return goalRepository.save(goal);
    }

    public void deleteGoal(String username, String goalId) {
        User user = getUser(username);
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Goal not found"));

        if (!goal.getUserId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to delete this goal");
        }

        goalRepository.delete(goal);
    }
}
