# Asset Management System - Backend API Specification

implemented API endpoints: 
(Authentication headers must provide: `Authorization: Bearer <jwt_token>`)

---

## 1. Authentication (`/auth`)

### POST `/auth/register`
Creates a new user account.
- **Payload**:
```json
{
  "username": "string (nullable=False)",
  "email": "string (nullable=False, unique)",
  "password": "string (nullable=False)",
  "role": "string (enum: ['admin', 'it_manager', 'employee'], default='employee')"
}
```
- **Response (201 Created)**:
```json
{
  "message": "User registered successfully",
  "id": 1
}
```
- **Errors**:
  - `400 Bad Request`: User already exists or missing fields.

---

### POST `/auth/login`
Authenticates user and returns JWT access token.
- **Payload**:
```json
{
  "username": "string",
  "password": "string"
}
```
- **Response (200 OK)**:
```json
{
  "access_token": "string (JWT)",
  "user": {
    "id": 1,
    "username": "string",
    "email": "string",
    "role": "string",
    "created_at": "string (ISO-8601)"
  }
}
```
- **Errors**:
  - `401 Unauthorized`: Invalid credentials.

---

### GET `/auth/me`
Retrieves current authenticated user details.
- **Auth**: Required (`jwt`)
- **Response (200 OK)**:
```json
{
  "id": 1,
  "username": "string",
  "email": "string",
  "role": "string",
  "created_at": "string (ISO-8601)"
}
```

---

## 2. Asset Inventory (`/assets`)

### GET `/assets`
Lists assets with support for search and filtering.
- **Auth**: Required (`jwt`), Roles: `['admin', 'it_manager']`
- **Query Params** (Optional):
  - `page`: integer (default=1)
  - `per_page`: integer (default=10)
  - `category`: string
  - `status`: string
  - `search`: string (matches Name, Category, Brand, Model, Serial)
- **Response (200 OK)**:
```json
{
  "items": [
    {
      "id": 1,
      "name": "string",
      "category": "string",
      "brand": "string",
      "model": "string",
      "serial_number": "string",
      "purchase_date": "string (YYYY-MM-DD)",
      "warranty_expiry": "string (YYYY-MM-DD)",
      "status": "string (Available, Assigned, Maintenance, Retired)",
      "created_at": "string (ISO-8601)"
    }
  ],
  "pages": 1,
  "total": 1,
  "current_page": 1
}
```

---

### GET `/assets/<asset_id>`
Retrieves single asset record.
- **Auth**: Required (`jwt`), Roles: All
- **Response (200 OK)**:
```json
{
  "id": 1,
  "name": "string",
  "category": "string",
  "brand": "string",
  "model": "string",
  "serial_number": "string",
  "purchase_date": "string (YYYY-MM-DD)",
  "warranty_expiry": "string (YYYY-MM-DD)",
  "status": "string"
}
```

---

### POST `/assets`
Creates a single asset entry.
- **Auth**: Required (`jwt`), Roles: `['admin', 'it_manager']`
- **Payload**:
```json
{
  "name": "string (nullable=False)",
  "category": "string (nullable=False)",
  "brand": "string (nullable=False)",
  "model": "string (nullable=False)",
  "serial_number": "string (nullable=False, unique)",
  "purchase_date": "string (YYYY-MM-DD, nullable=False)",
  "warranty_expiry": "string (YYYY-MM-DD, nullable=True)"
}
```
- **Response (201 Created)**:
```json
{
  "message": "Asset created successfully",
  "id": 1
}
```

---

### PUT `/assets/<asset_id>`
Updates asset attributes (partial updates supported).
- **Auth**: Required (`jwt`), Roles: `['admin', 'it_manager']`
- **Payload**:
```json
{
  "name": "string",
  "category": "string",
  "brand": "string",
  "model": "string",
  "status": "string (enum values)"
}
```
- **Response (200 OK)**:
```json
{
  "message": "Asset updated successfully"
}
```

---

### DELETE `/assets/<asset_id>`
Deletes asset record. Desctructive operation.
- **Auth**: Required (`jwt`), Roles: `['admin']`
- **Response (200 OK)**:
```json
{
  "message": "Asset deleted successfully"
}
```

---

## 3. Dashboard Analytics (`/dashboard`)

### GET `/dashboard/stats`
Retrieves aggregated statistics for inventory charts.
- **Auth**: Required (`jwt`), Roles: `['admin', 'it_manager']`
- **Response (200 OK)**:
```json
{
  "total_assets": 12,
  "assets_by_status": {
    "available": 5,
    "assigned": 4,
    "under_maintenance": 2,
    "retired": 1
  },
  "open_issues": 3
}
```

---

## 4. Maintenance Issues (`/issues`)

### POST `/issues`
Reports a new asset maintenance issue.
- **Payload**:
```json
{
  "asset_id": "integer (nullable=False)",
  "description": "string (min_length=5, nullable=False)",
  "reported_by": "integer (nullable=False)"
}
```
- **Response (201 Created)**:
```json
{
  "message": "Issue reported",
  "issue_id": 1
}
```

---

### GET `/issues`
Lists all reported issues.
- **Response (200 OK)**:
```json
[
  {
    "id": 1,
    "asset_id": 1,
    "description": "string",
    "status": "string (open, In Progress, Resolved, Closed)"
  }
]
```

---

### PATCH `/issues/<issue_id>/status`
Updates lifecycle status state of a reported issue.
- **Payload**:
```json
{
  "status": "string (enum: ['open', 'In Progress', 'Resolved', 'Closed'])"
}
```
- **Response (200 OK)**:
```json
{
  "message": "Issue updated"
}
```

---

## 5. Asset Assignments (`/assignments`)

### POST `/assignments`
Assigns an asset directly to a user.
- **Payload**:
```json
{
  "asset_id": "integer (nullable=False)",
  "user_id": "integer (nullable=False)"
}
```
- **Response (201 Created)**:
```json
{
  "message": "Asset assigned",
  "assignment_id": 1
}
```

---

### POST `/assignments/return/<assignment_id>`
Executes returns operation triggers for an assigned asset.
- **Response (200 OK)**:
```json
{
  "message": "Asset returned"
}
```

---

### GET `/assignments/user/<user_id>`
Lists all past and active assignments linked to a direct user reference node.
- **Response (200 OK)**:
```json
[
  {
    "id": 1,
    "asset_id": 1,
    "user_id": 1,
    "status": "string"
  }
]
```
