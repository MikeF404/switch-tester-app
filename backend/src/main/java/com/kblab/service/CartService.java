package com.kblab.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class CartService {
    @Autowired
    private CartRepository cartRepository;
    @Autowired
    private SwitchRepository switchRepository;
    
    @Transactional
    public ComplexCartItem addCustomTesterToCart(Long cartId, CustomTesterRequest request) {
        Cart cart = cartRepository.findById(cartId)
            .orElseThrow(() -> new NotFoundException("Cart not found"));
            
        // Create new custom tester
        SwitchTester tester = new SwitchTester();
        tester.setPreset(false);
        tester.setBasePrice(calculateBasePrice(request));
        tester.setIncludesKeycaps(request.isIncludesKeycaps());
        
        // Add switches to tester
        Set<Switch> switches = request.getSwitchIds().stream()
            .map(id -> switchRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Switch not found: " + id)))
            .collect(Collectors.toSet());
        tester.setSwitches(switches);
        
        // Create cart item
        ComplexCartItem cartItem = new ComplexCartItem();
        cartItem.setCart(cart);
        cartItem.setSwitchTester(tester);
        cartItem.setIncludesKeycaps(request.isIncludesKeycaps());
        cartItem.setQuantity(1);
        
        cart.getComplexItems().add(cartItem);
        cart.setUpdatedAt(LocalDateTime.now());
        
        return cartItem;
    }
} 