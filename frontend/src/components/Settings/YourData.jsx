import { useState } from 'react';
import {
  Button,
  FormControl,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import PasswordInput from '../Auth/PasswordInput';
import { deleteMyAccount, exportMyData } from '../../services/api';
import { handleApiError } from '../../utils/apiErrorHandler';

/** Saves a JSON object as a file download in the browser. */
const downloadJson = (data, filename) => {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  const link = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

/** Settings → Your data: download everything, or delete the account for good. */
export default function YourData({ toast, onDeleted }) {
  const confirm = useDisclosure();
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await exportMyData();
      downloadJson(data, `nutriflow-data-${new Date().toISOString().slice(0, 10)}.json`);
    } catch (err) {
      handleApiError(err, 'downloading your data', toast);
    } finally {
      setIsExporting(false);
    }
  };

  const closeConfirm = () => {
    setPassword('');
    setError('');
    confirm.onClose();
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    setIsDeleting(true);
    setError('');
    try {
      await deleteMyAccount(password);
      onDeleted();
    } catch (err) {
      setError(err?.message || 'Your account could not be deleted. Try again.');
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Stack spacing={5}>
        <div>
          <Text fontSize="sm">Every meal, workout, check-in, saved plan and chat message, as one JSON file.</Text>
          <Button variant="outline" mt={3} onClick={handleExport} isLoading={isExporting} loadingText="Preparing">
            Download my data
          </Button>
        </div>
        <div>
          <Text fontSize="sm">Deletes your account and everything in it, on every device. This cannot be undone.</Text>
          <Button variant="outline" color="danger.fg" borderColor="danger.fg" mt={3} onClick={confirm.onOpen}>
            Delete account
          </Button>
        </div>
      </Stack>

      <Modal isOpen={confirm.isOpen} onClose={closeConfirm} isCentered>
        <ModalOverlay />
        <ModalContent as="form" onSubmit={handleDelete} mx={4}>
          <ModalHeader>Delete your account?</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize="sm" color="fg.muted">
              Your meals, workouts, check-ins, saved plans and chats are deleted with it. Download your data first if
              you want a copy.
            </Text>
            <FormControl mt={5} isRequired isInvalid={Boolean(error)}>
              <FormLabel>Your password</FormLabel>
              <PasswordInput
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                autoFocus
              />
              {error && <Text fontSize="sm" color="danger.fg" mt={2} role="alert">{error}</Text>}
            </FormControl>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button variant="ghost" onClick={closeConfirm}>Cancel</Button>
            <Button type="submit" colorScheme="red" isLoading={isDeleting} loadingText="Deleting" isDisabled={!password}>
              Delete account
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
