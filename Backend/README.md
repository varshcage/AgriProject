# AgriSmart Backend API

Flask-based REST API with MongoDB for the AgriSmart platform.

## Features
- ✅ User Registration with password hashing
- ✅ User Login with JWT authentication
- ✅ Protected Profile endpoints
- ✅ Profile update functionality
- ✅ MongoDB integration
- ✅ CORS enabled for frontend integration

## Setup Instructions

### 1. Install MongoDB
You have two options:

**Option A: Local MongoDB**
- Download MongoDB Community Edition from https://www.mongodb.com/try/download/community
- Install and start MongoDB service
- Download MongoDB Compass from https://www.mongodb.com/try/download/compass
- Connect to `mongodb://localhost:27017`

**Option B: MongoDB Atlas (Cloud)**
- Create a free account at https://www.mongodb.com/cloud/atlas
- Create a cluster and get your connection string
- Update the `.env` file with your Atlas URI

### 2. Configure Environment Variables
Create or update the `.env` file:
```
MONGODB_URI=mongodb://localhost:27017/
SECRET_KEY=your-secret-key-here
```

### 3. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the Flask Server
```bash
python app.py
```

The server will run on http://localhost:5000

## API Endpoints

### Health Check
- **GET** `/api/health`
- Returns server status

### Register User
- **POST** `/api/register`
- Body:
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "institution": "Agricultural University",
  "password": "securepassword"
}
```
- Returns: User data + JWT token

### Login User
- **POST** `/api/login`
- Body:
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```
- Returns: User data + JWT token

### Get User Profile
- **GET** `/api/profile`
- Headers: `Authorization: Bearer <token>`
- Returns: Current user profile

### Update User Profile
- **PUT** `/api/profile`
- Headers: `Authorization: Bearer <token>`
- Body: (fields to update)
```json
{
  "fullName": "John Updated",
  "phone": "+0987654321",
  "major": "Agricultural Science",
  "yearOfStudy": "3rd Year",
  "location": "California, USA",
  "bio": "Updated bio..."
}
```
- Returns: Updated user data

## Database Structure

**Database**: `agrismart`
**Collection**: `users`

User document schema:
```javascript
{
  fullName: String,
  email: String (unique),
  phone: String,
  institution: String,
  password: String (hashed),
  major: String,
  yearOfStudy: String,
  location: String,
  bio: String,
  createdAt: DateTime,
  updatedAt: DateTime
}
```

## View Data in MongoDB Compass

1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017/`
3. Select the `agrismart` database
4. Select the `users` collection
5. View, edit, or delete user records

## Security Features

- Passwords are hashed using Werkzeug's `generate_password_hash`
- JWT tokens for authentication
- Token expiration set to 7 days
- Protected routes using `@token_required` decorator
- CORS enabled for cross-origin requests

## Testing the API

Use tools like Postman, Thunder Client, or curl to test the endpoints:

```bash
# Health check
curl http://localhost:5000/api/health

# Register
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test User","email":"test@example.com","phone":"+1234567890","institution":"Test Uni","password":"test123"}'

# Login
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

## Dependencies

- Flask 3.0.0 - Web framework
- flask-cors 4.0.0 - CORS support
- pymongo 4.6.1 - MongoDB driver
- Werkzeug 3.0.1 - Password hashing
- PyJWT 2.8.0 - JWT token generation
- python-dotenv 1.0.0 - Environment variables

## Troubleshooting

**MongoDB Connection Error**
- Ensure MongoDB service is running
- Check the connection URI in `.env`
- Verify MongoDB Compass can connect

**Import Error**
- Run `pip install -r requirements.txt`
- Check Python version (3.8+)

**CORS Error**
- Verify flask-cors is installed
- Check frontend is making requests to the correct URL

### Get Profile
- **GET** `/api/profile`
- Headers: `Authorization: Bearer <token>`

### Update Profile
- **PUT** `/api/profile`
- Headers: `Authorization: Bearer <token>`
- Body:
```json
{
  "fullName": "John Doe Updated",
  "phone": "+1234567890",
  "institution": "New University"
}
```

## MongoDB Collections

### users
- fullName
- email (unique)
- phone
- institution
- password (hashed)
- major
- yearOfStudy
- location
- bio
- joinDate
- createdAt
