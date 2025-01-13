package com.kblab.exception;

public class CartNotFoundException extends RuntimeException {
    public CartNotFoundException(String cartId) {
        super("Cart not found with id: " + cartId);
    }
} 