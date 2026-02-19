package com.budgetwise.service;

import com.budgetwise.model.Complaint;
import com.budgetwise.repository.ComplaintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ComplaintService {

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private EmailService emailService;

    @Value("${spring.mail.username}")
    private String adminEmail; // Sending to self/admin

    public Complaint createComplaint(String userId, String userEmail, String subject, String description) {
        Complaint complaint = new Complaint();
        complaint.setUserId(userId);
        complaint.setUserEmail(userEmail);
        complaint.setSubject(subject);
        complaint.setDescription(description);
        complaint.setStatus("OPEN");
        complaint.setCreatedAt(LocalDateTime.now());

        Complaint savedComplaint = complaintRepository.save(complaint);

        // Notify Admin
        String adminSubject = "New CRM Complaint: " + subject;
        String adminBody = "User: " + userEmail + "\nID: " + userId + "\n\nDescription:\n" + description;
        emailService.sendSimpleEmail(adminEmail, adminSubject, adminBody);

        // Notify User
        String userSubject = "Complaint Received: " + subject;
        String userBody = "Dear User,\n\nWe have received your complaint regarding '" + subject + "'.\n" +
                "Our team will review it and get back to you shortly.\n\nTicket ID: " + savedComplaint.getId();
        emailService.sendSimpleEmail(userEmail, userSubject, userBody);

        return savedComplaint;
    }

    public List<Complaint> getUserComplaints(String userId) {
        return complaintRepository.findByUserId(userId);
    }
}
