package com.pinto.ReactEcommerceBackend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.pinto.ReactEcommerceBackend.dto.request.CategoryRequest;
import com.pinto.ReactEcommerceBackend.dto.response.CategoryResponse;
import com.pinto.ReactEcommerceBackend.entity.Category;
import com.pinto.ReactEcommerceBackend.exception.ResourceNotFoundException;
import com.pinto.ReactEcommerceBackend.repository.CategoryRepository;

@Service
public class CategoryService {
	
	@Autowired
	private CategoryRepository categoryRepository;
	
	@Autowired
	private ModelMapper modelMapper;
	
	public CategoryResponse createCategory(CategoryRequest request) {
		Category category = modelMapper.map(request, Category.class);
		Category savedCategory = categoryRepository.save(category);
		
		return modelMapper.map(savedCategory, CategoryResponse.class);
		}
	
	public CategoryResponse getCategoryByID(Integer categoryID) {
		 Category category=  categoryRepository.findById(categoryID)
		.orElseThrow(()->new ResourceNotFoundException("Category not found"));
		 return modelMapper.map(category, CategoryResponse.class);
	}
	
	public List<CategoryResponse> getAllCategories(){
		return categoryRepository.findAll().stream()
				.map(category -> modelMapper.map(category,CategoryResponse.class))
				.collect(Collectors.toList());
	}
	
	
	public CategoryResponse updateCategory(Integer categoryID, CategoryRequest request) {
		Category existingCategory = categoryRepository.findById(categoryID)
				.orElseThrow(()-> new ResourceNotFoundException("Category not found.."));
		
		existingCategory.setCategoryName(request.getCategoryName());
		existingCategory.setCategoryDescription(request.getCategoryDescription());
		
		Category updatedCategory = categoryRepository.save(existingCategory);
		return modelMapper.map(updatedCategory,CategoryResponse.class);
	}
	
	public void deleteCategory(Integer categoryID) {
		if(!categoryRepository.existsById(categoryID)) {
			throw new ResourceNotFoundException("Category not found to delete");
		}
		
		categoryRepository.deleteById(categoryID);
	}
}
;