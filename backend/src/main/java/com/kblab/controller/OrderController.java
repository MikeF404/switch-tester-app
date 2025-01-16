package com.kblab.controller;

import com.kblab.dto.OrderCreateRequest;
import com.kblab.model.Order;
import com.kblab.service.StockVerificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*") // Configure appropriately for production
public class OrderController {
    
    @Autowired
    private StockVerificationService stockVerificationService;

    @PostMapping("/create")
    public ResponseEntity<Order> createOrder(@RequestBody OrderCreateRequest request) {
        Order order = stockVerificationService.verifyAndCreateOrder(request);
        return ResponseEntity.ok(order);
    }

    @PostMapping("/{orderId}/complete")
    public ResponseEntity<Order> completeOrder(@PathVariable Long orderId) {
        Order order = stockVerificationService.completeOrder(orderId);
        return ResponseEntity.ok(order);
    }

    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<Order> cancelOrder(@PathVariable Long orderId) {
        Order order = stockVerificationService.cancelOrder(orderId);
        return ResponseEntity.ok(order);
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<Order> getOrder(@PathVariable Long orderId) {
        Order order = stockVerificationService.getOrder(orderId);
        return ResponseEntity.ok(order);
    }
} 