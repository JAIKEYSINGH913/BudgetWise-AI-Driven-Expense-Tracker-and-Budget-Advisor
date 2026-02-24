package com.budgetwise.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Async
    public void sendOtpEmail(String toEmail, String otp) {
        System.out.println("DEBUG: Entering sendOtpEmail for " + toEmail);
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("BudgetWise Verification OTP");
        message.setText("Your OTP for BudgetWise verification is: " + otp + "\n\nThis OTP is valid for 5 minutes.");

        try {
            System.out.println("DEBUG: Attempting to send email to " + toEmail + " from " + fromEmail);
            mailSender.send(message);
            System.out.println("DEBUG: Email sent successfully to " + toEmail);
        } catch (Exception e) {
            System.err.println("Failed to send email to " + toEmail + ": " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Async
    public void sendSimpleEmail(String toEmail, String subject, String body) {
        System.out.println("DEBUG: Entering sendSimpleEmail for " + toEmail);
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject(subject);
        message.setText(body);

        try {
            System.out.println("DEBUG: Attempting to send simple email to " + toEmail + " from " + fromEmail);
            mailSender.send(message);
            System.out.println("DEBUG: Simple email sent successfully to " + toEmail);
        } catch (Exception e) {
            System.err.println("Failed to send email to " + toEmail + ": " + e.getMessage());
            e.printStackTrace();
        }
    }
}
