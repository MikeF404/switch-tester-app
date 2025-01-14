package com.kblab.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "testers")
public class Tester extends Item {
    private Integer size;
    private String keycaps;

    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
        name = "tester_switches",
        joinColumns = @JoinColumn(name = "tester_id"),
        inverseJoinColumns = @JoinColumn(name = "switch_id")
    )
    private Set<Switch> switches = new HashSet<>();

    // Default constructor
    public Tester() {
        super();
    }

    // Getters and setters
    public Integer getSize() {
        return size;
    }

    public void setSize(Integer size) {
        this.size = size;
    }

    public String getKeycaps() {
        return keycaps;
    }

    public void setKeycaps(String keycaps) {
        this.keycaps = keycaps;
    }

    public Set<Switch> getSwitches() {
        return switches;
    }

    public void setSwitches(Set<Switch> switches) {
        this.switches = switches;
    }

    public void addSwitch(Switch switch_) {
        this.switches.add(switch_);
    }
} 