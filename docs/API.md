# PawPal REST API Documentation

**Base URL:** `http://localhost:5000/api`  
**Authentication:** Session-based via HTTP-only cookie (`pawpal.sid`).  
**Content-Type:** `application/json` (or `multipart/form-data` for file uploads).

---

## 🔒 Session & Security Notes
* Authenticated requests must include credentials:
  * In React/Fetch: `{ credentials: 'include' }`
  * In Axios: `{ withCredentials: true }`
  * In Postman: Ensure cookie storage is enabled.
* Passwords are securely hashed with `bcrypt`.
* Input payloads are validated using `zod`.

---

## 1. Authentication Endpoints

### 1.1 Register User
* **Method:** `POST`
* **Endpoint:** `/auth/register`
* **Access:** Public
* **Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@pawpal.com",
  "password": "Password123!",
  "phone": "01700000003",
  "area": "Gulshan, Dhaka"
}
```
* **Success Response (201 Created):**
```json
{
  "message": "Registration successful",
  "user": {
    "id": "c1f7b7f4-...",
    "name": "Jane Doe",
    "email": "jane@pawpal.com",
    "role": "USER",
    "phone": "01700000003",
    "area": "Gulshan, Dhaka"
  }
}
```

### 1.2 Log In
* **Method:** `POST`
* **Endpoint:** `/auth/login`
* **Access:** Public
* **Request Body:**
```json
{
  "email": "demo@pawpal.com",
  "password": "Password123!"
}
```
* **Success Response (200 OK):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "3050c9e7-...",
    "name": "Demo User",
    "email": "demo@pawpal.com",
    "role": "USER",
    "phone": "01700000001",
    "area": "Dhanmondi, Dhaka"
  }
}
```

### 1.3 Log Out
* **Method:** `POST`
* **Endpoint:** `/auth/logout`
* **Access:** Authenticated
* **Success Response (200 OK):**
```json
{
  "message": "Logged out successfully."
}
```

### 1.4 Get Current Session User
* **Method:** `GET`
* **Endpoint:** `/auth/me`
* **Access:** Public (Returns `user: null` if not logged in)
* **Success Response (200 OK):**
```json
{
  "user": {
    "id": "3050c9e7-...",
    "name": "Demo User",
    "email": "demo@pawpal.com",
    "phone": "01700000001",
    "area": "Dhanmondi, Dhaka",
    "role": "USER",
    "created_at": "2026-11-09T05:25:44.815Z"
  }
}
```

---

## 2. User & Profile Endpoints

### 2.1 Get Profile
* **Method:** `GET`
* **Endpoint:** `/users/me`
* **Access:** Authenticated (`requireAuth`)
* **Success Response (200 OK):**
```json
{
  "profile": {
    "id": "3050c9e7-...",
    "name": "Demo User",
    "email": "demo@pawpal.com",
    "phone": "01700000001",
    "area": "Dhanmondi, Dhaka",
    "role": "USER",
    "created_at": "2026-11-09T...",
    "updated_at": "2026-11-09T..."
  }
}
```

### 2.2 Update Profile
* **Method:** `PATCH`
* **Endpoint:** `/users/me`
* **Access:** Authenticated (`requireAuth`)
* **Request Body:**
```json
{
  "name": "Demo User Updated",
  "phone": "01799999999",
  "area": "Banani, Dhaka"
}
```
* **Success Response (200 OK):**
```json
{
  "message": "Profile updated successfully",
  "user": { ... }
}
```

### 2.3 Change Password
* **Method:** `PATCH`
* **Endpoint:** `/users/me/password`
* **Access:** Authenticated (`requireAuth`)
* **Request Body:**
```json
{
  "currentPassword": "Password123!",
  "newPassword": "NewPassword456!"
}
```
* **Success Response (200 OK):**
```json
{
  "message": "Password updated successfully."
}
```

---

## 3. Rescue Reports Endpoints

### 3.1 List All Reports
* **Method:** `GET`
* **Endpoint:** `/reports`
* **Access:** Public
* **Success Response (200 OK):**
```json
{
  "reports": [
    {
      "id": "7d634137-...",
      "reporter_id": "3050c9e7-...",
      "reporter_name": "Demo User",
      "report_type": "Injured",
      "animal_type": "Cat",
      "image_url": "/uploads/img-1700000.jpg",
      "location": "Road 8A, Dhanmondi, Dhaka",
      "description": "Found a young stray cat with an injured front leg...",
      "animal_condition": "Limping and unable to walk properly",
      "contact_information": "01700000001",
      "urgency": "Critical",
      "status": "Active",
      "verification_status": "Verified",
      "created_at": "2026-11-09T...",
      "updated_at": "2026-11-09T..."
    }
  ]
}
```

### 3.2 Get Single Report Detail
* **Method:** `GET`
* **Endpoint:** `/reports/:id`
* **Access:** Public
* **Success Response (200 OK):**
```json
{
  "report": {
    "id": "7d634137-...",
    "reporter_name": "Demo User",
    "reporter_email": "demo@pawpal.com",
    "report_type": "Injured",
    "animal_type": "Cat",
    "location": "Road 8A, Dhanmondi, Dhaka",
    "description": "...",
    "urgency": "Critical",
    "status": "Active",
    "verification_status": "Verified"
  }
}
```

### 3.3 Create Rescue Report
* **Method:** `POST`
* **Endpoint:** `/reports`
* **Access:** Authenticated (`requireAuth`)
* **Request Body:**
```json
{
  "report_type": "Injured",
  "animal_type": "Dog",
  "urgency": "Urgent",
  "location": "Mirpur 10 roundabout, Dhaka",
  "description": "Puppy stranded near intersection.",
  "animal_condition": "Scared, cold, shivering",
  "contact_information": "01700000001",
  "image_url": "/uploads/img-1700000.jpg"
}
```
* **Success Response (201 Created):**
```json
{
  "message": "Rescue report created successfully",
  "report": { ... }
}
```

---

## 4. File Upload Endpoint

### 4.1 Upload Image
* **Method:** `POST`
* **Endpoint:** `/upload`
* **Access:** Authenticated (`requireAuth`)
* **Content-Type:** `multipart/form-data`
* **Field Name:** `image` (JPEG, PNG, WEBP, GIF; max 5MB)
* **Success Response (201 Created):**
```json
{
  "message": "Image uploaded successfully",
  "imageUrl": "/uploads/img-1731131796-a1b2c3.jpg",
  "filename": "img-1731131796-a1b2c3.jpg"
}
```

---

## 5. System Health Check
* **Method:** `GET`
* **Endpoint:** `/health`
* **Access:** Public
* **Success Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2026-11-09T05:25:44.815Z"
}
```
