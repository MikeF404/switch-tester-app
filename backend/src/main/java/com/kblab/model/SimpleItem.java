package com.kblab.model;
import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "simple_items")
public class SimpleItem extends Item {
    private Integer stock;

    // Constructors
    public SimpleItem() {}
    
    public SimpleItem(String name, BigDecimal price, Integer stock) {
        super(name, price);
        this.stock = stock;
    }

    // Getter and setter
    public Integer getStock() {
        return stock;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }
} 
