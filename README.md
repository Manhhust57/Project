# Online Booking Management System

## 📌 Giới thiệu
Online Booking Management System là một hệ thống web cho phép người dùng **đặt lịch trực tuyến**, quản lý booking và xử lý các trường hợp **trùng lịch**.  
Project tập trung vào **backend logic**, thiết kế API, database và xử lý nghiệp vụ thực tế.

> Project được xây dựng cho mục đích **học tập và demo năng lực backend**.

---

## 🎯 Chức năng chính
- Đăng ký / đăng nhập người dùng (JWT Authentication)
- Đặt lịch theo ngày & khung giờ
- Kiểm tra và **ngăn trùng lịch** (pending / confirmed)
- Quản lý trạng thái booking
- Phân quyền **User / Admin**
- Xem danh sách booking theo ngày

---

## 🛠 Công nghệ sử dụng
**Backend**
- NestJS
- TypeScript
- JWT Authentication

**Database**
- PostgreSQL / MySQL

**Frontend**
- ReactJS (demo luồng nghiệp vụ)

**Khác**
- RESTful API
- Swagger (API Documentation)
- Git

---

## 🗂 Database Design (tóm tắt)
- **User** (id, email, role, password)
- **Booking** (id, userId, date, startTime, endTime, status)
- **Field / Resource** (id, name)

> Một khung giờ chỉ có **1 booking hợp lệ** ở trạng thái `pending` hoặc `confirmed`.

---

## ⚙️ Cách chạy project (Local)

