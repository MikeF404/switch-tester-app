package com.kblab.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Table(name = "cart_items")
@IdClass(CartItemId.class)  // Reference to our composite key class
public class CartItem {
    @Id
    @ManyToOne
    @JoinColumn(name = "cart_id")
    @JsonBackReference
    private Cart cart;

    @Id
    @ManyToOne
    @JoinColumn(name = "item_id")
    private Item item;

    private Integer quantity;

    // Constructors
    public CartItem() {}

    public CartItem(Cart cart, Item item, Integer quantity) {
        this.cart = cart;
        this.item = item;
        this.quantity = quantity;
    }

    // Getters and setters
    public Cart getCart() {
        return cart;
    }

    public void setCart(Cart cart) {
        this.cart = cart;
    }

    public Item getItem() {
        return item;
    }

    public void setItem(Item item) {
        this.item = item;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}