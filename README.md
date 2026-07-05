# RentArena Zero Brokerage Property Rental Management System

This repository contains the **RentArena Zero Brokerage Property Rental Management System**, a web-based Single-Page Application (SPA) developed using **Node.js (Express)** on the backend and **Vanilla HTML/CSS/JS** on the frontend. It is designed to emulate a premium RentArena-style portal featuring direct owner connections, zero brokerage highlights, and value-added property services.

---

## 📝 Project Description

The system provides the following features:
- **Role-Specific Dashboards** for Owners, Property Managers (Relationship Managers), and Tenants.
- **Direct Connect (Zero Brokerage)**: Highlighted badges for direct direct-from-owner apartments.
- **Premium Services Grid**: Styled shortcuts for Rental Agreements, Packers & Movers, cleaning/painting services, and RentArena Pay.
- **Multi-Language Support**: Fully localized interface supporting English (EN), French (FR), Vietnamese (VI), and Spanish (ES).
- **Light & Dark Mode**: Modern dark/light theme switching with glassmorphic cards and subtle micro-animations.
- **CRUD Operations**: Secure management of buildings, apartments, events, messages, and appointments using a local database backend.

### Key Technologies Used:
- **Backend**: Node.js, Express.
- **Frontend**: Vanilla HTML5, CSS3 (Outfit/Inter fonts, Custom gradients, Responsive grid/flex layouts), JavaScript (ES6 SPA routing & state).
- **Database**: Microsoft SQL Server LocalDB (`DbPropertyRental`) using `odbc` connector.

---

## 📋 Features by User Role

### **Owner**
- Manage Property Managers and Tenants (CRUD).
- View and search Buildings and Apartments.
- Manage Events and Messages.
- Update profile or delete account.

### **Property Manager (Relationship Manager)**
- Manage Buildings, Apartments, Events, and Appointments (CRUD).
- Communicate with Owners and Tenants via Messages.
- Update profile or delete account.

### **Tenant**
- Register for an account.
- Browse Apartments directly from Owners with "Zero Brokerage" and "Verified Owner" badges.
- Book Appointments with Property Managers.
- Communicate with Property Managers via Messages.
- Update profile or delete account.

---

## 📂 Folder Structure

- **`static/`**: Web asset bundle (HTML/CSS/JS).
- **`routes/`**: Express API routers.
- **`server.js`**: Express server entry point.
- **`db.js`**: Database connection pool and helper.
- **`localizations.js`**: Localization dictionary and utilities.
- **`run.ps1`**: Startup script to launch the application.
- **`stop.ps1`**: Shutdown script to terminate the application on port 8000.
- **`script.sql`**: SQL database setup script.

---

## 🚀 Setup & Launch Instructions

### Prerequisites
- **Node.js (v20+)**
- **ODBC Driver 17 for SQL Server** (configured for LocalDB connection)

### Running the App
1. Open PowerShell in the project directory.
2. Launch the application (the script automatically installs npm packages and runs the Express server):
   ```powershell
   ./run.ps1
   ```
3. Open **`http://localhost:8000/`** in your web browser.
4. To stop the application, run:
   ```powershell
   ./stop.ps1
   ```

---

## 📋 Sample User Credentials

For testing purposes, you can use the following accounts:

| **Role**         | **Email**                 | **Password** |
|------------------|---------------------------|--------------|
| Owner            | tylerdurden@gmail.com     | password123  |
| Property Manager | ednamode@gmail.com        | password123  |
| Tenant           | michaelcorleone@gmail.com | password123  |
