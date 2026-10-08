import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Link,
  Select,
  SimpleGrid,
  Text,
} from '@chakra-ui/react';

const MUSCLES = ['Chest', 'Back', 'Legs', 'Core', 'Shoulders', 'Arms', 'Glutes', 'Full Body', 'Cardio', 'Mobility'];
const EQUIPMENT = ['Bodyweight', 'Dumbbells', 'Barbell', 'Cable', 'Machine', 'Kettlebell', 'Bands'];
const DIFFICULTY = ['Beginner', 'Intermediate', 'Advanced'];
const PREVIEW_COUNT = 9;

function FilterSelect({ label, value, options, onChange }) {
  return (
    <FormControl>
      <FormLabel>{label}</FormLabel>
      <Select size="sm" placeholder="All" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </Select>
    </FormControl>
  );
}

export default function FitnessHubDiscoverySection({
  muscle,
  equipment,
  difficulty,
  onMuscleChange,
  onEquipmentChange,
  onDifficultyChange,
  filteredExercises,
  totalExercises = filteredExercises.length,
  onClearFilters,
}) {
  const [showAll, setShowAll] = useState(false);
  const hasActiveFilters = Boolean(muscle || equipment || difficulty);
  const visibleExercises = useMemo(
    () => (showAll ? filteredExercises : filteredExercises.slice(0, PREVIEW_COUNT)),
    [filteredExercises, showAll]
  );
  const hiddenCount = filteredExercises.length - visibleExercises.length;

  return (
    <Card>
      <CardBody>
        <Flex justify="space-between" align="baseline" gap={3} wrap="wrap">
          <Heading as="h2" size="md">Exercise library</Heading>
          <Text fontSize="sm" color="fg.muted">
            {filteredExercises.length === totalExercises
              ? `${totalExercises} exercises`
              : `${filteredExercises.length} of ${totalExercises} exercises`}
          </Text>
        </Flex>

        <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={3} mt={4} alignItems="end">
          <FilterSelect label="Muscle group" value={muscle} options={MUSCLES} onChange={onMuscleChange} />
          <FilterSelect label="Equipment" value={equipment} options={EQUIPMENT} onChange={onEquipmentChange} />
          <FilterSelect label="Difficulty" value={difficulty} options={DIFFICULTY} onChange={onDifficultyChange} />
        </SimpleGrid>
        {hasActiveFilters && (
          <Button size="sm" variant="link" mt={3} onClick={onClearFilters}>Clear filters</Button>
        )}

        {filteredExercises.length === 0 ? (
          <Text fontSize="sm" color="fg.muted" mt={6}>
            Nothing matches those filters. Try a different muscle group or equipment.
          </Text>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} columnGap={8} mt={4}>
            {visibleExercises.map((ex) => (
              <Box key={`${ex.name}-${ex.equipment}-${ex.difficulty}`} py={3} borderTopWidth="1px" borderColor="border">
                <Flex justify="space-between" gap={3} align="baseline">
                  <Text fontWeight="700">{ex.name}</Text>
                  {ex.videoUrl && (
                    <Link href={ex.videoUrl} isExternal fontSize="sm" flexShrink={0} textDecoration="underline" textUnderlineOffset="3px">
                      Demo
                    </Link>
                  )}
                </Flex>
                <Text fontSize="sm" color="fg.muted">
                  {[ex.muscleGroup, ex.equipment, ex.difficulty && ex.difficulty.toLowerCase()].filter(Boolean).join(', ')}
                </Text>
                {ex.notes && <Text fontSize="sm" mt={1}>{ex.notes}</Text>}
              </Box>
            ))}
          </SimpleGrid>
        )}

        {(hiddenCount > 0 || showAll) && filteredExercises.length > PREVIEW_COUNT && (
          <Button size="sm" variant="outline" mt={4} onClick={() => setShowAll((prev) => !prev)}>
            {showAll ? 'Show fewer' : `Show ${hiddenCount} more`}
          </Button>
        )}
      </CardBody>
    </Card>
  );
}
