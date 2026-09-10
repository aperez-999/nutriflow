import React, { useState } from 'react';
import {
  VStack,
  Box,
  Heading,
  Text,
  SimpleGrid,
  HStack,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiPackage, FiCoffee } from 'react-icons/fi';
import { motion } from 'framer-motion';
import {
  DailySummaryCard,
  DietForm,
  DietCard,
} from './components';
import { getTodayDayKey, toDayKey } from '../../../utils/dateUtils';

const MotionBox = motion(Box);

const initialFormState = {
  date: getTodayDayKey(),
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
  const [selectedDate, setSelectedDate] = useState(getTodayDayKey());

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
      date: toDayKey(diet.date),
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
      h="100%"
    >
      <VStack spacing={5} align="stretch" h="100%">
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
          p={{ base: 5, md: 6 }}
          bg={bgColor}
          borderRadius="2xl"
          borderWidth="1px" 
          borderColor={borderColor}
          boxShadow="lg"
          flex="1"
        >
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between" align={{ base: 'start', md: 'center' }} flexWrap="wrap" gap={3}>
              <Box>
                <Heading size="md" color={textColor} display="flex" alignItems="center" gap={2}>
                  <Box as={FiPackage} />
                  Nutrition Log
                </Heading>
                <Text fontSize="sm" color={subTextColor} mt={1}>
                  Recent meal entries with clearer macro detail and easier scanning.
                </Text>
              </Box>
              <Badge colorScheme="teal" borderRadius="full" px={3} py={1}>
                {diets.length} total record{diets.length === 1 ? '' : 's'}
              </Badge>
            </HStack>
            
            {diets.length === 0 ? (
              <VStack spacing={4} py={8} px={2} align="center">
                <Box as={FiCoffee} boxSize="48px" color={subTextColor} />
                <Text fontSize="lg" color={textColor} textAlign="center" fontWeight="medium">
                  No diet records yet
                </Text>
                <Text fontSize="sm" color={subTextColor} textAlign="center" maxW="320px">
                  Start your nutrition journey. Log your first meal to begin tracking progress.
                </Text>
              </VStack>
            ) : (
              <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={5}>
                {diets
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .slice(0, 6)
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
                Showing the 6 most recent nutrition records.
              </Text>
            )}
          </VStack>
        </Box>
      </VStack>
    </MotionBox>
  );
}

export default DietSection;
