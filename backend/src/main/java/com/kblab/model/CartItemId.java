package com.kblab.model;

import java.io.Serializable;
import java.util.Objects;

public class CartItemId implements Serializable {
    private String cart;  // Must match the name of the field in CartItem
    private Long item;    // Must match the name of the field in CartItem

    public CartItemId() {}

    public CartItemId(String cart, Long item) {
        this.cart = cart;
        this.item = item;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CartItemId that = (CartItemId) o;
        return Objects.equals(cart, that.cart) && 
               Objects.equals(item, that.item);
    }

    @Override
    public int hashCode() {
        return Objects.hash(cart, item);
    }
} 