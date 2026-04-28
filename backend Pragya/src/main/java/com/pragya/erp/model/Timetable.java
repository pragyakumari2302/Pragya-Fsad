package com.pragya.erp.model;

import jakarta.persistence.*;

@Entity
public class Timetable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long courseId;
    private Long teacherId;
    private String section;
    private String roomNumber;
    private String day;       // Monday, Tuesday, etc.
    private String timeSlot;  // e.g. "09:00 - 11:00"
    private String courseCode;
    private String courseTitle;

    public Timetable() {}

    public Timetable(Long courseId, Long teacherId, String section, String roomNumber,
                     String day, String timeSlot, String courseCode, String courseTitle) {
        this.courseId = courseId;
        this.teacherId = teacherId;
        this.section = section;
        this.roomNumber = roomNumber;
        this.day = day;
        this.timeSlot = timeSlot;
        this.courseCode = courseCode;
        this.courseTitle = courseTitle;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }
    public Long getTeacherId() { return teacherId; }
    public void setTeacherId(Long teacherId) { this.teacherId = teacherId; }
    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }
    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }
    public String getDay() { return day; }
    public void setDay(String day) { this.day = day; }
    public String getTimeSlot() { return timeSlot; }
    public void setTimeSlot(String timeSlot) { this.timeSlot = timeSlot; }
    public String getCourseCode() { return courseCode; }
    public void setCourseCode(String courseCode) { this.courseCode = courseCode; }
    public String getCourseTitle() { return courseTitle; }
    public void setCourseTitle(String courseTitle) { this.courseTitle = courseTitle; }
}
