package com.pragya.erp.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
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

import com.pragya.erp.model.FeeItem;
import com.pragya.erp.model.FeePayment;
import com.pragya.erp.repository.FeeItemRepository;
import com.pragya.erp.repository.FeePaymentRepository;
import com.pragya.erp.security.JwtUtil;

@RestController
@RequestMapping("/api/fees")
public class FeeController {
    @Autowired private FeeItemRepository feeItemRepo;
    @Autowired private FeePaymentRepository feePaymentRepo;
    @Autowired private JwtUtil jwtUtil;

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

    // Fee Items (structure) — Admin and Student can read; Teacher blocked
    @GetMapping("/items")
    public ResponseEntity<?> getAllItems(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        String role = extractRole(authHeader);
        if ("Teacher".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Teachers cannot access fee information"));
        }
        return ResponseEntity.ok(feeItemRepo.findAll());
    }

    @PostMapping("/items")
    public ResponseEntity<?> createItem(@RequestBody FeeItem item,
                                         @RequestHeader(value = "Authorization", required = false) String authHeader) {
        String role = extractRole(authHeader);
        if (!"Admin".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Only admins can create fee items"));
        }
        return ResponseEntity.ok(feeItemRepo.save(item));
    }

    @PutMapping("/items/{id}")
    public ResponseEntity<?> updateItem(@PathVariable Long id, @RequestBody FeeItem item,
                                         @RequestHeader(value = "Authorization", required = false) String authHeader) {
        String role = extractRole(authHeader);
        if (!"Admin".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Only admins can update fee items"));
        }
        return feeItemRepo.findById(id).map(existing -> {
            existing.setName(item.getName());
            existing.setCategory(item.getCategory());
            existing.setAmount(item.getAmount());
            existing.setSemester(item.getSemester());
            return ResponseEntity.ok((Object) feeItemRepo.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<?> deleteItem(@PathVariable Long id,
                                         @RequestHeader(value = "Authorization", required = false) String authHeader) {
        String role = extractRole(authHeader);
        if (!"Admin".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Only admins can delete fee items"));
        }
        if (!feeItemRepo.existsById(id)) return ResponseEntity.notFound().build();
        feeItemRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // Fee Payments — Student sees own, Admin sees all, Teacher blocked
    @GetMapping("/payments")
    public ResponseEntity<?> getAllPayments(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        String role = extractRole(authHeader);
        Long userId = extractUserId(authHeader);

        if ("Teacher".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Teachers cannot access fee payments"));
        }

        if ("Student".equalsIgnoreCase(role) && userId != null) {
            return ResponseEntity.ok(feePaymentRepo.findByStudentId(userId));
        }

        // Admin or fallback
        return ResponseEntity.ok(feePaymentRepo.findAll());
    }

    @GetMapping("/payments/student/{studentId}")
    public ResponseEntity<?> getByStudent(@PathVariable Long studentId,
                                           @RequestHeader(value = "Authorization", required = false) String authHeader) {
        String role = extractRole(authHeader);
        Long userId = extractUserId(authHeader);

        if ("Teacher".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Teachers cannot access fee payments"));
        }

        // Students can only access their own payments
        if ("Student".equalsIgnoreCase(role) && userId != null && !userId.equals(studentId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "You can only view your own fee payments"));
        }

        return ResponseEntity.ok(feePaymentRepo.findByStudentId(studentId));
    }

    @PostMapping("/payments")
    public ResponseEntity<?> createPayment(@RequestBody FeePayment payment,
                                            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        String role = extractRole(authHeader);
        if ("Teacher".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Teachers cannot create fee payments"));
        }
        if (payment.getPaidAt() == null) payment.setPaidAt(java.time.LocalDate.now().toString());
        if (payment.getStatus() == null) payment.setStatus("paid");
        if (payment.getTransactionId() == null) payment.setTransactionId("TXN" + System.currentTimeMillis());
        return ResponseEntity.ok(feePaymentRepo.save(payment));
    }

    @PutMapping("/payments/{id}")
    public ResponseEntity<?> updatePayment(@PathVariable Long id, @RequestBody FeePayment payment,
                                            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        String role = extractRole(authHeader);
        if (!"Admin".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Only admins can update fee payments"));
        }
        return feePaymentRepo.findById(id).map(existing -> {
            if (payment.getAmountPaid() != 0) existing.setAmountPaid(payment.getAmountPaid());
            if (payment.getFeeItemId() != null) existing.setFeeItemId(payment.getFeeItemId());
            if (payment.getPaidAt() != null) existing.setPaidAt(payment.getPaidAt());
            if (payment.getMethod() != null) existing.setMethod(payment.getMethod());
            if (payment.getTransactionId() != null) existing.setTransactionId(payment.getTransactionId());
            if (payment.getStatus() != null) existing.setStatus(payment.getStatus());
            return ResponseEntity.ok((Object) feePaymentRepo.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/payments/{id}")
    public ResponseEntity<?> deletePayment(@PathVariable Long id,
                                            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        String role = extractRole(authHeader);
        if (!"Admin".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Only admins can delete fee payments"));
        }
        if (!feePaymentRepo.existsById(id)) return ResponseEntity.notFound().build();
        feePaymentRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
