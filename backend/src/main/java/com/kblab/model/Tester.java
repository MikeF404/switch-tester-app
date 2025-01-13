package com.kblab.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "testers")
public class Tester extends Item {
    @ManyToMany
    @JoinTable(
        name = "tester_switches",
        joinColumns = @JoinColumn(name = "tester_id"),
        inverseJoinColumns = @JoinColumn(name = "switch_id")
    )
    private Set<Switch> switches = new HashSet<>();
    
    private String keycaps; // null, "transparent", or "random"

    // Constructors
    public Tester() {}
    
    public Tester(String name, BigDecimal price, Set<Switch> switches, String keycaps) {
        super(name, price);
        this.switches = switches;
        this.keycaps = keycaps;
    }

    // Getters and setters
    public Set<Switch> getSwitches() {
        return switches;
    }

    public void setSwitches(Set<Switch> switches) {
        this.switches = switches;
    }

    public String getKeycaps() {
        return keycaps;
    }

    public void setKeycaps(String keycaps) {
        this.keycaps = keycaps;
    }
} 