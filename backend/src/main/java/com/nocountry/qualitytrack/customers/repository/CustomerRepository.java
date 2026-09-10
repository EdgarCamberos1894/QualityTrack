package com.nocountry.qualitytrack.customers.repository;

import com.nocountry.qualitytrack.customers.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
}
