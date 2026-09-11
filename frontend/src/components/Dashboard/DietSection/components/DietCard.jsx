import React from 'react';
import {
  Box,
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Badge,
  IconButton,
  useColorModeValue,
  Tooltip,
  SimpleGrid,
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { FiCoffee, FiFileText, FiZap, FiActivity, FiTrendingUp, FiTarget } from 'react-icons/fi';

const macroMeta = [
  { key: 'calories', label: 'Calories', color: 'teal.400', icon: FiZap, suffix: '' },
  { key: 'protein', label: 'Protein', color: 'blue.400', icon: FiActivity, suffix: 'g' },
  { key: 'carbs', label: 'Carbs', color: 'orange.400', icon: FiTrendingUp, suffix: 'g' },
  { key: 'fats', label: 'Fats', color: 'red.400', icon: FiTarget, suffix: 'g' },
];

const DietCard = ({ diet, onEdit, onDelete }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBorderColor = useColorModeValue('teal.200', 'teal.500');
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.600', 'gray.400');
  const surfaceBg = useColorModeValue('gray.50', 'whiteAlpha.50');

  const getMealTypeColor = (mealType) => {
    if (mealType === 'Breakfast') return 'yellow';
    if (mealType === 'Lunch') return 'orange';
    if (mealType === 'Dinner') return 'purple';
    return 'blue';
  };

  return (
    <Card
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="2xl"
      boxShadow="sm"
      _hover={{ transform: 'translateY(-2px)', boxShadow: 'xl', borderColor: hoverBorderColor }}
      transition="all 0.2s ease"
      minH="260px"
    >
      <CardBody p={5}>
        <VStack spacing={4} align="stretch" h="100%">
          <HStack justify="space-between" align="start" spacing={3}>
            <Box minW={0}>
              <HStack spacing={2} wrap="wrap" mb={2}>
                <Badge colorScheme={getMealTypeColor(diet.mealType)} borderRadius="full" px={3} py={1}>
                  {diet.mealType}
                </Badge>
                <Badge variant="subtle" borderRadius="full" px={3} py={1}>
                  {new Date(diet.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Badge>
              </HStack>
              <Tooltip label={diet.foodName} hasArrow>
                <Text fontSize="lg" fontWeight="700" color={textColor} noOfLines={2}>
                  {diet.foodName || 'Unknown Food'}
                </Text>
              </Tooltip>
            </Box>
            <HStack spacing={1}>
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
          </HStack>

          <SimpleGrid columns={{ base: 2, md: 2 }} spacing={3}>
            {macroMeta.map((metric) => (
              <Box key={metric.key} p={3.5} borderRadius="xl" bg={surfaceBg} borderWidth="1px" borderColor={borderColor}>
                <HStack spacing={2} mb={2} color={metric.color} align="center" minW={0}>
                  <Box as={metric.icon} boxSize={4} />
                  <Text fontSize="xs" fontWeight="700" textTransform="uppercase" letterSpacing="wide" whiteSpace="nowrap">
                    {metric.label}
                  </Text>
                </HStack>
                <HStack spacing={1.5} align="baseline" wrap="nowrap">
                  <Text fontSize="lg" fontWeight="700" color={textColor} whiteSpace="nowrap">
                    {Math.round(((diet[metric.key] || 0) + Number.EPSILON) * 10) / 10}
                  </Text>
                  {metric.suffix ? (
                    <Text fontSize="sm" color={subTextColor} whiteSpace="nowrap">
                      {metric.suffix}
                    </Text>
                  ) : null}
                </HStack>
              </Box>
            ))}
          </SimpleGrid>

          <HStack spacing={2} color={subTextColor}>
            <Box as={FiCoffee} boxSize={4} />
            <Text fontSize="sm">
              Logged as {diet.mealType?.toLowerCase() || 'meal'} entry
            </Text>
          </HStack>

          {diet.notes ? (
            <HStack spacing={2} align="start" color={subTextColor}>
              <Box as={FiFileText} boxSize={4} mt={1} flexShrink={0} />
              <Text fontSize="sm" noOfLines={3}>
                {diet.notes}
              </Text>
            </HStack>
          ) : (
            <Text fontSize="sm" color={subTextColor}>
              No extra notes added for this meal.
            </Text>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

export default React.memo(DietCard);
