package com.pinto.ReactEcommerceBackend.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pinto.ReactEcommerceBackend.entity.User;

public interface UserRepository extends JpaRepository<User, UUID> {
    User findByUsername(String username);
    User findByEmail(String email);
}
