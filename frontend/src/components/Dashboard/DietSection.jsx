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
  useToast,
  Select,
  HStack,
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

function DietSection({ diets, onAddDiet, onUpdateDiet, onDeleteDiet }) {
  const initialFormState = {
    date: new Date().toISOString().split('T')[0],
    mealType: '',
    foodName: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const toast = useToast();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
      toast({
        title: isEditing ? 'Diet updated' : 'Diet added',
        status: 'success',
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 2000,
      });
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
      fats: diet.fats?.toString() || ''
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData(initialFormState);
  };

  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const tableHeaderBg = useColorModeValue('gray.50', 'gray.800');

  return (
    <MotionBox
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Box p={6} bg={bgColor} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
        <VStack spacing={4} align="stretch">
          <Heading size="md" color={textColor}>
            {isEditing ? 'Edit Diet Record' : 'Add Diet Record'}
          </Heading>

          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel color={textColor}>Date</FormLabel>
                <Input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel color={textColor}>Meal Type</FormLabel>
                <Select
                  name="mealType"
                  value={formData.mealType}
                  onChange={handleInputChange}
                  placeholder="Select meal type"
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Snack">Snack</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel color={textColor}>Food Name</FormLabel>
                <Input
                  name="foodName"
                  value={formData.foodName}
                  onChange={handleInputChange}
                  placeholder="Enter food name"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel color={textColor}>Calories</FormLabel>
                <Input
                  type="number"
                  name="calories"
                  value={formData.calories}
                  onChange={handleInputChange}
                  placeholder="Enter calories"
                />
              </FormControl>

              <FormControl>
                <FormLabel color={textColor}>Protein (g)</FormLabel>
                <Input
                  type="number"
                  name="protein"
                  value={formData.protein}
                  onChange={handleInputChange}
                  placeholder="Enter protein"
                />
              </FormControl>

              <FormControl>
                <FormLabel color={textColor}>Carbs (g)</FormLabel>
                <Input
                  type="number"
                  name="carbs"
                  value={formData.carbs}
                  onChange={handleInputChange}
                  placeholder="Enter carbs"
                />
              </FormControl>

              <FormControl>
                <FormLabel color={textColor}>Fats (g)</FormLabel>
                <Input
                  type="number"
                  name="fats"
                  value={formData.fats}
                  onChange={handleInputChange}
                  placeholder="Enter fats"
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="teal"
                width="full"
                as={motion.button}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isEditing ? 'Update Record' : 'Add Record'}
              </Button>

              {isEditing && (
                <Button
                  onClick={handleCancel}
                  colorScheme="gray"
                  width="full"
                >
                  Cancel Edit
                </Button>
              )}
            </VStack>
          </form>

          {/* Updated Table Section without food name */}
          <Box overflowX="auto">
            <Table variant="simple" mt={6} size="sm">
              <Thead bg={tableHeaderBg}>
                <Tr>
                  <Th color={textColor} width="20%">Date</Th>
                  <Th color={textColor} width="15%">Meal</Th>
                  <Th color={textColor} width="15%">Calories</Th>
                  <Th color={textColor} width="15%">Protein</Th>
                  <Th color={textColor} width="15%">Carbs</Th>
                  <Th color={textColor} width="15%">Fats</Th>
                  <Th color={textColor} width="15%">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {diets.map((diet) => (
                  <Tr
                    key={diet._id}
                    as={motion.tr}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Td>{new Date(diet.date).toLocaleDateString()}</Td>
                    <Td>{diet.mealType}</Td>
                    <Td>{diet.calories}</Td>
                    <Td>{diet.protein}g</Td>
                    <Td>{diet.carbs}g</Td>
                    <Td>{diet.fats}g</Td>
                    <Td>
                      <HStack spacing={2}>
                        <IconButton
                          icon={<EditIcon />}
                          colorScheme="blue"
                          size="sm"
                          onClick={() => handleEdit(diet)}
                          aria-label="Edit"
                        />
                        <IconButton
                          icon={<DeleteIcon />}
                          colorScheme="red"
                          size="sm"
                          onClick={() => onDeleteDiet(diet._id)}
                          aria-label="Delete"
                        />
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </VStack>
      </Box>
    </MotionBox>
  );
}

export default DietSection; 