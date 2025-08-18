import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';

const GoalsModal = ({ 
  isOpen, 
  onClose, 
  editingGoals, 
  onEditingGoalsChange,
  onSave 
}) => {
  const bgColor = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');

  const handleInputChange = (field, value) => {
    onEditingGoalsChange({
      ...editingGoals,
      [field]: Number(value)
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent bg={bgColor}>
        <ModalHeader color={textColor}>Edit Goals</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl>
            <FormLabel color={textColor}>Daily Calorie Goal</FormLabel>
            <Input
              type="number"
              value={editingGoals.dailyCalories}
              onChange={(e) => handleInputChange('dailyCalories', e.target.value)}
            />
          </FormControl>

          <FormControl mt={4}>
            <FormLabel color={textColor}>Daily Protein Goal (g)</FormLabel>
            <Input
              type="number"
              value={editingGoals.dailyProtein}
              onChange={(e) => handleInputChange('dailyProtein', e.target.value)}
            />
          </FormControl>

          <FormControl mt={4}>
            <FormLabel color={textColor}>Weekly Workout Goal</FormLabel>
            <Input
              type="number"
              value={editingGoals.weeklyWorkouts}
              onChange={(e) => handleInputChange('weeklyWorkouts', e.target.value)}
            />
          </FormControl>

          <Button colorScheme="teal" mr={3} mt={6} onClick={onSave}>
            Save Goals
          </Button>
          <Button onClick={onClose} mt={6}>Cancel</Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default GoalsModal;
