package com.pragya.erp.repository;

import com.pragya.erp.model.Timetable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TimetableRepository extends JpaRepository<Timetable, Long> {
    List<Timetable> findBySection(String section);
    List<Timetable> findByTeacherId(Long teacherId);
    List<Timetable> findByCourseId(Long courseId);
}
