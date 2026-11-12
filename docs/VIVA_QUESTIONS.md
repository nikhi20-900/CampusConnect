# Viva preparation — CampusConnect

**1. What is CampusConnect?**  
A full-stack college community portal where students can discover campus events, join clubs, and browse shared study resources.

**2. What is the MERN stack?**  
MongoDB is the database, Express is the backend web framework, React is the UI library, and Node.js runs JavaScript on the server.

**3. What is a REST API?**  
A way for software clients and servers to communicate over HTTP using resource-based endpoints and methods such as GET and POST.

**4. What is the difference between GET and POST?**  
GET retrieves data. POST submits data or performs an action that changes server state.

**5. Why use React components?**  
Components split the interface into reusable, testable pieces such as navigation, event cards, and toast messages.

**6. What are props and state?**  
Props are inputs passed to a component. State is data managed by a component that can change and trigger a re-render.

**7. Why use MongoDB?**  
It stores flexible JSON-like documents and integrates naturally with JavaScript applications.

**8. What is Mongoose?**  
An ODM library that maps JavaScript objects to MongoDB documents and provides schemas and validation.

**9. Why hash passwords?**  
A password hash reduces exposure if the user table leaks. The original password should never be stored as plaintext.

**10. What is JWT?**  
A signed token that lets the server verify claims about an authenticated user without keeping a traditional server-side session for every request.

**11. What is middleware?**  
A function in the Express request-response pipeline. `requireAuth` checks the token before protected route handlers run.

**12. What is CORS?**  
A browser security mechanism controlling which origins may read responses from a server.

**13. What does HTTP 401 mean?**  
The request lacks valid authentication. HTTP 404 means the requested resource was not found; 409 indicates a conflict.

**14. How does event registration work?**  
The backend authenticates the request, checks the event and capacity, updates the user's registration list and event attendee count, then returns JSON.

**15. What is CRUD?**  
Create, Read, Update, Delete. The current project demonstrates create/read operations and toggle-style updates; full admin delete/edit screens can be added later.

**16. What are the limitations?**  
Demo data is illustrative; resource upload, real notifications, admin moderation, email verification, and production deployment are future improvements.

**17. Why is a frontend fallback included?**  
It allows the interface to be demonstrated without a live backend. The README explains that this is not a production security design.

**18. What would you improve next?**  
Add event creation for authorised organisers, file uploads, pagination, rate limiting, email reminders, automated tests, and deployment monitoring.
