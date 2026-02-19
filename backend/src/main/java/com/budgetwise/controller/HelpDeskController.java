package com.budgetwise.controller;

import com.budgetwise.model.Complaint;
import com.budgetwise.service.AIService;
import com.budgetwise.service.ComplaintService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.budgetwise.model.User; // Assuming User model exists to get email if needed, or extract from token
// If strict user fetching is needed, might need UserService. keeping simple for now.

import java.util.Map;
import java.util.HashMap;
import java.util.List;

@RestController
@RequestMapping("/api/helpdesk")
@CrossOrigin(origins = "*")
public class HelpDeskController {

    @Autowired
    private AIService aiService;

    @Autowired
    private ComplaintService complaintService;

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, String> request) {
        String userMessage = request.get("message");
        String aiResponse = aiService.getChatResponse(userMessage);

        Map<String, String> response = new HashMap<>();
        response.put("response", aiResponse);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/complaint")
    public ResponseEntity<Complaint> submitComplaint(@RequestBody Map<String, String> request) {
        // In a real app, extract userId from SecurityContext
        // For now, assuming frontend sends it or we extract from token
        // Let's assume we can get it from the token context if Authentication is
        // working
        // Or passed in body for simplicity if auth setup varies

        String userId = request.get("userId"); // Or get from principal
        String email = request.get("email");
        String subject = request.get("subject");
        String description = request.get("description");

        Complaint complaint = complaintService.createComplaint(userId, email, subject, description);
        return ResponseEntity.ok(complaint);
    }

    @GetMapping("/complaints/{userId}")
    public ResponseEntity<List<Complaint>> getHistory(@PathVariable String userId) {
        return ResponseEntity.ok(complaintService.getUserComplaints(userId));
    }
}
