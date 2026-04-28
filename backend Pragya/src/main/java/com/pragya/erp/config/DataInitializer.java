package com.pragya.erp.config;

import com.pragya.erp.model.*;
import com.pragya.erp.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.util.Base64;

@Configuration
@Order(1)
public class DataInitializer {

    private String generateSalt() {
        SecureRandom random = new SecureRandom();
        byte[] saltBytes = new byte[16];
        random.nextBytes(saltBytes);
        return Base64.getEncoder().encodeToString(saltBytes);
    }

    private String hashPassword(String rawPassword, String salt) throws Exception {
        MessageDigest md = MessageDigest.getInstance("SHA-256");
        md.update(salt.getBytes(StandardCharsets.UTF_8));
        byte[] hashed = md.digest(rawPassword.getBytes(StandardCharsets.UTF_8));
        return Base64.getEncoder().encodeToString(hashed);
    }

    private User createUserIfMissing(UserRepository repo, String name, String email,
                                      String username, String role, String department,
                                      String section, Long teacherId) throws Exception {
        var existing = repo.findByEmail(email);
        if (existing.isPresent()) {
            // Fix passwordChangeRequired for existing demo accounts
            User u = existing.get();
            if (u.isPasswordChangeRequired()) {
                u.setPasswordChangeRequired(false);
                repo.save(u);
            }
            return u;
        }
        String demoPassword = "1234";
        User user = new User(name, email, role, department, "active", LocalDate.of(2023, 9, 1));
        user.setUsername(username);
        user.setSection(section);
        user.setTeacherId(teacherId);
        String salt = generateSalt();
        user.setPasswordSalt(salt);
        user.setPasswordHash(hashPassword(demoPassword, salt));
        user.setPasswordChangeRequired(false); // Demo accounts don't require password change
        return repo.save(user);
    }

    @Bean
    CommandLineRunner initUsers(UserRepository userRepository,
                                 CourseRepository courseRepository,
                                 EnrollmentRepository enrollmentRepository,
                                 FeeItemRepository feeItemRepository,
                                 FeePaymentRepository feePaymentRepository,
                                 TimetableRepository timetableRepository) {
        return args -> {
            // ===== SEED USERS =====
            // Admin account
            createUserIfMissing(userRepository, "Admin CampusCore", "admin@system.com",
                    "admin", "Admin", "Administration", null, null);

            // Teacher account
            User teacher = createUserIfMissing(userRepository, "Rahul Sharma", "teacher@system.com",
                    "teacher", "Teacher", "Computer Science", null, null);

            // Get teacher ID for linking
            Long teacherId = null;
            var teacherOpt = userRepository.findByEmail("teacher@system.com");
            if (teacherOpt.isPresent()) teacherId = teacherOpt.get().getId();

            // Student account — linked to teacher and section A
            User student = createUserIfMissing(userRepository, "Pragya", "student@system.com",
                    "student", "Student", "Computer Science", "A", teacherId);

            // Get student ID for linking
            Long studentId = null;
            var studentOpt = userRepository.findByEmail("student@system.com");
            if (studentOpt.isPresent()) studentId = studentOpt.get().getId();

            // ===== SEED COURSES (if empty) =====
            if (courseRepository.count() == 0) {
                courseRepository.save(new Course("CSE201", "Data Structures", 4, "Spring 2026",
                        "Prof. Sharma", "Mon, Wed 09:00-11:00", "CSE Lab 2", "Active", "45/60"));
                courseRepository.save(new Course("CSE205", "DBMS", 4, "Spring 2026",
                        "Prof. Sharma", "Tue, Thu 09:00-11:00", "Room 214", "Active", "52/60"));
                courseRepository.save(new Course("CSE209", "Operating Systems", 3, "Spring 2026",
                        "Prof. Kumar", "Mon, Wed 11:00-13:00", "Room 302", "Active", "38/60"));
                courseRepository.save(new Course("CSE213", "Computer Networks", 3, "Spring 2026",
                        "Prof. Gupta", "Tue, Thu 11:00-13:00", "Room 108", "Active", "40/60"));
                courseRepository.save(new Course("CSE217", "Machine Learning", 4, "Spring 2026",
                        "Prof. Singh", "Wed, Fri 14:00-16:00", "AI Lab", "Active", "55/60"));
                courseRepository.save(new Course("CSE221", "Software Engineering", 3, "Spring 2026",
                        "Prof. Sharma", "Mon, Fri 09:00-11:00", "Room 210", "Active", "42/60"));
            }

            // ===== SEED ENROLLMENTS (if empty and student exists) =====
            if (enrollmentRepository.count() == 0 && studentId != null) {
                var courses = courseRepository.findAll();
                for (Course c : courses) {
                    enrollmentRepository.save(new Enrollment(studentId, c.getId(),
                            LocalDate.now().toString(), "active"));
                }
            }

            // ===== SEED FEE ITEMS (if empty) =====
            if (feeItemRepository.count() == 0) {
                feeItemRepository.save(new FeeItem("Tuition Fee", "tuition", 75000.0, "Spring 2026"));
                feeItemRepository.save(new FeeItem("Lab Fee", "lab", 15000.0, "Spring 2026"));
                feeItemRepository.save(new FeeItem("Library Fee", "library", 5000.0, "Spring 2026"));
                feeItemRepository.save(new FeeItem("Hostel Fee", "hostel", 45000.0, "Spring 2026"));
                feeItemRepository.save(new FeeItem("Exam Fee", "misc", 3000.0, "Spring 2026"));
            }

            // ===== SEED FEE PAYMENTS (if empty and student exists) =====
            if (feePaymentRepository.count() == 0 && studentId != null) {
                var feeItems = feeItemRepository.findAll();
                if (feeItems.size() >= 2) {
                    feePaymentRepository.save(new FeePayment(studentId, feeItems.get(0).getId(),
                            75000.0, "2026-01-15", "online", "TXN1001", "paid"));
                    feePaymentRepository.save(new FeePayment(studentId, feeItems.get(1).getId(),
                            15000.0, null, "online", null, "pending"));
                }
            }

            // ===== SEED TIMETABLE (if empty) =====
            if (timetableRepository.count() == 0 && teacherId != null) {
                var courses = courseRepository.findAll();
                String[] days = {"Monday", "Tuesday", "Wednesday", "Thursday", "Friday"};
                String[] slots = {"09:00 - 11:00", "11:00 - 13:00", "14:00 - 16:00"};

                int idx = 0;
                for (Course c : courses) {
                    if (idx >= days.length * slots.length) break;
                    String day = days[idx % days.length];
                    String slot = slots[(idx / days.length) % slots.length];
                    timetableRepository.save(new Timetable(c.getId(), teacherId, "A",
                            c.getRoom(), day, slot, c.getCode(), c.getTitle()));
                    idx++;
                }
            }
        };
    }
}
