import React from 'react';
import {
  Box,
  Card,
  CardBody,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

const cardStyles = {
  borderRadius: 'xl',
  boxShadow: 'sm',
  borderWidth: '1px',
  _hover: {
    transform: 'translateY(-2px)',
    boxShadow: 'lg',
  },
  transition: 'all 0.2s ease',
};

/**
 * Bar chart of calories logged for the last 7 days.
 */
export default function WeeklyCaloriesChart({ data = [] }) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const axisStroke = useColorModeValue('#718096', '#A0AEC0');

  return (
    <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} {...cardStyles}>
      <CardBody>
        <Text fontSize="sm" fontWeight="600" color={textColor} letterSpacing="wider" mb={4}>
          WEEKLY NUTRITION
        </Text>
        <Box width="100%" height="260px">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} vertical={false} />
              <XAxis dataKey="dayName" tick={{ fontSize: 12 }} stroke={axisStroke} />
              <YAxis tick={{ fontSize: 12 }} stroke={axisStroke} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: 'md',
                  padding: '8px 12px',
                  border: '1px solid',
                  borderColor,
                  background: cardBg,
                }}
                labelStyle={{ color: textColor }}
                formatter={(value) => [`${value} cal`, 'Calories']}
                labelFormatter={(label) => `Day: ${label}`}
              />
              <Bar dataKey="calories" radius={[6, 6, 0, 0]} maxBarSize={48} fill="#38B2AC" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardBody>
    </Card>
  );
}
