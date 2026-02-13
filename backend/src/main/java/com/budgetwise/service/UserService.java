package com.budgetwise.service;

import com.budgetwise.dto.AuthDto;
import com.budgetwise.dto.ProfileDto;
import com.budgetwise.model.User;
import com.budgetwise.repository.UserRepository;
import com.budgetwise.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private OtpService otpService;

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private EmailService emailService;

    @Value("${file.upload-dir}")
    private String uploadDir;

    // --- Authentication ---

    public AuthDto.AuthResponse signup(AuthDto.SignupRequest request, MultipartFile profileImage) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return new AuthDto.AuthResponse(false, "Email already in use", null, null);
        }
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return new AuthDto.AuthResponse(false, "Username already in use", null, null);
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setMobile(request.getMobile());
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        user.setEmailVerified(false); // Default false

        // Handle Profile Image
        if (profileImage != null && !profileImage.isEmpty()) {
            try {
                String fileName = UUID.randomUUID().toString() + "_" + profileImage.getOriginalFilename();
                Path path = Paths.get(uploadDir + java.io.File.separator + fileName);
                Files.createDirectories(path.getParent());
                Files.copy(profileImage.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
                user.setProfileImage("uploads/" + fileName);
            } catch (IOException e) {
                e.printStackTrace(); // Log error
            }
        }

        userRepository.save(user);

        // Initialize Default Categories
        categoryService.initDefaultCategories(user);

        // TRIGGER OTP IMMEDIATELY
        otpService.generateOtp(user.getEmail(), true);

        // Return Pending Verification Status
        AuthDto.UserDto userDto = mapToUserDto(user);
        return new AuthDto.AuthResponse(true, "Signup successful. Please verify your email.", null, userDto);
    }

    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        // Find by Email or Username
        Optional<User> userOpt = userRepository.findByEmail(request.getIdentifier());
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByUsername(request.getIdentifier());
        }

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (passwordEncoder.matches(request.getPassword(), user.getPassword())) {

                // ALLOW login even if unverified (Frontend will handle restriction)
                // if (!user.isEmailVerified()) { ... }

                String token = jwtUtil.generateToken(user.getEmail());
                return new AuthDto.AuthResponse(true, "Login successful", token, mapToUserDto(user));
            }
        }

        return new AuthDto.AuthResponse(false, "Invalid credentials", null, null);
    }

    // --- Profile Management ---

    public ProfileDto.ProfileResponse getProfile(String username) {
        User user = getUser(username);
        return new ProfileDto.ProfileResponse(true, "Profile loaded", mapToUserProfile(user));
    }

    public ProfileDto.ProfileResponse updateProfile(String username, ProfileDto.UpdateProfileRequest request,
            MultipartFile profileImage, MultipartFile backgroundImage) {
        User user = getUser(username);
        if (request.getName() != null && !request.getName().isEmpty()) {
            user.setName(request.getName());
        }

        // Handle Email Update
        if (request.getEmail() != null && !request.getEmail().isEmpty()
                && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                return new ProfileDto.ProfileResponse(false, "Email already in use", null);
            }
            user.setEmail(request.getEmail());
            user.setEmailVerified(false);
        }

        // Handle Username Update
        if (request.getUsername() != null && !request.getUsername().isEmpty()
                && !request.getUsername().equals(user.getUsername())) {
            if (userRepository.findByUsername(request.getUsername()).isPresent()) {
                return new ProfileDto.ProfileResponse(false, "Username already in use", null);
            }
            user.setUsername(request.getUsername());
        }

        // Handle Mobile Update
        if (request.getMobile() != null && !request.getMobile().equals(user.getMobile())) {
            user.setMobile(request.getMobile());
        }

        // Handle Customization Reset
        if (request.isRemoveCustomization()) {
            user.setBackgroundColor(null);
            user.setNavbarColor(null);
            user.setSidebarColor(null);
        } else {
            // Handle Background Color
            if (request.getBackgroundColor() != null) {
                user.setBackgroundColor(request.getBackgroundColor());
            }

            // Handle Navbar Color
            if (request.getNavbarColor() != null) {
                user.setNavbarColor(request.getNavbarColor());
            }

            // Handle Sidebar Color
            if (request.getSidebarColor() != null) {
                user.setSidebarColor(request.getSidebarColor());
            }
        }

        // Handle Password Update
        if (request.getNewPassword() != null && !request.getNewPassword().isEmpty()) {
            if (request.getCurrentPassword() == null
                    || !passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                return new ProfileDto.ProfileResponse(false, "Invalid current password", null);
            }
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        }

        // Handle Profile Image Update
        if (profileImage != null && !profileImage.isEmpty()) {
            try {
                String fileName = UUID.randomUUID().toString() + "_" + profileImage.getOriginalFilename();
                Path path = Paths.get(uploadDir + java.io.File.separator + fileName);
                Files.createDirectories(path.getParent());
                Files.copy(profileImage.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
                user.setProfileImage("uploads/" + fileName);
            } catch (IOException e) {
                e.printStackTrace();
                return new ProfileDto.ProfileResponse(false, "Failed to upload profile image", null);
            }
        }

        // Handle Background Image Update
        if (request.isRemoveBackgroundImage()) {
            user.setBackgroundImageUrl(null);
        } else if (backgroundImage != null && !backgroundImage.isEmpty()) {
            try {
                String fileName = UUID.randomUUID().toString() + "_bg_" + backgroundImage.getOriginalFilename();
                Path path = Paths.get(uploadDir + java.io.File.separator + fileName);
                Files.createDirectories(path.getParent());
                Files.copy(backgroundImage.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
                user.setBackgroundImageUrl("uploads/" + fileName);
            } catch (IOException e) {
                e.printStackTrace();
                return new ProfileDto.ProfileResponse(false, "Failed to upload background image", null);
            }
        }

        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        return new ProfileDto.ProfileResponse(true, "Profile updated successfully", mapToUserProfile(user));
    }

    public ProfileDto.ProfileResponse deleteProfile(String username, String password) {
        User user = getUser(username);
        if (!passwordEncoder.matches(password, user.getPassword())) {
            return new ProfileDto.ProfileResponse(false, "Invalid password", null);
        }
        userRepository.delete(user);
        return new ProfileDto.ProfileResponse(true, "Account deleted", null);
    }

    // --- OTP Services ---

    public void sendOtp(String username, String type) {
        User user = getUser(username);
        String identifier = type.equalsIgnoreCase("email") ? user.getEmail() : user.getMobile();
        otpService.generateOtp(identifier, type.equalsIgnoreCase("email"));
    }

    // NEW: Resend OTP (for unauthenticated/unverified users via email)
    public void resendOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.isEmailVerified()) {
            throw new RuntimeException("Email already verified");
        }

        otpService.generateOtp(user.getEmail(), true);
    }

    public boolean verifyOtp(String identifier, String otpCode) {
        boolean isValid = otpService.verifyOtp(identifier, otpCode);
        if (isValid) {
            Optional<User> userEmail = userRepository.findByEmail(identifier);
            if (userEmail.isPresent()) {
                User u = userEmail.get();
                u.setEmailVerified(true);
                userRepository.save(u);
                return true;
            }

            Optional<User> userMobile = userRepository.findByMobile(identifier);
            if (userMobile.isPresent()) {
                User u = userMobile.get();
                u.setMobileVerified(true);
                userRepository.save(u);
                return true;
            }
        }
        return false;
    }

    // --- Forgot Password Flow ---

    public void sendForgotPasswordOtp(String identifier) {
        User user = getUser(identifier); // Helper finds by email or username
        // Send to EMAIL regardless of input type for security (or user preference?)
        // Let's assume sending to Email is safest/standard.
        otpService.generateOtp(user.getEmail(), true);
    }

    public String verifyResetOtp(String identifier, String otp) {
        User user = getUser(identifier);
        if (otpService.verifyOtp(user.getEmail(), otp)) { // Verify against email OTP
            // Generate Reset Token
            return jwtUtil.generateResetToken(user.getEmail());
        }
        throw new RuntimeException("Invalid or expired OTP");
    }

    public void resetPasswordWithToken(String token, String newPassword) {
        String email = jwtUtil.extractUsername(token); // Token subject is email

        // Validate Token structure & expiry
        if (email == null || jwtUtil.isTokenExpired(token)) {
            throw new RuntimeException("Invalid or expired reset token");
        }

        // Check "purpose" claim if possible, but extractUsername validates
        // signature/expiry enough for now.

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Send Confirmation Email
        emailService.sendSimpleEmail(
                user.getEmail(),
                "Password Changed Successfully",
                "Your BudgetWise password has been reset successfully. If this wasn't you, contact support immediately.");
    }

    // --- Helpers ---

    private User getUser(String username) {
        return userRepository.findByEmail(username)
                .or(() -> userRepository.findByUsername(username))
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private AuthDto.UserDto mapToUserDto(User user) {
        AuthDto.UserDto dto = new AuthDto.UserDto();
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setUsername(user.getUsername());
        dto.setMobile(user.getMobile());
        dto.setProfileImage(user.getProfileImage());
        dto.setBackgroundColor(user.getBackgroundColor());
        dto.setBackgroundImageUrl(user.getBackgroundImageUrl());
        dto.setNavbarColor(user.getNavbarColor());
        dto.setSidebarColor(user.getSidebarColor());
        dto.setEmailVerified(user.isEmailVerified());
        dto.setCreatedAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null);
        return dto;
    }

    private ProfileDto.UserProfile mapToUserProfile(User user) {
        ProfileDto.UserProfile profile = new ProfileDto.UserProfile();
        profile.setName(user.getName());
        profile.setEmail(user.getEmail());
        profile.setUsername(user.getUsername());
        profile.setMobile(user.getMobile());
        profile.setProfileImage(user.getProfileImage());
        profile.setBackgroundColor(user.getBackgroundColor());
        profile.setBackgroundImageUrl(user.getBackgroundImageUrl());
        profile.setNavbarColor(user.getNavbarColor());
        profile.setSidebarColor(user.getSidebarColor());
        profile.setEmailVerified(user.isEmailVerified());
        profile.setMobileVerified(user.isMobileVerified());
        profile.setCreatedAt(user.getCreatedAt().toString());
        return profile;
    }
}
