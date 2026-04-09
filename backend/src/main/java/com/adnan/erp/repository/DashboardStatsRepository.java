package com.adnan.erp.repository;

import com.adnan.erp.model.DashboardStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DashboardStatsRepository extends JpaRepository<DashboardStats, Long> {
}
