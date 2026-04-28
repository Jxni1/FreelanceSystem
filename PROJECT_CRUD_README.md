# Project CRUD with JWT Authentication - Testing Guide

## ✅ Complete Implementation

Your Project CRUD is now **fully implemented** with:

- **JWT Authentication** on all endpoints (`[Authorize]` attribute)
- **FluentValidation** for request validation
- **AutoMapper** for DTO mapping
- **Redis Caching** on GetById (Cache-Aside pattern)
- **Audit Logging** (CreatedAt/UpdatedAt auto-populated)
- **Clean Architecture** (Domain, Application, Infrastructure, API)

---

## 🚀 Quick Start

### 1. Build the Solution

```powershell
dotnet build
```

### 2. Run the API

```powershell
dotnet run --project LabCourse2.API
```

**Console Output:**
```
🔑 TEST CLIENT_GUID for Postman: a1b2c3d4-5678-90ab-cdef-1234567890ab
🔑 TEST CATEGORY_GUID for Postman (Web Dev): f9e8d7c6-5432-10fe-dcba-0987654321fe
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: https://localhost:7244
```

**Copy those two GUIDs** - you'll need them for testing!

---

## 🧪 Testing with Postman

### Step 1: Login to Get JWT Token

```
POST https://localhost:7244/api/auth/login
Content-Type: application/json

{
  "email": "admin@freelancesystem.com",
  "password": "Admin@123456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "...",
    "user": { ... }
  }
}
```

**COPY THE TOKEN!**

---

### Step 2: Create Project (with JWT)

```
POST https://localhost:7244/api/projects
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "title": "E-Commerce Platform Development",
  "description": "Build a modern e-commerce platform with React and .NET",
  "budget": 15000.00,
  "clientID": "PASTE_CLIENT_GUID_FROM_CONSOLE",
  "categoryID": "PASTE_CATEGORY_GUID_FROM_CONSOLE",
  "visibility": "Public",
  "status": "Open"
}
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "projectID": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "title": "E-Commerce Platform Development",
    "description": "Build a modern e-commerce platform...",
    "budget": 15000.00,
    "status": "Open",
    "visibility": "Public",
    "clientID": "...",
    "clientName": "John Doe",
    "categoryID": "...",
    "categoryName": "Web Development",
    "createdAt": "2026-04-12T15:30:00Z",
    "updatedAt": "2026-04-12T15:30:00Z"
  },
  "errorMessage": null,
  "errors": null
}
```

---

### Step 3: Get All Projects (with JWT)

```
GET https://localhost:7244/api/projects
Authorization: Bearer YOUR_TOKEN_HERE
```

---

### Step 4: Get Project by ID (with JWT + Redis Caching)

```
GET https://localhost:7244/api/projects/PROJECT_ID_HERE
Authorization: Bearer YOUR_TOKEN_HERE
```

**Run this TWICE** - second call will be faster due to Redis cache!

---

### Step 5: Update Project (with JWT)

```
PUT https://localhost:7244/api/projects/PROJECT_ID_HERE
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "title": "Updated: E-Commerce + Mobile App",
  "budget": 20000.00,
  "status": "InProgress"
}
```

---

### Step 6: Delete Project (with JWT)

```
DELETE https://localhost:7244/api/projects/PROJECT_ID_HERE
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 🔑 JWT Authentication

All endpoints require a **valid JWT token** in the `Authorization` header:

```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Without a token, you'll get:**
```
401 Unauthorized
```

---

## ✅ All Available Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/projects` | Get all projects | ✅ Yes |
| GET | `/api/projects/{id}` | Get project by ID (cached) | ✅ Yes |
| GET | `/api/projects/client/{clientId}` | Get projects by client | ✅ Yes |
| GET | `/api/projects/category/{categoryId}` | Get projects by category | ✅ Yes |
| POST | `/api/projects` | Create new project | ✅ Yes |
| PUT | `/api/projects/{id}` | Update project | ✅ Yes |
| DELETE | `/api/projects/{id}` | Delete project | ✅ Yes |

---

## 📝 Validation Rules

**CreateProjectRequest:**
- `Title`: Required, max 200 characters
- `Description`: Required, max 2000 characters
- `Budget`: Must be > 0
- `ClientID`: Required
- `CategoryID`: Required
- `Visibility`: Must be one of: Public, Private, InviteOnly
- `Status`: Must be one of: Draft, Open, InProgress, Completed, Cancelled, OnHold

**UpdateProjectRequest:** (all fields optional)
- Same rules as above, but all fields are nullable

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| **401 Unauthorized** | Missing or invalid JWT token - login first |
| **400 Bad Request** | Validation failed - check request body |
| **404 Not Found** | Project doesn't exist |
| **500 Internal Server Error** | Check console logs for details |

---

## 🎯 Testing Checklist

- [ ] API starts successfully
- [ ] GUIDs displayed in console
- [ ] Login returns JWT token
- [ ] Create project (with token) returns 201
- [ ] Get all projects returns array
- [ ] Get by ID works (run twice to test cache)
- [ ] Update modifies fields
- [ ] Delete removes project
- [ ] Requests without token return 401
- [ ] Invalid data returns 400 with validation errors

---

## 📦 Redis Setup (Optional)

If Redis is not running, cache won't work but CRUD will still function:

**Quick Redis setup with Docker:**
```powershell
docker run -d --name redis-test -p 6379:6379 redis:latest
```

**Verify cache:**
```powershell
docker exec -it redis-test redis-cli
KEYS FreelanceSystem:project:*
```

---

## 🎉 You're All Set!

Your Project CRUD with JWT authentication is production-ready!

1. Start the API
2. Login to get token
3. Test all endpoints in Postman
4. Verify JWT protection (try without token)

**Happy testing!** 🚀
