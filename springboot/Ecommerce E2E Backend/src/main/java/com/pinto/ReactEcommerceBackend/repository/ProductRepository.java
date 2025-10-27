package com.pinto.ReactEcommerceBackend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.pinto.ReactEcommerceBackend.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Integer>,JpaSpecificationExecutor<Product> {

	List<Product> findByIsDealOfTheDay(boolean isDeal);

}
