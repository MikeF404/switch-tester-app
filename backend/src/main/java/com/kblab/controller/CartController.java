package com.kblab.controller;

import com.kblab.dto.CustomTesterRequest;
import com.kblab.dto.SwitchItem;
import com.kblab.exception.CartNotFoundException;
import com.kblab.exception.InsufficientStockException;
import com.kblab.model.Cart;
import com.kblab.model.CartItem;
import com.kblab.model.Order;
import com.kblab.service.CartService;
import com.kblab.service.StockVerificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "http://localhost:5173")
public class CartController {
    @Autowired
    private CartService cartService;

    @Autowired
    private StockVerificationService stockVerificationService;

    @GetMapping("/{cartId}")
    public ResponseEntity<Cart> getCart(@PathVariable String cartId) {
        return cartService.getCart(cartId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/add")
    public ResponseEntity<Cart> addItemToCart(
            @RequestParam(required = false) String cartId,
            @RequestParam Long itemId,
            @RequestParam Integer quantity) {
        Cart updatedCart = cartService.addItemToCart(cartId, itemId, quantity);
        return ResponseEntity.ok(updatedCart);
    }

    @PutMapping("/{cartId}/items/{itemId}")
    public ResponseEntity<Cart> updateItemQuantity(
            @PathVariable String cartId,
            @PathVariable Long itemId,
            @RequestParam Integer quantity) {
        Cart updatedCart = cartService.updateItemQuantity(cartId, itemId, quantity);
        return ResponseEntity.ok(updatedCart);
    }

    @DeleteMapping("/{cartId}/items/{itemId}")
    public ResponseEntity<Cart> removeItemFromCart(
            @PathVariable String cartId,
            @PathVariable Long itemId) {
        Cart updatedCart = cartService.removeItemFromCart(cartId, itemId);
        return ResponseEntity.ok(updatedCart);
    }

    @GetMapping
    public ResponseEntity<Cart> getCurrentCart(@RequestParam(required = false) String cartId) {
        if (cartId == null) {
            return ResponseEntity.ok(new Cart()); // Return empty cart
        }
        return cartService.getCart(cartId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.ok(new Cart())); // Return empty cart if not found
    }

    @PostMapping("/add/tester")
    public ResponseEntity<Cart> addCustomTester(@RequestBody CustomTesterRequest request) {
        try {
            List<Long> switchIds = request.getSwitches().stream()
                .map(SwitchItem::getId)
                .collect(Collectors.toList());

            Cart updatedCart = cartService.addCustomTester(
                request.getCartId(),
                request.getName(),
                request.getSize(),
                request.getKeycaps(),
                switchIds,
                request.getQuantity()
            );
            return ResponseEntity.ok(updatedCart);
        } catch (Exception e) {
            e.printStackTrace();
            throw new ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Error processing request: " + e.getMessage()
            );
        }
    }

    @PostMapping("/{cartId}/verify")
    public ResponseEntity<?> verifyCart(@PathVariable String cartId) {
        try {
            Cart cart = cartService.getCart(cartId)
                .orElseThrow(() -> new CartNotFoundException(cartId));
            
            // Create a pending order and decrease stock
            Order pendingOrder = stockVerificationService.createPendingOrder(cart);
            
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "orderId", pendingOrder.getId()
            ));
            
        } catch (InsufficientStockException e) {
            return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(Map.of("insufficientStock", e.getInsufficientItems()));
        }
    }
}




