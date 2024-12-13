package com.bsse1401_bsse1429.TimeWise.service;

import com.bsse1401_bsse1429.TimeWise.model.Users;
import com.bsse1401_bsse1429.TimeWise.repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private JWTService jwtService;

    @Autowired
    private AuthenticationManager authManager;

    @Autowired
    private UserRepo repo;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

    // Register a new user and generate a token
    public String register(Users user) {
        // Check for duplicate username
        if (repo.findByUserName(user.getUserName()) != null) {
            throw new IllegalArgumentException("Username already exists. Please choose another.");
        }

        // Check for duplicate email
        if (repo.findByEmail(user.getEmail()) != null) {
            throw new IllegalArgumentException("Email already registered. Please use another email.");
        }
        String pass=user.getPassword();
        // Hash the password before saving
        user.setPassword(encoder.encode(user.getPassword()));
        // Save the user in the database
        repo.save(user);
        user.setPassword(pass);
        // Automatically log in and generate token
        return verify(user); // Pass the user object to verify
    }

    // Verify user credentials and generate a JWT token
    public String verify(Users user) {
        // Authenticate the user based on username and plaintext password
        Authentication authentication = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getUserName(), user.getPassword())
        );

        if (authentication.isAuthenticated()) {
            // Fetch the full user details from the database
            Users authenticatedUser = repo.findByUserName(user.getUserName());

            // Generate JWT token for the user based on their ID
            return jwtService.generateToken(authenticatedUser);
        } else {
            throw new IllegalArgumentException("Authentication failed. Bad credentials.");
        }
    }
}
