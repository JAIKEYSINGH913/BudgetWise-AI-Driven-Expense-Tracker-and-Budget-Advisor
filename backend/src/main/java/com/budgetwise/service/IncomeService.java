package com.budgetwise.service;

import com.budgetwise.model.Income;
import com.budgetwise.model.User;
import com.budgetwise.repository.IncomeRepository;
import com.budgetwise.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class IncomeService {

    @Autowired
    private IncomeRepository incomeRepository;

    @Autowired
    private UserRepository userRepository;

    private User getUser(String username) {
        return userRepository.findByEmail(username)
                .or(() -> userRepository.findByUsername(username))
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<Income> getAllIncomes(String username) {
        User user = getUser(username);
        return incomeRepository.findByUserId(user.getId());
    }

    public Income addIncome(String username, Income income) {
        User user = getUser(username);
        income.setUserId(user.getId());
        income.setId(null);
        return incomeRepository.save(income);
    }

    public void deleteIncome(String username, String incomeId) {
        User user = getUser(username);
        Income income = incomeRepository.findById(incomeId)
                .orElseThrow(() -> new RuntimeException("Income not found"));

        if (!income.getUserId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to delete this income");
        }

        incomeRepository.delete(income);
    }
}
