# PawPal — Animal Rescue & Pet Care Management Platform

**Course:** CSE-4113: Internet Programming Lab  
**Department:** Computer Science and Engineering, University of Dhaka  
**Team:** QuadrupleA  
**Technology Stack:** PERN (PostgreSQL, Express.js, React.js with Vite, Node.js)

---

## 🐾 Overview
PawPal is a centralized web platform for coordinating animal rescue activities, managing personal pet-health schedules, and discovering veterinary clinics across Bangladesh.

---

## 👥 Four-Member Sequential Architecture
The platform is developed across four sequential vertical phases:
1. **Phase 1 (Member 1):** Project Foundation, Authentication & Basic Reporting (`feature/01-foundation-auth`)
2. **Phase 2 (Member 2):** Advanced Rescue Workflows & Volunteer Coordination (`feature/02-rescue-volunteers`)
3. **Phase 3 (Member 3):** Pet Health Management & Veterinary Directory (`feature/03-pet-health-clinics`)
4. **Phase 4 (Member 4):** Knowledge Hub, Admin Moderation & Final Integration (`feature/04-knowledge-admin`)

---

## 🚀 Getting Started (Milestone Zero)

### 1. Prerequisites
- **Node.js:** v24 LTS (`.nvmrc` specifies `24`)
- **Docker Desktop:** Running with WSL2 integration
- **Git**

### 2. Initial Setup
Clone the repository and copy the environment configuration files:
```powershell
# Copy environment configuration files
Copy-Item .env.example .env
Copy-Item server/.env.example server/.env
```

### 3. Start PostgreSQL Database
```powershell
docker compose up -d
```
*Note: PostgreSQL is exposed on host port `5433` (mapped to container port `5432`) to prevent port collisions.*

### 4. Start the Express Backend
```powershell
cd server
npm ci
npm run db:migrate
npm run db:seed
npm run dev
```
*Server runs at `http://localhost:5000`.*

### 5. Start the React Frontend
```powershell
cd client
npm ci
npm run dev
```
*Frontend runs at `http://localhost:5173` (with `/api` automatically proxied to port `5000`).*
