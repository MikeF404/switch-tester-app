package com.kblab.dto;

public class SwitchItem {
    private Long id;
    private Integer quantity;

    // Default constructor
    public SwitchItem() {}

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
}