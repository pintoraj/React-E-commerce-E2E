package com.pinto.ReactEcommerceBackend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CategoryRequest {
	@NotNull(message = "Category name shouldn't be empty")
	private String categoryName;
	private String categoryDescription;
}
