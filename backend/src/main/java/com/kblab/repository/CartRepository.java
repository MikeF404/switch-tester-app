package com.kblab.repository;

import com.kblab.model.Cart;
import com.kblab.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {
    Optional<Cart> findByUser(User user);
    void deleteByUser(User user);
}
