package com.adnan.erp.repository;

import com.adnan.erp.model.DashboardActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DashboardActivityRepository extends JpaRepository<DashboardActivity, Long> {
}
