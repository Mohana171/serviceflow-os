package com.serviceflow.backend.repository;

import com.serviceflow.backend.entity.Note;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NoteRepository extends JpaRepository<Note, Long> {

    List<Note> findByJobIdOrderByCreatedAtAsc(Long jobId);
}