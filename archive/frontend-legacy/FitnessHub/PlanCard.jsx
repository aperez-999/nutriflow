import { Box, Text } from '@chakra-ui/react';

/**
 * Ordered overview of an AI-generated plan (one line per session or meal).
 */
export default function PlanCard({ title = 'Plan', items = [] }) {
  return (
    <Box borderWidth="1px" borderColor="border" borderRadius="control" px={4} py={3}>
      <Text fontSize="sm" fontWeight="700">{title}</Text>
      <Box as="ol" pl={5} mt={1}>
        {items.map((item, index) => (
          <Text as="li" key={`${item}-${index}`} fontSize="sm" color="fg.muted" py={0.5}>{item}</Text>
        ))}
      </Box>
    </Box>
  );
}
