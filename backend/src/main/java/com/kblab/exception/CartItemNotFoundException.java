package com.kblab.exception;

public class CartItemNotFoundException extends RuntimeException {
    public CartItemNotFoundException(String cartId, Long itemId) {
        super("Item " + itemId + " not found in cart: " + cartId);
    }
} 