package com.kblab.model;

import jakarta.persistence.*;

@Entity
@Table(name = "switches")
public class Switch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String brand;
    private String type;
    private int available;
    private String force;
    private String image;

    // Constructors, Getters, and Setters

    public Switch() {}

    public Switch(String name, String brand, String type, int available, String force, String image) {
        this.name = name;
        this.brand = brand;
        this.type = type;
        this.available = available;
        this.force = force;
        this.image = image;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public int getAvailable() {
        return available;
    }

    public void setAvailable(int available) {
        this.available = available;
    }

    public String getForce() {
        return force;
    }

    public void setForce(String force) {
        this.force = force;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }
}