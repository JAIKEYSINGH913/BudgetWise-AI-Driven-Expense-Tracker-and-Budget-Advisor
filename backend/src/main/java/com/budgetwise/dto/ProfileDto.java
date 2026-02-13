package com.budgetwise.dto;

import lombok.Data;

public class ProfileDto {

    @Data
    public static class UpdateProfileRequest {
        private String name;
        private String email;
        private String username;
        private String mobile;
        private String backgroundColor;
        private String navbarColor;
        private String sidebarColor;
        private String currentPassword;
        private String newPassword;
        private boolean removeBackgroundImage;
        private boolean removeCustomization;
    }

    @Data
    public static class UserProfile {
        private String name;
        private String email;
        private String username;
        private String mobile;
        private String profileImage;
        private String backgroundColor;
        private String backgroundImageUrl;
        private String navbarColor;
        private String sidebarColor;
        private boolean emailVerified;
        private boolean mobileVerified;
        private String createdAt;
    }

    @Data
    public static class ProfileResponse {
        private boolean success;
        private String message;
        private UserProfile profile;

        public ProfileResponse(boolean success, String message, UserProfile profile) {
            this.success = success;
            this.message = message;
            this.profile = profile;
        }
    }

    @Data
    public static class OtpRequest {
        private String identifier; // Email or Mobile
    }

    @Data
    public static class OtpVerificationRequest {
        private String identifier;
        private String otp;
    }
}
