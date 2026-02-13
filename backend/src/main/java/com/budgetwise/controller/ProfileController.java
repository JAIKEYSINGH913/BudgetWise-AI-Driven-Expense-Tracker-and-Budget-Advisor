package com.budgetwise.controller;

import com.budgetwise.dto.ProfileDto;
import com.budgetwise.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class ProfileController {

    @Autowired
    private UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<ProfileDto.ProfileResponse> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        ProfileDto.ProfileResponse response = userService.getProfile(userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    @PutMapping(value = "/profile/update", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    public ResponseEntity<ProfileDto.ProfileResponse> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestPart(value = "name", required = false) String name,
            @RequestPart(value = "email", required = false) String email,
            @RequestPart(value = "username", required = false) String username,
            @RequestPart(value = "mobile", required = false) String mobile,
            @RequestPart(value = "password", required = false) String password,
            @RequestPart(value = "newPassword", required = false) String newPassword,
            @RequestPart(value = "backgroundColor", required = false) String backgroundColor,
            @RequestPart(value = "navbarColor", required = false) String navbarColor,
            @RequestPart(value = "sidebarColor", required = false) String sidebarColor,
            @RequestPart(value = "removeBackgroundImage", required = false) String removeBackgroundImage,
            @RequestPart(value = "removeCustomization", required = false) String removeCustomization,
            @RequestPart(value = "profileImage", required = false) MultipartFile profileImage,
            @RequestPart(value = "backgroundImage", required = false) MultipartFile backgroundImage) {

        ProfileDto.UpdateProfileRequest request = new ProfileDto.UpdateProfileRequest();
        request.setName(name);
        request.setEmail(email);
        request.setUsername(username);
        request.setMobile(mobile);
        request.setBackgroundColor(backgroundColor);
        request.setNavbarColor(navbarColor);
        request.setSidebarColor(sidebarColor);
        request.setCurrentPassword(password);
        request.setNewPassword(newPassword);
        request.setRemoveBackgroundImage(Boolean.parseBoolean(removeBackgroundImage));
        request.setRemoveCustomization(Boolean.parseBoolean(removeCustomization));

        ProfileDto.ProfileResponse response = userService.updateProfile(userDetails.getUsername(), request,
                profileImage, backgroundImage);
        return ResponseEntity.status(response.isSuccess() ? 200 : 400).body(response);
    }

    @DeleteMapping("/profile/delete")
    public ResponseEntity<ProfileDto.ProfileResponse> deleteAccount(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> body) {
        ProfileDto.ProfileResponse response = userService.deleteProfile(userDetails.getUsername(),
                body.get("password"));
        return ResponseEntity.status(response.isSuccess() ? 200 : 403).body(response);
    }

    // --- OTP & Verification Endpoints ---
    // Moved to AuthController
}
