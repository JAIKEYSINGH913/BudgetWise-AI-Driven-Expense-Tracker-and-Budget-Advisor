package com.budgetwise.controller;

import com.budgetwise.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
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
public class MailDiagnosticController {

    @Autowired
    private JavaMailSender mailSender;

    @GetMapping("/test-mail")
    public Map<String, Object> testMail(@RequestParam String to) {
        Map<String, Object> result = new HashMap<>();
        result.put("status", "testing");
        result.put("recipient", to);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("BudgetWise SMTP Diagnostic Test");
        message.setText("If you see this, your SMTP configuration on Render is working correctly.");

        try {
            System.out.println("DIAGNOSTIC: Attempting to send test email to " + to);
            mailSender.send(message);
            result.put("success", true);
            result.put("message", "Email sent successfully! Check your inbox.");
        } catch (Exception e) {
            System.err.println("DIAGNOSTIC FAILED for " + to);
            result.put("success", false);
            result.put("error", e.getMessage());

            // Return full stack trace for deep debugging
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            result.put("stackTrace", sw.toString());
        }

        return result;
    }
}
