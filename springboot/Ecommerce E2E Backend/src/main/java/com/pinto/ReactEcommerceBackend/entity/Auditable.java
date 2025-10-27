package com.pinto.ReactEcommerceBackend.entity;

import java.time.Instant;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import lombok.Data;

@Data
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class Auditable {
	
	@CreatedDate
	@Column(name = "created_at",updatable = false)
	private Instant created_at;
	
	@LastModifiedDate
	@Column(name = "updated_at")
	private Instant updated_at;

}
