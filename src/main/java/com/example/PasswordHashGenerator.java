package com.example;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

public class PasswordHashGenerator {
    public static void main(String[] args) {
        // Create BCrypt encoder
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

        // The plain text password
        String rawPassword = "123";

        // Generate BCrypt hash
        String encodedPassword = passwordEncoder.encode(rawPassword);

        // Print the hash
        System.out.println("BCrypt Hash: " + encodedPassword);
    }
}
