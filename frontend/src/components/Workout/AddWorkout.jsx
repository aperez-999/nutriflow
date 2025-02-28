import React, { useState } from 'react';
import { addWorkout } from '../../services/api';
import { Box, Button, Input, VStack, Heading } from '@chakra-ui/react';

const AddWorkout = () => {
  const [formData, setFormData] = useState({ date: '', type: '', duration: '', caloriesBurned: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addWorkout(formData);
      // Optionally, you can add a success message or redirect
    } catch (error) {
      console.error('Error adding workout:', error);
    }
  };

  return (
    <Box p={4}>
      <VStack spacing={4}>
        <Heading>Add Workout</Heading>
        <Input
          placeholder="Date"
          name="date"
          value={formData.date}
          onChange={handleChange}
        />
        <Input
          placeholder="Type"
          name="type"
          value={formData.type}
          onChange={handleChange}
        />
        <Input
          placeholder="Duration"
          name="duration"
          value={formData.duration}
          onChange={handleChange}
        />
        <Input
          placeholder="Calories Burned"
          name="caloriesBurned"
          value={formData.caloriesBurned}
          onChange={handleChange}
        />
        <Button onClick={handleSubmit}>Add Workout</Button>
      </VStack>
    </Box>
  );
};

export default AddWorkout;