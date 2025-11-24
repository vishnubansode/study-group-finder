package com.groupgenius.groupgenius_backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    // Should ideally come from application.properties
    private final String jwtSecret = "GroupGeniusSecretKeyForJWTWhichShouldBeLongEnough123!";
    private final long jwtExpirationMs = 24 * 60 * 60 * 1000; // 24 hours

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    // Generate token
    public String generateToken(String email) {
        return Jwts.builder()
                .setSubject(email) // subject = username/email
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // Extract email (username) from token
    public String extractUsername(String token) {
        return parseClaims(token).getSubject();
    }

    public String extractUsernameAllowExpired(String token) {
        return parseClaimsAllowExpired(token).getSubject();
    }

    // Validate token
    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (ExpiredJwtException e) {
            System.out.println("JWT expired: " + e.getMessage());
        } catch (UnsupportedJwtException e) {
            System.out.println("JWT unsupported: " + e.getMessage());
        } catch (MalformedJwtException e) {
            System.out.println("Invalid JWT: " + e.getMessage());
        } catch (io.jsonwebtoken.security.SignatureException e) {
            System.out.println("Invalid JWT signature: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            System.out.println("JWT claims string is empty: " + e.getMessage());
        }
        return false;
    }

    // Internal: Parse token
    private Claims parseClaims(String token) {
        return parseClaimsInternal(token, false);
    }

    private Claims parseClaimsAllowExpired(String token) {
        return parseClaimsInternal(token, true);
    }

    private Claims parseClaimsInternal(String token, boolean allowExpired) {
        JwtParser parser = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build();

        try {
            return parser.parseClaimsJws(token).getBody();
        } catch (ExpiredJwtException e) {
            if (allowExpired) {
                return e.getClaims();
            }
            throw e;
        }
    }

    public boolean isTokenExpired(String token) {
        try {
            parseClaims(token);
            return false;
        } catch (ExpiredJwtException e) {
            return true;
        }
    }
}
