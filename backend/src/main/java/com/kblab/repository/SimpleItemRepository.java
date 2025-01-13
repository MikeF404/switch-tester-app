package com.kblab.repository;

import com.kblab.model.SimpleItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SimpleItemRepository extends JpaRepository<SimpleItem, Long> {
} 