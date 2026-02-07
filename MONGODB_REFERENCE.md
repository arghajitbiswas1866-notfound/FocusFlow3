# 🗄️ FocusFlow MongoDB Setup - Complete Reference

## ✅ Current Setup Status

| Component | Status | Details |
|-----------|--------|---------|
| **MongoDB** | ✅ Running | `mongod` process active |
| **Database** | ✅ Created | `focusflow` |
| **Connection** | ✅ Working | `mongodb://127.0.0.1:27017` |
| **Mongoose ORM** | ✅ Integrated | v7.0.0 |
| **Authentication** | ✅ bcryptjs | Password hashing enabled |

---

## 🧭 MongoDB Compass Quick Connect

### Installation
1. Download: [mongodb.com/products/compass](https://www.mongodb.com/products/compass)
2. Run installer
3. Launch MongoDB Compass

### Connection String
```
mongodb://localhost:27017
```

### In Compass UI
1. New Connection
2. Paste URI ↑
3. Connect
4. Browse `focusflow` database

---

## 📂 Database Structure

### Database: `focusflow`

#### Collections (Auto-created)

**1. `users`**
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (bcrypt hashed),
  createdAt: Date,
  updatedAt: Date
}
```
- Stores user accounts
- Email is unique & lowercase
- Password is hashed with bcryptjs

**2. `analytics`**
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: users),
  subjectTimes: { 
    [subject]: Number  // minutes
  },
  createdAt: Date,
  updatedAt: Date
}
```
- Tracks study sessions per user
- Records subject-wise time spent
- Indexed by user ID

**3. `playgrounds`**
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: users),
  name: String,
  data: String,  // code content
  createdAt: Date,
  updatedAt: Date
}
```
- User code saved snippets
- Can store any text/code
- Indexed by user ID

---

## 🔐 Security & Authentication

### Authentication Flow
1. User signs up with email & password
2. Password hashed: `bcryptjs.hash(password, 10)`
3. Hash stored in MongoDB
4. On login: `bcryptjs.compare(input, hash)`
5. JWT token issued: `jwt.sign({ id: user._id })`
6. Token stored in localStorage (frontend)
7. Token sent in Authorization header: `Bearer <token>`

### JWT Configuration
- **Secret**: Stored in `.env` as `JWT_SECRET`
- **Expiry**: 7 days
- **Header**: `Authorization: Bearer <token>`
- **Payload**: `{ id: user._id }`

### Password Security
- Hashing Algorithm: bcryptjs
- Salt Rounds: 10
- Stored as salted hash (never plain text)

---

## 🛠️ Configuration Files

### `.env` (Development)
```dotenv
MONGO_URI=mongodb://127.0.0.1:27017/focusflow
JWT_SECRET=dev_secret
PORT=5000
```

### `.env.example` (Template)
- Provided for team members
- Contains placeholders
- Instructions for each variable

### `mongodb.config`
- Reference schema file
- Data structure documentation
- Index information

---

## 📊 Indexes

Auto-created by application:

```javascript
// users collection
users.email (unique: true)

// analytics & playgrounds
[collection].user (for filtering by user)
```

These enable fast queries without scanning all documents.

---

## 🔄 Data Flow

### Sign Up Process
```
Frontend (signup.js)
    ↓
POST /api/auth/signup
    ↓
Backend (routes/auth.js)
    ↓
Hash password (bcryptjs)
    ↓
Save user to MongoDB (users collection)
    ↓
Generate JWT token
    ↓
Send token to frontend
    ↓
Frontend stores in localStorage
```

### API Request with Auth
```
Frontend fetch()
    ↓
Include: Authorization: Bearer [token]
    ↓
Backend auth middleware
    ↓
Verify JWT (routes/auth.js)
    ↓
Extract userId from token
    ↓
Query MongoDB with userId
    ↓
Return user-specific data
```

### Study Session Recording
```
Dashboard (dashboard.js)
    ↓
