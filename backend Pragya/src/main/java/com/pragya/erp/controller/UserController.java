package com.pragya.erp.controller;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pragya.erp.model.User;
import com.pragya.erp.repository.UserRepository;
import com.pragya.erp.security.JwtUtil;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public UserController(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    private String extractToken(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }

    private String extractRole(String authHeader) {
        String token = extractToken(authHeader);
        if (token == null) return null;
        try { return jwtUtil.extractRole(token); } catch (Exception e) { return null; }
    }

    private Long extractUserId(String authHeader) {
        String token = extractToken(authHeader);
        if (token == null) return null;
        try { return jwtUtil.extractUserId(token); } catch (Exception e) { return null; }
    }

    @GetMapping
    public ResponseEntity<?> getAllUsers(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        String role = extractRole(authHeader);
        Long userId = extractUserId(authHeader);

        if ("Admin".equalsIgnoreCase(role)) {
            // Admin sees all users
            return ResponseEntity.ok(userRepository.findAll());
        } else if ("Teacher".equalsIgnoreCase(role) && userId != null) {
            // Teacher only sees students assigned to them
            List<User> allUsers = userRepository.findAll();
            List<User> assignedStudents = allUsers.stream()
                    .filter(u -> "Student".equalsIgnoreCase(u.getRole()) && userId.equals(u.getTeacherId()))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(assignedStudents);
        } else if ("Student".equalsIgnoreCase(role)) {
            // Students shouldn't access user list
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Students cannot access the user directory"));
        }

        return ResponseEntity.ok(userRepository.findAll());
    }

    @PostMapping
    public User createUser(@RequestBody User user) {
        try {
            String defaultPassword = "1234";
            String salt = java.util.UUID.randomUUID().toString();
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            md.update(salt.getBytes(StandardCharsets.UTF_8));
            byte[] hashed = md.digest(defaultPassword.getBytes(StandardCharsets.UTF_8));
            String hash = Base64.getEncoder().encodeToString(hashed);
            user.setPasswordSalt(salt);
            user.setPasswordHash(hash);
            if (user.getDepartment() == null || user.getDepartment().isBlank()) {
                user.setDepartment("Computer Science");
            }
            if (user.getStatus() == null || user.getStatus().isBlank()) {
                user.setStatus("active");
            }
            user.setPasswordChangeRequired(true);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return userRepository.save(user);
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User updated) {
        return userRepository.findById(id)
                .map(existing -> {
                    existing.setName(updated.getName());
                    existing.setEmail(updated.getEmail());
                    existing.setRole(updated.getRole());
                    existing.setDepartment(updated.getDepartment());
                    existing.setStatus(updated.getStatus());
                    existing.setJoinedAt(updated.getJoinedAt());
                    // Update section and teacherId for student-teacher mapping
                    if (updated.getSection() != null) existing.setSection(updated.getSection());
                    if (updated.getTeacherId() != null) existing.setTeacherId(updated.getTeacherId());
                    return ResponseEntity.ok(userRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/change-password")
    public ResponseEntity<?> changePassword(@PathVariable Long id, @RequestBody java.util.Map<String, String> request) {
        return userRepository.findById(id).map(user -> {
            try {
                String newPassword = request.get("newPassword");
                String salt = java.util.UUID.randomUUID().toString();
                MessageDigest md = MessageDigest.getInstance("SHA-256");
                md.update(salt.getBytes(StandardCharsets.UTF_8));
                byte[] hashed = md.digest(newPassword.getBytes(StandardCharsets.UTF_8));
                String hash = Base64.getEncoder().encodeToString(hashed);
                user.setPasswordSalt(salt);
                user.setPasswordHash(hash);
                user.setPasswordChangeRequired(false);
                userRepository.save(user);
                return ResponseEntity.ok(java.util.Map.of("message", "Password updated successfully"));
            } catch (Exception e) {
                return ResponseEntity.internalServerError().build();
            }
        }).orElse(ResponseEntity.notFound().build());
    }
}
