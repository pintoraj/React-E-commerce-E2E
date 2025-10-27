package com.pinto.ReactEcommerceBackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class ReactEcommerceBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(ReactEcommerceBackendApplication.class, args);
	}

}