POST /api/analytics
    ↓
Include: subjectTimes { subject: minutes }
    ↓
Backend (routes/analytics.js)
    ↓
Create Analytics document
    ↓
Associate with user ID
    ↓
Save to MongoDB (analytics collection)
    ↓
Return success response
```

---

## 📋 Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/focusflow` |
| `JWT_SECRET` | Token signing key | `dev_secret` / random string |
| `PORT` | Express server port | `5000` |

### Production Changes Needed
```dotenv
# Development (.env)
MONGO_URI=mongodb://127.0.0.1:27017/focusflow
JWT_SECRET=dev_secret
PORT=5000

# Production (.env)
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/focusflow
JWT_SECRET=long-random-secret-string
PORT=process.env.PORT  # Platform assigns
```

---

## 🧪 Testing & Utilities

### Connection Test
```bash
npm run test-mongodb
# or
node test-mongodb.js
```

Shows:
- Connection status
- Database name & host
- Port number
- Compass connection details

### Testing Endpoints
```bash
node test_endpoints.js  # API endpoint tests
node test_playground.js # Playground tests
```

---

## 📈 Scalability Notes

### Current Limits (Development)
- Single MongoDB instance
- No replication
- No sharding
- No backup strategy

### For Production Scale
1. **MongoDB Atlas** (cloud)
   - Automatic backups
   - Replication
   - Load balancing

2. **On-Premise MongoDB**
   - Replica sets
   - Sharding
   - Regular backups

3. **Indexes Optimization**
   - Add composite indexes
   - Profile slow queries
   - Check index statistics

### Data Growth Considerations
- `users`: 1M+ documents OK
- `analytics`: Archive old sessions
- `playgrounds`: Clean up large code submissions

---

## 🔍 Querying Examples

### Via MongoDB Compass

**Find user by email:**
```json
{ "email": "user@example.com" }
```

**Find all analytics for user:**
```json
{ "user": ObjectId("...user_id...") }
```

**Find recent playgrounds:**
```json
{ "createdAt": { "$gte": ISODate("2024-01-01") } }
```

### Via Mongoose (Backend)
```javascript
// Find user
const user = await User.findOne({ email });

// Find analytics
const analytics = await Analytics.find({ user: userId });

// Find playground
const playground = await Playground.findById(playgroundId);
```

---

## 📂 File Locations

| File | Purpose |
|------|---------|
| `.env` | Production environment variables |
| `.env.example` | Template with instructions |
| `mongodb.config` | Schema reference documentation |
| `test-mongodb.js` | Connection test utility |
| `MONGODB_COMPASS_SETUP.md` | Comprehensive Compass guide |
| `QUICK_START_COMPASS.md` | 5-minute quick start |

---

## 🚀 Quick Commands

```bash
# Start backend
npm start

# Development with auto-reload
npm run dev

# Test MongoDB connection
node test-mongodb.js

# Test API endpoints
node test_endpoints.js

# Check Node processes
Get-Process -Name node

# Stop all Node processes
Get-Process -Name node | Stop-Process -Force
```

---

## 📞 Troubleshooting Checklist

- [ ] MongoDB running: `Get-Process -Name mongod`
- [ ] Backend running: `npm start`
- [ ] MONGO_URI correct in `.env`
- [ ] Port 5000 available: `netstat -ano | findstr :5000`
- [ ] MongoDB Compass can connect
- [ ] User data appearing after signup
- [ ] Analytics saved when using dashboard
- [ ] Tokens stored in localStorage

---

## 📚 Related Documentation

- [MONGODB_COMPASS_SETUP.md](./MONGODB_COMPASS_SETUP.md) - Full Compass guide
- [QUICK_START_COMPASS.md](./QUICK_START_COMPASS.md) - Quick setup
- [SERVER_README.md](./SERVER_README.md) - Backend API docs

---

**All MongoDB files and configuration are ready for Compass integration! 🎉**
