package com.serviceflow.backend.repository;

import com.serviceflow.backend.entity.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    List<Schedule> findByUserId(Long userId);
}