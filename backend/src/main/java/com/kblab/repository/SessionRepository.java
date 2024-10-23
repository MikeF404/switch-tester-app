package com.kblab.repository;

import com.kblab.model.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

public interface SessionRepository extends JpaRepository<Session, String> {
    @Transactional
    void deleteByUserId(Long id);
}
