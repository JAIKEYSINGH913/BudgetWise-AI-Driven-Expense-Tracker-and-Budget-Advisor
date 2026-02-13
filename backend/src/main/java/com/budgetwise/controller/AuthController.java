package com.budgetwise.controller;

import com.budgetwise.dto.AuthDto;
import com.budgetwise.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping(value = "/signup", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    public ResponseEntity<AuthDto.AuthResponse> signup(
            @RequestPart("name") String name,
            @RequestPart("email") String email,
            @RequestPart("username") String username,
            @RequestPart("password") String password,
            @RequestPart(value = "mobile", required = false) String mobile,
            @RequestPart(value = "profileImage", required = false) MultipartFile profileImage
    ) {
        AuthDto.SignupRequest request = new AuthDto.SignupRequest();
        request.setName(name);
        request.setEmail(email);
        request.setUsername(username);
        request.setPassword(password);
        request.setMobile(mobile);

        AuthDto.AuthResponse response = userService.signup(request, profileImage);
        return ResponseEntity.status(response.isSuccess() ? 201 : 409).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthDto.AuthResponse> login(@RequestBody AuthDto.LoginRequest request) {
        AuthDto.AuthResponse response = userService.login(request);
        // If message contains "not verified", stick to 403, otherwise 200 or 401
        int status = response.isSuccess() ? 200 : (response.getMessage().contains("verified") ? 403 : 401);
        return ResponseEntity.status(status).body(response);
    }
    
    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@RequestParam String email) {
        try {
            userService.resendOtp(email);
            return ResponseEntity.ok(Map.of("success", true, "message", "OTP resent successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
    
    // Pass-through for verify-otp if not authenticated yet (e.g. signup flow)
    // Pass-through for verify-otp if not authenticated yet (e.g. signup flow)
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> payload) {
         String identifier = payload.get("identifier"); // email or mobile
         String otp = payload.get("otp");
         boolean verified = userService.verifyOtp(identifier, otp);
         if (verified) {
             return ResponseEntity.ok(Map.of("success", true, "message", "Verified successfully"));
         }
         return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Invalid or expired OTP"));
    }
    
    // --- Forgot Password Endpoints ---
    
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> payload) {
        String identifier = payload.get("identifier");
        try {
            userService.sendForgotPasswordOtp(identifier);
            return ResponseEntity.ok(Map.of("success", true, "message", "OTP sent successfully"));
        } catch (Exception e) {
            // Security: Don't reveal if user exists? User asked for "Invalid User" toast.
            // Returning specific error message for UX as requested.
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
    
    @PostMapping("/verify-reset-otp")
    public ResponseEntity<?> verifyResetOtp(@RequestBody Map<String, String> payload) {
        String identifier = payload.get("identifier");
        String otp = payload.get("otp");
        try {
            String token = userService.verifyResetOtp(identifier, otp);
            return ResponseEntity.ok(Map.of("success", true, "message", "OTP Verified", "token", token));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
    
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> payload) {
        String token = payload.get("token");
        String newPassword = payload.get("newPassword");
        try {
            userService.resetPasswordWithToken(token, newPassword);
            return ResponseEntity.ok(Map.of("success", true, "message", "Password reset successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
