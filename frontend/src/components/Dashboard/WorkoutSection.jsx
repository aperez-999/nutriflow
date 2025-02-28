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

function WorkoutSection({ workouts, onAddWorkout, onUpdateWorkout, onDeleteWorkout }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const toast = useToast();
  
  const initialFormState = {
    date: new Date().toISOString().split('T')[0],
    type: '',
    duration: '',
    caloriesBurned: '',
    notes: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const tableHeaderBg = useColorModeValue('gray.50', 'gray.800');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formattedData = {
        ...formData,
        duration: Number(formData.duration),
        caloriesBurned: Number(formData.caloriesBurned)
      };

      if (isEditing) {
        await onUpdateWorkout(editingId, formattedData);
        setIsEditing(false);
        setEditingId(null);
      } else {
        await onAddWorkout(formattedData);
      }
      setFormData(initialFormState);
      toast({
        title: isEditing ? 'Workout updated' : 'Workout added',
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

  const handleEdit = (workout) => {
    setIsEditing(true);
    setEditingId(workout._id);
    setFormData({
      date: workout.date.split('T')[0],
      type: workout.type,
      duration: workout.duration.toString(),
      caloriesBurned: workout.caloriesBurned?.toString() || '',
      notes: workout.notes || ''
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData(initialFormState);
  };

  return (
    <MotionBox
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Box p={6} bg={bgColor} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
        <VStack spacing={4} align="stretch">
          <Heading size="md" color={textColor}>
            {isEditing ? 'Edit Workout' : 'Add Workout'}
          </Heading>

          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel color={textColor}>Date</FormLabel>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </FormControl>

              <FormControl>
                <FormLabel color={textColor}>Workout Type</FormLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  placeholder="Select workout type"
                >
                  <option value="Cardio">Cardio</option>
                  <option value="Strength">Strength</option>
                  <option value="Flexibility">Flexibility</option>
                  <option value="Sports">Sports</option>
                  <option value="Other">Other</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel color={textColor}>Duration (minutes)</FormLabel>
                <Input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="Enter duration in minutes"
                />
              </FormControl>

              <FormControl>
                <FormLabel color={textColor}>Calories Burned</FormLabel>
                <Input
                  type="number"
                  value={formData.caloriesBurned}
                  onChange={(e) => setFormData({ ...formData, caloriesBurned: e.target.value })}
                  placeholder="Enter calories burned"
                />
              </FormControl>

              <FormControl>
                <FormLabel color={textColor}>Notes</FormLabel>
                <Input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add any notes (optional)"
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
                {isEditing ? 'Update Workout' : 'Add Workout'}
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

          {/* Workout Records Table */}
          <Box overflowX="auto">
            <Table variant="simple" mt={6} size="sm">
              <Thead bg={tableHeaderBg}>
                <Tr>
                  <Th color={textColor} width="20%">Date</Th>
                  <Th color={textColor} width="20%">Type</Th>
                  <Th color={textColor} width="20%">Duration (min)</Th>
                  <Th color={textColor} width="20%">Calories Burned</Th>
                  <Th color={textColor} width="20%">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {workouts.map((workout) => (
                  <Tr
                    key={workout._id}
                    as={motion.tr}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Td>{new Date(workout.date).toLocaleDateString()}</Td>
                    <Td>{workout.type}</Td>
                    <Td>{workout.duration}</Td>
                    <Td>{workout.caloriesBurned}</Td>
                    <Td>
                      <HStack spacing={2}>
                        <IconButton
                          icon={<EditIcon />}
                          colorScheme="blue"
                          size="sm"
                          onClick={() => handleEdit(workout)}
                          aria-label="Edit"
                        />
                        <IconButton
                          icon={<DeleteIcon />}
                          colorScheme="red"
                          size="sm"
                          onClick={() => onDeleteWorkout(workout._id)}
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

export default WorkoutSection;