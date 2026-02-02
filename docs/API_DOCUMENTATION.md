# SEED Assist Portal - API Documentation

> **Last Updated:** February 2026  
> **Base URL:** `https://seedglobaleducation.com/api/assist/`  
> **Authentication:** Bearer Token (JWT)

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [In-Person Events](#2-in-person-events)
   - [BSF Events](#21-bsf-events)
   - [Campus Tours](#22-campus-tours)
3. [Virtual Events](#3-virtual-events)
4. [In-Country Representation (ICR)](#4-in-country-representation-icr)
5. [Scholarship Portal](#5-scholarship-portal)
6. [University Applications](#6-university-applications)
7. [Lead & Application Engagement (LAE)](#7-lead--application-engagement-lae)
8. [Profile Leads](#8-profile-leads)
9. [School Profile](#9-school-profile)
10. [Programs Management](#10-programs-management)
11. [Team Management](#11-team-management)
12. [AI Visa Tutor](#12-ai-visa-tutor)

---

## Authentication Header

All authenticated endpoints require the following header:

```
Authorization: Bearer <portal_token>
```

The `portal_token` is obtained from the login endpoint and stored in secure cookies.

---

## 1. Authentication

### 1.1 Login

**Endpoint:** `POST /login.php`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "123",
      "email": "user@example.com",
      "name": "John Doe",
      "school_id": "456",
      "school_name": "Example Business School",
      "permissions": {
        "leadGeneration": true,
        "inPersonEvents": true,
        "virtualEvents": true,
        "icrReports": true,
        "scholarshipPortal": true,
        "applicantPools": true,
        "leadAndApplicationEngagement": true,
        "visaPrep": true,
        "schoolProfile": true,
        "teamManagement": true
      }
    }
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

---

## 2. In-Person Events

### 2.1 BSF Events

#### List BSF Events

**Endpoint:** `GET /in-person-event/bsf`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "event_name": "Business School Festival Lagos 2024",
      "city": "Lagos",
      "country": "Nigeria",
      "event_date": "2024-03-15",
      "season": "Spring 2024",
      "registrants": 245,
      "attendees": 198,
      "connections": 156,
      "has_report": true
    }
  ]
}
```

#### Download BSF Report

**Endpoint:** `GET /in-person-event/bsf/reports.php?id={event_id}`

**Response:** Binary XLSX file

**Headers:**
```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="bsf_report_{event_id}.xlsx"
```

---

### 2.2 Campus Tours

#### List Campus Tour Events

**Endpoint:** `GET /in-person-event/campus-tour/`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "event_name": "IIT Delhi Campus Tour",
      "campus": "IIT Delhi",
      "city": "New Delhi",
      "country": "India",
      "event_date": "2024-02-20",
      "campuses_reached": 1,
      "attendees": 450,
      "students_connected": 280,
      "has_report": true
    }
  ]
}
```

#### Download Campus Tour Report

**Endpoint:** `GET /in-person-event/campus-tour/reports.php?id={event_id}`

**Response:** Binary XLSX file

---

## 3. Virtual Events

### 3.1 List Virtual Events

**Endpoint:** `GET /virtual-events/`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | string | Filter by event type: `masterclass`, `meetup`, `all` |
| `year` | string | Filter by year (e.g., `2024`) |
| `month` | string | Filter by month (e.g., `03`) |

**Response:**
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "1",
        "title": "MBA Application Masterclass",
        "type": "masterclass",
        "date": "2024-03-20",
        "time": "14:00",
        "timezone": "IST",
        "registrants": 150,
        "attendees": 98,
        "recording_url": "https://...",
        "has_report": true
      }
    ],
    "summary": {
      "total_events": 25,
      "total_registrants": 3500,
      "total_attendees": 2100
    }
  }
}
```

### 3.2 Download Virtual Event Report

**Endpoint:** `GET /virtual-events/reports.php?id={event_id}`

**Response:** Binary XLSX file

---

## 4. In-Country Representation (ICR)

### 4.1 List ICR Reports

**Endpoint:** `GET /in-country-representation/`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `year` | string | Filter by year |
| `month` | string | Filter by month |

**Response:**
```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "id": "1",
        "title": "Nigeria Monthly Report",
        "country": "Nigeria",
        "region": "West Africa",
        "month": "March",
        "year": "2024",
        "activities_count": 12,
        "leads_generated": 45,
        "report_url": "https://..."
      }
    ],
    "filter_options": {
      "years": ["2024", "2023"],
      "months": ["January", "February", "March"]
    }
  }
}
```

### 4.2 Download ICR Report

**Endpoint:** `GET /in-country-representation/download.php?id={report_id}`

**Response:** Binary PDF/XLSX file

---

## 5. Scholarship Portal

### 5.1 List Scholarship Applicants

**Endpoint:** `GET /scholarship-portal/`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Search by name or email |
| `status` | string | Filter by status |
| `nationality` | string | Filter by nationality |
| `gender` | string | Filter by gender |
| `test_type` | string | Filter by test type (GRE/GMAT) |
| `round` | string | Filter by application round |
| `page` | number | Page number |
| `limit` | number | Items per page |

**Response:**
```json
{
  "success": true,
  "data": {
    "applicants": [
      {
        "id": "1",
        "first_name": "John",
        "last_name": "Doe",
        "email": "john@example.com",
        "phone": "+234123456789",
        "nationality": "NG",
        "nationality_name": "Nigeria",
        "gender": "Male",
        "test_type": "GMAT",
        "test_score": 720,
        "program_applied": "MBA",
        "round": "Round 1",
        "status": "Pending",
        "applied_date": "2024-01-15",
        "documents": {
          "resume": "https://...",
          "sop": "https://...",
          "recommendation": "https://..."
        }
      }
    ],
    "meta": {
      "total": 150,
      "page": 1,
      "limit": 20,
      "total_pages": 8
    },
    "filter_options": {
      "nationalities": [
        { "key": "NG", "value": "Nigeria" },
        { "key": "KE", "value": "Kenya" }
      ],
      "genders": ["Male", "Female", "Other"],
      "test_types": ["GMAT", "GRE", "None"],
      "rounds": ["Round 1", "Round 2", "Round 3"],
      "statuses": ["Pending", "Shortlisted", "SEED Recommended", "Admitted", "Rejected"]
    },
    "status_counts": {
      "Pending": 45,
      "Shortlisted": 30,
      "SEED Recommended": 25,
      "Admitted": 35,
      "Rejected": 15
    }
  }
}
```

### 5.2 Update Applicant Status

**Endpoint:** `POST /scholarship-portal/update-status.php`

**Request Body:**
```json
{
  "applicant_ids": ["1", "2", "3"],
  "status": "Shortlisted"
}
```

**Response:**
```json
{
  "success": true,
  "message": "3 applicants updated successfully"
}
```

### 5.3 View Student Profile

**Endpoint:** `GET /scholarship-portal/student.php?id={applicant_id}`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "+234123456789",
    "nationality": "Nigeria",
    "date_of_birth": "1995-05-15",
    "gender": "Male",
    "education": {
      "undergraduate": {
        "institution": "University of Lagos",
        "degree": "BSc Economics",
        "gpa": "3.8",
        "graduation_year": "2017"
      }
    },
    "work_experience": [
      {
        "company": "ABC Corp",
        "title": "Financial Analyst",
        "duration": "3 years",
        "description": "..."
      }
    ],
    "test_scores": {
      "gmat": {
        "total": 720,
        "verbal": 38,
        "quant": 49,
        "ir": 7,
        "awa": 5.5
      }
    },
    "application": {
      "program": "MBA",
      "round": "Round 1",
      "status": "Pending",
      "essay": "...",
      "career_goals": "..."
    },
    "documents": [
      {
        "type": "Resume",
        "url": "https://...",
        "uploaded_at": "2024-01-10"
      }
    ]
  }
}
```

---

## 6. University Applications

### 6.1 List Applications

**Endpoint:** `GET /admissions/index.php`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Search by name or email |
| `status` | string | Filter by status |
| `program` | string | Filter by program |
| `page` | number | Page number |
| `limit` | number | Items per page |

**Response:**
```json
{
  "success": true,
  "data": {
    "applications": [
      {
        "record_id": "APP001",
        "name": "John Doe",
        "first_name": "John",
        "last_name": "Doe",
        "email": "john@example.com",
        "phone_number": "+234123456789",
        "program_name": "MBA Full-Time",
        "intake": "Fall 2024",
        "status": "Applied",
        "created_at": "2024-01-15T10:30:00Z"
      }
    ],
    "meta": {
      "total_applications": 250,
      "filtered_count": 50,
      "status_counts": {
        "Applied": 100,
        "Under Review": 80,
        "Admitted": 50,
        "Rejected": 20
      }
    },
    "filter_options": {
      "statuses": ["Applied", "Under Review", "Interview Scheduled", "Admitted", "Rejected"],
      "intakes": ["Fall 2024", "Spring 2025"],
      "programs": ["MBA Full-Time", "MBA Part-Time", "EMBA"]
    },
    "school": {
      "university": "Example University",
      "school_name": "Example Business School"
    }
  }
}
```

### 6.2 Export Applications

**Endpoint:** `GET /admissions/download.php`

**Response:** Binary XLSX file

---

## 7. Lead & Application Engagement (LAE)

### 7.1 Get LAE Analytics

**Endpoint:** `GET /lae/`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `year` | string | Filter by year |
| `month` | string | Filter by month |

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_assignments": 150,
      "completed": 120,
      "pending": 30,
      "success_rate": 80
    },
    "assignments": [
      {
        "id": "1",
        "student_name": "John Doe",
        "student_email": "john@example.com",
        "program": "MBA",
        "assignment_type": "Application Review",
        "status": "Completed",
        "assigned_date": "2024-01-10",
        "completed_date": "2024-01-15",
        "notes": "..."
      }
    ],
    "analytics": {
      "by_month": [
        { "month": "Jan", "assignments": 45, "completed": 40 },
        { "month": "Feb", "assignments": 52, "completed": 48 }
      ],
      "by_type": [
        { "type": "Application Review", "count": 80 },
        { "type": "Interview Prep", "count": 50 },
        { "type": "Essay Review", "count": 20 }
      ]
    }
  }
}
```

### 7.2 Upload LAE File

**Endpoint:** `POST /lae/upload.php`

**Content-Type:** `multipart/form-data`

**Request Body:**
| Field | Type | Description |
|-------|------|-------------|
| `file` | File | XLSX file with assignments |

**Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "records_processed": 50,
    "records_created": 45,
    "records_updated": 5,
    "errors": []
  }
}
```

