import React from 'react';
import {
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Badge,
  SimpleGrid,
  IconButton,
  useColorModeValue,
  Tooltip,
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';

const DietCard = ({ diet, onEdit, onDelete }) => {
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.600', 'gray.400');

  const getMealTypeColor = (mealType) => {
    switch (mealType) {
      case 'Breakfast': return 'yellow';
      case 'Lunch': return 'orange';
      case 'Dinner': return 'purple';
      default: return 'blue';
    }
  };

  return (
    <Card 
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
              colorScheme={getMealTypeColor(diet.mealType)}
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
              onClick={() => onEdit(diet)}
              aria-label="Edit diet"
            />
            <IconButton
              icon={<DeleteIcon />}
              size="sm"
              colorScheme="red"
              variant="ghost"
              onClick={() => onDelete(diet._id)}
              aria-label="Delete diet"
            />
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default DietCard;
