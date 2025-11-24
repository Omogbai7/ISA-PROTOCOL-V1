# API Documentation

## Authentication

All API requests require an API key in the header:

```
x-api-key: your-api-key
```

## Base URL

```
http://localhost:3000/api
```

---

## Commands API

### Execute Command

Execute a bot command.

**Endpoint:** `POST /commands/execute`

**Request Body:**
```json
{
  "command": "ping",
  "args": [],
  "user": {
    "phoneNumber": "1234567890",
    "name": "John Doe"
  },
  "group": {
    "groupId": "123456@g.us",
    "name": "Test Group"
  },
  "participants": ["1234567890", "0987654321"],
  "mentionedUsers": ["1234567890"]
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "message": "🏓 Pong! Bot is active."
  }
}
```

### Process Message

Process message for auto-moderation.

**Endpoint:** `POST /commands/process-message`

**Request Body:**
```json
{
  "message": "Hey everyone! @all @all @all",
  "user": {
    "phoneNumber": "1234567890",
    "name": "John Doe"
  },
  "group": {
    "groupId": "123456@g.us"
  }
}
```

**Response:**
```json
{
  "success": true,
  "actions": [
    {
      "type": "anti-tag",
      "action": "warn",
      "data": {
        "violated": true,
        "mentionCount": 3
      }
    }
  ]
}
```

---

## Premium API

### Generate License

Generate premium license codes.

**Endpoint:** `POST /premium/generate`

**Request Body:**
```json
{
  "type": "monthly",
  "count": 5,
  "createdBy": "admin",
  "metadata": {
    "paymentReference": "PAY123",
    "amount": 9.99,
    "currency": "USD"
  }
}
```

**Response:**
```json
{
  "success": true,
  "licenses": [
    {
      "code": "ISA-ABCD1234-XYZ789",
      "type": "monthly",
      "durationDays": 30,
      "expiresAt": "2025-12-10T00:00:00.000Z"
    }
  ]
}
```

### Activate License

Activate a premium license for a user.

**Endpoint:** `POST /premium/activate`

**Request Body:**
```json
{
  "code": "ISA-ABCD1234-XYZ789",
  "phoneNumber": "1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Premium activated successfully! Valid for 30 days.",
  "user": {
    "phoneNumber": "1234567890",
    "isPremium": true,
    "premiumExpiry": "2025-12-10T00:00:00.000Z"
  }
}
```

### Check Premium Status

Check if a user has active premium.

**Endpoint:** `POST /premium/status`

**Request Body:**
```json
{
  "phoneNumber": "1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "status": {
    "isPremium": true,
    "expiresAt": "2025-12-10T00:00:00.000Z",
    "daysRemaining": 30
  }
}
```

### Get All Licenses

Retrieve all licenses with optional filters.

**Endpoint:** `GET /premium/licenses?isActivated=false&type=monthly`

**Response:**
```json
{
  "success": true,
  "licenses": [
    {
      "code": "ISA-ABCD1234-XYZ789",
      "type": "monthly",
      "isActivated": false,
      "createdAt": "2025-11-10T00:00:00.000Z"
    }
  ]
}
```

### Revoke Premium

Revoke premium access from a user.

**Endpoint:** `POST /premium/revoke`

**Request Body:**
```json
{
  "phoneNumber": "1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Premium revoked successfully",
  "user": {
    "phoneNumber": "1234567890",
    "isPremium": false
  }
}
```

---

## Admin API

### Get Analytics

Retrieve bot analytics and statistics.

**Endpoint:** `GET /admin/analytics`

**Response:**
```json
{
  "success": true,
  "analytics": {
    "users": {
      "total": 150,
      "premium": 25,
      "free": 125
    },
    "groups": {
      "total": 10
    },
    "commands": {
      "total": 5420,
      "top": [
        {
          "_id": "ping",
          "count": 1250,
          "successRate": 0.99
        }
      ]
    },
    "topUsers": [
      {
        "_id": "1234567890",
        "name": "John Doe",
        "commandCount": 450
      }
    ]
  }
}
```

### Get All Users

Retrieve all users with pagination.

**Endpoint:** `GET /admin/users?page=1&limit=50&isPremium=true`

**Response:**
```json
{
  "success": true,
  "users": [...],
  "pagination": {
    "total": 150,
    "page": 1,
    "pages": 3
  }
}
```

### Get User by Phone

Retrieve specific user details.

**Endpoint:** `GET /admin/users/:phoneNumber`

**Response:**
```json
{
  "success": true,
  "user": {
    "phoneNumber": "1234567890",
    "name": "John Doe",
    "isPremium": true,
    "isOwner": false,
    "warnings": 0
  },
  "commandHistory": [...]
}
```

### Update User Permissions

Update user roles and permissions.

**Endpoint:** `PATCH /admin/users/:phoneNumber`

**Request Body:**
```json
{
  "isOwner": false,
  "isAdmin": true,
  "isBanned": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "User updated successfully",
  "user": {...}
}
```

### Get All Groups

Retrieve all groups.

**Endpoint:** `GET /admin/groups`

**Response:**
```json
{
  "success": true,
  "groups": [
    {
      "groupId": "123456@g.us",
      "name": "Test Group",
      "settings": {...},
      "statistics": {...}
    }
  ]
}
```

### Get Group by ID

Retrieve specific group details.

**Endpoint:** `GET /admin/groups/:groupId`

**Response:**
```json
{
  "success": true,
  "group": {
    "groupId": "123456@g.us",
    "name": "Test Group",
    "settings": {
      "antiTag": {
        "enabled": true,
        "maxMentions": 5
      }
    }
  }
}
```

### Update Group Settings

Update group configuration.

**Endpoint:** `PATCH /admin/groups/:groupId`

**Request Body:**
```json
{
  "settings": {
    "antiTag": {
      "enabled": true,
      "maxMentions": 3,
      "action": "kick"
    },
    "ghostMode": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Group updated successfully",
  "group": {...}
}
```

### Get Command Logs

Retrieve command execution logs.

**Endpoint:** `GET /admin/logs/commands?page=1&limit=100&command=tagall`

**Response:**
```json
{
  "success": true,
  "logs": [
    {
      "command": "tagall",
      "user": {
        "phoneNumber": "1234567890",
        "name": "John Doe"
      },
      "success": true,
      "executionTime": 125,
      "timestamp": "2025-11-10T12:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 500,
    "page": 1,
    "pages": 5
  }
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

### Common Error Codes

- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (missing API key)
- `403` - Forbidden (invalid API key or insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

---

## Rate Limiting

API is rate limited to **100 requests per 15 minutes** per IP address.

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1699632000
```

---

## Webhook Integration (Future)

Coming soon: Webhooks for real-time events.