### 7.3 Download LAE Report

**Endpoint:** `GET /lae/download.php`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `year` | string | Filter by year |
| `month` | string | Filter by month |

**Response:** Binary XLSX file

---

## 8. Profile Leads

### 8.1 Get Lead Statistics

**Endpoint:** `GET /school-profile/leads.php?action=get_stats`

**Response:**
```json
{
  "success": true,
  "data": {
    "total_leads": 1250,
    "new_leads_7_days": 45,
    "active_leads": 890,
    "engaged_leads": 340
  }
}
```

### 8.2 Get Programs (for filtering)

**Endpoint:** `GET /school-profile/leads.php?action=get_programs`

**Response:**
```json
{
  "success": true,
  "data": [
    { "id": "1", "name": "MBA Full-Time" },
    { "id": "2", "name": "MBA Part-Time" },
    { "id": "3", "name": "Executive MBA" }
  ]
}
```

### 8.3 Get Countries (for filtering)

**Endpoint:** `GET /school-profile/leads.php?action=get_countries`

**Response:**
```json
{
  "success": true,
  "data": [
    { "key": "NG", "value": "Nigeria" },
    { "key": "KE", "value": "Kenya" },
    { "key": "GH", "value": "Ghana" }
  ]
}
```

### 8.4 List Leads

