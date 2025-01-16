package com.kblab.repository;

import com.kblab.enums.OrderStatus;
import com.kblab.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByEmail(String email);
    List<Order> findByStatusAndExpiresAtBefore(OrderStatus orderStatus, LocalDateTime now);
} 