package com.pinto.ReactEcommerceBackend.dto.response;

import java.math.BigDecimal;
import java.time.Instant;

import lombok.Data;

@Data
public class ProductResponse {
	private Integer productId;
	
	private String productName;
	private String productDescription;
	private BigDecimal productPrice;
	private String imageURL;
	private String productThumbnail;
	private String productBrand;
	private BigDecimal  productRating;
	private Integer productStock;
	private boolean isDealOfTheDay;

	//Category Object 
	private Integer categoryID;
	private String categoryName;
	private Instant created_at;
	private Instant updated_at;

}