**Endpoint:** `GET /school-profile/leads.php?action=get_leads`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `program_id` | string | Filter by program |
| `country` | string | Filter by country code |
| `start_date` | string | Filter from date (YYYY-MM-DD) |
| `end_date` | string | Filter to date (YYYY-MM-DD) |
| `page` | number | Page number |
| `limit` | number | Items per page |

**Response:**
```json
{
  "success": true,
  "data": {
    "leads": [
      {
        "id": "1",
        "first_name": "John",
        "last_name": "Doe",
        "email": "john@example.com",
        "phone": "1234567890",
        "country_of_residence": "234",
        "country_name": "Nigeria",
        "intended_pg_program_start_year": "2025",
        "intended_study_level": "Masters",
        "intended_subject_area": "Business &amp; Management",
        "page_views": 15,
        "registration_date": "2024-01-15T10:30:00Z",
        "last_activity": "2024-02-01T14:20:00Z",
        "programs_viewed": "MBA Full-Time, EMBA"
      }
    ],
    "meta": {
      "total": 1250,
      "page": 1,
      "limit": 20,
      "total_pages": 63
    }
  }
}
```

---

## 9. School Profile

### 9.1 Get School Information

**Endpoint:** `GET /school-profile/info.php`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "123",
    "name": "Example Business School",
    "university": "Example University",
    "about": "Description of the school...",
    "logo": "https://...",
    "banner": "school_banner_123.jpg",
    "website": "https://example.edu",
    "location": {
      "city": "New York",
      "country": "USA",
      "address": "123 Business Ave"
    },
    "contact": {
      "email": "admissions@example.edu",
      "phone": "+1234567890"
    },
    "stats": {
      "graduate_programs": 5,
      "phd_programs": 2,
      "international_students": 45,
      "average_salary": "150000",
      "scholarship_amount": "3000000"
    },
    "accreditations": ["AACSB", "EQUIS", "AMBA"],
    "school_brochure_link": "https://..."
  }
}
```

### 9.2 Update School Information

**Endpoint:** `POST /school-profile/info.php`

**Content-Type:** `multipart/form-data`

**Request Body:**
| Field | Type | Description |
|-------|------|-------------|
| `about` | string | School description |
| `graduate_programs` | number | Number of graduate programs |
| `phd_programs` | number | Number of PhD programs |
| `international_students` | number | International student percentage |
| `average_salary` | string | Average salary |
| `scholarship_amount` | string | Total scholarship amount |
| `school_brochure_link` | string | Brochure URL |
| `imageUpload` | File | Banner image file |

**Response:**
```json
{
  "success": true,
  "message": "School information updated successfully"
}
```

### 9.3 Get School FAQs

**Endpoint:** `GET /school-profile/faqs.php`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "question": "What is the application deadline?",
      "answer": "The deadline for Round 1 is October 15th...",
      "category": "Admissions",
      "order": 1
    }
  ]
}
```

