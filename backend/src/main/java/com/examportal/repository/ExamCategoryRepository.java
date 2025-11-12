package com.examportal.repository;

import com.examportal.entity.ExamCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ExamCategoryRepository extends JpaRepository<ExamCategory, Long> {
    Optional<ExamCategory> findByName(String name);
    boolean existsByName(String name);
    
    @Query("SELECT COUNT(ec) FROM ExamCategory ec")
    long countCategories();
}
