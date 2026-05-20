# ⚡ Quick Reference - fin-react

## 🚀 Start Development (3 steps)

### Step 1: Install (if first time)
```bash
cd Backend && npm install
cd ../Frontend && npm install
```

### Step 2: Start Backend (Terminal A)
```bash
cd Backend
npm start
# Should see: Backend API listening on http://localhost:4000
```

### Step 3: Start Frontend (Terminal B)
```bash
cd Frontend
npm run dev
# Should see: ➜ Local: http://localhost:5173/
```

✅ **Done!** Open http://localhost:5173 in browser

---

## 🔧 Testing Connection

**In LoginPage:**
1. Click "Test Backend Connection" button
2. Should show ✓ Backend is running
3. Enter any email & password, click "Sign in"

**Via curl:**
```bash
curl http://localhost:4000/health
```

---

## 📂 Project Structure

```
fin-react/
├── Backend/        (Node.js + Express on :4000)
│   ├── .env        (Config: PORT=4000, JWT_SECRET, etc)
│   ├── server.js   (Entry point)
│   └── src/
│       ├── app.js  (Express app with CORS)
│       ├── controllers/authController.js
│       └── routes/auth.js
│
└── Frontend/       (React + Vite on :5173)
    ├── .env.local  (Config: VITE_API_URL)
    ├── index.html
    └── src/
        ├── pages/LoginPage.jsx
        ├── contexts/AuthContext.jsx
        ├── services/api.js (Axios with logging)
        └── ...
```

---

## 📋 Environment Variables

**Backend/.env**
```env
PORT=4000
FRONTEND_URL=http://localhost:5173
JWT_SECRET=fin-react-demo-secret-key-change-in-production
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/fin-react
```

**Frontend/.env.local**
```env
VITE_API_URL=http://localhost:4000/api
```

---

## 🐛 Debug with Console Logs

**Backend:**
- Terminal where `npm start` is running
- Shows all requests: `[timestamp] METHOD /path`
- Shows errors with status & details

**Frontend:**
- Browser DevTools → Console tab
- Look for: `[API Service]`, `[Auth]`, `[LoginPage]`
- Shows request details, responses, errors

---

## 🔗 API Endpoints

| Method | Path | What |
|--------|------|------|
| GET | /health | Check if backend is running |
| GET | /api | Welcome message |
| POST | /api/auth/login | Login (accepts any email/password for now) |

---

## ⚠️ Common Issues

| Issue | Fix |
|-------|-----|
| net::ERR_CONNECTION_REFUSED | Backend not running: `cd Backend && npm start` |
| API returns 404 | Check backend is on :4000, routes are correct |
| CORS error | Both servers must be running, check .env |
| Token not saved | Check browser localStorage |
| Vite proxy not working | Proxy only works in dev mode (`npm run dev`) |

---

## 📖 Full Documentation

See:
- **CONNECTION_SETUP.md** — Complete setup & configuration
- **FIXES_SUMMARY.md** — All errors that were fixed
- **Backend/.env** — Backend configuration
- **Frontend/.env.local** — Frontend configuration

---

## ✨ Features Added

✅ Favicon 404 error fixed
✅ Backend connection configured
✅ API routes working
✅ Error handling improved
✅ Console logging added
✅ "Test Backend Connection" button
✅ Vite proxy configured
✅ CORS properly set up
✅ Health check endpoint
✅ Detailed error messages

---

## 🎯 Next Steps

After login works:

1. **Setup MongoDB** (if using database)
   ```bash
   # Option A: Local MongoDB
   brew install mongodb-community
   brew services start mongodb-community
   
   # Option B: MongoDB Atlas
   # Create account at mongodb.com/cloud/atlas
   # Update MONGODB_URI in .env
   ```

2. **Implement real auth**
   - Replace demo login with real user validation
   - Add password hashing with bcryptjs
   - Add user registration

3. **Build frontend pages**
   - Dashboard, Reports, Transactions, etc.
   - Connect to backend APIs

4. **Deploy**
   - Backend → Heroku, Railway, Vercel, AWS, etc.
   - Frontend → Vercel, Netlify, etc.

---

**Status**: ✅ All connection errors fixed!
**Time to read full docs**: ~5 minutes
**Bookmark**: CONNECTION_SETUP.md
