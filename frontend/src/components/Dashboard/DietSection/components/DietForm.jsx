import React, { useState } from 'react';
import {
  Box,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Select,
  HStack,
  Textarea,
  useColorModeValue,
} from '@chakra-ui/react';
import { EditIcon, AddIcon, DeleteIcon, CalendarIcon, SearchIcon } from '@chakra-ui/icons';
import { FiCoffee, FiZap, FiActivity, FiTrendingUp, FiTarget, FiPackage } from 'react-icons/fi';
import { motion } from 'framer-motion';
import FoodSearchInput from '../../../Diet/FoodSearchInput';

const DietForm = ({ isEditing, onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState(initialData);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const accentColor = useColorModeValue('teal.500', 'teal.300');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFoodSelect = (food) => {
    if (food) {
      setFormData(prev => ({
        ...prev,
        foodName: food.description,
        calories: food.nutrition.calories.toString(),
        protein: food.nutrition.protein.toString(),
        carbs: food.nutrition.carbs.toString(),
        fats: food.nutrition.fats.toString()
      }));
    }
  };

  const handleFoodNameChange = (value) => {
    setFormData(prev => ({
      ...prev,
      foodName: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formattedData = {
      ...formData,
      calories: Number(formData.calories),
      protein: Number(formData.protein),
      carbs: Number(formData.carbs),
      fats: Number(formData.fats)
    };
    onSubmit(formattedData);
  };

  return (
    <Box 
      p={6} 
      bg={bgColor} 
      borderRadius="xl" 
      borderWidth="1px" 
      borderColor={borderColor}
      boxShadow="lg"
    >
      <VStack spacing={5} align="stretch">
        <Heading size="md" color={textColor} textAlign="center" display="flex" alignItems="center" justifyContent="center" gap={2}>
          {isEditing ? <EditIcon /> : <AddIcon />}
          {isEditing ? 'Edit Diet Record' : 'Add New Diet Record'}
        </Heading>

        <form onSubmit={handleSubmit}>
          <VStack spacing={5}>
            <HStack spacing={4} width="100%">
              <FormControl isRequired flex={1}>
                <FormLabel color={textColor} fontWeight="semibold" display="flex" alignItems="center" gap={2}>
                  <CalendarIcon />
                  Date
                </FormLabel>
                <Input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  bg={useColorModeValue('white', 'gray.700')}
                  borderColor={borderColor}
                  color={textColor}
                  _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
                />
              </FormControl>

              <FormControl isRequired flex={1}>
                <FormLabel color={textColor} fontWeight="semibold" display="flex" alignItems="center" gap={2}>
                  <Box as={FiCoffee} />
                  Meal Type
                </FormLabel>
                <Select
                  name="mealType"
                  value={formData.mealType}
                  onChange={handleInputChange}
                  placeholder="Select meal type"
                  bg={useColorModeValue('white', 'gray.700')}
                  borderColor={borderColor}
                  color={textColor}
                  _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Snack">Snack</option>
                </Select>
              </FormControl>
            </HStack>

            <FormControl>
              <FormLabel color={textColor} fontWeight="semibold" display="flex" alignItems="center" gap={2}>
                <SearchIcon />
                Food Name
              </FormLabel>
              <FoodSearchInput
                value={formData.foodName}
                onChange={handleFoodNameChange}
                onFoodSelect={handleFoodSelect}
                placeholder="Search for food (e.g., apple, chicken breast, rice)..."
              />
            </FormControl>

            <HStack spacing={4} width="100%">
              <FormControl isRequired flex={1}>
                <FormLabel color={textColor} fontWeight="semibold" display="flex" alignItems="center" gap={2}>
                  <Box as={FiZap} />
                  Calories
                </FormLabel>
                <Input
                  type="number"
                  name="calories"
                  value={formData.calories}
                  onChange={handleInputChange}
                  placeholder="0"
                  bg={useColorModeValue('white', 'gray.700')}
                  borderColor={borderColor}
                  color={textColor}
                  _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
                />
              </FormControl>

              <FormControl flex={1}>
                <FormLabel color={textColor} fontWeight="semibold" display="flex" alignItems="center" gap={2}>
                  <Box as={FiActivity} />
                  Protein (g)
                </FormLabel>
                <Input
                  type="number"
                  step="0.1"
                  name="protein"
                  value={formData.protein}
                  onChange={handleInputChange}
                  placeholder="0"
                  bg={useColorModeValue('white', 'gray.700')}
                  borderColor={borderColor}
                  color={textColor}
                  _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
                />
              </FormControl>
            </HStack>

            <HStack spacing={4} width="100%">
              <FormControl flex={1}>
                <FormLabel color={textColor} fontWeight="semibold" display="flex" alignItems="center" gap={2}>
                  <Box as={FiTrendingUp} />
                  Carbs (g)
                </FormLabel>
                <Input
                  type="number"
                  step="0.1"
                  name="carbs"
                  value={formData.carbs}
                  onChange={handleInputChange}
                  placeholder="0"
                  bg={useColorModeValue('white', 'gray.700')}
                  borderColor={borderColor}
                  color={textColor}
                  _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
                />
              </FormControl>

              <FormControl flex={1}>
                <FormLabel color={textColor} fontWeight="semibold" display="flex" alignItems="center" gap={2}>
                  <Box as={FiTarget} />
                  Fats (g)
                </FormLabel>
                <Input
                  type="number"
                  step="0.1"
                  name="fats"
                  value={formData.fats}
                  onChange={handleInputChange}
                  placeholder="0"
                  bg={useColorModeValue('white', 'gray.700')}
                  borderColor={borderColor}
                  color={textColor}
                  _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
                />
              </FormControl>
            </HStack>

            <FormControl>
              <FormLabel color={textColor} fontWeight="semibold" display="flex" alignItems="center" gap={2}>
                <Box as={FiPackage} />
                Notes (optional)
              </FormLabel>
              <Textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Add any notes about this meal..."
                bg={useColorModeValue('white', 'gray.700')}
                borderColor={borderColor}
                color={textColor}
                _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
                rows={3}
              />
            </FormControl>

            <HStack spacing={4} width="100%">
              <Button
                type="submit"
                colorScheme="teal"
                size="lg"
                flex={1}
                as={motion.button}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                leftIcon={isEditing ? <EditIcon /> : <AddIcon />}
                fontWeight="bold"
              >
                {isEditing ? 'Update Record' : 'Add Record'}
              </Button>

              {isEditing && (
                <Button
                  onClick={onCancel}
                  colorScheme="gray"
                  size="lg"
                  flex={1}
                  leftIcon={<DeleteIcon />}
                >
                  Cancel Edit
                </Button>
              )}
            </HStack>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
};

export default DietForm;
