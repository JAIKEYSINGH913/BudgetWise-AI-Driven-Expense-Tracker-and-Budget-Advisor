package com.budgetwise.dto;

import lombok.Data;

public class AuthDto {

    @Data
    public static class SignupRequest {
        private String name;
        private String email;
        private String password;
        private String username;
        private String mobile;
    }

    @Data
    public static class LoginRequest {
        private String identifier; // email or username
        private String password;
    }

    @Data
    public static class UserDto {
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
        private String createdAt;
    }

    @Data
    public static class AuthResponse {
        private boolean success;
        private String message;
        private String token;
        private UserDto user;

        public AuthResponse(boolean success, String message, String token, UserDto user) {
            this.success = success;
            this.message = message;
            this.token = token;
            this.user = user;
        }
    }
}
