package com.kblab.dto;

public class OrderCreateRequest {
    private String cartId;
    private String email;
    private String customerName;
    private AddressDTO shippingAddress;

    public OrderCreateRequest() {
    }

    public OrderCreateRequest(String cartId, String email, String customerName, AddressDTO shippingAddress) {
        this.cartId = cartId;
        this.email = email;
        this.customerName = customerName;
        this.shippingAddress = shippingAddress;
    }

    // Getters and setters

    public String getCartId() {
        return cartId;
    }

    public void setCartId(String cartId) {
        this.cartId = cartId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public AddressDTO getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(AddressDTO shippingAddress) {
        this.shippingAddress = shippingAddress;
    }
}

