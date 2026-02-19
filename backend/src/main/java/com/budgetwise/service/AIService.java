package com.budgetwise.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;
import java.util.Collections;

@Service
public class AIService {

    @Value("${openai.api.key}")
    private String apiKey;

    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=";

    private final RestTemplate restTemplate = new RestTemplate();

    public String getChatResponse(String userMessage) {
        if (apiKey == null || apiKey.isEmpty() || apiKey.equals("your-api-key-here")) {
            return "AI Service is not configured. Please set a valid API key in application.properties.";
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Strict Context for BudgetWise
            String systemContext = "You are the AI assistant for 'BudgetWise', a personal finance application. " +
                    "Your role is to help users with tracking expenses, setting budgets, and financial advice related to the app. "
                    +
                    "If a user asks about anything unrelated to finance, budgeting, or this application, politely refuse to answer. "
                    +
                    "Keep answers concise and helpful.\n\nUser Question: ";

            // Construct Gemini Request Body
            Map<String, Object> requestBody = new HashMap<>();

            Map<String, Object> part = new HashMap<>();
            part.put("text", systemContext + userMessage);

            Map<String, Object> content = new HashMap<>();
            content.put("parts", Collections.singletonList(part));

            requestBody.put("contents", Collections.singletonList(content));

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            // Use the API key in the URL query parameter for Gemini
            String url = GEMINI_API_URL + apiKey;

            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<?, ?> body = response.getBody();
                if (body.containsKey("candidates")) {
                    List<?> candidates = (List<?>) body.get("candidates");
                    if (candidates != null && !candidates.isEmpty()) {
                        Map<?, ?> candidate = (Map<?, ?>) candidates.get(0);
                        if (candidate.containsKey("content")) {
                            Map<?, ?> responseContent = (Map<?, ?>) candidate.get("content");
                            if (responseContent.containsKey("parts")) {
                                List<?> parts = (List<?>) responseContent.get("parts");
                                if (parts != null && !parts.isEmpty()) {
                                    Map<?, ?> firstPart = (Map<?, ?>) parts.get(0);
                                    return (String) firstPart.get("text");
                                }
                            }
                        }
                    }
                }
            }
            return "No response from AI provider.";

        } catch (Exception e) {
            e.printStackTrace();
            return "Error communicating with AI service: " + e.getMessage();
        }
    }
}
