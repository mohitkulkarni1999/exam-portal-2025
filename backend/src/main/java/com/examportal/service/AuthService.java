package com.examportal.service;

import java.util.Map;
import com.examportal.dto.JwtResponse;
import com.examportal.dto.LoginRequest;
import com.examportal.dto.StudentRegistrationRequest;
import com.examportal.entity.Admin;
import com.examportal.entity.Student;
import com.examportal.entity.User;
import com.examportal.repository.AdminRepository;
import com.examportal.repository.StudentRepository;
import com.examportal.repository.UserRepository;
import com.examportal.security.JwtUtils;
import com.examportal.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {
    
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final AdminRepository adminRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    
    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
        );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        String refreshToken = jwtUtils.generateRefreshToken(authentication);
        
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        
        // Get user details based on role
        String name = "";
        if (userPrincipal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            Admin admin = adminRepository.findByEmail(userPrincipal.getEmail()).orElse(null);
            name = admin != null ? admin.getName() : "";
        } else if (userPrincipal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_STUDENT"))) {
            Student student = studentRepository.findByEmail(userPrincipal.getEmail()).orElse(null);
            name = student != null ? student.getFullName() : "";
        }
        
        return new JwtResponse(
            jwt,
            refreshToken,
            userPrincipal.getId(),
            userPrincipal.getEmail(),
            userPrincipal.getAuthorities().iterator().next().getAuthority(),
            name
        );
    }
    
    public void registerStudent(StudentRegistrationRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already taken!");
        }
        
        Student student = new Student();
        student.setFullName(request.getFullName());
        student.setEmail(request.getEmail());
        student.setPassword(passwordEncoder.encode(request.getPassword()));
        student.setPhone(request.getPhone());
        student.setDateOfBirth(request.getDateOfBirth());
        student.setRole(User.Role.ROLE_STUDENT);
        student.setEnabled(true);
        
        studentRepository.save(student);
    }
    
    public void registerAdmin(Map<String, String> request) {
        if (userRepository.existsByEmail(request.get("email"))) {
            throw new RuntimeException("Email is already taken!");
        }
        
        Admin admin = new Admin();
        admin.setName(request.get("name"));
        admin.setEmail(request.get("email"));
        admin.setPassword(passwordEncoder.encode(request.get("password")));
        admin.setPhone(request.get("phone"));
        admin.setRole(User.Role.ROLE_ADMIN);
        admin.setEnabled(true);
        
        adminRepository.save(admin);
    }
    
    // Method to create default admin user (call this on application startup)
    public void createDefaultAdmin() {
        if (!userRepository.existsByEmail("admin@examportal.com")) {
            Admin admin = new Admin();
            admin.setName("System Administrator");
            admin.setEmail("admin@examportal.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setPhone("1234567890");
            admin.setRole(User.Role.ROLE_ADMIN);
            admin.setEnabled(true);
            
            adminRepository.save(admin);
            System.out.println("Default admin user created: admin@examportal.com / admin123");
        }
    }
}
