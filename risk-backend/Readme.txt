# Risk Assessment API Documentation

A comprehensive API for customer risk assessment and compliance management.

## 🚀 Quick Start

1. Start the server:
   ```bash
   npm run dev
   ```

2. Access the interactive API documentation:
   ```
   http://localhost:3000/api-docs
   ```

## 📖 API Overview

The Risk Assessment API provides endpoints for:
- **Authentication** - User signup and login
- **Submissions** - Customer data submission and risk assessment
- **Admin Management** - Risk parameters, settings, and scoring configuration

## 🔐 Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Get a Token

1. **Signup** (if needed):
   ```bash
   curl -X POST http://localhost:3000/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"email":"user@example.com","password":"Password123","role":"user"}'
   ```

2. **Login**:
   ```bash
   curl -X POST http://localhost:3000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"user@example.com","password":"Password123"}'
   ```

## 👥 User Roles

- **`user`** - Can create and view their own submissions
- **`approver`** - Can view all submissions and override risk ratings
- **`admin`** - Full access to all endpoints including system configuration

## 🎯 Key Endpoints

### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login and get JWT token

### Submissions
- `POST /submissions` - Create new submission with automatic risk assessment
- `GET /submissions` - Get user's submissions (or all for approvers/admins)
- `GET /submissions/:id` - Get specific submission details
- `PATCH /submissions/:id` - Override submission rating (approver/admin only)
- `POST /submissions/:id/reassess` - Trigger risk reassessment (admin only)

### Admin - Risk Parameters
- `GET /admin/risk-parameters` - List all risk parameters
- `POST /admin/risk-parameters` - Add new risk parameter
- `PATCH /admin/risk-parameters/:id` - Update risk parameter
- `DELETE /admin/risk-parameters/:id` - Delete risk parameter

### Admin - Settings
- `GET /admin/settings` - List all admin settings
- `POST /admin/settings` - Add new setting
- `PATCH /admin/settings/:id` - Update setting
- `DELETE /admin/settings/:id` - Delete setting

## 📊 Risk Assessment

The system automatically calculates risk scores based on:

### Risk Parameters
Configure scoring for various factors:
- **Countries** - Geographic risk levels
- **Occupations** - High-risk professions
- **Compliance** - PEP status, sanctions, etc.
- **Financial** - Transaction volumes, wealth sources

### Risk Bands
- **`Low`** - Standard processing
- **`Medium`** - Enhanced due diligence
- **`High`** - Senior approval required
- **`AutoHigh`** - Automatic high-risk classification
- **`NoGo`** - Automatic rejection

### Scoring Thresholds
Configure via admin settings:
- `score_threshold_low` (default: 20)
- `score_threshold_medium` (default: 50)
- `score_threshold_high` (default: 75)
- `score_threshold_auto_high` (default: 90)

## 🔧 Configuration Examples

### Add Risk Parameters
```bash
# High-risk country
curl -X POST http://localhost:3000/admin/risk-parameters \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Country",
    "parameter": "Nigeria",
    "riskLevel": "High",
    "scoreValue": 30
  }'

# PEP scoring
curl -X POST http://localhost:3000/admin/risk-parameters \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Compliance",
    "parameter": "PEP",
    "riskLevel": "High",
    "scoreValue": 25
  }'
```

### Configure Settings
```bash
# Set high-risk threshold
curl -X POST http://localhost:3000/admin/settings \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "score_threshold_high",
    "description": "High risk threshold",
    "value": "75"
  }'

# Configure no-go countries
curl -X POST http://localhost:3000/admin/settings \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "no_go_countries",
    "description": "Auto-reject countries",
    "value": "North Korea,Iran,Syria"
  }'
```

## 📝 Submission Examples

### Low Risk Individual
```json
{
  "type": "individual",
  "details": [
    {
      "section": "personal_info",
      "data": {
        "country": "Mauritius",
        "isPEP": false,
        "age": 35,
        "occupation": "Engineer"
      }
    },
    {
      "section": "financial_info",
      "data": {
        "sourceOfWealth": "Salary",
        "estimatedMonthlyInflow": 50000
      }
    }
  ]
}
```

### High Risk Individual
```json
{
  "type": "individual",
  "details": [
    {
      "section": "personal_info",
      "data": {
        "country": "Nigeria",
        "isPEP": true,
        "age": 45,
        "occupation": "Politician"
      }
    },
    {
      "section": "financial_info",
      "data": {
        "sourceOfWealth": "Business",
        "estimatedMonthlyInflow": 200000
      }
    }
  ]
}
```

## 🛠️ Error Handling

The API returns standard HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `500` - Internal Server Error

Error responses include a descriptive message:
```json
{
  "message": "Error description",
  "error": "Additional error details"
}
```

## 📊 Risk Assessment Logic

### Automatic Rules
1. **No-Go Countries** → `NoGo` risk (score: 100)
2. **Blacklisted Customers** → `High` risk (score: 100)
3. **PEP Status** → Adds configured score
4. **Country Risk** → Adds country-specific score
5. **High Transaction Volume** → Adds volume-based score
6. **Age-based Risk** → Additional scoring for minors/elderly

### Manual Overrides
Approvers and admins can override system ratings with justification.

## 🔍 Testing

Use the interactive Swagger documentation at `/api-docs` to test all endpoints with your browser, or use the provided curl examples.

## 📞 Support

For API support or questions, refer to the interactive documentation at `/api-docs` or contact the development team.