import { Box, Button, Flex, Text } from '@chakra-ui/react';

/**
 * A saved AI meal plan: one row per meal with a single action to log it.
 */
export default function MealPlanCard({ title = 'Meal plan', calories = null, meals = [], onCompleteMeal, getMealState }) {
  return (
    <Box>
      <Text fontWeight="700">{title}</Text>
      {calories ? <Text fontSize="sm" color="fg.muted">About {Number(calories).toLocaleString()} kcal for the day</Text> : null}
      <Box mt={2}>
        {meals.map((meal, index) => {
          const state = getMealState?.(index) || {};
          return (
            <Flex
              key={`${meal.mealType}-${index}`}
              justify="space-between"
              align="center"
              gap={3}
              py={2.5}
              borderBottomWidth="1px"
              borderColor="border"
              _last={{ borderBottomWidth: 0 }}
            >
              <Box minW={0}>
                <Text fontSize="xs" color="fg.muted">{meal.mealType}</Text>
                <Text fontSize="sm" fontWeight="600" noOfLines={2}>{meal.foodName}</Text>
              </Box>
              <Button
                size="sm"
                variant={state.completed ? 'ghost' : 'outline'}
                isDisabled={state.completed}
                isLoading={state.loading}
                loadingText="Logging"
                onClick={() => onCompleteMeal?.(meal, index)}
                flexShrink={0}
              >
                {state.completed ? 'Logged' : 'Log meal'}
              </Button>
            </Flex>
          );
        })}
        {meals.length === 0 ? <Text fontSize="sm" color="fg.muted">This plan has no meals yet.</Text> : null}
      </Box>
    </Box>
  );
}
