import React, { useState } from 'react';
import {
  Box,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Select,
  HStack,
  Badge,
  Flex,
  Textarea,
  SimpleGrid,
  Card,
  CardBody,
  Tooltip,
} from '@chakra-ui/react';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  DeleteIcon, 
  EditIcon,
  CalendarIcon,
  SearchIcon,
  AddIcon,
  SettingsIcon
} from '@chakra-ui/icons';
import { 
  FiBarChart2, 
  FiCoffee, 
  FiSun, 
  FiMoon, 
  FiPackage,
  FiTrendingUp,
  FiActivity,
  FiTarget,
  FiZap
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import FoodSearchInput from '../Diet/FoodSearchInput';

const MotionBox = motion(Box);

function DietSection({ diets, onAddDiet, onUpdateDiet, onDeleteDiet }) {
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

  const [formData, setFormData] = useState(initialFormState);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Calculate daily totals for selected date
  const getDailyTotals = () => {
    const todaysDiets = diets.filter(diet => 
      diet.date && diet.date.split('T')[0] === selectedDate
    );
    
    return todaysDiets.reduce((totals, diet) => ({
      calories: totals.calories + (diet.calories || 0),
      protein: totals.protein + (diet.protein || 0),
      carbs: totals.carbs + (diet.carbs || 0),
      fats: totals.fats + (diet.fats || 0),
      count: totals.count + 1
    }), { calories: 0, protein: 0, carbs: 0, fats: 0, count: 0 });
  };

  const dailyTotals = getDailyTotals();

  // Date navigation functions
  const goToPreviousDay = () => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() - 1);
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  };

  const goToNextDay = () => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + 1);
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  };

  const goToToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle food selection from search
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

  // Handle food name change (for manual entry)
  const handleFoodNameChange = (value) => {
    setFormData(prev => ({
      ...prev,
      foodName: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formattedData = {
        ...formData,
        calories: Number(formData.calories),
        protein: Number(formData.protein),
        carbs: Number(formData.carbs),
        fats: Number(formData.fats)
      };

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
  const tableHeaderBg = useColorModeValue('gray.50', 'gray.700');
  const cardBg = useColorModeValue('gray.50', 'gray.700');
  const accentColor = useColorModeValue('teal.500', 'teal.300');

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <VStack spacing={6} align="stretch">
        {/* Daily Summary Card */}
        <Box 
          p={6} 
          bg={cardBg} 
          borderRadius="xl" 
          borderWidth="1px" 
          borderColor={borderColor}
          boxShadow="lg"
        >
          <VStack spacing={4}>
            <Heading size="lg" color={accentColor} textAlign="center" display="flex" alignItems="center" justifyContent="center" gap={3}>
              <Box as={FiBarChart2} />
              Daily Nutrition Summary
            </Heading>
            
            <VStack spacing={3}>
              <Text fontSize="sm" color={subTextColor} fontWeight="medium">
                Viewing Date
              </Text>
              <HStack spacing={4} align="center">
                <IconButton
                  icon={<ChevronLeftIcon />}
                  size="sm"
                  variant="ghost"
                  colorScheme="teal"
                  onClick={goToPreviousDay}
                  aria-label="Previous day"
                  _hover={{ bg: useColorModeValue('teal.50', 'teal.900') }}
                />
                
                <VStack spacing={1} minW="120px">
                  <Text fontSize="lg" fontWeight="bold" color={textColor}>
                    {new Date(selectedDate).toLocaleDateString('en-US', { 
                      weekday: 'short',
                      month: 'short', 
                      day: 'numeric'
                    })}
                  </Text>
                  <Text fontSize="xs" color={subTextColor}>
                    {new Date(selectedDate).getFullYear()}
                  </Text>
                </VStack>

                <IconButton
                  icon={<ChevronRightIcon />}
                  size="sm"
                  variant="ghost"
                  colorScheme="teal"
                  onClick={goToNextDay}
                  aria-label="Next day"
                  _hover={{ bg: useColorModeValue('teal.50', 'teal.900') }}
                />
              </HStack>
              
              <Button
                size="xs"
                variant="ghost"
                colorScheme="teal"
                onClick={goToToday}
                fontSize="xs"
                _hover={{ bg: useColorModeValue('teal.50', 'teal.900') }}
              >
                Today
              </Button>
            </VStack>

            <HStack spacing={6} justify="center" wrap="wrap">
              <VStack spacing={1}>
                <Text fontSize="2xl" fontWeight="bold" color={accentColor}>
                  {Math.round(dailyTotals.calories)}
                </Text>
                <Text fontSize="sm" color={subTextColor}>Calories</Text>
              </VStack>
              <VStack spacing={1}>
                <Text fontSize="xl" fontWeight="semibold" color="blue.400">
                  {Math.round(dailyTotals.protein)}g
                </Text>
                <Text fontSize="sm" color={subTextColor}>Protein</Text>
              </VStack>
              <VStack spacing={1}>
                <Text fontSize="xl" fontWeight="semibold" color="orange.400">
                  {Math.round(dailyTotals.carbs)}g
                </Text>
                <Text fontSize="sm" color={subTextColor}>Carbs</Text>
              </VStack>
              <VStack spacing={1}>
                <Text fontSize="xl" fontWeight="semibold" color="red.400">
                  {Math.round(dailyTotals.fats)}g
                </Text>
                <Text fontSize="sm" color={subTextColor}>Fats</Text>
              </VStack>
              <VStack spacing={1}>
                <Text fontSize="xl" fontWeight="semibold" color="purple.400">
                  {dailyTotals.count}
                </Text>
                <Text fontSize="sm" color={subTextColor}>Meals</Text>
              </VStack>
            </HStack>
          </VStack>
        </Box>

        {/* Add/Edit Form */}
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
                    onClick={handleCancel}
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

      {/* Diet Records Table */}
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
                <Card 
                  key={diet._id}
                  size="sm"
                  variant="outline"
                  _hover={{ 
                    transform: 'translateY(-2px)', 
                    boxShadow: 'lg',
                    borderColor: useColorModeValue('teal.200', 'teal.500')
                  }}
                  transition="all 0.2s"
                  cursor="pointer"
                  height="220px"
                >
                  <CardBody p={4}>
                    <VStack spacing={3} align="stretch" height="100%">
                      {/* Header Section */}
                      <HStack justify="space-between" align="center">
                        <Badge 
                          colorScheme={
                            diet.mealType === 'Breakfast' ? 'yellow' :
                            diet.mealType === 'Lunch' ? 'orange' :
                            diet.mealType === 'Dinner' ? 'purple' : 'blue'
                          }
                          variant="subtle"
                          fontSize="xs"
                          px={2}
                          py={1}
                        >
                          {diet.mealType}
                        </Badge>
                        <Text fontSize="xs" color={subTextColor}>
                          {new Date(diet.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric'
                          })}
                        </Text>
                      </HStack>
                      
                      {/* Food Name Section */}
                      <Tooltip label={diet.foodName} hasArrow>
                        <Text 
                          fontSize="sm" 
                          fontWeight="semibold" 
                          color={textColor}
                          noOfLines={1}
                        >
                          {diet.foodName || 'Unknown Food'}
                        </Text>
                      </Tooltip>
                      
                      {/* Metrics Section */}
                      <SimpleGrid columns={4} spacing={2} width="100%">
                        <VStack spacing={1}>
                          <Text fontSize="md" fontWeight="bold" color="teal.500">
                            {Math.round(diet.calories || 0)}
                          </Text>
                          <Text fontSize="xs" color={subTextColor}>Cal</Text>
                        </VStack>
                        <VStack spacing={1}>
                          <Text fontSize="md" fontWeight="bold" color="blue.400">
                            {Math.round((diet.protein || 0) * 10) / 10}g
                          </Text>
                          <Text fontSize="xs" color={subTextColor}>Pro</Text>
                        </VStack>
                        <VStack spacing={1}>
                          <Text fontSize="md" fontWeight="bold" color="orange.400">
                            {Math.round((diet.carbs || 0) * 10) / 10}g
                          </Text>
                          <Text fontSize="xs" color={subTextColor}>Carb</Text>
                        </VStack>
                        <VStack spacing={1}>
                          <Text fontSize="md" fontWeight="bold" color="red.400">
                            {Math.round((diet.fats || 0) * 10) / 10}g
                          </Text>
                          <Text fontSize="xs" color={subTextColor}>Fat</Text>
                        </VStack>
                      </SimpleGrid>
                      
                      {/* Notes Section */}
                      {diet.notes && (
                        <Text fontSize="xs" color={subTextColor} noOfLines={2}>
                          📝 {diet.notes}
                        </Text>
                      )}
                      
                      {/* Actions Section */}
                      <HStack spacing={2} justify="center" pt={2}>
                        <IconButton
                          icon={<EditIcon />}
                          size="sm"
                          colorScheme="blue"
                          variant="ghost"
                          onClick={() => handleEdit(diet)}
                          aria-label="Edit diet"
                        />
                        <IconButton
                          icon={<DeleteIcon />}
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => onDeleteDiet(diet._id)}
                          aria-label="Delete diet"
                        />
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
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