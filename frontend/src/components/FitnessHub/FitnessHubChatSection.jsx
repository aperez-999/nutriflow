import { forwardRef } from 'react';
import { Box } from '@chakra-ui/react';
import AIFitnessChat from './AIFitnessChat/index.jsx';

// Forwards the chat's handle ({ send, clear }) so the page can ask questions from outside it.
const FitnessHubChatSection = forwardRef(function FitnessHubChatSection(
  { userWorkouts = [], userDiets = [], initialPrompt, onPromptConsumed },
  ref
) {
  return (
    <Box w="100%" h="100%" minH={0}>
      <AIFitnessChat
        ref={ref}
        userWorkouts={userWorkouts}
        userDiets={userDiets}
        initialPrompt={initialPrompt}
        onPromptConsumed={onPromptConsumed}
      />
    </Box>
  );
});

export default FitnessHubChatSection;
