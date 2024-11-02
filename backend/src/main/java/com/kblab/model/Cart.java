package com.kblab.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

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

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = true)
    private User user;

    @Lob
    private String itemsJson;

    // Getters and Setters
    public Cart() {}

    public Cart(LocalDateTime createdAt, LocalDateTime updatedAt, User user, String itemsJson) {
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.user = user;
        this.itemsJson = itemsJson;
    }
    public Cart(LocalDateTime createdAt, LocalDateTime updatedAt, User user) {
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.user = user;
    }
    public Cart(LocalDateTime createdAt, LocalDateTime updatedAt, String itemsJson) {
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.itemsJson = itemsJson;
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

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getItemsJson() {
        return itemsJson;
    }

    public void setItemsJson(String itemsJson) {
        this.itemsJson = itemsJson;
    }
}
