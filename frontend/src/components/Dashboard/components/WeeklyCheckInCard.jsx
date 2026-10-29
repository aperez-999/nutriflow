import { useCallback, useEffect, useState } from 'react';
import { Box, Button, Card, CardBody, Flex, FormControl, FormLabel, Heading, Input, InputGroup, InputRightAddon, Progress, Stack, Text } from '@chakra-ui/react';
import { getEnergy, saveWeighIn, updateGoals } from '../../../services/api';
import { getTodayDayKey } from '../../../utils/dateUtils';
import { handleApiError } from '../../../utils/apiErrorHandler';

const fmtChange = (kg) => (Math.abs(kg) < 0.1 ? 'steady' : `${kg > 0 ? '+' : '−'}${Math.abs(kg)} kg a week`);

/**
 * The weekly check-in, the same as the app's: log today's weight, see the trend, and once there
 * are about two weeks of food and weigh-ins, what you burn and the calories for your goal.
 */
export default function WeeklyCheckInCard({ goals, toast, onGoalsSaved }) {
  const [energy, setEnergy] = useState(null);
  const [kg, setKg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(() => getEnergy().then(setEnergy).catch(() => setEnergy(null)), []);
  useEffect(() => { load(); }, [load]);

  const handleWeight = async (e) => {
    e.preventDefault();
    const value = Number(kg);
    if (!(value >= 25 && value <= 350)) return;
    setIsSaving(true);
    try {
      await saveWeighIn(getTodayDayKey(), Math.round(value * 10) / 10);
      setKg('');
      toast({ title: 'Weight saved', status: 'success', duration: 2000, isClosable: true });
      await load();
    } catch (error) {
      handleApiError(error, 'saving your weight', toast);
    } finally {
      setIsSaving(false);
    }
  };

  const useSuggestion = async () => {
    setIsSaving(true);
    try {
      const response = await updateGoals({ ...goals, dailyCalories: energy.suggestion.calories });
      onGoalsSaved(response.user);
      await load();
    } catch (error) {
      handleApiError(error, 'saving your target', toast);
    } finally {
      setIsSaving(false);
    }
  };

  const ready = energy?.status === 'ready';
  return (
    <Card h="100%">
      <CardBody display="flex" flexDirection="column" gap={4}>
        <Heading as="h2" size="md">Weekly check-in</Heading>
        {energy?.trendKg && (
          <Flex align="baseline" gap={2}>
            <Text fontFamily="heading" fontSize="3xl" lineHeight="1">{energy.trendKg} kg</Text>
            {ready && <Text fontSize="sm" color="fg.muted">{fmtChange(energy.weeklyChangeKg)}</Text>}
          </Flex>
        )}
        {energy && <Text fontSize="sm">{energy.line}</Text>}
        {ready && energy.suggestion?.differs && (
          <Box>
            <Button size="sm" variant="outline" onClick={useSuggestion} isLoading={isSaving}>
              Use {energy.suggestion.calories.toLocaleString()} kcal a day
            </Button>
            <Text fontSize="xs" color="fg.muted" mt={2}>Now {goals.dailyCalories.toLocaleString()} kcal. Your verdict still moves the carbs each day.</Text>
          </Box>
        )}
        {energy && !ready && (
          <Stack spacing={2}>
            {[
              ['Weigh-ins', energy.progress.weighIns, energy.progress.needs.weighIns],
              ['Days of food logged', energy.progress.foodDays, energy.progress.needs.foodDays],
            ].map(([label, value, needed]) => (
              <Box key={label}>
                <Flex justify="space-between" fontSize="xs" color="fg.muted" mb={1}>
                  <Text>{label}</Text>
                  <Text>{Math.min(value, needed)} of {needed}</Text>
                </Flex>
                <Progress value={(Math.min(value, needed) / needed) * 100} size="xs" colorScheme="green" borderRadius="full" aria-label={label} />
              </Box>
            ))}
          </Stack>
        )}
        <Box as="form" onSubmit={handleWeight} mt="auto">
          <FormControl>
            <FormLabel fontSize="sm">Today’s weight</FormLabel>
            <Flex gap={2}>
              <InputGroup size="sm">
                <Input type="number" inputMode="decimal" step="0.1" min={25} max={350} value={kg} onChange={(e) => setKg(e.target.value)} placeholder="76.4" />
                <InputRightAddon>kg</InputRightAddon>
              </InputGroup>
              <Button type="submit" size="sm" isLoading={isSaving} isDisabled={!kg}>Save</Button>
            </Flex>
          </FormControl>
        </Box>
      </CardBody>
    </Card>
  );
}
