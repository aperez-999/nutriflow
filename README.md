# NutriFlow - Fitness & Nutrition Tracking App

A comprehensive fitness and nutrition tracking application built with React, Node.js, and MongoDB. Track your daily meals, workouts, and progress towards your health goals.

## Features

### **Nutrition Tracking**
- Log daily meals with detailed nutritional information
- Search and add foods with automatic nutrition data
- Track calories, protein, carbs, and fats
- Daily nutrition summaries and progress visualization
- Meal type categorization (Breakfast, Lunch, Dinner, Snack)

### **Workout Management**
- Record different types of workouts (Cardio, Strength, Flexibility, Sports)
- Track workout duration and calories burned
- Weekly workout goal tracking
- Progress visualization

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
- **Deployment**: Vercel (Frontend) + Render/Heroku (Backend)

## 📁 Project Structure

```
nutriflow-app/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── Auth/       # Authentication components
│   │   │   ├── Dashboard/  # Dashboard sections
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
```

Create `.env.local` in the frontend directory:
```bash
# frontend/.env.local
VITE_API_URL=http://localhost:3000
```

4. **Start Development Servers**

```bash
# Start backend server (from backend directory)
cd backend
npm start

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
- `GET /api/food/search?query=apple` - Search for food items

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