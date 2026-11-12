# CampusConnect

CampusConnect is a full-stack campus community portal for finding student events, joining clubs, and sharing study resources. It was built as a full-stack development course project using the MERN stack.

## Features

- Browse, search, and filter campus events.
- Register for or cancel attendance at events.
- Browse clubs and join or leave a community.
- Search and view shared study resources.
- Sign up and sign in with password hashing and JWT-based authentication.
- Protect event and club creation with admin permissions; signed-in students and admins can share resources.
- Explore sample content in frontend demo mode when the API is unavailable.

## Screenshots

Screenshots of the dashboard, events, and clubs/resources will be added here.

## Tech stack

| Part | Technology |
| --- | --- |
| Frontend | React, Vite, JavaScript, CSS |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| Authentication | bcryptjs, JSON Web Tokens (JWT) |
| Icons | Lucide React |

## How it works

```text
React UI → API helper → Express route and middleware → Mongoose → MongoDB
    ↑                                                           ↓
    └──────────────────── JSON response ────────────────────────┘
```

The React app loads events, clubs, and resources from the Express API. The API validates requests, checks authentication and roles where needed, and uses Mongoose models to access MongoDB. It then returns JSON for the frontend to render. Sample records are inserted into each collection when that collection is empty.

## Run locally

### Requirements

- Node.js 18 or newer and npm
- MongoDB running locally, or a MongoDB Atlas connection string

### 1. Start MongoDB

Start your local MongoDB service, or prepare a MongoDB Atlas URI for the server configuration.

### 2. Configure and start the API

In a terminal:

```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env` and set a long, private `JWT_SECRET`. Set `MONGODB_URI` if you are using MongoDB Atlas. Then start the API:

```bash
npm run dev
```

By default, the API uses `http://localhost:5000` and MongoDB at `mongodb://127.0.0.1:27017/campusconnect`. Check that it is running at `http://localhost:5000/api/health`.

### 3. Configure and start the frontend

In a second terminal:

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`. The default `client/.env.example` points the app to `http://localhost:5000/api`.

If you change either port, update `VITE_API_URL` in `client/.env` and include the frontend origin in `CLIENT_ORIGIN` in `server/.env`, then restart the affected development server.

## Authentication and roles

- New accounts are assigned the `student` role.
- Students and admins can create study resources.
- Only admins can create events or clubs.
- Event registration and joining clubs require a signed-in account.
- Passwords are hashed before they are stored. JWTs expire after two hours.

Admin roles are assigned outside the public sign-up flow. Do not put credentials or real student data in this repository.

## API overview

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/health` | Public | API and database status |
| `POST` | `/auth/register` | Public | Create a student account |
| `POST` | `/auth/login` | Public | Sign in and receive a JWT |
| `GET` | `/events` | Public | List events |
| `GET` | `/events/:id` | Public | Get one event |
| `POST` | `/events/:id/register` | Signed in | Register or cancel registration |
| `POST` | `/events` | Admin | Create an event |
| `GET` | `/clubs` | Public | List clubs |
| `POST` | `/clubs/:id/join` | Signed in | Join or leave a club |
| `POST` | `/clubs` | Admin | Create a club |
| `GET` | `/resources` | Public | List and search resources |
| `GET` | `/resources/:id` | Public | View a resource and increment its counter |
| `POST` | `/resources` | Student or admin | Share a study resource |

Protected requests send `Authorization: Bearer <token>`. More endpoint details and examples are in [`docs/API.md`](docs/API.md).

## Project layout

```text
client/
  src/App.jsx              Main React screens, state, and interactions
  src/lib/api.js           HTTP requests, auth token handling, demo fallback
  src/components/          Shared navigation, event cards, and toast UI
server/
  src/index.js             Express setup, CORS, MongoDB connection, API routes
  src/routes/              Authentication and feature endpoints
  src/middleware/auth.js   JWT verification and role checks
  src/models/              Mongoose schemas
  src/utils/seed.js        Sample events, clubs, and resources
docs/                      API notes and course presentation guides
```

## Demo mode

When the API cannot be reached and the browser has no signed-in token, the frontend can load sample data and keep demo interactions in that browser's local storage. Demo mode is for classroom demonstrations; MongoDB is the persistent source of truth when the API is connected.

## Course materials

- [`START_HERE.txt`](START_HERE.txt) — quick-start notes
- [`docs/CODE_WALKTHROUGH.md`](docs/CODE_WALKTHROUGH.md) — code walkthrough
- [`docs/VIVA_QUESTIONS.md`](docs/VIVA_QUESTIONS.md) — sample viva questions
- [`PRESENTATION.pptx`](PRESENTATION.pptx) — project presentation

## License

No license has been selected for this course project yet. Add a license before allowing others to reuse or distribute the code.
