# Server setup (Express + MongoDB)

1. Copy `.env.example` to `.env` and update values:
   - `MONGO_URI` (use MongoDB Atlas connection string or local URI)
   - `JWT_SECRET` (pick a secure secret)

2. Install dependencies (already done):
   - `npm install`

3. Run the server:
   - Development: `npm run dev` (requires `nodemon`)
   - Production: `npm start`

4. Quick tests:
   - Health: `GET /api/health` -> should return `{ "healthy": true }`
   - Signup: `POST /api/auth/signup` with JSON { name, email, password }
   - Signin: `POST /api/auth/signin` with JSON { email, password }

5. Notes:
   - Keep `.env` out of version control.
   - Extend with more models (analytics, tasks, etc.) and protected routes using JWT.
