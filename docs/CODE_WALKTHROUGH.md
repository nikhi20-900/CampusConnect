# Code Walkthrough — explain it in your viva

## 1. Big picture
CampusConnect has three main parts:
1. **React client** renders pages and manages user interactions.
2. **Express/Node API** validates requests and runs application logic.
3. **MongoDB** stores users, events, clubs, resources, and relationships.

The frontend sends HTTP requests as JSON. Express routes process them, Mongoose talks to MongoDB, and the server sends JSON back to React.

## 2. Frontend files
- `client/src/main.jsx`: React entry point. It mounts `<App />` into the HTML root.
- `client/src/App.jsx`: main application state, page navigation, search/filter logic, and UI composition.
- `client/src/components/Sidebar.jsx`: reusable navigation component; receives props like `active` and `onNavigate`.
- `client/src/components/EventCard.jsx`: reusable event card. Props carry event data and callback functions.
- `client/src/components/Toast.jsx`: temporary feedback message, cleaned up with `useEffect`.
- `client/src/lib/api.js`: isolates HTTP requests from UI components. It attaches the JWT when present, handles JSON errors, and provides a local demo fallback.

### React concepts to describe
- **Component:** a reusable UI function such as `EventCard`.
- **Props:** values/callbacks passed from parent to child.
- **State:** `useState` stores values that change, such as selected page or search text.
- **Effect:** `useEffect` loads initial data and updates the document theme.
- **Derived data:** `filter()` and `useMemo()` produce event lists based on state.
- **Event handler:** a function called when a button or input changes.
- **Conditional rendering:** React shows the page selected by `active`.

## 3. Backend files
- `server/src/index.js`: creates the Express app, installs CORS and JSON middleware, mounts routes, connects MongoDB, seeds demo data, and handles errors.
- `server/src/models/*.js`: Mongoose schemas define document fields and constraints.
- `server/src/routes/auth.js`: validates credentials, hashes passwords with bcrypt, signs JWTs, and returns a safe public user object.
- `server/src/routes/events.js`: reads event data and handles registrations.
- `server/src/routes/clubs.js`: lists clubs and toggles membership.
- `server/src/routes/resources.js`: searches resources and increments download counters.
- `server/src/middleware/auth.js`: checks the `Authorization: Bearer ...` header and verifies the JWT before protected actions.

## 4. Example request lifecycle: event registration
1. User clicks Register in an event modal.
2. React calls `registerForEvent(eventId)` in `lib/api.js`.
3. The API client sends `POST /api/events/:id/register` with the JWT.
4. `requireAuth` verifies the token and puts the user ID on `req.user`.
5. The route loads the user and event from MongoDB.
6. It checks whether the user is already registered.
7. It adds/removes the event ID from the user's `registrations`, updates `attendees`, and saves both documents.
8. Express returns JSON; React refreshes the event list and shows a toast.

## 5. Authentication and security
- `bcrypt.hash(password, 12)` stores a hash instead of a plaintext password.
- `bcrypt.compare()` checks the supplied password against the hash.
- JWT contains a subject/user ID, email, and role, with a two-hour expiry.
- `requireAuth` rejects missing or invalid tokens with HTTP 401.
- CORS limits browser requests to the configured client origin.
- JSON body size is limited to 1 MB.
- Never commit `.env`; use a long random JWT secret.
- For production, add rate limiting, email verification, stronger schema validation, secure token storage, CSRF strategy where applicable, and careful authorization rules.

## 6. Data model
- **User:** name, email, passwordHash, role, joinedClubs, registrations.
- **Event:** title, category, date/time, location, organizer, attendee count, capacity.
- **Club:** name, category, member count, description.
- **Resource:** title, subject, type, author, download count, URL.

MongoDB stores each record as a document. Mongoose schemas add validation and define field types.

## 7. Important implementation caveat
The UI has a local demo mode for presentation when the backend is not running. It stores demo interaction state in the browser. A real deployment should rely on the backend for authoritative registrations and club memberships, and should not silently downgrade authenticated actions to unauthenticated storage.