### 9.4 Update School FAQs

**Endpoint:** `POST /school-profile/faqs.php`

**Request Body:**
```json
{
  "faqs": [
    {
      "id": "1",
      "question": "Updated question?",
      "answer": "Updated answer...",
      "category": "Admissions",
      "order": 1
    }
  ]
}
```

### 9.5 Get Social Media Links

**Endpoint:** `GET /school-profile/social_media.php`

**Response:**
```json
{
  "success": true,
  "data": {
    "linkedin": "https://linkedin.com/school/example",
    "twitter": "https://twitter.com/example",
    "facebook": "https://facebook.com/example",
    "instagram": "https://instagram.com/example",
    "youtube": "https://youtube.com/example"
  }
}
```

### 9.6 Update Social Media Links

**Endpoint:** `POST /school-profile/social_media.php`

**Request Body:**
```json
{
  "linkedin": "https://linkedin.com/school/example",
  "twitter": "https://twitter.com/example",
  "facebook": "https://facebook.com/example",
  "instagram": "https://instagram.com/example",
  "youtube": "https://youtube.com/example"
}
```

---

## 10. Programs Management

### 10.1 List Programs

**Endpoint:** `GET /school-profile/programs/?action=list`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "MBA Full-Time",
      "degree_type": "MBA",
      "duration": "2 years",
      "format": "Full-Time",
      "tuition": "80000",
      "currency": "USD",
      "start_date": "September",
      "application_deadline": "2024-04-15",
      "status": "Active"
    }
  ]
}
```

### 10.2 Get Program Details

**Endpoint:** `GET /school-profile/programs/?action=details&program_id={id}`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "MBA Full-Time",
    "description": "...",
    "highlights": ["Global immersion", "Career services"],
    "faculty": [...],
    "students": [...],
    "alumni": [...],
    "rankings": [...],
    "recruiters": [...],
    "job_roles": [...],
    "faqs": [...],
    "pocs": [...]
  }
}
```

