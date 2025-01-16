package com.kblab.service;

import com.kblab.dto.OrderCreateRequest;
import com.kblab.enums.OrderStatus;
import com.kblab.exception.CartNotFoundException;
import com.kblab.exception.InsufficientStockException;
import com.kblab.exception.ItemNotFoundException;
import com.kblab.exception.OrderNotFoundException;
import com.kblab.model.*;
import com.kblab.repository.ItemRepository;
import com.kblab.repository.OrderRepository;
import com.kblab.repository.SwitchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class StockVerificationService {
    @Autowired
    private ItemRepository itemRepository;
    
    @Autowired
    private SwitchRepository switchRepository;
    
    @Autowired
    private CartService cartService;
    
    @Autowired
    private OrderRepository orderRepository;

    public Order verifyAndCreateOrder(OrderCreateRequest request) {
        Cart cart = cartService.getCart(request.getCartId())
            .orElseThrow(() -> new CartNotFoundException(request.getCartId()));

        verifyStock(cart);

        // Create order with customer information
        Order order = new Order();
        order.setCartId(request.getCartId());
        order.setStatus(OrderStatus.STARTED);
        order.setEmail(request.getEmail());
        order.setCustomerName(request.getCustomerName());
        
        // Map address
        Address address = new Address();
        address.setStreet(request.getShippingAddress().getStreet());
        address.setApartment(request.getShippingAddress().getApartment());
        address.setCity(request.getShippingAddress().getCity());
        address.setState(request.getShippingAddress().getState());
        address.setZipCode(request.getShippingAddress().getZipCode());
        address.setCountry(request.getShippingAddress().getCountry());
        order.setShippingAddress(address);

        // Create order items
        createOrderItems(order, cart);
        
        // Calculate totals
        order.calculateTotals();

        // Decrease stock
        decreaseStock(cart);

        return orderRepository.save(order);
    }

    private void createOrderItems(Order order, Cart cart) {
        for (CartItem cartItem : cart.getItems()) {
            OrderItem orderItem = new OrderItem(
                order,
                cartItem.getItem(),
                cartItem.getQuantity()
            );
            order.getItems().add(orderItem);
        }
    }

    private void decreaseStock(Cart cart) {
        for (CartItem cartItem : cart.getItems()) {
            if (cartItem.getItem() instanceof SimpleItem) {
                SimpleItem item = (SimpleItem) cartItem.getItem();
                item.setStock(item.getStock() - cartItem.getQuantity());
                itemRepository.save(item);
            } else if (cartItem.getItem() instanceof Tester) {
                Tester tester = (Tester) cartItem.getItem();
                for (Switch switch_ : tester.getSwitches()) {
                    switch_.setStock(switch_.getStock() - cartItem.getQuantity());
                    switchRepository.save(switch_);
                }
            }
        }
    }

    @Scheduled(fixedRate = 60000) // Run every minute
    @Transactional
    public void checkExpiredOrders() {
        List<Order> expiredOrders = orderRepository.findByStatusAndExpiresAtBefore(
            OrderStatus.STARTED, 
            LocalDateTime.now()
        );

        for (Order order : expiredOrders) {
            returnStockToInventory(order);
            order.setStatus(OrderStatus.EXPIRED);
            orderRepository.save(order);
        }
    }

    private void returnStockToInventory(Order order) {
        Cart cart = cartService.getCart(order.getCartId())
            .orElseThrow(() -> new CartNotFoundException(order.getCartId()));

        for (CartItem cartItem : cart.getItems()) {
            if (cartItem.getItem() instanceof SimpleItem) {
                SimpleItem item = (SimpleItem) cartItem.getItem();
                item.setStock(item.getStock() + cartItem.getQuantity());
                itemRepository.save(item);
            } else if (cartItem.getItem() instanceof Tester) {
                Tester tester = (Tester) cartItem.getItem();
                for (Switch switch_ : tester.getSwitches()) {
                    switch_.setStock(switch_.getStock() + cartItem.getQuantity());
                    switchRepository.save(switch_);
                }
            }
        }
    }

    public void verifyStock(Cart cart) {
        Map<String, Integer> insufficientItems = new HashMap<>();
        
        // Track total quantity needed for each switch across all testers
        Map<Long, Integer> switchQuantityNeeded = new HashMap<>();
        
        for (CartItem cartItem : cart.getItems()) {
            if (cartItem.getItem() instanceof SimpleItem) {
                SimpleItem item = (SimpleItem) cartItem.getItem();
                if (item.getStock() < cartItem.getQuantity()) {
                    insufficientItems.put(item.getName(), item.getStock());
                }
            } else if (cartItem.getItem() instanceof Tester) {
                Tester tester = (Tester) cartItem.getItem();
                // For each switch in the tester, we need (quantity * tester quantity)
                for (Switch switch_ : tester.getSwitches()) {
                    int currentQuantityNeeded = switchQuantityNeeded.getOrDefault(switch_.getId(), 0);
                    switchQuantityNeeded.put(
                        switch_.getId(), 
                        currentQuantityNeeded + cartItem.getQuantity()
                    );
                }
            }
        }
        
        // Verify switch quantities
        for (Map.Entry<Long, Integer> entry : switchQuantityNeeded.entrySet()) {
            Switch switch_ = switchRepository.findById(entry.getKey())
                .orElseThrow(() -> new ItemNotFoundException(entry.getKey()));
                
            if (switch_.getStock() < entry.getValue()) {
                insufficientItems.put(switch_.getName(), switch_.getStock());
            }
        }

        if (!insufficientItems.isEmpty()) {
            throw new InsufficientStockException(insufficientItems);
        }
    }

    public Order getOrder(Long orderId) {
        return orderRepository.findById(orderId)
            .orElseThrow(() -> new OrderNotFoundException(orderId));
    }

    @Transactional
    public Order completeOrder(Long orderId) {
        Order order = getOrder(orderId);
        if (order.getStatus() != OrderStatus.STARTED) {
            throw new IllegalStateException("Order is not in STARTED state");
        }
        
        order.setStatus(OrderStatus.COMPLETED);
        order.setCompletedAt(LocalDateTime.now());
        return orderRepository.save(order);
    }

    @Transactional
    public Order cancelOrder(Long orderId) {
        Order order = getOrder(orderId);
        if (order.getStatus() == OrderStatus.COMPLETED) {
            throw new IllegalStateException("Cannot cancel completed order");
        }
        
        order.setStatus(OrderStatus.CANCELLED);
        returnStockToInventory(order);
        return orderRepository.save(order);
    }

    @Transactional
    public Order createPendingOrder(Cart cart) {
        // First verify stock
        verifyStock(cart);

        // Create order
        Order order = new Order();
        order.setCartId(cart.getId());
        order.setStatus(OrderStatus.STARTED);
        order.setCreatedAt(LocalDateTime.now());
        order.setExpiresAt(LocalDateTime.now().plusMinutes(15));

        // Create order items
        for (CartItem cartItem : cart.getItems()) {
            OrderItem orderItem = new OrderItem(order, cartItem.getItem(), cartItem.getQuantity());
            order.getItems().add(orderItem);
        }

        // Calculate initial totals
        order.calculateTotals();

        // Decrease stock
        decreaseStock(cart);

        // Save and return the order
        return orderRepository.save(order);
    }
} 