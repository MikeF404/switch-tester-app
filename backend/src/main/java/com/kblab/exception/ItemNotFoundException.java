package com.kblab.exception;

public class ItemNotFoundException extends RuntimeException {
    public ItemNotFoundException(Long itemId) {
        super("Item not found with id: " + itemId);
    }
} 