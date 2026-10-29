import { useRef, useState } from 'react';
import { Avatar, Button, Flex, Input, Stack, Text } from '@chakra-ui/react';
import { deleteAvatar, uploadAvatar } from '../../services/api';
import useAvatarUrl from '../../utils/useAvatarUrl';
import { handleApiError } from '../../utils/apiErrorHandler';

/** A picked image as a 256 px square JPEG (the centre of it), base64 without the data: prefix. */
const squareJpeg = (file) => new Promise((resolve, reject) => {
  const url = URL.createObjectURL(file);
  const image = new Image();
  image.onload = () => {
    const side = Math.min(image.width, image.height);
    const canvas = Object.assign(document.createElement('canvas'), { width: 256, height: 256 });
    canvas.getContext('2d').drawImage(image, (image.width - side) / 2, (image.height - side) / 2, side, side, 0, 0, 256, 256);
    URL.revokeObjectURL(url);
    resolve(canvas.toDataURL('image/jpeg', 0.8).split(',')[1]);
  };
  image.onerror = () => {
    URL.revokeObjectURL(url);
    reject(new Error('That image could not be opened.'));
  };
  image.src = url;
});

/** Settings → Profile: your photo, as the app shows it. */
export default function ProfilePhoto({ account, toast, onSaved }) {
  const input = useRef(null);
  const src = useAvatarUrl(account);
  const [isSaving, setIsSaving] = useState(false);

  const save = async (work) => {
    setIsSaving(true);
    try {
      const response = await work();
      onSaved(response.user);
    } catch (error) {
      handleApiError(error, 'saving your photo', toast);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFile = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) save(async () => uploadAvatar(await squareJpeg(file)));
  };

  return (
    <Flex align="center" gap={4}>
      <Avatar size="lg" name={account.username} src={src || undefined} bg="fg" color="bg.surface" />
      <Stack spacing={2}>
        <Flex gap={2} wrap="wrap">
          <Button size="sm" variant="outline" onClick={() => input.current?.click()} isLoading={isSaving}>
            {account.avatarUpdatedAt ? 'Change photo' : 'Add a photo'}
          </Button>
          {account.avatarUpdatedAt && (
            <Button size="sm" variant="ghost" onClick={() => save(deleteAvatar)} isDisabled={isSaving}>Remove</Button>
          )}
        </Flex>
        <Text fontSize="xs" color="fg.muted">Shown in the app and here. A square crop of the middle.</Text>
      </Stack>
      <Input ref={input} type="file" accept="image/jpeg,image/png" display="none" onChange={handleFile} aria-label="Choose a photo" />
    </Flex>
  );
}
