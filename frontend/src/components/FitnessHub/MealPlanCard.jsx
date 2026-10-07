import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  HStack,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react';
import { FiCheckCircle, FiCoffee } from 'react-icons/fi';

const cardHoverStyles = {
  _hover: { transform: 'translateY(-2px)', boxShadow: 'lg' },
  transition: 'all 0.2s ease',
};

export default function MealPlanCard({
  title = 'Meal Plan',
  calories = null,
  meals = [],
  onCompleteMeal,
  getMealState,
}) {
  const cardBg = 'bg.surface';
  const borderColor = 'border';
  const textColor = 'fg';
  const subColor = 'fg.muted';
  const panelBg = 'bg.muted';

  return (
    <Card
      bg={cardBg}
      border="1px"
      borderColor={borderColor}
      borderRadius="xl"
      boxShadow="sm"
      h="100%"
      {...cardHoverStyles}
    >
      <CardBody>
        <VStack align="stretch" spacing={4}>
          <Box>
            <Text fontSize="md" fontWeight="700" color={textColor}>
              {title}
            </Text>
            <Text fontSize="sm" color={subColor} mt={1}>
              {calories ? `Target around ${calories} calories.` : 'Save each meal directly into your nutrition log.'}
            </Text>
          </Box>

          <VStack spacing={3} align="stretch">
            {meals.map((meal, index) => {
              const mealState = getMealState?.(index) || {};
              return (
                <Stack
                  key={`${meal.mealType}-${index}`}
                  direction={{ base: 'column', md: 'row' }}
                  justify="space-between"
                  align={{ base: 'stretch', md: 'center' }}
                  spacing={3}
                  p={3.5}
                  bg={panelBg}
                  borderWidth="1px"
                  borderColor={borderColor}
                  borderRadius="xl"
                >
                  <Box minW={0}>
                    <HStack spacing={2} mb={1.5} flexWrap="wrap">
                      <Badge colorScheme="orange" borderRadius="full" px={3} py={1}>
                        {meal.mealType}
                      </Badge>
                      {mealState.completed ? (
                        <Badge colorScheme="green" borderRadius="full" px={3} py={1}>
                          Logged
                        </Badge>
                      ) : null}
                    </HStack>
                    <Text fontSize="sm" color={textColor} fontWeight="600">
                      {meal.foodName}
                    </Text>
                  </Box>

                  <Button
                    size="sm"
                    colorScheme={mealState.completed ? 'green' : 'teal'}
                    variant={mealState.completed ? 'solid' : 'outline'}
                    leftIcon={<FiCheckCircle />}
                    isDisabled={mealState.completed}
                    isLoading={mealState.loading}
                    loadingText="Logging"
                    onClick={() => onCompleteMeal?.(meal, index)}
                    minW={{ base: '100%', md: '140px' }}
                  >
                    {mealState.completed ? 'Completed' : 'Mark Complete'}
                  </Button>
                </Stack>
              );
            })}

            {meals.length === 0 ? (
              <HStack spacing={3} color={subColor}>
                <Box as={FiCoffee} boxSize={4} />
                <Text fontSize="sm">No meals saved in this plan yet.</Text>
              </HStack>
            ) : null}
          </VStack>
        </VStack>
      </CardBody>
    </Card>
  );
}
