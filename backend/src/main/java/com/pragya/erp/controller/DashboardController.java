package com.pragya.erp.controller;

import com.pragya.erp.model.DashboardStats;
import com.pragya.erp.model.DashboardActivity;
import com.pragya.erp.repository.DashboardStatsRepository;
import com.pragya.erp.repository.DashboardActivityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardStatsRepository statsRepository;
    
    @Autowired
    private DashboardActivityRepository activityRepository;

    @GetMapping
    public Map<String, Object> getDashboard() {
        DashboardStats stats = statsRepository.findById(1L).orElse(new DashboardStats(1L, 0, 0, 0, 0));

        return Map.of(
                "stats", stats,
                "recentActivity", activityRepository.findAll()
        );
    }
}
