import React, { useEffect, useState } from 'react';
import {
  Box,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Select,
  Textarea,
  useColorModeValue,
  Text,
  SimpleGrid,
  HStack,
  Badge,
} from '@chakra-ui/react';
import { EditIcon, AddIcon, DeleteIcon, CalendarIcon, SearchIcon } from '@chakra-ui/icons';
import { FiCoffee, FiZap, FiActivity, FiTrendingUp, FiTarget, FiPackage } from 'react-icons/fi';
import { motion } from 'framer-motion';
import FoodSearchInput from '../../../Diet/FoodSearchInput';

const MotionButton = motion(Button);

const metricCards = [
  { key: 'calories', label: 'Calories', icon: FiZap, color: 'teal.400', suffix: '' },
  { key: 'protein', label: 'Protein', icon: FiActivity, color: 'blue.400', suffix: 'g' },
  { key: 'carbs', label: 'Carbs', icon: FiTrendingUp, color: 'orange.400', suffix: 'g' },
  { key: 'fats', label: 'Fats', icon: FiTarget, color: 'red.400', suffix: 'g' },
];

const DietForm = ({ isEditing, onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState(initialData);
  const [selectedFood, setSelectedFood] = useState(null);

  useEffect(() => {
    setFormData(initialData);
    setSelectedFood(null);
  }, [initialData]);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.600', 'gray.400');
  const mutedBg = useColorModeValue('gray.50', 'whiteAlpha.50');
  const accentColor = useColorModeValue('teal.500', 'teal.300');
  const inputBg = useColorModeValue('white', 'gray.700');
  const iconBg = useColorModeValue('teal.50', 'whiteAlpha.100');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFoodSelect = (food) => {
    setSelectedFood(food);
    if (food) {
      setFormData((prev) => ({
        ...prev,
        foodName: food.description,
        calories: food.nutrition.calories.toString(),
        protein: food.nutrition.protein.toString(),
        carbs: food.nutrition.carbs.toString(),
        fats: food.nutrition.fats.toString(),
      }));
    }
  };

  const handleFoodNameChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      foodName: value,
    }));
    if (selectedFood && value !== selectedFood.description) {
      setSelectedFood(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formattedData = {
      ...formData,
      calories: Number(formData.calories),
      protein: Number(formData.protein),
      carbs: Number(formData.carbs),
      fats: Number(formData.fats),
    };
    onSubmit(formattedData);
  };

  return (
    <Box
      p={{ base: 5, md: 6 }}
      bg={bgColor}
      borderRadius="2xl"
      borderWidth="1px"
      borderColor={borderColor}
      boxShadow="lg"
    >
      <VStack spacing={6} align="stretch">
        <Box>
          <HStack spacing={3} mb={2}>
            <Box
              p={2.5}
              borderRadius="xl"
              bg={iconBg}
              color={accentColor}
            >
              {isEditing ? <EditIcon /> : <AddIcon />}
            </Box>
            <Box>
              <Heading size="md" color={textColor}>
                {isEditing ? 'Edit Nutrition Record' : 'Add Nutrition Record'}
              </Heading>
              <Text fontSize="sm" color={subTextColor}>
                Search USDA foods, confirm the nutrition preview, then save the meal.
              </Text>
            </Box>
          </HStack>
        </Box>

        <form onSubmit={handleSubmit}>
          <VStack spacing={5} align="stretch">
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl isRequired>
                <FormLabel color={textColor} fontWeight="semibold" display="flex" alignItems="center" gap={2}>
                  <CalendarIcon />
                  Date
                </FormLabel>
                <Input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  bg={inputBg}
                  borderColor={borderColor}
                  color={textColor}
                  borderRadius="xl"
                  _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel color={textColor} fontWeight="semibold" display="flex" alignItems="center" gap={2}>
                  <Box as={FiCoffee} />
                  Meal Type
                </FormLabel>
                <Select
                  name="mealType"
                  value={formData.mealType}
                  onChange={handleInputChange}
                  placeholder="Select meal type"
                  bg={inputBg}
                  borderColor={borderColor}
                  color={textColor}
                  borderRadius="xl"
                  _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Snack">Snack</option>
                </Select>
              </FormControl>
            </SimpleGrid>

            <FormControl>
              <FormLabel color={textColor} fontWeight="semibold" display="flex" alignItems="center" gap={2}>
                <SearchIcon />
                Food Search
              </FormLabel>
              <FoodSearchInput
                value={formData.foodName}
                onChange={handleFoodNameChange}
                onFoodSelect={handleFoodSelect}
                placeholder="Search foods like greek yogurt, chicken and rice, or salmon bowl"
              />
            </FormControl>

            <Box p={4} borderRadius="2xl" bg={mutedBg} borderWidth="1px" borderColor={borderColor}>
              <HStack justify="space-between" align={{ base: 'start', md: 'center' }} flexWrap="wrap" gap={3} mb={4}>
                <Box>
                  <Text fontSize="sm" fontWeight="700" color={textColor}>
                    Nutrition Preview
                  </Text>
                  <Text fontSize="sm" color={subTextColor}>
                    {selectedFood
                      ? `Auto-filled from USDA for ${selectedFood.description}`
                      : 'Manual values update live here so you can review before saving.'}
                  </Text>
                </Box>
                {selectedFood && (
                  <Badge colorScheme="teal" borderRadius="full" px={3} py={1}>
                    USDA selected
                  </Badge>
                )}
              </HStack>

              <SimpleGrid columns={{ base: 2, xl: 4 }} spacing={3}>
                {metricCards.map((metric) => (
                  <Box key={metric.key} p={3.5} borderRadius="xl" bg={bgColor} borderWidth="1px" borderColor={borderColor}>
                    <HStack spacing={2} mb={2} color={metric.color}>
                      <Box as={metric.icon} boxSize={4} />
                      <Text fontSize="xs" fontWeight="700" textTransform="uppercase" letterSpacing="wide">
                        {metric.label}
                      </Text>
                    </HStack>
                    <Text fontSize="xl" fontWeight="700" color={textColor}>
                      {formData[metric.key] || 0}
                      <Text as="span" fontSize="sm" color={subTextColor} ml={1}>
                        {metric.suffix}
                      </Text>
                    </Text>
                  </Box>
                ))}
              </SimpleGrid>
            </Box>

            <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={4}>
              <FormControl isRequired>
                <FormLabel color={textColor} fontWeight="semibold">Calories</FormLabel>
                <Input
                  type="number"
                  name="calories"
                  value={formData.calories}
                  onChange={handleInputChange}
                  placeholder="0"
                  bg={inputBg}
                  borderColor={borderColor}
                  color={textColor}
                  borderRadius="xl"
                  _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
                />
              </FormControl>

              <FormControl>
                <FormLabel color={textColor} fontWeight="semibold">Protein (g)</FormLabel>
                <Input
                  type="number"
                  step="0.1"
                  name="protein"
                  value={formData.protein}
                  onChange={handleInputChange}
                  placeholder="0"
                  bg={inputBg}
                  borderColor={borderColor}
                  color={textColor}
                  borderRadius="xl"
                  _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
                />
              </FormControl>

              <FormControl>
                <FormLabel color={textColor} fontWeight="semibold">Carbs (g)</FormLabel>
                <Input
                  type="number"
                  step="0.1"
                  name="carbs"
                  value={formData.carbs}
                  onChange={handleInputChange}
                  placeholder="0"
                  bg={inputBg}
                  borderColor={borderColor}
                  color={textColor}
                  borderRadius="xl"
                  _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
                />
              </FormControl>

              <FormControl>
                <FormLabel color={textColor} fontWeight="semibold">Fats (g)</FormLabel>
                <Input
                  type="number"
                  step="0.1"
                  name="fats"
                  value={formData.fats}
                  onChange={handleInputChange}
                  placeholder="0"
                  bg={inputBg}
                  borderColor={borderColor}
                  color={textColor}
                  borderRadius="xl"
                  _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
                />
              </FormControl>
            </SimpleGrid>

            <FormControl>
              <FormLabel color={textColor} fontWeight="semibold" display="flex" alignItems="center" gap={2}>
                <Box as={FiPackage} />
                Notes
              </FormLabel>
              <Textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Add context like portion size, prep details, or how the meal felt."
                bg={inputBg}
                borderColor={borderColor}
                color={textColor}
                borderRadius="xl"
                rows={3}
                _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
              />
            </FormControl>

            <HStack spacing={4} justify="flex-end" flexWrap="wrap">
              {isEditing && (
                <Button
                  onClick={onCancel}
                  colorScheme="gray"
                  variant="outline"
                  size="lg"
                  leftIcon={<DeleteIcon />}
                  minW={{ base: '100%', md: '180px' }}
                >
                  Cancel Edit
                </Button>
              )}

              <MotionButton
                type="submit"
                colorScheme="teal"
                size="lg"
                minW={{ base: '100%', md: '220px' }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                leftIcon={isEditing ? <EditIcon /> : <AddIcon />}
                fontWeight="700"
              >
                {isEditing ? 'Update Nutrition Record' : 'Save Nutrition Record'}
              </MotionButton>
            </HStack>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
};

export default DietForm;
