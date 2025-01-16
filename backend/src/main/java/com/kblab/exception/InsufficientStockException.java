package com.kblab.exception;

import java.util.Map;

public class InsufficientStockException extends RuntimeException {
    private Map<String, Integer> insufficientItems;
    public InsufficientStockException(Map<String, Integer> insufficientItems) {
        super("Insufficient stock for items: " + insufficientItems.toString());
        this.insufficientItems = insufficientItems;
    }
    public Map<String, Integer> getInsufficientItems() {
        return insufficientItems;
    }
}