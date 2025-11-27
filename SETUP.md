# Quick Access Page - Setup Guide

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas connection string)
- npm or yarn

## Installation Steps

### 1. Backend Setup

```bash
cd Backend
npm install
```

### 2. Create Backend .env File

Create a `.env` file in the `Backend` directory with the following content:

```
MONGODB_URI=mongodb://localhost:27017/quickaccess
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=3000
```

**Note:** If using MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string.

### 3. Frontend Setup

```bash
cd Frontend
npm install
```

### 4. Start MongoDB

Make sure MongoDB is running on your system:
- **Windows:** MongoDB should be running as a service
- **Mac/Linux:** Run `mongod` in a terminal
- **Docker:** `docker run -d -p 27017:27017 mongo`

### 5. Start Backend Server

```bash
cd Backend
npm run dev
```

The backend will run on `http://localhost:3000`

### 6. Start Frontend Server

In a new terminal:

```bash
cd Frontend
npm run dev
```

The frontend will run on `http://localhost:5173` (or another port if 5173 is busy)

## Creating Initial Users

To create users, you can use the registration endpoint. Here are some example users:

### Create Admin User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@company.com",
    "password": "admin123",
    "role": "admin"
  }'
```

### Create Other Role Users

```bash
# Employee
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "employee1",
    "email": "employee@company.com",
    "password": "emp123",
    "role": "employee"
  }'

# Marketer
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "marketer1",
    "email": "marketer@company.com",
    "password": "mkt123",
    "role": "marketer"
  }'

# HR
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "hr1",
    "email": "hr@company.com",
    "password": "hr123",
    "role": "hr"
  }'
```

Or use Postman/Thunder Client to make these requests.

## Features

✅ **Role-Based Authentication**
- Admin, Employee, Marketer, HR roles
- Secure JWT-based authentication

✅ **Role-Based Link Visibility**
- Admin sees all categories
- Other roles see their category + "Other"
- "Other" category visible to everyone

✅ **Auto Logo Detection**
- Automatically fetches logos from URLs
- Falls back to custom upload or default logo

✅ **Modern Animated UI**
- Smooth transitions and hover effects
- Professional gradient design
- Responsive layout

✅ **Link Management**
- Add links with title, URL, description, and category
- Delete links (admin or link creator)
- Tab-based filtering

## Default Login Credentials

After creating users using the registration endpoint, you can login with:
- Username: `admin` (or any username you created)
- Password: The password you set during registration

## Troubleshooting

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check your `.env` file has the correct `MONGODB_URI`

2. **Port Already in Use**
   - Change the PORT in `.env` file
   - Update API_BASE_URL in `Frontend/src/axios/api.js` if backend port changes

3. **CORS Errors**
   - Ensure backend CORS is enabled (already configured)
   - Check that frontend is calling the correct backend URL

4. **Logo Not Fetching**
   - Some domains may not have logos available
   - Use the custom logo upload feature as fallback

## Production Deployment

Before deploying to production:

1. Change `JWT_SECRET` to a strong, random string
2. Use environment variables for all sensitive data
3. Set up proper MongoDB connection (Atlas recommended)
4. Configure CORS to allow only your frontend domain
5. Use HTTPS for all connections
6. Set up proper error logging and monitoring

