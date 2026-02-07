# MongoDB Compass Setup Guide

MongoDB Compass is a GUI tool for managing, querying, and visualizing MongoDB data. Follow these steps to connect it to your FocusFlow database.

## Prerequisites

- MongoDB Server running locally on `127.0.0.1:27017` ✅
- MongoDB Compass installed ([Download here](https://www.mongodb.com/products/compass))
- FocusFlow backend running (run `npm start` from root directory)

## Connection Details

Your MongoDB instance is configured with the following details:

| Setting | Value |
|---------|-------|
| **Host** | `127.0.0.1` or `localhost` |
| **Port** | `27017` |
| **Database** | `focusflow` |
| **Connection String** | `mongodb://127.0.0.1:27017` |
| **URI (with DB)** | `mongodb://127.0.0.1:27017/focusflow` |

## Steps to Connect

### 1. Launch MongoDB Compass
Open MongoDB Compass application from your computer.

### 2. Create New Connection
Click **"New Connection"** or the **"+"** button.

### 3. Enter Connection URI
Paste this connection string in the URI field:
```
mongodb://localhost:27017
```

Or use the full database URI:
```
mongodb://localhost:27017/focusflow
```

### 4. Click Connect
Click the **"Connect"** button to establish connection.

### 5. Explore Your Data

Once connected, you'll see:

**Databases:**
- `focusflow` - Your FocusFlow application database

**Collections (Tables):**
- `users` - User accounts and authentication
- `analytics` - Study analytics and tracking data
- `playgrounds` - Code playground saves

## What You Can Do in Compass

### View Collections
- Click on `focusflow` database
- Click on any collection (`users`, `analytics`, `playgrounds`)
- Browse all documents (records) in JSON format

### Example: View All Users
```
Database: focusflow
Collection: users
```

Click to see:
- User IDs
- Emails
- Usernames
- Sign-up dates

### Example: View Study Analytics
```
Database: focusflow
Collection: analytics
```

See:
- Subject study times
- User tracking
- Session data
- Timestamps

### Query Data
Use Compass's query bar to filter documents:

**Find users by email:**
```json
{ "email": "user@example.com" }
```

**Find analytics for specific user:**
```json
{ "user": ObjectId("...") }
```

## Troubleshooting

### Connection Failed: "Unable to connect"
1. ✅ Verify MongoDB server is running:
   ```powershell
   Get-Process -Name mongod
   ```
2. Check if port 27017 is correct:
   ```powershell
   netstat -ano | findstr :27017
   ```

### Cannot See `focusflow` Database
- The database is created automatically when the backend makes first request
- Try signing up a user on the app first
- Then refresh Compass connection

### No Collections Visible
- Collections are created when data is first inserted
- Use the app:
  1. Sign up a user
  2. Use dashboard features
  3. This will populate the database
- Refresh Compass to see collections

## Environment Variables

Your MongoDB connection is configured in `.env`:

```dotenv
MONGO_URI=mongodb://127.0.0.1:27017/focusflow
JWT_SECRET=dev_secret
PORT=5000
```

To modify connection:
1. Edit `.env` file
2. Change `MONGO_URI` value
3. Restart backend server: `npm start`

## Import/Export Data

### Export Collection (Backup)
1. Right-click collection in Compass
2. Select **"Export Collection"**
3. Choose JSON or CSV format
4. Save to file

### Import Data
1. Click **"Import Data"**
2. Select file
3. Choose format (JSON, CSV)
4. Click **"Import"**

## Compass Features

| Feature | Use |
|---------|-----|
| **Aggregation** | Complex data queries |
| **Schema** | View data structure |
| **Indexes** | Optimize query performance |
| **Validation** | Set data validation rules |
| **Explain Plan** | Debug slow queries |

## Next Steps

1. ✅ Install MongoDB Compass
2. ✅ Connect using `mongodb://localhost:27017`
3. ✅ Open the `focusflow` database
4. ✅ Browse collections
5. 📊 Use Compass to monitor your app data

## Additional Resources

- [MongoDB Compass Documentation](https://docs.mongodb.com/compass/current/)
- [MongoDB Query Language](https://docs.mongodb.com/manual/tutorial/query-documents/)
- [FocusFlow Backend README](./SERVER_README.md)

## Connection String Reference

**Local MongoDB (Default):**
```
mongodb://localhost:27017/focusflow
```

**With Authentication (if enabled):**
```
mongodb://username:password@localhost:27017/focusflow
```

**MongoDB Atlas Cloud (Remote):**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/focusflow
```

---

**Your backend is already configured to:**
- ✅ Create database automatically
- ✅ Create collections automatically
- ✅ Use Mongoose for schema validation
- ✅ Hash passwords securely
- ✅ Manage connections efficiently

You're all set to monitor your data with MongoDB Compass! 🚀
