package com.pinto.ReactEcommerceBackend.entity;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;


@Data
@Entity
@Table(name = "products") 
public class Product extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id") 
    private Integer productId;   

    @Column(name = "product_name")
    private String productName;

    @Column(name = "product_description", columnDefinition = "TEXT")
    private String productDescription;
    
    @Column(name = "brand")
    private String brand;
    
    @Column(name = "price")
    private BigDecimal price;
    
    @Column(name = "stock")
    private Integer stock;
    
    @Column(name = "rating")
    private BigDecimal rating;
    
    @Column(name = "thumbnail")
    private String thumbnail;

    @Column(name = "image_urls", columnDefinition = "TEXT")
    private String imageUrls;
    
    @Column(name="is_deal_of_the_day")
    private boolean isDealOfTheDay;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id") 
    private Category category;

	
}