import React, { useState } from 'react';
import {
  VStack,
  Box,
  Heading,
  Text,
  SimpleGrid,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiPackage, FiCoffee } from 'react-icons/fi';
import { motion } from 'framer-motion';
import {
  DailySummaryCard,
  DietForm,
  DietCard,
} from './components';

const MotionBox = motion(Box);

const initialFormState = {
  date: new Date().toISOString().split('T')[0],
  mealType: '',
  foodName: '',
  calories: '',
  protein: '',
  carbs: '',
  fats: '',
  notes: ''
};

function DietSection({ diets, onAddDiet, onUpdateDiet, onDeleteDiet }) {
  const [formData, setFormData] = useState(initialFormState);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = async (formattedData) => {
    try {
      if (isEditing) {
        await onUpdateDiet(editingId, formattedData);
        setIsEditing(false);
        setEditingId(null);
      } else {
        await onAddDiet(formattedData);
      }
      setFormData(initialFormState);
    } catch (error) {
      console.error('Error in diet operation:', error);
    }
  };

  const handleEdit = (diet) => {
    setIsEditing(true);
    setEditingId(diet._id);
    setFormData({
      date: diet.date.split('T')[0],
      mealType: diet.mealType || '',
      foodName: diet.foodName || '',
      calories: diet.calories?.toString() || '',
      protein: diet.protein?.toString() || '',
      carbs: diet.carbs?.toString() || '',
      fats: diet.fats?.toString() || '',
      notes: diet.notes || ''
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData(initialFormState);
  };

  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <VStack spacing={6} align="stretch">
        <DailySummaryCard
          diets={diets}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />

        <DietForm
          isEditing={isEditing}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          initialData={formData}
        />

        {/* Diet Records Section */}
        <Box 
          p={6} 
          bg={bgColor} 
          borderRadius="xl" 
          borderWidth="1px" 
          borderColor={borderColor}
          boxShadow="lg"
        >
          <VStack spacing={4} align="stretch">
            <Heading size="md" color={textColor} textAlign="center" display="flex" alignItems="center" justifyContent="center" gap={2}>
              <Box as={FiPackage} />
              Your Diet Records
            </Heading>
            
            {diets.length === 0 ? (
              <VStack spacing={4} py={8}>
                <Box as={FiCoffee} size="48px" color={subTextColor} />
                <Text fontSize="lg" color={subTextColor} textAlign="center">
                  No diet records found
                </Text>
                <Text fontSize="sm" color={subTextColor} textAlign="center">
                  Start by adding your first meal above!
                </Text>
              </VStack>
            ) : (
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
                {diets
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .slice(0, 6) // Show only recent 6 records
                  .map((diet) => (
                    <DietCard
                      key={diet._id}
                      diet={diet}
                      onEdit={handleEdit}
                      onDelete={onDeleteDiet}
                    />
                  ))}
              </SimpleGrid>
            )}
            
            {diets.length > 6 && (
              <Text fontSize="sm" color={subTextColor} textAlign="center" mt={4}>
                Showing 6 most recent records. Total: {diets.length} records.
              </Text>
            )}
          </VStack>
        </Box>
      </VStack>
    </MotionBox>
  );
}

export default DietSection;
