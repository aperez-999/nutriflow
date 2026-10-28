import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  IconButton,
  Input,
  Select,
  Stack,
  Text,
  Textarea,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { FiX } from 'react-icons/fi';
import { deleteCoachNote, getCoachNotes, updateAbout } from '../../services/api';
import { handleApiError } from '../../utils/apiErrorHandler';

// Same lists the API accepts (backend/models/User.js).
const GOALS = ['Lose fat', 'Build muscle', 'Get stronger', 'Train for an event', 'Feel better'];
const DIETS = ['Vegetarian', 'Vegan', 'Pescatarian', 'Halal', 'Kosher', 'Gluten-free', 'Dairy-free', 'No nuts'];

const fromAccount = (about = {}) => ({
  goal: about.goal || '',
  diet: about.diet || [],
  injuries: about.injuries || '',
  note: about.note || '',
});

/** Settings → Your coach: what the coach should know, and what it has remembered from chats. */
export default function YourCoach({ about, toast, onSaved }) {
  const [form, setForm] = useState(() => fromAccount(about));
  const [isSaving, setIsSaving] = useState(false);
  const [notes, setNotes] = useState(null);

  useEffect(() => {
    let active = true;
    getCoachNotes()
      .then((loaded) => active && setNotes(loaded))
      .catch(() => active && setNotes([]));
    return () => { active = false; };
  }, []);

  const toggleDiet = (diet) => setForm((prev) => ({
    ...prev,
    diet: prev.diet.includes(diet) ? prev.diet.filter((d) => d !== diet) : [...prev.diet, diet],
  }));

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await updateAbout(form);
      onSaved(response.user);
      toast({ title: 'Your coach has it', status: 'success', duration: 2500, isClosable: true });
    } catch (error) {
      handleApiError(error, 'saving that', toast);
    } finally {
      setIsSaving(false);
    }
  };

  const handleForget = async (note) => {
    setNotes((prev) => prev.filter((n) => n._id !== note._id));
    try {
      await deleteCoachNote(note._id);
    } catch (error) {
      setNotes((prev) => [note, ...prev]);
      handleApiError(error, 'removing that note', toast);
    }
  };

  return (
    <Stack spacing={8}>
      <Stack as="form" spacing={4} onSubmit={handleSave}>
        <FormControl>
          <FormLabel>Training for</FormLabel>
          <Select value={form.goal} onChange={(e) => setForm((prev) => ({ ...prev, goal: e.target.value }))} placeholder="Choose one">
            {GOALS.map((goal) => <option key={goal} value={goal}>{goal}</option>)}
          </Select>
        </FormControl>
        <FormControl as="fieldset">
          <FormLabel as="legend">How you eat</FormLabel>
          <Wrap spacing={2}>
            {DIETS.map((diet) => {
              const selected = form.diet.includes(diet);
              return (
                <WrapItem key={diet}>
                  <Button
                    size="sm"
                    variant="outline"
                    aria-pressed={selected}
                    onClick={() => toggleDiet(diet)}
                    bg={selected ? 'fg' : 'bg.surface'}
                    color={selected ? 'bg.surface' : 'fg'}
                    borderColor={selected ? 'fg' : 'border'}
                    _hover={{ bg: selected ? 'fg' : 'bg.muted' }}
                  >
                    {diet}
                  </Button>
                </WrapItem>
              );
            })}
          </Wrap>
        </FormControl>
        <FormControl>
          <FormLabel>Injuries or limits</FormLabel>
          <Input
            value={form.injuries}
            maxLength={200}
            placeholder="Left knee, no jumping"
            onChange={(e) => setForm((prev) => ({ ...prev, injuries: e.target.value }))}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Anything else</FormLabel>
          <Textarea
            value={form.note}
            maxLength={300}
            rows={3}
            placeholder="I train before work and hate oatmeal."
            onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
          />
          <FormHelperText color="fg.muted">Your coach reads this before every answer and plan.</FormHelperText>
        </FormControl>
        <Box>
          <Button type="submit" isLoading={isSaving}>Save</Button>
        </Box>
      </Stack>

      <Box>
        <Text fontWeight="600" fontSize="sm">What your coach remembers</Text>
        <Text fontSize="sm" color="fg.muted" mt={1}>
          Things you told it in chats. Remove anything that is wrong or that you would rather it forgot.
        </Text>
        {notes === null ? null : notes.length === 0 ? (
          <Text fontSize="sm" color="fg.muted" mt={3}>Nothing yet. Mention a diet, an injury or your schedule in a chat and it will keep it.</Text>
        ) : (
          <Stack spacing={0} mt={3} borderWidth="1px" borderColor="border" borderRadius="md">
            {notes.map((note, index) => (
              <Flex key={note._id} align="center" justify="space-between" gap={3} px={3} py={2} borderTopWidth={index ? '1px' : 0} borderColor="border">
                <Text fontSize="sm">{note.text}</Text>
                <IconButton
                  size="sm"
                  variant="ghost"
                  icon={<FiX />}
                  aria-label={`Forget: ${note.text}`}
                  onClick={() => handleForget(note)}
                />
              </Flex>
            ))}
          </Stack>
        )}
      </Box>
    </Stack>
  );
}
