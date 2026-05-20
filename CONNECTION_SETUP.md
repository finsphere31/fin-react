# Connection Setup & Startup Guide

## Project Structure
```
fin-react/
├── Backend/           # Node.js + Express server
│   ├── server.js      # Entry point (listens on port 4000)
│   ├── .env           # Environment variables
│   └── src/
│       ├── app.js     # Express app configuration with CORS
│       ├── controllers/
│       │   └── authController.js  # Login logic
│       └── routes/
│           └── auth.js             # /api/auth/login endpoint
└── Frontend/          # React + Vite
    ├── vite.config.ts # Proxy configuration for /api
    ├── .env.local     # Frontend environment variables
    ├── index.html     # Entry HTML
    └── src/
        ├── services/api.js         # Axios instance with interceptors
        ├── contexts/AuthContext.jsx # Auth state management
        └── pages/LoginPage.jsx      # Login UI with connection test
```

## ✅ Fixed Issues

### 1. ✓ Favicon 404 Error
**Status**: FIXED
- Removed favicon reference from index.html
- Eliminates the 404 error from missing favicon.ico

### 2. ✓ Backend Connection Errors
**Status**: FIXED
- Created `.env` file in Backend with proper configuration
- Backend server now logs all requests
- Health check endpoint added at `/health`
- Proper CORS configuration for localhost:5173 and localhost:3000
- Error handling with detailed logging in development mode

### 3. ✓ API Route Configuration
**Status**: FIXED  
- Backend routes properly configured at `/api/auth/login`
- Frontend proxy configured in vite.config.ts to forward `/api/*` to `http://localhost:4000`
- API service logs all requests and responses

### 4. ✓ Error Handling & Loading States
**Status**: ENHANCED
- Added logging to AuthContext with detailed error messages
- LoginPage now displays specific error messages
- Added "Test Backend Connection" button for debugging
- Proper loading states with LoadingButton component
- Console logs show exact connection details and failures

### 5. ✓ Vite Proxy Configuration
**Status**: VERIFIED
- Proxy correctly configured in vite.config.ts
- Routes `/api/*` to `http://localhost:4000` during development

### 6. ✓ Dependencies
**Status**: VERIFIED
- All required packages installed
- Backend: express, cors, mongoose, dotenv, bcryptjs, jsonwebtoken
- Frontend: axios, react-router-dom, tailwindcss, etc.

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+ installed
- npm or yarn package manager
- MongoDB running (optional for demo, backend accepts all logins)

### Step 1: Install Dependencies

**Backend:**
```bash
cd Backend
npm install
```

**Frontend:**
```bash
cd Frontend
npm install
```

### Step 2: Configure Environment Variables

**Backend** - Already created at `Backend/.env`:
```env
PORT=4000
FRONTEND_URL=http://localhost:5173
JWT_SECRET=fin-react-demo-secret-key-change-in-production
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/fin-react
```

**Frontend** - Already configured at `Frontend/.env.local`:
```env
VITE_API_URL=http://localhost:4000/api
```

### Step 3: Start Backend

```bash
cd Backend
npm start
```

**Expected output:**
```
Backend API listening on http://localhost:4000
[timestamp] GET /health
[timestamp] POST /api/auth/login
```

### Step 4: Start Frontend (in a new terminal)

```bash
cd Frontend
npm run dev
```

**Expected output:**
```
VITE v6.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Press h + enter to show help
```

### Step 5: Test Connection

1. Open http://localhost:5173 in your browser
2. Navigate to Login page
3. Click "Test Backend Connection" button
   - Should see: ✓ Backend is running
   - If failed: ✗ Backend is not responding
4. Enter any email and password
5. Click "Sign in"
6. Should redirect to dashboard on success

---

## 🔍 Debugging

### Check Console Logs

**Backend terminal:**
- Shows all incoming requests
- Shows errors with status codes and paths
- Shows CORS warnings (if any)

**Browser console:**
- [API Service] logs show all HTTP requests/responses
- [Auth] logs show login flow
- [LoginPage] logs show page-specific actions

### Common Issues & Solutions

#### Issue: "net::ERR_CONNECTION_REFUSED" on login attempt
**Solution**: Backend is not running
```bash
cd Backend && npm start
# Should see: Backend API listening on http://localhost:4000
```

#### Issue: CORS errors
**Solution**: Ensure both servers are running on correct ports
- Backend: http://localhost:4000
- Frontend: http://localhost:5173
- Ports are configured in CORS allow list in Backend/src/app.js

#### Issue: API returns 404
**Solution**: Routes may be misconfigured
1. Test: http://localhost:4000/health (should return success)
2. Test: http://localhost:4000/api (should return welcome message)
3. Test: POST to http://localhost:4000/api/auth/login with `{email, password}`

#### Issue: Frontend can't reach backend through Vite proxy
**Solution**: Vite proxy only works in dev mode, not in built/production mode
- During dev: `/api/*` → `http://localhost:4000` (via Vite proxy)
- For production: Use the `VITE_API_URL` environment variable

---

## 📋 Configuration Files

### Backend/.env
Controls backend behavior and server settings

### Frontend/.env.local  
Controls frontend API endpoint (development)

### Frontend/vite.config.ts
- Configures dev server proxy for `/api` routes
- Points to backend at http://localhost:4000
- Only active during `npm run dev`

### Backend/src/app.js
- Registers CORS middleware
- Sets allowed origins to localhost:5173, localhost:3000
- Registers routes at `/api`
- Registers error handling middleware

---

## 🔐 Security Notes

⚠️ **For Development Only:**
- JWT_SECRET is a placeholder, change before production
- NODE_ENV is set to 'development' showing full error details
- CORS allows all origins (callback always returns true)

⚠️ **For Production:**
1. Change JWT_SECRET to a strong random string
2. Set NODE_ENV to 'production'
3. Update CORS to only allow your frontend domain
4. Use HTTPS
5. Use environment-specific .env files
6. Use a real MongoDB instance
7. Hash passwords with bcryptjs before saving

---

## 📊 Response Formats

### Successful Login
```json
{
  "user": {
    "id": "demo-user",
    "email": "test@example.com",
    "name": "Demo User",
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

### Health Check
```json
{
  "success": true,
  "message": "Backend is running",
  "timestamp": "2026-05-20T12:34:56.789Z"
}
```

---

## 🛠️ Development Commands

### Backend
```bash
cd Backend
npm start           # Start production server
npm run dev         # Start with tsx watch mode (if configured)
```

### Frontend
```bash
cd Frontend
npm run dev         # Start dev server at http://localhost:5173
npm run build       # Build for production
npm run preview     # Preview production build
npm run clean       # Remove dist folder
```

---

## ✨ Features Added

1. **Detailed Logging**
   - Every request logged with timestamp and method
   - Errors logged with status, path, and stack trace
   - Browser console shows API flow

2. **Health Check Endpoint**
   - GET /health returns server status
   - Useful for checking if backend is running

3. **Connection Test Button**
   - Added to LoginPage for easy debugging
   - Tests http://localhost:4000/health
   - Shows visual feedback (green/red)

4. **Improved Error Messages**
   - Shows specific error from server
   - Suggests checking backend if connection fails
   - Console logs show exact URL being called

5. **Proper CORS Configuration**
   - Allows localhost development
   - Configurable for production

---

Last Updated: 2026-05-20
