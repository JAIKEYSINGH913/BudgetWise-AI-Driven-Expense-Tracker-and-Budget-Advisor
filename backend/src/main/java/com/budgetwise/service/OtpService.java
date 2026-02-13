package com.budgetwise.service;

import com.budgetwise.model.Otp;
import com.budgetwise.repository.OtpRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class OtpService {

    @Autowired
    private OtpRepository otpRepository;

    @Autowired
    private EmailService emailService;

    private static final SecureRandom random = new SecureRandom();

    public String generateOtp(String identifier, boolean isEmail) {
        // Generate 6-digit OTP
        int otpValue = 100000 + random.nextInt(900000);
        String otpCode = String.valueOf(otpValue);

        // Delete existing OTP for this identifier if any
        otpRepository.deleteByIdentifier(identifier);

        // Save new OTP
        Otp otp = new Otp();
        otp.setIdentifier(identifier);
        otp.setOtpCode(otpCode);
        otp.setExpiryDate(LocalDateTime.now().plusMinutes(5));
        otpRepository.save(otp);

        // Send OTP
        System.out.println("-------------------------------------------------");
        System.out.println("DEBUG OTP for " + identifier + ": " + otpCode);
        System.out.println("-------------------------------------------------");

        if (isEmail) {
            emailService.sendOtpEmail(identifier, otpCode);
        } else {
            // Mock SMS sending
            System.out.println("MOCK SMS: Sending OTP " + otpCode + " to mobile " + identifier);
        }

        return otpCode;
    }

    public boolean verifyOtp(String identifier, String otpCode) {
        Optional<Otp> otpOptional = otpRepository.findByIdentifier(identifier);

        if (otpOptional.isPresent()) {
            Otp otp = otpOptional.get();
            if (otp.getOtpCode().equals(otpCode) && !otp.isExpired()) {
                otpRepository.delete(otp); // Consume OTP
                return true;
            }
        }
        return false;
    }
}
