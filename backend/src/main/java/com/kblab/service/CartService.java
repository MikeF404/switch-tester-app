package com.kblab.service;

import com.kblab.exception.SwitchNotFoundException;
import com.kblab.model.*;
import com.kblab.repository.CartRepository;
import com.kblab.repository.CartItemRepository;
import com.kblab.repository.ItemRepository;
import com.kblab.exception.CartNotFoundException;
import com.kblab.exception.ItemNotFoundException;
import com.kblab.exception.CartItemNotFoundException;
import com.kblab.repository.SwitchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.List;

@Service
public class CartService {
    @Autowired
    private CartRepository cartRepository;
    
    @Autowired
    private CartItemRepository cartItemRepository;
    
    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private SwitchRepository switchRepository;

    public Cart createCart() {
        Cart cart = new Cart();
        return cartRepository.save(cart);
    }

    public Optional<Cart> getCart(String cartId) {
        return cartRepository.findById(cartId);
    }

    @Transactional
    public Cart addItemToCart(String cartId, Long itemId, Integer quantity) {
        Cart cart = cartId == null ? 
            createCart() : 
            cartRepository.findById(cartId).orElseGet(this::createCart);
            
        Item item = itemRepository.findById(itemId)
            .orElseThrow(() -> new ItemNotFoundException(itemId));

        // Try to find existing cart item
        Optional<CartItem> existingCartItem = cartItemRepository
            .findByCartIdAndItemId(cart.getId(), itemId);

        if (existingCartItem.isPresent()) {
            // Update quantity of existing item
            CartItem cartItem = existingCartItem.get();
            cartItem.setQuantity(cartItem.getQuantity() + quantity);
        } else {
            // Create new cart item
            CartItem cartItem = new CartItem(cart, item, quantity);
            cart.getItems().add(cartItem);
        }

        cart.setUpdatedAt(LocalDateTime.now());
        return cartRepository.save(cart);
    }

    @Transactional
    public Cart updateItemQuantity(String cartId, Long itemId, Integer quantity) {
        Cart cart = cartRepository.findById(cartId)
            .orElseThrow(() -> new CartNotFoundException(cartId));

        CartItem cartItem = cartItemRepository
            .findByCartIdAndItemId(cartId, itemId)
            .orElseThrow(() -> new CartItemNotFoundException(cartId, itemId));

        if (quantity <= 0) {
            cart.getItems().remove(cartItem);
            cartItemRepository.delete(cartItem);
        } else {
            cartItem.setQuantity(quantity);
        }

        cart.setUpdatedAt(LocalDateTime.now());
        return cartRepository.save(cart);
    }

    @Transactional
    public Cart removeItemFromCart(String cartId, Long itemId) {
        return updateItemQuantity(cartId, itemId, 0);
    }

    @Transactional
    public Cart addCustomTester(
        String cartId,
        String name,
        Integer size,
        String keycaps,
        List<Long> switchIds,
        Integer quantity
    ) {
        // Get existing cart or create new one
        Cart cart;
        if (cartId != null) {
            cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart not found: " + cartId));
        } else {
            cart = new Cart();
        }
        
        // Create new tester
        Tester tester = new Tester();
        tester.setSize(size);
        tester.setKeycaps(keycaps);
        tester.setName(name);
        
        // Calculate price based on size and keycaps
        double basePrice = switch(size) {
            case 10 -> 9.99;
            case 15 -> 13.99;
            case 20 -> 17.99;
            default -> throw new IllegalArgumentException("Invalid size");
        };
        
        double keycapPrice = switch(keycaps) {
            case "none" -> 0;
            case "random" -> size * 0.1;
            case "transparent" -> size * 0.2;
            default -> throw new IllegalArgumentException("Invalid keycap type");
        };
        
        tester.setPrice(BigDecimal.valueOf(basePrice + keycapPrice));

        // Add switches
        for (Long switchId : switchIds) {
            Switch switch_ = switchRepository.findById(switchId)
                .orElseThrow(() -> new SwitchNotFoundException(switchId));
            tester.addSwitch(switch_);
        }

        // Save tester first
        tester = (Tester) itemRepository.save(tester);
        
        // Add to cart
        cart.addItem(new CartItem(cart, tester, quantity));
        
        // Save and return cart
        return cartRepository.save(cart);
    }
} 