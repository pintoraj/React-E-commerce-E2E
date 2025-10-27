package com.pinto.ReactEcommerceBackend.service;
import com.pinto.ReactEcommerceBackend.entity.Category;
import com.pinto.ReactEcommerceBackend.entity.Product;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class ProductSpecification {

    public Specification<Product> withFilters(
            String searchTerm,
            List<String> brands,
            List<String> categories,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            BigDecimal minRating) {

        return (Root<Product> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
            Predicate p = cb.conjunction(); // Start with a "true" predicate

            // 1. Search Term Filter (checks name and description)
            if (searchTerm != null && !searchTerm.isEmpty()) {
                p = cb.and(p, cb.or(
                        cb.like(cb.lower(root.get("productName")), "%" + searchTerm.toLowerCase() + "%"),
                        cb.like(cb.lower(root.get("productDescription")), "%" + searchTerm.toLowerCase() + "%")
                ));
            }

            // 2. Brand Filter
            if (brands != null && !brands.isEmpty()) {
                p = cb.and(p, root.get("brand").in(brands));
            }

            // 3. Category Filter (requires a JOIN)
            if (categories != null && !categories.isEmpty()) {
                Join<Product, Category> categoryJoin = root.join("category");
                p = cb.and(p, categoryJoin.get("categoryName").in(categories));
            }

            // 4. Price Range Filter
            if (minPrice != null) {
                p = cb.and(p, cb.greaterThanOrEqualTo(root.get("price"), minPrice));
            }
            if (maxPrice != null) {
                p = cb.and(p, cb.lessThanOrEqualTo(root.get("price"), maxPrice));
            }

            // 5. Rating Filter
            if (minRating != null) {
                p = cb.and(p, cb.greaterThanOrEqualTo(root.get("rating"), minRating));
            }

            return p;
        };
    }
}
