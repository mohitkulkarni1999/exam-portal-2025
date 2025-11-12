package com.examportal.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class JwtResponse {
    private String token;
    private String refreshToken;
    private String type = "Bearer";
    private Long id;
    private String email;
    private String role;
    private String name;
    
    public JwtResponse(String token, String refreshToken, Long id, String email, String role, String name) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.id = id;
        this.email = email;
        this.role = role;
        this.name = name;
    }
}
