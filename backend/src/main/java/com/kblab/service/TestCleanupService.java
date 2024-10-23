package com.kblab.service;

import com.kblab.model.User;
import com.kblab.repository.CartRepository;
import com.kblab.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TestCleanupService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CartRepository cartRepository;

    @Transactional
    public void cleanupTestUserByEmail(String email) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user != null) {
            // Delete associated cart, then delete the user
            cartRepository.deleteByUser(user);
            userRepository.delete(user);
        }
    }
}