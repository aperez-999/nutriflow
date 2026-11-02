import { Box, Container, Heading, ListItem, Text, UnorderedList, VStack } from '@chakra-ui/react';
import PageBand from '../Global/PageBand';

/**
 * The layout the privacy policy and terms share: a band, then sections of plain
 * text. A section's `body` is a paragraph, or a list when it's an array.
 */
export default function LegalPage({ title, description, updated, sections }) {
  return (
    <Box>
      <PageBand maxW="4xl" title={title} description={description} />
      <Container maxW="4xl" px={{ base: 4, md: 6 }} py={{ base: 8, md: 10 }}>
        <VStack spacing={8} align="start">
          <Text fontSize="sm" color="fg.muted">Last updated {updated}</Text>
          {sections.map((section) => (
            <Box key={section.title} as="section">
              <Heading as="h2" size="md" mb={3}>{section.title}</Heading>
              {section.intro && <Text mb={2}>{section.intro}</Text>}
              {Array.isArray(section.body) ? (
                <UnorderedList spacing={2} pl={1}>
                  {section.body.map((item) => <ListItem key={item}>{item}</ListItem>)}
                </UnorderedList>
              ) : (
                <Text>{section.body}</Text>
              )}
            </Box>
          ))}
        </VStack>
      </Container>
    </Box>
  );
}
