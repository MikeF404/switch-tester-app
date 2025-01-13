package com.kblab.service;

import com.kblab.model.Cart;
import com.kblab.model.CartItem;
import com.kblab.model.Item;
import com.kblab.repository.CartRepository;
import com.kblab.repository.CartItemRepository;
import com.kblab.repository.ItemRepository;
import com.kblab.exception.CartNotFoundException;
import com.kblab.exception.ItemNotFoundException;
import com.kblab.exception.CartItemNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class CartService {
    @Autowired
    private CartRepository cartRepository;
    
    @Autowired
    private CartItemRepository cartItemRepository;
    
    @Autowired
    private ItemRepository itemRepository;

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
} 