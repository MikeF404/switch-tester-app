package com.kblab.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "carts")
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SimpleCartItem> simpleItems = new ArrayList<>();

    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ComplexCartItem> complexItems = new ArrayList<>();

    // Getters and Setters
    public Cart() {}

    public Cart(LocalDateTime createdAt, LocalDateTime updatedAt, List<SimpleCartItem> simpleItems, List<ComplexCartItem> complexItems) {
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.simpleItems = simpleItems;
        this.complexItems = complexItems;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<SimpleCartItem> getSimpleItems() {
        return simpleItems;
    }

    public void setSimpleItems(List<SimpleCartItem> simpleItems) {
        this.simpleItems = simpleItems;
    }

    public List<ComplexCartItem> getComplexItems() {
        return complexItems;
    }

    public void setComplexItems(List<ComplexCartItem> complexItems) {
        this.complexItems = complexItems;
    }
}
