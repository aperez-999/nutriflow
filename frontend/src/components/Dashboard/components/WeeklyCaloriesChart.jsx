import { Box, Card, CardBody, Flex, Heading, Text } from '@chakra-ui/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { CountUp } from '../../Motion';

const AXIS_TICK = { fontSize: 12, fill: 'var(--chakra-colors-fg-muted)' };

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { dayName, calories } = payload[0].payload;
  return (
    <Box bg="bg.surface" borderWidth="1px" borderColor="border" borderRadius="md" px={3} py={2} boxShadow="overlay">
      <Text fontSize="xs" color="fg.muted">{dayName}</Text>
      <Text fontSize="sm" fontWeight="700">{calories.toLocaleString()} kcal</Text>
    </Box>
  );
}

/**
 * Bar chart of calories logged for the last 7 days against the daily goal.
 */
export default function WeeklyCaloriesChart({ data = [], goal = 0 }) {
  const loggedDays = data.filter((d) => d.calories > 0);
  const average = loggedDays.length
    ? Math.round(loggedDays.reduce((sum, d) => sum + d.calories, 0) / loggedDays.length)
    : 0;
  // Keep the goal line in view even on light days, with round 500 kcal ticks.
  const yMax = Math.max(500, Math.ceil(Math.max(...data.map((d) => d.calories), goal * 1.1) / 500) * 500);
  const yTicks = Array.from({ length: yMax / 500 + 1 }, (_, i) => i * 500);

  return (
    <Card h="100%">
      <CardBody display="flex" flexDirection="column">
        <Flex justify="space-between" align="flex-start" mb={4} gap={4}>
          <Box>
            <Heading as="h2" size="md">Fuel this week</Heading>
            <Text fontSize="sm" color="fg.muted" mt={1}>Calories per day, dashed line is your goal.</Text>
          </Box>
          <Box textAlign="right">
            <Text textStyle="figure" fontSize="4xl"><CountUp value={average} /></Text>
            <Text fontSize="xs" color="fg.muted">avg on logged days</Text>
          </Box>
        </Flex>
        <Box width="100%" flex="1" minH="220px">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 4, left: -12, bottom: 0 }} barCategoryGap="28%">
              <CartesianGrid stroke="var(--chakra-colors-border)" vertical={false} />
              <XAxis dataKey="dayName" tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <YAxis
                tick={AXIS_TICK}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                width={48}
                domain={[0, yMax]}
                ticks={yTicks}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--chakra-colors-bg-muted)' }} />
              {goal > 0 && (
                <ReferenceLine y={goal} stroke="var(--chakra-colors-fg-muted)" strokeDasharray="4 4" strokeWidth={1.5} />
              )}
              <Bar dataKey="calories" radius={[4, 4, 0, 0]} maxBarSize={36} fill="var(--chakra-colors-fuel-solid)" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardBody>
    </Card>
  );
}
