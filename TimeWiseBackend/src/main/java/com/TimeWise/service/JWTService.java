package com.TimeWise.service;

import com.TimeWise.utils.UserPrincipal;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JWTService {

    @Value("${jwt.secret-key}")
    private String secretKey; // Inject the secret key from application.properties

    @Value("${jwt.token-expiration}")
    private long tokenExpiration; // Inject the token expiration time from application.properties

    // Generate JWT token using ObjectId as String, and add username and email in the claims
    public String generateToken(ObjectId userId, String username, String email) {
        try {
            // Log the user ID and expiration for debugging
            System.out.println("Generating token for userId: " + userId.toHexString());
            System.out.println("Token expiration: " + tokenExpiration);

            Map<String, Object> claims = new HashMap<>();
            claims.put("username", username);  // Add username to claims
            claims.put("email", email);        // Add email to claims

            return Jwts.builder().claims(claims)
                    .subject(userId.toHexString())  // Convert ObjectId to String and use as subject
                    .issuedAt(new Date(System.currentTimeMillis()))
                    .expiration(new Date(System.currentTimeMillis() + tokenExpiration))
                    .signWith(getKey())
                    .compact();
        } catch (Exception e) {
            // Log the error to understand what went wrong
            e.printStackTrace();
            throw new RuntimeException("Error generating JWT token", e);
        }
    }

    private SecretKey getKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey); // Decode the secret key from BASE64
        return Keys.hmacShaKeyFor(keyBytes); // Generate SecretKey from the decoded byte array
    }

    // Extract userId from the token
    public ObjectId extractUserId(String token) {
        String userIdString = extractClaim(token, Claims::getSubject); // Get subject (userId) from the token
        return new ObjectId(userIdString); // Convert the subject back to ObjectId
    }

    // Extract username from token
    public String extractUsername(String token) {
        return extractClaim(token, claims -> claims.get("username", String.class)); // Get username from claims
    }

    // Extract email from token
    public String extractEmail(String token) {
        return extractClaim(token, claims -> claims.get("email", String.class)); // Get email from claims
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    // Validate token using UserDetails
    public boolean validateToken(String token, UserPrincipal userPrincipal) {
        ObjectId userId=extractUserId(token);
        String userName = extractUsername(token);
        String userEmail=extractEmail(token);
        return userName.equals(userPrincipal.getUsername()) && userId.equals(userPrincipal.getUserId()) && userEmail.equals(userPrincipal.getUserEmail()) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
}
