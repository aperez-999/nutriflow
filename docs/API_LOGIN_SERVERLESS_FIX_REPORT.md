# API /api/auth/login Serverless Hang — Investigation & Fix Report

## Symptoms

- `/api/auth/login` loads forever on Vercel
- POST requests from frontend return `Promise { pending }`, no response body
- Backend uses Express wrapped with serverless-http

---

## 1. Serverless entry point: `api/index.js`

**Checked:**
- Exports a handler (no longer `export default serverless(app)` only)
- Imports Express app from `../backend/app.js`

**Issue:** The handler did not await MongoDB connection before passing the request to Express. The first (and any) request could hit the login route before `connectDB()` finished, so Mongoose operations could hang waiting for a connection that was still in progress or never completed.

**Change:** The default export is now an async function that:
1. Awaits `connectDB()` (cached, so fast after first request)
2. Then invokes `serverless(app)` with the same `(req, res)`

---

## 2. `backend/app.js`

**Checked:**
- Express app is exported with `export default app` ✓
- No `app.listen()` call ✓
- Middleware: `express.json()`, `express.urlencoded()` are used ✓
- Routes: `app.use('/api/auth', authRoutes)` ✓

**MongoDB:** `connectDB()` was called at top level without `await`. In serverless, the module loads once; the promise was not awaited, so the first request could run before the connection was ready.

**Change:** No structural change to app.js. Connection is now awaited in the serverless handler (`api/index.js`) before each invocation. Optional debug log: `"Auth routes mounted"` when not in production.

---

## 3. MongoDB connection: `backend/config/db.js`

**Issues:**
- **No cached connection:** Every module load (e.g. cold start) called `mongoose.connect()` again. No reuse of an existing connection.
- **Blocking / hang risk:** No `serverSelectionTimeoutMS`; a bad or slow network could leave the request hanging.
- **process.exit(1) on failure:** In serverless, this kills the function process; subsequent requests in the same container can misbehave.
- **dotenv:** `dotenv.config()` uses `process.cwd()`. On Vercel the cwd may be the repo root, so `backend/.env` was not loaded and `MONGO_URI` could be undefined, leading to a hang or odd behavior.

**Changes:**
- **Cached connection:** `connPromise` is stored; subsequent `connectDB()` calls return the same promise. If `mongoose.connection.readyState === 1`, return immediately.
- **Timeout:** `serverSelectionTimeoutMS: 10000` so connect fails in a bounded time instead of hanging.
- **No process.exit in serverless:** `process.exit(1)` is only used when not in Vercel/Lambda (checks `process.env.VERCEL` and `process.env.AWS_LAMBDA_FUNCTION_NAME`).
- **Explicit .env path:** `dotenv.config({ path: path.resolve(__dirname, '../.env') })` so `backend/.env` is loaded regardless of cwd.
- **Missing MONGO_URI:** If `MONGO_URI` is not set, throw an error instead of calling `mongoose.connect(undefined)`.

---

## 4. Auth route: `backend/routes/authRoutes.js`

**Checked:**
- `router.post('/login', [validators], login)` exists ✓
- Mount in app: `app.use('/api/auth', authRoutes)` ✓

**Changes:** Added `return` before `res.json()` / `res.status(...).json()` in the forgot-password and reset-password handlers so the handler always returns after sending a response.

---

## 5. Login controller: `backend/controllers/authController.js`

**Checked:**
- Handler is async ✓
- Success path: `res.status(200).json(...)` ✓
- Error paths: `return res.status(401).json(...)` and catch block ✓

**Issues:**
- Success path did not use `return` before `res.status(201).json(...)` (register) and `res.status(200).json(...)` (login). Same for the catch blocks. Code after `res.json()` could still run; adding `return` makes behavior explicit and avoids accidental fall-through.

**Changes:**
- `return res.status(201).json(...)` in register success
- `return res.status(500).json(...)` in register catch
- `return res.status(200).json(...)` in login success
- `return res.status(500).json(...)` in login catch
- Optional debug log: `"Login route hit"` when not in production

---

## 6. Async error handling

- Login and register use try/catch and send a response in both success and catch.
- Forgot-password and reset-password handlers now use `return` before every `res.json()` / `res.status().json()` so no path exits without returning after sending.

---

## 7. Middleware

- **errorHandler:** Sends `res.json()` and does not need to call `next()` (it’s the last error handler). No change.
- **express-validator:** Validation runs before login; the controller does not currently check `validationResult(req)`. That can allow invalid bodies through but does not cause a hang. Not changed in this fix.

---

## 8. Debug logs

- In `app.js`: `if (process.env.NODE_ENV !== 'production') console.log('Auth routes mounted');`
- In login controller: `if (process.env.NODE_ENV !== 'production') console.log('Login route hit');`

These can be removed later if desired.

---

## 9. Serverless compatibility

- **express.json():** Used in app.js ✓
- **Blocking:** Connection is now cached and awaited in the handler; `serverSelectionTimeoutMS` limits connect time.
- **Unhandled promises:** All response paths in the touched handlers now return after sending; the serverless wrapper receives the response.

---

## 10. Summary: files inspected and changes

| File | Finding | Fix |
|------|--------|-----|
| **api/index.js** | Handler did not wait for DB before passing to Express | Default export now async: `await connectDB()` then call `serverless(app)(req, res)` |
| **backend/config/db.js** | No cache, no timeout, process.exit in serverless, dotenv cwd, no MONGO_URI check | Cached connection, serverSelectionTimeoutMS, no exit on Vercel/Lambda, explicit .env path, throw if no MONGO_URI |
| **backend/app.js** | connectDB() not awaited at top level | No change; connection awaited in api/index.js. Added optional debug log. |
| **backend/controllers/authController.js** | Missing `return` before some res.json() calls | Added `return` before all res.json/res.status().json in register and login. Optional debug log in login. |
| **backend/routes/authRoutes.js** | Missing `return` in forgot-password and reset-password handlers | Added `return` before res.json() and res.status(500).json() |

**Root cause of the hang:** The serverless handler did not await the MongoDB connection before handling the request, and `db.js` did not load `backend/.env` from the correct path on Vercel. So either the connection was still pending when login ran, or `MONGO_URI` was undefined and connect/operations hung or failed in a way that never sent a response. Caching the connection, awaiting it in the handler, loading `.env` from the backend directory, and adding a connection timeout and explicit returns ensure requests complete and return a response.
