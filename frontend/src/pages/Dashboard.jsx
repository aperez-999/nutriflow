import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  VStack,
  SimpleGrid,
  useToast,
  useDisclosure,
  useColorModeValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { getDiets, addDiet, getWorkouts, addWorkout, deleteDiet, deleteWorkout, updateDiet, updateWorkout } from '../services/api';
import DietSection from '../components/Dashboard/DietSection/index';
import WorkoutSection from '../components/Dashboard/WorkoutSection/index';
import { GoalsSection, GoalsModal } from '../components/Dashboard/components';
import {
  calculateDailyCalories,
  calculateWeeklyWorkouts,
  calculateProgress,
  handleApiError,
  handleApiSuccess,
  transformDietData,
  transformWorkoutData
} from '../components/Dashboard/utils/dashboardUtils';

const MotionBox = motion.div;

function Dashboard() {
  const { user } = useContext(AuthContext);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // State
  const [diets, setDiets] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [goals, setGoals] = useState({
    dailyCalories: 2000,
    dailyProtein: 150,
    weeklyWorkouts: 5
  });
  const [editingGoals, setEditingGoals] = useState({ ...goals });

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dietData, workoutData] = await Promise.all([
          getDiets(),
          getWorkouts()
        ]);
        setDiets(Array.isArray(dietData) ? dietData : []);
        setWorkouts(Array.isArray(workoutData) ? workoutData : []);
      } catch (error) {
        handleApiError(error, toast, 'fetching data');
        setDiets([]);
        setWorkouts([]);
      }
    };
    fetchData();
  }, []);

  // CRUD operations for Diet
  const handleAddDiet = async (dietData) => {
    try {
      const transformedData = transformDietData(dietData);
      const newDiet = await addDiet(transformedData);
      setDiets([...diets, newDiet]);
      handleApiSuccess(toast, 'Diet added successfully');
    } catch (error) {
      handleApiError(error, toast, 'adding diet');
    }
  };

  const handleUpdateDiet = async (id, dietData) => {
    try {
      const transformedData = transformDietData(dietData);
      const updatedDiet = await updateDiet(id, transformedData);
      setDiets(diets.map(diet => diet._id === id ? updatedDiet : diet));
      handleApiSuccess(toast, 'Diet updated successfully');
    } catch (error) {
      handleApiError(error, toast, 'updating diet');
    }
  };

  const handleDeleteDiet = async (id) => {
    try {
      await deleteDiet(id);
      setDiets(diets.filter(diet => diet._id !== id));
      handleApiSuccess(toast, 'Diet record deleted');
    } catch (error) {
      handleApiError(error, toast, 'deleting diet record');
    }
  };

  // CRUD operations for Workout
  const handleAddWorkout = async (workoutData) => {
    try {
      const transformedData = transformWorkoutData(workoutData);
      const newWorkout = await addWorkout(transformedData);
      setWorkouts([...workouts, newWorkout]);
      handleApiSuccess(toast, 'Workout added successfully');
    } catch (error) {
      handleApiError(error, toast, 'adding workout');
    }
  };

  const handleUpdateWorkout = async (id, workoutData) => {
    try {
      const transformedData = transformWorkoutData(workoutData);
      const updatedWorkout = await updateWorkout(id, transformedData);
      setWorkouts(workouts.map(workout => workout._id === id ? updatedWorkout : workout));
      handleApiSuccess(toast, 'Workout updated successfully');
    } catch (error) {
      handleApiError(error, toast, 'updating workout');
    }
  };

  const handleDeleteWorkout = async (id) => {
    try {
      await deleteWorkout(id);
      setWorkouts(workouts.filter(workout => workout._id !== id));
      handleApiSuccess(toast, 'Workout deleted');
    } catch (error) {
      handleApiError(error, toast, 'deleting workout');
    }
  };

  // Goals handling
  const handleSaveGoals = () => {
    setGoals(editingGoals);
    onClose();
    handleApiSuccess(toast, 'Goals updated successfully');
  };

  // Progress calculations
  const dailyCalories = calculateDailyCalories(diets);
  const weeklyWorkoutCount = calculateWeeklyWorkouts(workouts);
  const calorieProgress = calculateProgress(dailyCalories, goals.dailyCalories);
  const workoutProgress = calculateProgress(weeklyWorkoutCount, goals.weeklyWorkouts);

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <GoalsSection
          goals={goals}
          calorieProgress={calorieProgress}
          workoutProgress={workoutProgress}
          dailyCalories={dailyCalories}
          weeklyWorkouts={weeklyWorkoutCount}
          onEditGoals={onOpen}
        />

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
          <MotionBox
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <DietSection
              diets={diets}
              onAddDiet={handleAddDiet}
              onUpdateDiet={handleUpdateDiet}
              onDeleteDiet={handleDeleteDiet}
            />
          </MotionBox>
          <MotionBox
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <WorkoutSection
              workouts={workouts}
              onAddWorkout={handleAddWorkout}
              onUpdateWorkout={handleUpdateWorkout}
              onDeleteWorkout={handleDeleteWorkout}
            />
          </MotionBox>
        </SimpleGrid>

        <GoalsModal
          isOpen={isOpen}
          onClose={onClose}
          editingGoals={editingGoals}
          onEditingGoalsChange={setEditingGoals}
          onSave={handleSaveGoals}
        />
      </VStack>
    </Container>
  );
}

export default Dashboard;