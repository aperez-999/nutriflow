import React, { useEffect, useState, useContext } from 'react';
import { getWorkouts } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { Box, VStack, Heading, Text } from '@chakra-ui/react';

const WorkoutList = () => {
  const [workouts, setWorkouts] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const { data } = await getWorkouts(user.result._id);
        setWorkouts(data);
      } catch (error) {
        console.error('Error fetching workouts:', error);
      }
    };

    fetchWorkouts();
  }, [user]);

  return (
    <Box p={4}>
      <VStack spacing={4}>
        <Heading>Workout List</Heading>
        {workouts.map((workout) => (
          <Box key={workout._id} p={4} borderWidth={1} borderRadius="lg">
            <Text>Date: {workout.date}</Text>
            <Text>Type: {workout.type}</Text>
            <Text>Duration: {workout.duration} minutes</Text>
            <Text>Calories Burned: {workout.caloriesBurned}</Text>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default WorkoutList;