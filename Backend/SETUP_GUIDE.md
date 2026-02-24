# AgriSmart Backend Setup Guide

## Prerequisites
1. Python 3.8 or higher
2. MongoDB installed locally or MongoDB Atlas account
3. MongoDB Compass (for database visualization)

## Installation Steps

### 1. Install Python Dependencies
```bash
cd Backend
pip install -r requirements.txt
```

### 2. MongoDB Setup

#### Option A: Local MongoDB
1. Download and install MongoDB Community Edition
2. Start MongoDB service:
   - Windows: `net start MongoDB`
   - Mac/Linux: `sudo systemctl start mongod`
3. Your MongoDB URI will be: `mongodb://localhost:27017/`

#### Option B: MongoDB Atlas (Cloud)
1. Create a free account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Get your connection string and update `.env` file
4. Example: `mongodb+srv://username:password@cluster.mongodb.net/`

### 3. MongoDB Compass Connection
1. Open MongoDB Compass
2. Connection string: `mongodb://localhost:27017/` (or your Atlas URI)
3. Click "Connect"
4. You should see the `agrismart` database after registering a user

### 4. Environment Configuration
Update the `.env` file with your settings:
```
MONGODB_URI=mongodb://localhost:27017/
SECRET_KEY=your-super-secret-key-here
```

### 5. Run the Flask Server
```bash
cd Backend
python app.py
```

The server will start on `http://localhost:5000`

## API Endpoints

### Health Check
- **GET** `/api/health`
- Check if server is running

### Register
- **POST** `/api/register`
- Body:
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "institution": "University Name",
  "password": "securepassword"
}
```

### Login
- **POST** `/api/login`
- Body:
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

### Get Profile
- **GET** `/api/profile`
- Headers: `Authorization: Bearer <token>`

### Update Profile
- **PUT** `/api/profile`
- Headers: `Authorization: Bearer <token>`
- Body: (any fields you want to update)
```json
{
  "fullName": "John Updated",
  "phone": "+0987654321",
  "major": "Agricultural Science",
  "bio": "Updated bio..."
}
```

## Frontend Setup

### Run Frontend Development Server
```bash
cd front
npm install
npm run dev
```

The frontend will start on `http://localhost:5173`

## Testing the Integration

1. Start MongoDB (if using local)
2. Start Flask backend: `python Backend/app.py`
3. Start frontend: `npm run dev` in the `front` folder
4. Open browser to `http://localhost:5173`
5. Register a new account
6. Login with your credentials
7. View your profile - it should show the data you registered with
8. Open MongoDB Compass to see the user data in the database

## Database Structure

### Database: `agrismart`
### Collection: `users`

Document structure:
```json
{
  "_id": ObjectId("..."),
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "institution": "University Name",
  "password": "hashed_password",
  "major": "Agricultural Science",
  "yearOfStudy": "3rd Year",
  "location": "City, Country",
  "bio": "User bio...",
  "createdAt": ISODate("2024-12-13T..."),
  "updatedAt": ISODate("2024-12-13T...")
}
```

## Troubleshooting

### MongoDB Connection Error
- Check if MongoDB service is running
- Verify the connection URI in `.env`
- Check firewall settings

### CORS Error
- Make sure flask-cors is installed
- Backend should be running on port 5000
- Frontend should be running on port 5173

### Token Errors
- Check if token is being stored in localStorage
- Verify SECRET_KEY in `.env` matches
- Token expires after 7 days

## Security Notes
- Change the SECRET_KEY in production
- Use HTTPS in production
- Never commit `.env` file to version control
- Passwords are hashed using Werkzeug's security utilities
