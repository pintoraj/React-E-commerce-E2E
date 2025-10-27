package com.pinto.ReactEcommerceBackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pinto.ReactEcommerceBackend.entity.Category;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Integer>{
		
}
