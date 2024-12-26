package com.kblab.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.kblab.model.*;
import com.kblab.repository.CartRepository;
import com.kblab.repository.OrderRepository;
import com.kblab.repository.UserRepository;
import com.kblab.service.PriceService;
import com.kblab.service.StockService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private StockService stockService;

    @Autowired
    ObjectMapper mapper = new ObjectMapper();
    @Autowired
    private PriceService priceService;

    @PostMapping
    public ResponseEntity<Map<String, Long>> createCart() {
        Cart newCart = new Cart();
        newCart.setCreatedAt(LocalDateTime.now());
        newCart.setItemsJson("[]");  // Empty JSON for a new cart
        cartRepository.save(newCart);

        // Return the ID of the newly created cart
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("cartId", newCart.getId()));
    }

    @GetMapping("/{cartId}")
    public ResponseEntity<?> getCart(@PathVariable Long cartId) {
        return cartRepository.findById(cartId)
                .map(cart -> {
                    // Validate items JSON against inventory stock levels
                    System.out.println("Fetched items JSON: " + cartId);
                    if (cart.getCreatedAt() == null) return ResponseEntity.ok("[]");
                    boolean isValid = stockService.validateCart(cart.getItemsJson());
                    if (!isValid) {
                        return ResponseEntity.badRequest().body("Error: Some items are out of stock or invalid.");
                    }
                    String updatedItemsJson = priceService.updatePrice(cart.getItemsJson());
                    cart.setItemsJson(updatedItemsJson);
                    cartRepository.save(cart);
                    return ResponseEntity.ok(cart.getItemsJson());
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body("Cart not found"));
    }

    @PostMapping("/{cartId}")
    public ResponseEntity<?> updateCart(@PathVariable Long cartId, @RequestBody String itemsJson) {
        return cartRepository.findById(cartId)
                .map(cart -> {
                    // Validate items JSON against inventory stock levels
                    boolean isValid = stockService.validateCart(itemsJson);
                    if (!isValid) {
                        return ResponseEntity.badRequest().body("Error: Some items are out of stock or invalid.");
                    }
                    String updatedItemsJson = priceService.updatePrice(itemsJson);
                    cart.setItemsJson(updatedItemsJson);
                    cartRepository.save(cart);
                    return ResponseEntity.ok("Cart updated successfully.");
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body("Cart not found"));
    }




    @PostMapping("/purchase")
    public ResponseEntity<?> purchaseCart(@RequestParam Long cartId, @RequestParam(required = false) Long userId) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        String itemsJson = cart.getItemsJson();

        // Validate stock availability and decrement inventory if valid
        if (!stockService.checkAndDecrementStock(itemsJson)) {
            return ResponseEntity.badRequest().body("Error: Some items are out of stock.");
        }

        // Create an Order
        Order order = new Order();

        if (userId != null) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            order.setUser(user);
        }

        order.setStatus("in progress");
        order.setCreatedAt(LocalDateTime.now());
        order.setItemsJson(itemsJson);
        order.setTotal(calculateTotal(itemsJson));
        order.setShippingCost(calculateShipping(itemsJson));

        orderRepository.save(order);

        // Delete the cart after purchase
        cartRepository.delete(cart);

        return ResponseEntity.ok("Order placed successfully!");
    }



    private double calculateTotal(String itemsJson) {
        double total = 0.0;
        try {
            JsonNode items = mapper.readTree(itemsJson);
            for (JsonNode item : items) {
                total += priceService.getPrice(item);
            }
        }
        catch (IOException e) {
            e.printStackTrace();
            return -1;
        }
        return total;
    }

    //TODO: Temporary flat rate - potentially replace with Shipping calculation
    private double calculateShipping(String itemsJson) {
        return 8.0;
    }
}
