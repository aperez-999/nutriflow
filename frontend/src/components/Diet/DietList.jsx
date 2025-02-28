import React, { useEffect, useState, useContext } from 'react';
import { getDiets } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { Box, VStack, Heading, Text } from '@chakra-ui/react';

const DietList = () => {
  const [diets, setDiets] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchDiets = async () => {
      try {
        const { data } = await getDiets(user.result._id);
        setDiets(data);
      } catch (error) {
        console.error('Error fetching diets:', error);
      }
    };

    fetchDiets();
  }, [user]);

  return (
    <Box p={4}>
      <VStack spacing={4}>
        <Heading>Diet List</Heading>
        {diets.map((diet) => (
          <Box key={diet._id} p={4} borderWidth={1} borderRadius="lg">
            <Text>Date: {diet.date}</Text>
            <Text>Calories: {diet.calories}</Text>
            <Text>Protein: {diet.protein}</Text>
            <Text>Carbs: {diet.carbs}</Text>
            <Text>Fat: {diet.fat}</Text>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default DietList;