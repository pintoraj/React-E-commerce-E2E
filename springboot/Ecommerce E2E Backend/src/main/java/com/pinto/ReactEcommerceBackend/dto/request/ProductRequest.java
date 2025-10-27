package com.pinto.ReactEcommerceBackend.dto.request;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ProductRequest {
	
	@NotBlank(message="Product name should not be empty")
	@Size(min = 3,max = 255, message = "Product characters should be min 3 and max 255")
	private String productName;
	
	private String productDescription;
	
	@NotNull(message = "Price shouldn't be empty")
	@Positive(message = "Price should be a positive number")
	private BigDecimal productPrice;
	
	private String imageURL;
	private String productThumbnail;
	
	@NotNull(message = "Product shouldn't be empty")
	private String productBrand;
	
	private boolean isDealOfTheDay;
	
	@NotNull(message = "Product rating shouldn't be null")
	@Positive(message = "Rating shouldn't be negative")
	private BigDecimal productRating;
	
	@NotNull(message = "Product stock shouldn't be null")
	@Positive(message = "Stock shouldn't be negative")
	private Integer productStock;
	
	@NotNull(message = "Category Id is required")
	private Integer categoryID;
}
