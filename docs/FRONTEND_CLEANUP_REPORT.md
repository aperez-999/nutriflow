# Frontend Cleanup Report — NutriFlow v2

## Summary

A focused frontend cleanup and structure pass was performed to make the app easier to maintain before implementing additional AI agents. No redesign, no backend changes, and no new product features were introduced.

---

## 1. Files removed

| File | Reason |
|------|--------|
| `frontend/src/pages/Login.jsx` | Empty file (only whitespace). Routing uses `components/Auth/Login.jsx` for `/login`. Removing it avoids confusion and duplicate naming. |

---

## 2. Files archived

Unused components were moved to **`frontend/src/components/legacy/`** (not deleted) and a README was added so they are clearly reference-only.

| From | To | Reason |
|------|-----|--------|
| `frontend/src/components/Layout/Footer.jsx` | `frontend/src/components/legacy/Layout/Footer.jsx` | Not imported anywhere. The app uses `components/Footer.jsx`. Old "Caloric Tracker App" branding. |
| `frontend/src/components/Layout/Header.jsx` | `frontend/src/components/legacy/Layout/Header.jsx` | Not imported anywhere. The app uses `components/Navbar.jsx`. Import path inside the file was updated to `../../../context/AuthContext` so the archived file still resolves if opened. |

**New file:** `frontend/src/components/legacy/README.md` — explains that contents are unused, that the app uses Footer.jsx and Navbar.jsx, and that the folder is for reference only.

---

## 3. Files refactored

### FitnessHub page split into section components

**`frontend/src/pages/FitnessHub.jsx`** was reduced in size and responsibility by extracting four presentational sections. Behavior and UI are unchanged.

| New component | Responsibility |
|---------------|----------------|
| `frontend/src/components/FitnessHub/FitnessHubChatSection.jsx` | AI Coach label + `AIFitnessChat`. Props: `userWorkouts`, `userDiets`, `toast`. |
| `frontend/src/components/FitnessHub/FitnessHubInsightsSection.jsx` | Wrapper that renders `AIInsightsSection`. Props: `insights`. |
| `frontend/src/components/FitnessHub/FitnessHubPlansSection.jsx` | "Your AI Generated Plans" card: loading state, plan list, empty state, Get AI Recommendations button. Props: `sectionRef`, `recommendationsLoading`, `aiWorkouts`, `aiGeneratedAt`, `onViewDetails`, `onGetRecommendations`. |
| `frontend/src/components/FitnessHub/FitnessHubDiscoverySection.jsx` | "AI-Powered Workout Discovery" card: filters (muscle, equipment, difficulty), filtered exercise list, feature grid. Props: filter state/setters and `filteredExercises`. |

**`frontend/src/pages/FitnessHub.jsx`** now:
- Keeps all state (workouts, diets, AI plans, discovery filters, modal)
- Keeps event listeners for `ai-recommendations-updated` / `ai-recommendations-loading`
- Renders hero, the four section components, and `ExerciseDetailsModal`
- Uses the shared API error helper for data loading (see below)

### Shared API error helper

**New file:** `frontend/src/utils/apiErrorHandler.js`

- **Purpose:** Turn API/network errors into a consistent, toast-friendly message.
- **Signature:** `handleApiError(error, action, toast)` — `action` is a short string (e.g. `'loading workouts'`). If `toast` (Chakra `useToast()` result) is provided, a toast is shown; otherwise the error is logged to the console.
- **Used in:**
  - **FitnessHub:** Data loading (`getWorkouts` / `getDiets`) — catch blocks now call `handleApiError(err, 'loading workouts' | 'loading diets' | 'loading Fitness Hub data', toast)`.
  - **AIFitnessChat:** Load chat history (catch), save chat history (`.catch`), clear chat history (catch). Optional `toast` prop is passed from FitnessHub so errors can be shown when the chat is used on that page.

**Note:** Dashboard continues to use `handleApiError(error, toast, action)` from `components/Dashboard/utils/dashboardUtils.js`. The new shared util uses `(error, action, toast)` and is used only in FitnessHub and AIFitnessChat.

---

## 4. Why these changes were made

- **Legacy files:** Removing or archiving unused components (Layout/Footer, Layout/Header, empty Login page) reduces noise and prevents accidental use of old branding or duplicate entry points.
- **FitnessHub split:** Smaller, named sections make the page easier to read and change (e.g. plans vs. discovery) without changing behavior.
- **API error helper:** Replacing silent catch blocks with a single helper gives users consistent feedback when requests fail (FitnessHub data load, chat history load/save/clear) and keeps error handling in one place.

---

## 5. Verification summary

- **Imports:** No remaining imports of `Layout/Footer` or `Layout/Header`. Routes still use `Auth/Login`, `Auth/Register`, etc. New section components and `apiErrorHandler` are imported correctly.
- **Routes:** `frontend/src/routes/index.jsx` unchanged; `/login` still renders `Login` from `components/Auth/Login`. No references to `pages/Login.jsx`.
- **Dashboard / FitnessHub / Auth:** Flow is unchanged; FitnessHub still composes the same sections and passes the same props and callbacks; modal and refs behave as before.
- **Lint:** Lint run on modified files reported no errors.

---

## 6. Remaining follow-ups

- **Optional:** Unify error handler signature across the app (e.g. one shared `handleApiError(error, action, toast)` and migrate Dashboard to use it from `utils/apiErrorHandler.js`) so there is a single convention.
- **Optional:** After a period of confidence, delete `frontend/src/components/legacy/` if the archived Layout components are no longer needed for reference.
- **Styling:** No broad styling pass was done; only structural and error-handling changes. A future pass could align card radius/shadow/spacing and button hierarchy on Auth and Contact if desired.
