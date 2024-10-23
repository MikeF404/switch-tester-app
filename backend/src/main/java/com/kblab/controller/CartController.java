package com.kblab.controller;

import com.kblab.model.Cart;
import com.kblab.repository.CartRepository;
import com.kblab.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Optional;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/{cartId}")
    public Optional<Cart> getCart(@PathVariable Long cartId) {
        return cartRepository.findById(cartId);
    }

    @PostMapping("/{cartId}")
    public String updateCart(@PathVariable Long cartId) {
        Optional<Cart> cartOptional = cartRepository.findById(cartId);
        if (cartOptional.isPresent()) {
            Cart cart = cartOptional.get();
            cart.setUpdatedAt(LocalDateTime.now());
            cartRepository.save(cart);
            return "Cart updated successfully!";
        } else {
            return "Cart not found!";
        }
    }
}
