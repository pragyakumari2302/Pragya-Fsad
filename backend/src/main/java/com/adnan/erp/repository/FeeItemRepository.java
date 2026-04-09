package com.adnan.erp.repository;
import com.adnan.erp.model.FeeItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FeeItemRepository extends JpaRepository<FeeItem, Long> {}
