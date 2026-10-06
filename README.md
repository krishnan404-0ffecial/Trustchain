# TrustChain — Real-Time Gig Worker Verification Platform

A full MERN-stack app with three role-based modules (**User / Worker / Admin**),
built to be genuinely real-time via **Socket.io**: live chat, live job-status
updates, live KYC decisions, and live notifications — no polling, no refresh.

## Stack

- **Frontend:** React (Context API, React Router), plain CSS design system, Socket.io-client
- **Backend:** Node.js, Express, Socket.io
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT (role-based access: `user`, `worker`, `admin`)

## Project structure

```
trustchain/
├── backend/
│   ├── config/db.js
│   ├── models/          User, Job, Rating, Message, Notification
│   ├── middleware/       auth (JWT + role guard), upload (multer), errorHandler
│   ├── controllers/      auth, user, worker, admin, chat
│   ├── routes/           authRoutes, userRoutes, workerRoutes, adminRoutes, chatRoutes, notificationRoutes
│   ├── socket/socketHandler.js   Socket.io auth + chat/presence/typing events
│   ├── utils/            generateToken, seed.js (creates a default admin)
│   └── server.js
└── frontend/
    └── src/
        ├── api/axios.js               Axios instance w/ JWT interceptor
        ├── context/                    AuthContext, SocketContext
        ├── components/                 TrustBadge, Sidebar, PrivateRoute, RatingStars
        ├── modules/
        │   ├── user/     UserDashboard (browse/request workers), MyBookings
        │   ├── worker/   WorkerDashboard, KYCUpload, MyJobs
        │   └── admin/    AdminDashboard, VerifyKYC, ManageUsers
        ├── pages/         Login, Register, Chat
        └── styles/        tokens.css (design system), layout.css
```

## How the three modules work together

1. **User** browses verified workers (trust score + rating shown via the "Trust Seal"
   badge), sends a job request, chats live with the worker, and rates them once the
   job is completed.
2. **Worker** registers, uploads KYC documents (government ID required), and cannot
   receive job requests until an admin verifies them. They see job requests appear
   **live**, update job status (accepted → in progress → completed), and see their
   trust score update the instant a new rating comes in.
3. **Admin** sees a live-updating KYC review queue and platform stats dashboard,
   approves/rejects KYC submissions (worker is notified instantly), and manages
   (activates/deactivates) user accounts.

## What's real-time (Socket.io), not just REST

- Live chat with delivery + typing indicators + online presence
- New job request pushed to worker instantly
- Job status changes pushed to the customer instantly
- KYC decisions pushed to the worker instantly
- New ratings pushed to the worker (trust score updates live on their dashboard)
- Toast notifications + a live notification feed for every event above

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # edit MONGO_URI / JWT_SECRET as needed
npm run seed               # creates admin@trustchain.local / ChangeMe123!
npm run dev                # starts on http://localhost:5000
```

Requires a running MongoDB instance (local `mongod` or a MongoDB Atlas URI in `.env`).

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env      # points to the backend API + socket URL
npm start                  # starts on http://localhost:3000
```

### 3. Try it out

1. Log in as admin (`admin@trustchain.local` / `ChangeMe123!`) — change the password later.
2. Register a **worker** account, go to "Verification (KYC)" and upload a document.
3. Back in the admin tab, the KYC queue updates live — approve it.
4. The worker's dashboard updates live to "Verified" with no refresh.
5. Register a **customer** account, find the worker, request a job, and chat live.

## Notes on going to production

- Set a strong `JWT_SECRET` and restrict `CLIENT_URL`/CORS to your real domain.
- Swap local disk storage (`multer`) for S3/Cloud storage for KYC documents.
- Add rate limiting (e.g. `express-rate-limit`) on auth and KYC upload routes.
- Add HTTPS/WSS in front of Express + Socket.io (e.g. via a reverse proxy).
- Consider Redis-backed Socket.io adapter if you scale beyond a single server instance.
