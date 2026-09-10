# AGENTS.md

## Project Overview
This project is **NutriFlow**, a full-stack AI-powered fitness and nutrition web app.

Core features include:
- user authentication
- workout tracking
- diet logging
- AI coach chat
- workout planner
- meal planner
- AI insights
- readiness score
- dashboard and fitness hub UI

## Tech Stack
- Frontend: React + Vite + Chakra UI
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- AI: Groq / Ollama
- Deployment: Vercel
- External APIs:
  - USDA food API
  - Ninja exercise API

## Architecture Rules
- Keep the Express backend canonical
- Preserve the existing API contract: `{ content, suggestions, source }`
- Reuse existing patterns before creating new ones
- Keep AI orchestration inside `backend/ai/`
- Keep routes, controllers, models, and middleware separated
- Avoid duplicate logic unless there is a strong reason

## Frontend Rules
- Reuse the existing design system and Chakra UI patterns
- Keep cards visually consistent:
  - rounded corners
  - subtle shadows
  - hover lift
  - spacing consistency
- Preserve responsiveness and avoid layout regressions
- Improve existing components before creating parallel UI patterns

## Backend Rules
- Do not break existing routes
- Keep controllers responsible for logic and routes responsible for wiring
- Use environment variables for all secrets
- Keep production-safe error handling
- Avoid introducing blocking behavior in serverless handlers
- Preserve backward compatibility whenever possible

## AI Rules
- Preserve orchestrator + agent registry structure
- Keep agents focused by responsibility
- Use formatters for readable frontend output
- Do not return raw JSON to chat unless explicitly required
- Prefer safe, human-readable responses
- Use verifier/sanitization where appropriate

## Safety Rules
- Do not expose secrets
- Do not commit `.env` files
- Do not remove working logic unless clearly unused and archived
- Prefer minimal, safe changes over broad rewrites
- If uncertain, report the risk clearly instead of guessing

## Change Strategy
When implementing changes:
1. inspect existing code first
2. reuse current architecture and patterns
3. make minimal safe edits
4. verify imports and affected flows
5. summarize changes clearly

## Response / Report Style
When finishing a task, report:
- files changed
- what was fixed or added
- risks / follow-ups
- whether behavior or API contracts changed

## Skill Usage
This repo may use reusable skills under `.codex/skills/`.

When a prompt references a skill like:
- `$ui-check`
- `$debug`
- `$feature-build`
- `$pre-ship`

follow that skill's instructions first, then apply the task-specific request.