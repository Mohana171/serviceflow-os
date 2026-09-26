package com.serviceflow.backend.repository;

import com.serviceflow.backend.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByJobId(Long jobId);

    List<Appointment> findByTechnicianId(Long technicianId);

    boolean existsByJobIdAndTechnicianId(Long jobId, Long technicianId);
}