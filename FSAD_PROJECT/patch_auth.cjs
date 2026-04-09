const fs = require('fs');

const path = '../backend/src/main/java/com/pragya/erp/controller/UserController.java';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('MessageDigest')) {
    content = content.replace('import java.util.List;', 'import java.util.List;\nimport java.util.Base64;\nimport java.nio.charset.StandardCharsets;\nimport java.security.MessageDigest;');
    
    const origMethod = `public User createUser(@RequestBody User user) {
        return userRepository.save(user);
    }`;

    const newMethod = `public User createUser(@RequestBody User user) {
        try {
            String salt = java.util.UUID.randomUUID().toString();
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            md.update(salt.getBytes(StandardCharsets.UTF_8));
            byte[] hashed = md.digest("1234".getBytes(StandardCharsets.UTF_8));
            String hash = Base64.getEncoder().encodeToString(hashed);
            user.setPasswordSalt(salt);
            user.setPasswordHash(hash);
            user.setDepartment("required-password-change");
        } catch(Exception e){}
        if (user.getUsername() == null) user.setUsername(user.getEmail());
        if (user.getStatus() == null) user.setStatus("active");
        if (user.getJoinedAt() == null) user.setJoinedAt(java.time.LocalDate.now());
        return userRepository.save(user);
    }`;
    content = content.replace(origMethod, newMethod);
    
    // Add change password endpoint
    content = content.replace(/}\s*$/, `
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
                if ("required-password-change".equals(user.getDepartment())) {
                    user.setDepartment("Computer Science");
                }
                userRepository.save(user);
                return ResponseEntity.ok(java.util.Map.of("message", "Password updated successfully"));
            } catch (Exception e) {
                return ResponseEntity.internalServerError().build();
            }
        }).orElse(ResponseEntity.notFound().build());
    }
}
`);
    fs.writeFileSync(path, content);
}
console.log('Patched backend UserController.java!');