### 10.3 Update Program Information

**Endpoint:** `POST /school-profile/programs/update_program_information.php`

**Request Body:**
```json
{
  "program_id": "1",
  "name": "MBA Full-Time",
  "description": "...",
  "duration": "2 years",
  "tuition": "85000"
}
```

### 10.4 Add Program Highlight (USP)

**Endpoint:** `POST /school-profile/programs/add_program_usp.php`

**Request Body:**
```json
{
  "program_id": "1",
  "usp": "Global Network of 50,000+ Alumni"
}
```

### 10.5 Update Program Member (Faculty/Student/Alumni)

**Endpoint:** `POST /school-profile/programs/update_program_member.php`

**Request Body:**
```json
{
  "program_id": "1",
  "member_type": "faculty",
  "member_id": "10",
  "name": "Dr. John Smith",
  "title": "Professor of Finance",
  "bio": "...",
  "image": "..."
}
```

### 10.6 Update Program Rankings

**Endpoint:** `POST /school-profile/programs/update_program_rankings.php`

**Request Body:**
```json
{
  "program_id": "1",
  "rankings": [
    {
      "source": "Financial Times",
      "rank": 15,
      "year": 2024
    }
  ]
}
```

### 10.7 Update Program Recruiters

**Endpoint:** `POST /school-profile/programs/update_program_recruiters.php`

**Request Body:**
```json
{
  "program_id": "1",
  "recruiters": ["Google", "McKinsey", "Goldman Sachs"]
}
```

### 10.8 Update Program Job Roles

**Endpoint:** `POST /school-profile/programs/update_program_job_roles.php`

**Request Body:**
```json
{
  "program_id": "1",
  "job_roles": ["Consultant", "Product Manager", "Investment Banker"]
}
```

### 10.9 Update Program FAQs

**Endpoint:** `POST /school-profile/programs/update_program_faqs.php`

**Request Body:**
```json
{
  "program_id": "1",
  "faqs": [
    {
      "question": "What is the class size?",
      "answer": "Approximately 200 students per cohort."
    }
  ]
}
```

### 10.10 Update Program POCs (Points of Contact)

**Endpoint:** `POST /school-profile/programs/update_program_poc.php`

**Request Body:**
```json
{
  "program_id": "1",
  "pocs": [
    {
      "name": "Jane Doe",
      "title": "Admissions Director",
      "email": "jane@example.edu",
      "phone": "+1234567890"
    }
  ]
}
```

---

## 11. Team Management

### 11.1 List Team Members

