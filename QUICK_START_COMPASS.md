# 🚀 Quick Start: Connect MongoDB Compass

## 5-Minute Setup

### 1️⃣ Ensure MongoDB is Running
```powershell
Get-Process -Name mongod
```
If no output → MongoDB is NOT running. Start it first.

### 2️⃣ Start FocusFlow Backend
```powershell
cd C:\Users\biswa\OneDrive\Desktop\FocusFlow
npm start
```
Expected output:
```
✅ Server running on http://localhost:5000
📡 API endpoints available at http://localhost:5000/api
✅ MongoDB connected
```

### 3️⃣ Test MongoDB Connection (Optional)
```powershell
node test-mongodb.js
```

### 4️⃣ Install MongoDB Compass
- Download: https://www.mongodb.com/products/compass
- Run installer
- Launch application

### 5️⃣ Connect to Your Database

**In MongoDB Compass:**

1. Click **"New Connection"**
2. Paste this URI:
   ```
   mongodb://localhost:27017
   ```
3. Click **"Connect"**

**✅ You're Connected!**

You should now see:
- Database: `focusflow`
- Collections: `users`, `analytics`, `playgrounds`

---

## 📍 Your MongoDB Details

| Item | Value |
|------|-------|
| Connection URI | `mongodb://localhost:27017` |
| Host | `localhost` (or `127.0.0.1`) |
| Port | `27017` |
| Database | `focusflow` |
| Username | (none - development) |
| Password | (none - development) |

---

## ✨ What You Can Do Now

### View User Data
1. Open `focusflow` database
2. Click `users` collection
3. See all registered users with emails, names, created dates

### Browse Study Analytics
1. Click `analytics` collection
2. See study tracking data by user
3. View timestamps and subject times

### Check Code Playgrounds
1. Click `playgrounds` collection
2. View saved code snippets by user

---

## 🧪 Test It Out

### Create Test Data
1. Go to http://localhost:5000
2. Click "Get Started" → "Sign Up"
3. Create test account
4. Use the dashboard
5. Refresh MongoDB Compass to see new user

### Verify in Compass
1. In `users` collection, find your new user
2. See encrypted password (bcrypt)
3. See timestamps (createdAt, updatedAt)

---

## ❌ Troubleshooting

### "Unable to Connect"
```powershell
# Check if MongoDB is running
Get-Process -Name mongod

# Check port 27017
netstat -ano | findstr :27017

# Restart MongoDB
net stop MongoDB
net start MongoDB
```

### "No Collections Visible"
- Collections appear only after data is created
- Sign up a user through the app first
- Then refresh Compass (F5)

### "Cannot Access Database"
1. Verify `.env` has correct MONGO_URI
2. Check MongoDB logs
3. Try: `node test-mongodb.js`

---

## 📚 Full Documentation

See [MONGODB_COMPASS_SETUP.md](./MONGODB_COMPASS_SETUP.md) for:
- Query examples
- Data import/export
- Schema validation
- Performance optimization
- Advanced features

---

## 🎯 Next Steps

✅ MongoDB Compass connected
✅ Can view collections
✅ Can browse documents

Now:
1. Create more test users
2. Use the app features
3. Monitor data in Compass
4. Export backups regularly

---

**Your MongoDB setup is READY TO USE! 🎉**
