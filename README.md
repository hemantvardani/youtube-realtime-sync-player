# Watch Party - Real-time YouTube Sync

A real-time synchronized YouTube video player where multiple users can watch the same video together with perfect playback sync across all devices.


### Prerequisites

- Node.js 22.12.0 

### Installation

1. Clone the repo.
  
3. Install dependencies:

   Backend:
   ```cd server
   npm install
   ```

   Frontend:
   ```cd frontend
   npm install
   ```

### Running Locally

1. Start the backend server:
   ```
   cd server
   npm run dev
   ```
   Server runs on `http://localhost:4000`

2. Start the frontend:
   ```cd frontend
   npm run dev
   ```
   Frontend runs on `http://localhost:3000`

3. Set env:
   
   Create `frontend/.env.local`:
   ```env
   NEXT_PUBLIC_BASE_API_URL=http://localhost:4000
   ```
  


 

## Tech Stack

- **Frontend**: Next.js, React, Redux Toolkit, TypeScript
- **Backend**: Node.js, Socket.io, TypeScript
- **Video Player**: YouTube IFrame API
- **Deployment**: Vercel (frontend), Railway (backend)


## 📝 Notes

- The application uses a single global session - all users watch the same video
- Synchronization works across multiple browser tabs and devices
- Network delays are automatically compensated using server timestamps

