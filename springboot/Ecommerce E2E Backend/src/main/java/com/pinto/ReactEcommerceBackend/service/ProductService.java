package com.pinto.ReactEcommerceBackend.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.pinto.ReactEcommerceBackend.dto.request.ProductRequest;
import com.pinto.ReactEcommerceBackend.dto.response.ProductResponse;
import com.pinto.ReactEcommerceBackend.entity.Category;
import com.pinto.ReactEcommerceBackend.entity.Product;
import com.pinto.ReactEcommerceBackend.exception.ResourceNotFoundException;
import com.pinto.ReactEcommerceBackend.repository.CategoryRepository;
import com.pinto.ReactEcommerceBackend.repository.ProductRepository;

@Service
public class ProductService{
	@Autowired
	private ProductRepository productRepository;
	@Autowired
	private CategoryRepository categoryRepository;

	@Autowired
	private ProductSpecification productSpecification;

	@Autowired
	private ModelMapper modelMapper;

public ProductResponse createProduct(ProductRequest request) {

        Category category = categoryRepository.findById(request.getCategoryID())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryID()));

        Product product = new Product();
        product.setProductName(request.getProductName());
        product.setProductDescription(request.getProductDescription());
        product.setPrice(request.getProductPrice());
        product.setBrand(request.getProductBrand());
        product.setRating(request.getProductRating());
        product.setStock(request.getProductStock());
        product.setThumbnail(request.getImageURL());
        product.setImageUrls(request.getImageURL());

        product.setCategory(category);
        Product savedProduct = productRepository.save(product);

        ProductResponse response = new ProductResponse();
        response.setProductName(savedProduct.getProductName());
        response.setProductDescription(savedProduct.getProductDescription());
        response.setProductPrice(savedProduct.getPrice());
        response.setImageURL(savedProduct.getImageUrls());
        response.setProductThumbnail(savedProduct.getImageUrls());
        response.setProductBrand(savedProduct.getBrand());
        response.setProductRating(savedProduct.getRating());
        response.setProductStock(savedProduct.getStock());
        response.setCreated_at(savedProduct.getCreated_at());
        response.setUpdated_at(savedProduct.getUpdated_at());
        response.setCategoryID(savedProduct.getCategory().getCategoryId());
        response.setCategoryName(savedProduct.getCategory().getCategoryName());
        return response;
    }

		public Page<ProductResponse> getAllProducts(
            Pageable pageable,
            String searchTerm,
            List<String> brands,
            List<String> categories,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            BigDecimal minRating) {
        Specification<Product> spec = productSpecification.withFilters(
                searchTerm, brands, categories, minPrice, maxPrice, minRating
        );
        Page<Product> productPage = productRepository.findAll(spec, pageable);
        return productPage.map(this::responseHelper);
    }

	public ProductResponse getProductByID(Integer productID) {
		Product product = productRepository.findById(productID)
				.orElseThrow(()->new ResourceNotFoundException("Product not found with id: " + productID));
		return responseHelper(product);
	}

	public List<ProductResponse> getAllProducts(){
		return productRepository.findAll().stream()
				.map(this::responseHelper)
				.collect(Collectors.toList());
	}

	public List<ProductResponse> getDealOfTheDay(){
		List<Product> dealProducts = productRepository.findByIsDealOfTheDay(true);
		return dealProducts.stream()
				.map(this::responseHelper)
				.collect(Collectors.toList());
	}

	public ProductResponse updateProduct(Integer productID, ProductRequest updateRequest) {
		Product existingProduct= productRepository.findById(productID)
				.orElseThrow(()->new RuntimeException());
		Category category = categoryRepository.findById(updateRequest.getCategoryID())
				.orElseThrow(()->new RuntimeException());

		existingProduct.setProductName(updateRequest.getProductName());
		existingProduct.setProductDescription(updateRequest.getProductDescription());
		existingProduct.setBrand(updateRequest.getProductBrand());
		existingProduct.setImageUrls(updateRequest.getImageURL());
		existingProduct.setThumbnail(updateRequest.getProductThumbnail());
		existingProduct.setPrice( updateRequest.getProductPrice());
		existingProduct.setRating( updateRequest.getProductRating());
		existingProduct.setStock(updateRequest.getProductStock());
		existingProduct.setCategory(category);

		Product updatedProduct = productRepository.save(existingProduct);
		return responseHelper(updatedProduct);

	}

	public void deleteProduct(Integer productID) {
		if(!productRepository.existsById(productID)) {
			throw new ResourceNotFoundException("Product not found with id: " + productID);
		}
		productRepository.deleteById(productID);
	}


	private ProductResponse responseHelper(Product product) {
		ProductResponse response = modelMapper.map(product,ProductResponse.class);

		if(product.getCategory()!=null) {
			response.setCategoryName(product.getCategory().getCategoryName());
			response.setCategoryID(product.getCategory().getCategoryId());
		}
		return response;
	}
}