**Endpoint:** `GET /users/?action=list`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "John Doe",
      "email": "john@example.edu",
      "role": "admin",
      "status": "active",
      "last_login": "2024-02-01T10:30:00Z",
      "created_at": "2023-01-15T09:00:00Z"
    }
  ]
}
```

### 11.2 Invite Team Member

**Endpoint:** `POST /users/?action=invite`

**Request Body:**
```json
{
  "email": "newuser@example.edu",
  "role": "representative",
  "name": "New User"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Invitation sent successfully"
}
```

### 11.3 Update Team Member Role

**Endpoint:** `POST /users/?action=update_role`

**Request Body:**
```json
{
  "user_id": "1",
  "role": "admin"
}
```

### 11.4 Remove Team Member

**Endpoint:** `POST /users/?action=remove`

**Request Body:**
```json
{
  "user_id": "1"
}
```

---

## 12. AI Visa Tutor

### 12.1 List Licenses

**Endpoint:** `GET /visa-tutor/`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Search by license number or student name |
| `status` | string | Filter by status |
| `page` | number | Page number |
| `limit` | number | Items per page |

**Response:**
```json
{
  "success": true,
  "data": {
    "licenses": [
      {
        "id": "1",
        "license_number": "VT-2024-001",
        "alloted_to": "Example Business School",
        "created_date": "2024-01-15",
        "assigned_to": "partner_123",
        "student_name": "John Doe",
        "student_email": "john@example.com",
        "student_phone": "+234123456789",
        "target_degree": "Masters",
        "visa_app_type": "F-1",
        "activation_status": "Active",
        "activation_date": "2024-01-20",
        "sessions_completed": 3,
        "total_sessions": 5,
        "last_session_date": "2024-02-01",
        "expiry_date": "2024-07-20",
        "notes": "..."
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 20,
      "total_pages": 3
    }
  }
}
```

### 12.2 Get License Details

**Endpoint:** `GET /visa-tutor/details.php?id={license_id}`

**Response:**
```json
{
  "success": true,
  "data": {
    "license": {
      "id": "1",
      "license_number": "VT-2024-001",
      "student": {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+234123456789",
        "nationality": "Nigeria"
      },
      "program": {
        "degree": "Masters",
        "university": "Example University",
        "country": "USA"
      },
      "visa": {
        "type": "F-1",
        "interview_date": "2024-03-15",
        "consulate": "Lagos"
      }
    },
    "sessions": [
      {
        "id": "1",
        "date": "2024-01-25",
        "duration": 45,
        "topic": "DS-160 Review",
        "tutor_notes": "...",
        "student_feedback": "..."
      }
    ]
  }
}
```

### 12.3 Reassign License

**Endpoint:** `POST /visa-tutor/reassign.php`

**Request Body:**
```json
{
  "license_id": "1",
  "new_partner_id": "partner_456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "License reassigned successfully"
}
```

### 12.4 Bulk Upload Licenses

**Endpoint:** `POST /visa-tutor/bulk-upload.php`

**Content-Type:** `multipart/form-data`

**Request Body:**
| Field | Type | Description |
|-------|------|-------------|
| `file` | File | XLSX file with license data |

**Response:**
```json
{
  "success": true,
  "message": "Bulk upload successful",
  "data": {
    "total_records": 25,
    "created": 20,
    "updated": 3,
    "errors": [
      {
        "row": 5,
        "error": "Invalid email format"
      }
    ]
  }
}
```

---

## Error Handling

All endpoints return consistent error responses:

**Client Error (4xx):**
```json
{
  "success": false,
  "error": "Error message description",
  "code": "ERROR_CODE"
}
```

**Server Error (5xx):**
```json
{
  "success": false,
  "error": "Internal server error",
  "code": "INTERNAL_ERROR"
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or expired token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 422 | Invalid request data |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Rate Limiting

- **Standard endpoints:** 100 requests per minute
- **Report downloads:** 10 requests per minute
- **Bulk uploads:** 5 requests per minute

---

## Pagination

Paginated endpoints accept these query parameters:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page (max: 100) |

Paginated responses include:

```json
{
  "meta": {
    "total": 250,
    "page": 1,
    "limit": 20,
    "total_pages": 13
  }
}
```

---

## File Downloads

Binary file downloads (XLSX, PDF) include these headers:

```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="report_name.xlsx"
```

Handle these responses as binary data, not JSON.

---

## Proxy Architecture

All API requests from the frontend are routed through Supabase Edge Functions:

| Proxy Function | Backend Endpoint |
|----------------|------------------|
| `portal-auth` | `/login.php` |
| `bsf-proxy` | `/in-person-event/bsf` |
| `campus-tour-proxy` | `/in-person-event/campus-tour/` |
| `virtual-events-proxy` | `/virtual-events/` |
| `icr-proxy` | `/in-country-representation/` |
| `scholarship-proxy` | `/scholarship-portal/` |
| `applications-proxy` | `/admissions/` |
| `lae-proxy` | `/lae/` |
| `school-profile-proxy` | `/school-profile/` |
| `programs-proxy` | `/school-profile/programs/` |
| `users-proxy` | `/users/` |
| `visa-tutor-proxy` | `/visa-tutor/` |

This architecture handles CORS, secure token forwarding, and error normalization.
