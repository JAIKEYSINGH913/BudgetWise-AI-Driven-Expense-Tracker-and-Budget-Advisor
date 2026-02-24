package com.budgetwise.controller;

import com.budgetwise.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class TestMailController {

    @Autowired
    private EmailService emailService;

    @GetMapping("/test-mail")
    public Map<String, Object> testMail(@RequestParam String to) {
        Map<String, Object> result = new HashMap<>();
        try {
            emailService.sendSimpleEmail(to, "Test Subject", "Test Body");
            result.put("success", true);
            result.put("message",
                    "Triggered sendSimpleEmail without exceptions in controller. Check console logs for async failures.");
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            result.put("stackTrace", sw.toString());
        }
        return result;
    }
}
