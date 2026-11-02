# API

Every route is under `/api` and speaks JSON. Routes marked **(signed in)** need a session: the
website's cookie, or `Authorization: Bearer <token>` with the token that sign-in returns. A write
signed only by the cookie must also send `X-Requested-With: NutriFlow`. A `401` always means the
session is over (expired, or ended by a password change); sign in again.

## Accounts

| Route | |
| --- | --- |
| `POST /auth/register` | `{ username, email, password, invite? }`. Passwords need 8 characters. Sends a confirmation email when email is set up |
| `POST /auth/login` | `{ email, password }` → `{ user, token }` |
| `POST /auth/google` | `{ credential }` (a Google ID token). Signs in a known Google account, or links an account with the same Google-verified email. For a Google account with no account yet, answers `{ needsSignUp, signUp: { token, email, name } }` and makes nothing |
| `POST /auth/google/register` | `{ signUpToken, username, invite? }`: makes the account a Google sign-in asked for (the token lasts 15 minutes) |
| `POST /auth/logout` | Ends the session cookie |
| `POST /auth/forgot-password` | `{ email }`: emails a one-hour reset link. The answer is the same whether or not the email has an account |
| `PUT /auth/reset-password/:token` | `{ password }`. Signs out every session. `POST` works too |
| `POST /auth/verify-email/:token` | Confirms the email from the emailed link |

## The signed-in account (signed in)

| Route | |
| --- | --- |
| `GET /auth/me` | The account, so other devices pick up changes |
| `PUT /auth/me` | `{ username, email, preferences? }`. A new email has to be confirmed again |
| `PUT /auth/me/password` | `{ currentPassword, newPassword }` → `{ token }`. Every other session ends; this one continues with the new token. Accounts made with Google set their first password without `currentPassword` |
| `POST /auth/me/sessions/revoke` | Signs out every other session → `{ token }` for this one |
| `POST /auth/me/verify-email` | Sends the confirmation link again |
| `PUT /auth/me/goals` | `dailyCalories`, `dailyProtein`, `weeklyWorkouts`, and optionally `dailyCarbs`, `dailyFats` (grams; `null` clears), `fuelFollowsVerdict`, `pushCarbBoost`, `recoveryCarbCut`. Fields left out keep their values |
| `PUT /auth/me/body` | `heightCm`, `weightKg`, `birthYear`, `sex`, `goalKg`. Fields left out keep their values; `null` clears |
| `PUT /auth/me/about` | `goal`, `diet`, `injuries`, `note`: what the coach should know |
| `PUT /auth/me/meals` | `{ meals: [...] }`: the day's meal names, 1 to 6 |
| `GET` · `PUT` · `DELETE /auth/me/avatar` | The profile photo: JPEG or PNG, up to 200 KB, sent as base64 `{ image }` |
| `GET /auth/me/invites` | Your invite code and how many friends joined with it |
| `GET /auth/me/notes`, `DELETE /auth/me/notes/:id` | What the coach remembers about you |
| `GET /auth/me/export` | Everything stored for the account, as one JSON file |
| `DELETE /auth/me` | `{ password }` (or, without a password, the account's email): deletes the account and everything it owns |

## Logs (signed in)

| Route | |
| --- | --- |
| `GET` · `POST /diets`, `PUT` · `DELETE /diets/:id` | Meals: `foodName`, `mealType`, `calories`, `protein`, `carbs`, `fats`, and optionally `fiber`, `sugar` (g) and `sodium` (mg) |
| `GET` · `POST /workouts`, `PUT` · `DELETE /workouts/:id` | Workouts |
| `GET /checkins?limit=30`, `PUT /checkins/:dayKey` | Morning check-ins, one per `YYYY-MM-DD` |
| `GET /weights`, `PUT` · `DELETE /weights/:dayKey` | Weigh-ins, one per day |
| `GET /weights/energy?timeZone=...` | The weekly check-in: what you burn, worked out from four weeks of weigh-ins and full days of food, and a calorie target for your goal. Says what it still needs while it's learning |

## Food and exercises

| Route | |
| --- | --- |
| `GET /food/search?query=...` | USDA FoodData Central |
| `GET /food/barcode/:code` | A packaged food by its 8 to 14 digit barcode, from Open Food Facts or USDA branded foods, per 100 g and per serving. `404` when neither knows it |
| `POST /food/estimate` | (signed in) `{ description }` → the meal described in words, as foods with their numbers. Counts toward a daily allowance |
| `GET /exercise/search?query=...` | API Ninjas |
| `GET /exercises` | (signed in) The exercise library with muscle maps and cues. Filters: `muscleGroup`, `equipment`, `difficulty`, `q` |

Food and barcode results are cached for 30 days.

## Coach

| Route | |
| --- | --- |
| `POST /ai/chat` | `{ message, context?, history? }` → `{ content, suggestions, source }`. Uses your own log when signed in. 20 a minute, and a daily allowance |
| `GET /chat/conversations`, `PUT` · `DELETE /chat/conversations/:id` | Saved conversations (the newest 50 are kept) |
| `GET` · `POST` · `DELETE /chat/history` | The single saved conversation older clients use |
| `GET /plans`, `PUT` · `DELETE /plans/:id` | Saved training and meal plans (the newest 60 are kept) |

## Other

| Route | |
| --- | --- |
| `POST /contact` | The contact form, emailed to the site's address |
| `GET /health` | Which AI provider and model are active |

## Limits

Counted in MongoDB so they hold across serverless instances (`middleware/rateLimits.js`): 300
requests a minute per address overall, plus tighter limits on log in, sign-up, password reset,
photo changes, the contact form and the coach. Each account gets 30 coach messages and 15 meal
estimates a day.
