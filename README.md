# NutriFlow - Fitness & Nutrition Tracking App

A comprehensive fitness and nutrition tracking application built with React, Node.js, and MongoDB. Track your daily meals, workouts, and progress towards your health goals.

## Features

### **AI-Powered Features**
- Personalized workout recommendations based on fitness level and goals
- AI Fitness Coach for real-time guidance and form tips
- Smart workout plan generation
- Progress analysis and adaptive recommendations
- Natural language interaction for fitness queries

### **Nutrition Tracking**
- Log daily meals with detailed nutritional information
- Search and add foods using USDA Food Database API
- Track calories, protein, carbs, and fats
- Daily nutrition summaries and progress visualization
- Meal type categorization (Breakfast, Lunch, Dinner, Snack)

### **Workout Management**
- Record different types of workouts (Cardio, Strength, Flexibility, Sports)
- Search and add exercises using API Ninjas Exercise Database
- Track workout duration, intensity, and calories burned
- Weekly workout goal tracking
- Progress visualization
- Equipment recommendations and exercise instructions

### **Dashboard & Analytics**
- Real-time progress tracking
- Daily calorie and weekly workout goals
- Visual progress bars and statistics
- Date-based navigation for historical data

### **User Authentication**
- Secure user registration and login
- Password reset functionality
- JWT-based authentication
- Protected routes and data

## Architecture

- **Frontend**: React + Vite with Chakra UI
- **Backend**: Node.js with Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT tokens
- **External APIs**: 
  - USDA Food Database (nutrition data)
  - API Ninjas Exercise Database (exercise data)
  - Groq/Ollama (AI features)
- **Deployment**: Vercel (Frontend) + Render/Heroku (Backend)

## 📁 Project Structure

```
nutriflow-app/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── Auth/       # Authentication components
│   │   │   ├── Dashboard/  # Dashboard sections
│   │   │   │   ├── DietSection/    # Diet tracking components
│   │   │   │   └── WorkoutSection/ # Workout tracking components
│   │   │   ├── Diet/       # Diet-related components
│   │   │   └── Workout/    # Workout-related components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context providers
│   │   ├── services/       # API service functions
│   │   └── theme/          # UI theme configuration
│   └── public/             # Static assets
├── backend/                 # Node.js backend server
│   ├── controllers/        # Route controllers
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   └── config/           # Database configuration
└── api/                   # Vercel serverless functions
    ├── auth/             # Authentication endpoints
    ├── diets/           # Diet management endpoints
    ├── workouts/        # Workout management endpoints
    ├── food/           # Food search endpoints
    ├── exercise/       # Exercise search endpoints
    └── contact/        # Contact form endpoint
```

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Chakra UI** - Component library
- **Framer Motion** - Animations
- **React Router** - Client-side routing
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Nodemailer** - Email functionality

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account
- API keys for:
  - USDA Food Database
  - API Ninjas Exercise Database
  - Groq (production) or Ollama (development)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd nutriflow-app
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd ../backend && npm install
```

3. **Environment Setup**

Create `.env` files in the backend directory:
```bash
# backend/.env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
EMAIL_USERNAME=your_gmail_username
EMAIL_PASSWORD=your_gmail_app_password
NODE_ENV=development

# API Keys
USDA_API_KEY=your_usda_api_key
NINJA_API_KEY=your_api_ninjas_key

# AI Configuration
# Production
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama3-8b-8192

# Local Development
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3:8b-instruct
```

Create `.env.local` in the frontend directory:
```bash
# frontend/.env.local
VITE_API_URL=http://localhost:3000
```

### API Setup

1. **USDA Food Database API**
   - Sign up at [USDA Food Data Central](https://fdc.nal.usda.gov/api-key-signup.html)
   - Get your API key
   - Add to `.env` as `USDA_API_KEY`

2. **API Ninjas Exercise Database**
   - Sign up at [API Ninjas](https://api-ninjas.com/)
   - Get your API key
   - Add to `.env` as `NINJA_API_KEY`

### AI Development Setup

For local development, you'll need:
1. [Ollama](https://ollama.ai/) installed locally
2. Llama model pulled: `ollama pull llama3:8b-instruct`

For production:
1. Groq API key from [Groq Cloud](https://groq.com)
2. Set GROQ_API_KEY in your production environment

4. **Start Development Servers**

```bash
# Start backend server (from backend directory)
cd backend
npm run dev

# Start frontend dev server (from frontend directory)
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password

### Diet Management
- `GET /api/diets` - Get user's diet records
- `POST /api/diets` - Add new diet record
- `PUT /api/diets/:id` - Update diet record
- `DELETE /api/diets/:id` - Delete diet record

### Workout Management
- `GET /api/workouts` - Get user's workout records
- `POST /api/workouts` - Add new workout record
- `PUT /api/workouts/:id` - Update workout record
- `DELETE /api/workouts/:id` - Delete workout record

### Food Search
- `GET /api/food/search?query=apple` - Search USDA food database

### Exercise Search
- `GET /api/exercise/search?query=squat` - Search exercise database

### Contact
- `POST /api/contact` - Submit contact form

## Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set build command: `cd frontend && npm run build`
3. Set output directory: `frontend/dist`
4. Configure environment variables in Vercel dashboard

### Backend (Render/Heroku)
1. Deploy to Render or Heroku
2. Set environment variables in deployment platform
3. Configure MongoDB Atlas connection

## 🔧 Development

### Available Scripts

**Frontend:**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

**Backend:**
```bash
npm start            # Start production server
npm run dev          # Start development server with nodemon
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request