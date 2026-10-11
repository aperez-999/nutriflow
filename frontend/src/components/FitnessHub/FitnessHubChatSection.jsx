import { Box } from '@chakra-ui/react';
import AIFitnessChat from './AIFitnessChat/index.jsx';

export default function FitnessHubChatSection({ userWorkouts = [], userDiets = [], toast, initialPrompt, onPromptConsumed }) {
  return (
    <Box w="100%" h="100%" minH={0}>
      <AIFitnessChat
        userWorkouts={userWorkouts}
        userDiets={userDiets}
        toast={toast}
        initialPrompt={initialPrompt}
        onPromptConsumed={onPromptConsumed}
      />
    </Box>
  );
}
