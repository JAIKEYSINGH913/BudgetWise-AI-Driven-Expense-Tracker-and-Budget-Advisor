package com.budgetwise.service;

import com.budgetwise.model.Expense;
import com.budgetwise.model.User;
import com.budgetwise.repository.ExpenseRepository;
import com.budgetwise.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ExpenseService {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private UserRepository userRepository;

    private User getUser(String username) {
        return userRepository.findByEmail(username)
                .or(() -> userRepository.findByUsername(username))
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<Expense> getAllExpenses(String username) {
        User user = getUser(username);
        return expenseRepository.findByUserId(user.getId());
    }

    public Expense addExpense(String username, Expense expense) {
        User user = getUser(username);
        expense.setUserId(user.getId());
        // Ensure ID is null so Mongo generates it, unless needed otherwise
        expense.setId(null); 
        return expenseRepository.save(expense);
    }

    public Expense updateExpense(String username, String expenseId, Expense expenseDetails) {
        User user = getUser(username);
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        if (!expense.getUserId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to update this expense");
        }

        expense.setTitle(expenseDetails.getTitle());
        expense.setAmount(expenseDetails.getAmount());
        expense.setCategory(expenseDetails.getCategory());
        expense.setDate(expenseDetails.getDate());
        
        return expenseRepository.save(expense);
    }

    public void deleteExpense(String username, String expenseId) {
        User user = getUser(username);
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        if (!expense.getUserId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to delete this expense");
        }

        expenseRepository.delete(expense);
    }
}
