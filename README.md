# NutriFlow - Vercel Deployment

This is the NutriFlow fitness and nutrition tracking app, migrated from Render to Vercel for better performance and cost efficiency.

## Architecture

- **Frontend**: React + Vite (deployed as static site)
- **Backend**: Serverless functions in `/api` directory
- **Database**: MongoDB Atlas
- **Deployment**: Vercel

## Environment Variables

Set these in your Vercel dashboard:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USERNAME=your_gmail_username
EMAIL_PASSWORD=your_gmail_app_password
NODE_ENV=production
```

## Local Development

1. Install dependencies:
```bash
npm install
cd frontend && npm install
```

2. Set up environment variables:
   - Copy `backend/.env.example` to `backend/.env`
   - Copy `frontend/.env.local.example` to `frontend/.env.local`

3. Start development:
```bash
# Frontend only
cd frontend && npm run dev

# For API testing, you'll need to deploy to Vercel or use Vercel CLI
```

## Deployment

1. Connect your GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET/POST /api/diets` - Diet management
- `PUT/DELETE /api/diets/[id]` - Individual diet operations
- `GET/POST /api/workouts` - Workout management
- `PUT/DELETE /api/workouts/[id]` - Individual workout operations
- `POST /api/contact` - Contact form

## Migration Notes

- Converted from Express.js monolith to serverless functions
- Updated API base URLs to use Vercel domain
- Optimized database connections for serverless environment
- Added proper CORS handling for serverless functions