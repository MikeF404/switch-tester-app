package com.kblab.controller;

import com.kblab.model.Subscriber;
import com.kblab.service.EmailService;
import com.kblab.repository.SubscriberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class EmailController {

    @Autowired
    private EmailService emailService;

    @Autowired
    private SubscriberRepository subscriberRepository;

    // Endpoint to send message
    @PostMapping("/sendMessage")
    public String sendMessage(@RequestBody Map<String, String> request) {
        String message = request.get("message");
        String topic = request.get("topic");
        String userEmail = request.get("userEmail");  // Optional field

        // Email subject and body
        String subject = "New Message from Website: " + topic;
        String body = "Message: " + message + "\n";

        // Include user email if provided
        if (userEmail != null && !userEmail.isEmpty()) {
            body += "User Email: " + userEmail;
        }

        // Send email to your inbox
        emailService.sendSimpleEmail("mike@switchtest.shop", subject, body);  // Your email address
        return "Message sent successfully!";
    }

    // Endpoint for email subscription
    @PostMapping("/subscribe")
    public String subscribeToNews(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        if (email == null || email.isEmpty()) {
            return "Invalid email";
        }

        if (subscriberRepository.existsByEmail(email)) {
            return "Email already subscribed";
        }

        Subscriber subscriber = new Subscriber(email);
        subscriberRepository.save(subscriber);

        return "Subscription successful!";
    }
}
