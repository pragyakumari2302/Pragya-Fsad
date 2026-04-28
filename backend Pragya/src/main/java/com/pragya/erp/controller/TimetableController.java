package com.pragya.erp.controller;

import com.pragya.erp.model.Timetable;
import com.pragya.erp.repository.TimetableRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/timetable")
public class TimetableController {
    @Autowired private TimetableRepository repo;

    @GetMapping
    public List<Timetable> getAll() { return repo.findAll(); }

    @GetMapping("/section/{section}")
    public List<Timetable> getBySection(@PathVariable String section) {
        return repo.findBySection(section);
    }

    @GetMapping("/teacher/{teacherId}")
    public List<Timetable> getByTeacher(@PathVariable Long teacherId) {
        return repo.findByTeacherId(teacherId);
    }

    @PostMapping
    public Timetable create(@RequestBody Timetable entry) { return repo.save(entry); }

    @PutMapping("/{id}")
    public ResponseEntity<Timetable> update(@PathVariable Long id, @RequestBody Timetable entry) {
        return repo.findById(id).map(existing -> {
            if (entry.getCourseId() != null) existing.setCourseId(entry.getCourseId());
            if (entry.getTeacherId() != null) existing.setTeacherId(entry.getTeacherId());
            if (entry.getSection() != null) existing.setSection(entry.getSection());
            if (entry.getRoomNumber() != null) existing.setRoomNumber(entry.getRoomNumber());
            if (entry.getDay() != null) existing.setDay(entry.getDay());
            if (entry.getTimeSlot() != null) existing.setTimeSlot(entry.getTimeSlot());
            if (entry.getCourseCode() != null) existing.setCourseCode(entry.getCourseCode());
            if (entry.getCourseTitle() != null) existing.setCourseTitle(entry.getCourseTitle());
            return ResponseEntity.ok(repo.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
