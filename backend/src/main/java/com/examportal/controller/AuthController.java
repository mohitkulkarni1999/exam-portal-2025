package com.examportal.controller;

import com.examportal.dto.JwtResponse;
import com.examportal.dto.LoginRequest;
import com.examportal.dto.StudentRegistrationRequest;
import com.examportal.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {
    
    private final AuthService authService;
    
    @PostMapping("/login")
    public ResponseEntity<JwtResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        JwtResponse jwtResponse = authService.authenticateUser(loginRequest);
        return ResponseEntity.ok(jwtResponse);
    }
    
    @PostMapping("/student/register")
    public ResponseEntity<String> registerStudent(@Valid @RequestBody StudentRegistrationRequest signUpRequest) {
        authService.registerStudent(signUpRequest);
        return ResponseEntity.ok("Student registered successfully!");
    }
    
    @PostMapping("/admin/register")
    public ResponseEntity<String> registerAdmin(@Valid @RequestBody Map<String, String> adminRequest) {
        authService.registerAdmin(adminRequest);
        return ResponseEntity.ok("Admin registered successfully!");
    }
}
