package com.kblab.model;

import java.io.Serializable;
import java.util.Objects;

public class OrderItemId implements Serializable {
    private Long order;  // Must match the field name in OrderItem
    private Long item;   // Must match the field name in OrderItem

    public OrderItemId() {}

    public OrderItemId(Long order, Long item) {
        this.order = order;
        this.item = item;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        OrderItemId that = (OrderItemId) o;
        return Objects.equals(order, that.order) && 
               Objects.equals(item, that.item);
    }

    @Override
    public int hashCode() {
        return Objects.hash(order, item);
    }
} 