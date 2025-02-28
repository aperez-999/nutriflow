import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  useToast,
  SimpleGrid,
  useColorModeValue,
  Progress,
  Grid,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  useDisclosure,
  Flex,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { getDiets, addDiet, getWorkouts, addWorkout, deleteDiet, deleteWorkout, updateDiet, updateWorkout } from '../services/api';
import DietSection from '../components/Dashboard/DietSection';
import WorkoutSection from '../components/Dashboard/WorkoutSection';

const MotionBox = motion(Box);

function Dashboard() {
  const { user } = useContext(AuthContext);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.600', 'gray.300');

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
        console.error('Error fetching data:', error);
        setDiets([]);
        setWorkouts([]);
        toast({
          title: 'Error fetching data',
          status: 'error',
          duration: 3000,
        });
      }
    };
    fetchData();
  }, []);

  // Calculate progress
  const calculateDailyCalories = () => {
    const today = new Date().toISOString().split('T')[0];
    const todaysDiets = diets.filter(diet => {
      const dietDate = new Date(diet.date).toISOString().split('T')[0];
      return dietDate === today;
    });
    return todaysDiets.reduce((sum, diet) => sum + (Number(diet.calories) || 0), 0);
  };

  const calculateWeeklyWorkouts = () => {
    if (!Array.isArray(workouts)) {
      return 0;
    }
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return workouts.filter(workout => new Date(workout.date) >= weekAgo).length;
  };

  // CRUD operations for Diet
  const handleAddDiet = async (dietData) => {
    try {
      const newDiet = await addDiet(dietData);
      setDiets([...diets, newDiet]);
      toast({
        title: 'Diet added successfully',
        status: 'success',
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: 'Error adding diet',
        description: error.message,
        status: 'error',
        duration: 2000,
      });
    }
  };

  const handleUpdateDiet = async (id, dietData) => {
    try {
      const updatedDiet = await updateDiet(id, dietData);
      setDiets(diets.map(diet => diet._id === id ? updatedDiet : diet));
      toast({
        title: 'Diet updated successfully',
        status: 'success',
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: 'Error updating diet',
        description: error.message,
        status: 'error',
        duration: 2000,
      });
    }
  };

  const handleDeleteDiet = async (id) => {
    try {
      await deleteDiet(id);
      setDiets(diets.filter(diet => diet._id !== id));
      toast({
        title: 'Diet record deleted',
        status: 'success',
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: 'Error deleting diet record',
        status: 'error',
        duration: 2000,
      });
    }
  };

  // CRUD operations for Workout
  const handleAddWorkout = async (workoutData) => {
    try {
      const newWorkout = await addWorkout(workoutData);
      setWorkouts([...workouts, newWorkout]);
      toast({
        title: 'Workout added successfully',
        status: 'success',
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: 'Error adding workout',
        description: error.message,
        status: 'error',
        duration: 2000,
      });
    }
  };

  const handleUpdateWorkout = async (id, workoutData) => {
    try {
      const updatedWorkout = await updateWorkout(id, workoutData);
      setWorkouts(workouts.map(workout => workout._id === id ? updatedWorkout : workout));
      toast({
        title: 'Workout updated successfully',
        status: 'success',
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: 'Error updating workout',
        description: error.message,
        status: 'error',
        duration: 2000,
      });
    }
  };

  const handleDeleteWorkout = async (id) => {
    try {
      await deleteWorkout(id);
      setWorkouts(workouts.filter(workout => workout._id !== id));
      toast({
        title: 'Workout deleted',
        status: 'success',
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: 'Error deleting workout',
        status: 'error',
        duration: 2000,
      });
    }
  };

  // Goals Modal
  const handleSaveGoals = () => {
    setGoals(editingGoals);
    onClose();
    toast({
      title: 'Goals updated successfully',
      status: 'success',
      duration: 2000,
    });
  };

  // Progress calculations
  const calorieProgress = Math.min((calculateDailyCalories() / goals.dailyCalories) * 100, 100);
  const workoutProgress = Math.min((calculateWeeklyWorkouts() / goals.weeklyWorkouts) * 100, 100);

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Goals Section */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
            <Box p={6} bg={bgColor} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
              <Flex justify="space-between" align="center" mb={4}>
                <Heading size="md" color={textColor}>Daily Calorie Goal</Heading>
                <Button size="sm" colorScheme="teal" onClick={onOpen}>
                  Edit Goals
                </Button>
              </Flex>
              <Progress 
                value={calorieProgress} 
                colorScheme={calorieProgress > 100 ? "red" : "teal"} 
                mb={2} 
                borderRadius="full" 
              />
              <Text color={subTextColor}>
                {calculateDailyCalories()} / {goals.dailyCalories} calories
              </Text>
            </Box>
            <Box p={6} bg={bgColor} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
              <Heading size="md" mb={4} color={textColor}>Weekly Workout Goal</Heading>
              <Progress 
                value={workoutProgress} 
                colorScheme="blue" 
                mb={2} 
                borderRadius="full" 
              />
              <Text color={subTextColor}>
                {calculateWeeklyWorkouts()} / {goals.weeklyWorkouts} workouts
              </Text>
            </Box>
          </Grid>
        </MotionBox>

        {/* Diet and Workout Sections */}
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

        {/* Goals Edit Modal */}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent bg={bgColor}>
            <ModalHeader color={textColor}>Edit Goals</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <FormControl>
                <FormLabel color={textColor}>Daily Calorie Goal</FormLabel>
                <Input
                  type="number"
                  value={editingGoals.dailyCalories}
                  onChange={(e) => setEditingGoals({
                    ...editingGoals,
                    dailyCalories: Number(e.target.value)
                  })}
                />
              </FormControl>

              <FormControl mt={4}>
                <FormLabel color={textColor}>Daily Protein Goal (g)</FormLabel>
                <Input
                  type="number"
                  value={editingGoals.dailyProtein}
                  onChange={(e) => setEditingGoals({
                    ...editingGoals,
                    dailyProtein: Number(e.target.value)
                  })}
                />
              </FormControl>

              <FormControl mt={4}>
                <FormLabel color={textColor}>Weekly Workout Goal</FormLabel>
                <Input
                  type="number"
                  value={editingGoals.weeklyWorkouts}
                  onChange={(e) => setEditingGoals({
                    ...editingGoals,
                    weeklyWorkouts: Number(e.target.value)
                  })}
                />
              </FormControl>

              <Button colorScheme="teal" mr={3} mt={6} onClick={handleSaveGoals}>
                Save Goals
              </Button>
              <Button onClick={onClose} mt={6}>Cancel</Button>
            </ModalBody>
          </ModalContent>
        </Modal>
      </VStack>
    </Container>
  );
}

export default Dashboard;