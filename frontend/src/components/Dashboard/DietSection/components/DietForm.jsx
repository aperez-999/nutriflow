import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputRightElement,
  SimpleGrid,
  Text,
  Textarea,
  VStack,
} from '@chakra-ui/react';
import FoodSearchInput from '../../../Diet/FoodSearchInput';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

const MACRO_FIELDS = [
  { name: 'calories', label: 'Calories', unit: 'kcal', isRequired: true },
  { name: 'protein', label: 'Protein', unit: 'g' },
  { name: 'carbs', label: 'Carbs', unit: 'g' },
  { name: 'fats', label: 'Fat', unit: 'g' },
];

// New entries start on the meal that fits the time of day; one tap changes it.
const mealTypeForNow = (date = new Date()) => {
  const hour = date.getHours();
  if (hour < 11) return 'Breakfast';
  if (hour < 15) return 'Lunch';
  if (hour >= 17 && hour < 21) return 'Dinner';
  return 'Snack';
};

const withDefaults = (data, isEditing) => ({
  ...data,
  mealType: data.mealType || (isEditing ? '' : mealTypeForNow()),
});

const DietForm = ({ isEditing, onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState(() => withDefaults(initialData, isEditing));
  const [selectedFood, setSelectedFood] = useState(null);

  useEffect(() => {
    setFormData(withDefaults(initialData, isEditing));
    setSelectedFood(null);
  }, [initialData, isEditing]);

  const setField = (name, value) => setFormData((prev) => ({ ...prev, [name]: value }));
  const handleInputChange = (e) => setField(e.target.name, e.target.value);

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
    setField('foodName', value);
    if (selectedFood && value !== selectedFood.description) {
      setSelectedFood(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      calories: Number(formData.calories),
      protein: Number(formData.protein),
      carbs: Number(formData.carbs),
      fats: Number(formData.fats),
    });
  };

  const canSubmit = Boolean(formData.foodName?.trim() && formData.mealType && formData.calories !== '');

  return (
    <Box bg="bg.surface" borderWidth="1px" borderColor="border" borderRadius="panel" p={{ base: 4, md: 5 }}>
      <Heading as="h3" size="sm" mb={4}>{isEditing ? 'Edit meal' : 'Log a meal'}</Heading>

      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">
          <FormControl isRequired>
            <FormLabel>Food</FormLabel>
            <FoodSearchInput
              value={formData.foodName}
              onChange={handleFoodNameChange}
              onFoodSelect={handleFoodSelect}
              placeholder="Search USDA foods, or type your own"
            />
            {selectedFood && (
              <Text fontSize="xs" color="fg.muted" mt={1.5}>
                Values filled from USDA. Adjust them if your portion is different.
              </Text>
            )}
          </FormControl>

          <FormControl isRequired>
            <FormLabel id="meal-type-label">Meal</FormLabel>
            <ButtonGroup role="radiogroup" aria-labelledby="meal-type-label" isAttached size="sm" w="100%" variant="outline">
              {MEAL_TYPES.map((type) => {
                const selected = formData.mealType === type;
                return (
                  <Button
                    key={type}
                    flex="1"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setField('mealType', type)}
                    bg={selected ? 'fg' : 'bg.surface'}
                    color={selected ? 'bg.surface' : 'fg'}
                    borderColor={selected ? 'fg' : 'border'}
                    _hover={{ bg: selected ? 'fg' : 'bg.muted' }}
                  >
                    {type}
                  </Button>
                );
              })}
            </ButtonGroup>
          </FormControl>

          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
            {MACRO_FIELDS.map((field) => (
              <FormControl key={field.name} isRequired={field.isRequired}>
                <FormLabel>{field.label}</FormLabel>
                <InputGroup>
                  <Input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step={field.name === 'calories' ? 1 : 0.1}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleInputChange}
                    placeholder="0"
                    pr={field.unit.length > 1 ? 12 : 8}
                  />
                  <InputRightElement pointerEvents="none" color="fg.muted" fontSize="sm" w={field.unit.length > 1 ? 12 : 8}>
                    {field.unit}
                  </InputRightElement>
                </InputGroup>
              </FormControl>
            ))}
          </SimpleGrid>

          <FormControl isRequired maxW={{ md: '50%' }}>
            <FormLabel>Date</FormLabel>
            <Input type="date" name="date" value={formData.date} onChange={handleInputChange} />
          </FormControl>

          <FormControl>
            <FormLabel>Notes</FormLabel>
            <Textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Portion, how it sat, anything worth remembering"
              rows={2}
              resize="vertical"
            />
          </FormControl>

          <HStack spacing={2} justify="flex-end">
            {isEditing && (
              <Button variant="ghost" onClick={onCancel}>Cancel</Button>
            )}
            <Button type="submit" isDisabled={!canSubmit} flex={{ base: 1, md: 'none' }} minW={{ md: '160px' }}>
              {isEditing ? 'Save changes' : 'Log meal'}
            </Button>
          </HStack>
        </VStack>
      </form>
    </Box>
  );
};

export default DietForm;
