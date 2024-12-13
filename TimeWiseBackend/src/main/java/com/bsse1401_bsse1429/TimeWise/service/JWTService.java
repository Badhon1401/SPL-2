package com.bsse1401_bsse1429.TimeWise.service;

import com.bsse1401_bsse1429.TimeWise.model.Users;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.bson.types.ObjectId;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JWTService {

    private String secretkey = "";
    private long tokenExpiration = 1814400000; // 21 days

    public JWTService() {
        try {
            KeyGenerator keyGen = KeyGenerator.getInstance("HmacSHA256");
            SecretKey sk = keyGen.generateKey();
            secretkey = Base64.getEncoder().encodeToString(sk.getEncoded());
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }

    // Generate JWT token using ObjectId (converted to String) and other claims
    public String generateToken(Users user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getUserId().toHexString());  // Store userId as string
        claims.put("userName", user.getUserName());  // Use userName instead of username
        claims.put("email", user.getEmail());  // Add email as claim

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(user.getUserId().toHexString())  // Using userId as subject
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + tokenExpiration))
                .signWith(getKey())
                .compact();
    }

    private SecretKey getKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretkey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // Extract userId from the token (convert the String back to ObjectId)
    public ObjectId extractUserId(String token) {
        return new ObjectId(String.valueOf(extractClaim(token, "userId")));  // Extract userId from claims and convert to ObjectId
    }

    // Extract userName from the token
    public String extractUserName(String token) {
        return extractClaim(token, "userName");  // Extract userName from claims
    }

    // Extract email from the token
    public String extractEmail(String token) {
        return extractClaim(token, "email");  // Extract email from claims
    }

    private <T> T extractClaim(String token, String claimKey) {
        final Claims claims = extractAllClaims(token);
        return (T) claims.get(claimKey);  // Extract the claim value using its key
    }


    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    // Validate token and match with UserDetails (comparing ObjectId)
    public boolean validateToken(String token, UserDetails userDetails) {
        final String userName = extractUserName(token);  // Extract userName instead of username
        return (userName.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims.EXPIRATION);  // This works because Claims::getExpiration is a valid Function
    }
}
