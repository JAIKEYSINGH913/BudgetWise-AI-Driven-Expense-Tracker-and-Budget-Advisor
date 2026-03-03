package com.budgetwise.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.boot.web.client.RestTemplateBuilder;
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

    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=";

    private final RestTemplate restTemplate;

    public AIService(RestTemplateBuilder restTemplateBuilder) {
        this.restTemplate = restTemplateBuilder
                .setConnectTimeout(java.time.Duration.ofSeconds(10))
                .setReadTimeout(java.time.Duration.ofSeconds(60)) // Give Gemini 60 seconds to respond
                .build();
    }

    public String scanReceiptFromBase64(String base64Image, String mimeType) {
        if (apiKey == null || apiKey.isEmpty()) {
            return "{\"error\": \"AI Service not configured\"}";
        }
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            String prompt = "Analyze this receipt image and extract the expense details. Return ONLY a valid JSON object with these exact keys: "
                    +
                    "{\"title\": \"<merchant or item name>\", \"amount\": <number>, \"category\": \"<one of: Food, Travel, Shopping, Utilities, Health, Education, Entertainment, Rent, General>\", \"date\": \"<YYYY-MM-DD format>\"}. "
                    +
                    "If any field cannot be determined, use sensible defaults: title='Receipt Expense', amount=0, category='General', date=today's date. "
                    +
                    "Do NOT include any explanation, markdown, or additional text. Only output the raw JSON.";

            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text", prompt);

            Map<String, Object> imageData = new HashMap<>();
            imageData.put("mime_type", mimeType);
            imageData.put("data", base64Image);

            Map<String, Object> inlineData = new HashMap<>();
            inlineData.put("inline_data", imageData);

            List<Map<String, Object>> parts = new ArrayList<>();
            parts.add(textPart);
            parts.add(inlineData);

            Map<String, Object> content = new HashMap<>();
            content.put("parts", parts);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", Collections.singletonList(content));

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
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
                                List<?> responseParts = (List<?>) responseContent.get("parts");
                                if (responseParts != null && !responseParts.isEmpty()) {
                                    Map<?, ?> firstPart = (Map<?, ?>) responseParts.get(0);
                                    String text = (String) firstPart.get("text");
                                    // Strip any accidental markdown code fences
                                    text = text.trim().replaceAll("^```json\\s*", "").replaceAll("^```\\s*", "")
                                            .replaceAll("```\\s*$", "").trim();
                                    return text;
                                }
                            }
                        }
                    }
                }
            }
            return "{\"error\": \"Could not parse receipt\"}";
        } catch (Exception e) {
            e.printStackTrace();
            return "{\"error\": \"" + e.getMessage().replace("\"", "'") + "\"}";
        }
    }

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
