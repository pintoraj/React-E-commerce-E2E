package com.pinto.ReactEcommerceBackend.dto.response;

import java.time.Instant;

import lombok.Data;

@Data
public class CategoryResponse {
	private Integer categoryId;
	private String categoryName;
	private String categoryDescription;
	private Instant created_at;
	private Instant updated_at;
	
}
