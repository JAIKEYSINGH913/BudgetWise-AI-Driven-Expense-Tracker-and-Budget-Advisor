package com.budgetwise.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EmailService {

    @Value("${resend.api.key}")
    private String resendApiKey;

    @Value("${resend.from.email}")
    private String fromEmail;

    private final String RESEND_API_URL = "https://api.resend.com/emails";
    private final RestTemplate restTemplate = new RestTemplate();

    public void sendOtpEmail(String toEmail, String otp) {
        String subject = "BudgetWise Verification OTP";
        String body = "Your OTP for BudgetWise verification is: " + otp + "\n\nThis OTP is valid for 5 minutes.";
        sendResendEmail(toEmail, subject, body);
    }

    public void sendSimpleEmail(String toEmail, String subject, String body) {
        sendResendEmail(toEmail, subject, body);
    }

    private void sendResendEmail(String toEmail, String subject, String body) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(resendApiKey);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("from", fromEmail);
            requestBody.put("to", List.of(toEmail));
            requestBody.put("subject", subject);
            requestBody.put("text", body);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(RESEND_API_URL, request, String.class);

            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException("HTTP Server returned error: " + response.getStatusCode());
            }

        } catch (Exception e) {
            System.err.println("Failed to send HTTP email to " + toEmail + ": " + e.getMessage());
            throw new RuntimeException("Email delivery failed: " + e.getMessage(), e);
        }
    }
}
