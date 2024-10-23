package com.kblab.controller;

import com.kblab.model.Cart;
import com.kblab.model.Session;
import com.kblab.model.User;
import com.kblab.repository.CartRepository;
import com.kblab.repository.SessionRepository;
import com.kblab.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private SessionRepository sessionRepository;

    @PostMapping("/register")
    public String register(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        if (email == null || password == null) {
            return "Missing email or password";
        }

        if (userService.findByEmail(email).isPresent()) {
            return "User already exists!";
        }

        User newUser = userService.register(email, password);
        Cart cart = new Cart(LocalDateTime.now(), LocalDateTime.now(), newUser);
        cartRepository.save(cart);

        return "User registered successfully!";
    }

    @PostMapping("/login")
    public String login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        if (email == null || password == null) {
            return "Missing email or password";
        }

        Optional<User> userOptional = userService.findByEmail(email);
        if (userOptional.isEmpty()) {
            return "Invalid credentials!";
        }
        User user = userOptional.get();
        if (!userService.validatePassword(password, user.getPassword())) {
            return "Invalid credentials!";
        }

        // Ensure each user has only one session
        sessionRepository.deleteByUserId(user.getId());

        // Generate session and return cart_id
        String sessionId = UUID.randomUUID().toString();
        sessionRepository.save(new Session(sessionId, user, LocalDateTime.now()));

        Cart cart = cartRepository.findByUser(user).orElseThrow();
        return "Session ID: " + sessionId + ", Cart ID: " + cart.getId();
    }
}
