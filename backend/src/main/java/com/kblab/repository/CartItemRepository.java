package com.kblab.repository;

import com.kblab.model.CartItem;
import com.kblab.model.CartItemId;
import com.kblab.model.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, CartItemId> {
    List<CartItem> findByCart(Cart cart);
    void deleteByCart(Cart cart);
    Optional<CartItem> findByCartIdAndItemId(String cartId, Long itemId);
} 