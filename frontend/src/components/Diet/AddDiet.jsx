import React, { useState } from 'react';
import { addDiet } from '../../services/api';
import { Box, Button, Input, VStack, Heading } from '@chakra-ui/react';

const AddDiet = () => {
  const [formData, setFormData] = useState({ date: '', calories: '', protein: '', carbs: '', fat: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDiet(formData);
      // Optionally, you can add a success message or redirect
    } catch (error) {
      console.error('Error adding diet:', error);
    }
  };

  return (
    <Box p={4}>
      <VStack spacing={4}>
        <Heading>Add Diet</Heading>
        <Input
          placeholder="Date"
          name="date"
          value={formData.date}
          onChange={handleChange}
        />
        <Input
          placeholder="Calories"
          name="calories"
          value={formData.calories}
          onChange={handleChange}
        />
        <Input
          placeholder="Protein"
          name="protein"
          value={formData.protein}
          onChange={handleChange}
        />
        <Input
          placeholder="Carbs"
          name="carbs"
          value={formData.carbs}
          onChange={handleChange}
        />
        <Input
          placeholder="Fat"
          name="fat"
          value={formData.fat}
          onChange={handleChange}
        />
        <Button onClick={handleSubmit}>Add Diet</Button>
      </VStack>
    </Box>
  );
};

export default AddDiet;