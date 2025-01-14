package com.kblab.dto;

import java.util.List;

public class CustomTesterRequest {
    private String cartId;
    private String name;
    private Integer size;
    private String keycaps;
    private List<SwitchItem> switches;
    private Integer quantity;

    // Default constructor
    public CustomTesterRequest() {}

    // Getters and setters
    public String getCartId() { return cartId; }
    public void setCartId(String cartId) { this.cartId = cartId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getSize() { return size; }
    public void setSize(Integer size) { this.size = size; }

    public String getKeycaps() { return keycaps; }
    public void setKeycaps(String keycaps) { this.keycaps = keycaps; }

    public List<SwitchItem> getSwitches() { return switches; }
    public void setSwitches(List<SwitchItem> switches) { this.switches = switches; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
}