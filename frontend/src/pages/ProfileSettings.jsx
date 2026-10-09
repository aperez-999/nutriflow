import { useContext, useEffect, useState } from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Container,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Switch,
  Text,
  VStack,
  useColorMode,
  useToast,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { changePassword, updateProfile } from '../services/api';
import { handleApiError } from '../utils/apiErrorHandler';
import PasswordInput from '../components/Auth/PasswordInput';
import PageBand from '../components/Global/PageBand';

const getAccount = (user) => user?.user || user?.result || user || {};

function ProfileSettings() {
  const { user, updateUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const account = getAccount(user);
  const toast = useToast();
  const { colorMode, setColorMode } = useColorMode();

  const [profileForm, setProfileForm] = useState({
    username: account.username || '',
    email: account.email || '',
    notificationsEnabled: account.preferences?.notificationsEnabled ?? true,
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    setProfileForm({
      username: account.username || '',
      email: account.email || '',
      notificationsEnabled: account.preferences?.notificationsEnabled ?? true,
    });
  }, [account.email, account.preferences?.notificationsEnabled, account.username]);

  const handleProfileChange = (field, value) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const response = await updateProfile({
        username: profileForm.username,
        email: profileForm.email,
        preferences: {
          notificationsEnabled: profileForm.notificationsEnabled,
        },
      });

      updateUser({
        ...user,
        user: response.user,
      });

      toast({
        title: 'Profile updated',
        description: 'Your account details were saved successfully.',
        status: 'success',
        duration: 2500,
        isClosable: true,
      });
    } catch (error) {
      handleApiError(error, 'updating profile', toast);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSavePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure the new password fields match.',
        status: 'warning',
        duration: 2500,
        isClosable: true,
      });
      return;
    }

    setIsSavingPassword(true);
    try {
      const response = await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      toast({
        title: 'Password updated',
        description: response.message || 'Your password was updated successfully.',
        status: 'success',
        duration: 2500,
        isClosable: true,
      });
    } catch (error) {
      handleApiError(error, 'changing password', toast);
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const passwordMismatch = Boolean(passwordForm.confirmPassword) && passwordForm.newPassword !== passwordForm.confirmPassword;

  return (
    <Box>
      <PageBand title="Settings" description={`Signed in as ${account.email}`} />
      <Container maxW="880px" px={{ base: 4, md: 6 }} py={{ base: 2, md: 4 }}>
        <Box>
          <SettingsSection title="Profile" description="How you appear in the app.">
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Name</FormLabel>
                <Input value={profileForm.username} autoComplete="nickname" onChange={(e) => handleProfileChange('username', e.target.value)} />
              </FormControl>
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input type="email" value={profileForm.email} autoComplete="email" onChange={(e) => handleProfileChange('email', e.target.value)} />
              </FormControl>
              <Flex justify="space-between" align="center" gap={4}>
                <Box>
                  <Text fontWeight="600" fontSize="sm">Account notifications</Text>
                  <Text fontSize="sm" color="fg.muted">Emails about your account, like password changes.</Text>
                </Box>
                <Switch
                  colorScheme="gray"
                  isChecked={profileForm.notificationsEnabled}
                  onChange={(e) => handleProfileChange('notificationsEnabled', e.target.checked)}
                  aria-label="Account notifications"
                />
              </Flex>
              <Box>
                <Button onClick={handleSaveProfile} isLoading={isSavingProfile}>Save profile</Button>
              </Box>
            </VStack>
          </SettingsSection>

          <SettingsSection title="Appearance" description="Follows your device until you choose.">
            <ButtonGroup isAttached size="sm" variant="outline" role="radiogroup" aria-label="Theme">
              {['light', 'dark'].map((mode) => (
                <Button
                  key={mode}
                  role="radio"
                  aria-checked={colorMode === mode}
                  onClick={() => setColorMode(mode)}
                  bg={colorMode === mode ? 'fg' : 'bg.surface'}
                  color={colorMode === mode ? 'bg.surface' : 'fg'}
                  borderColor={colorMode === mode ? 'fg' : 'border'}
                  _hover={{ bg: colorMode === mode ? 'fg' : 'bg.muted' }}
                  minW="88px"
                >
                  {mode === 'light' ? 'Light' : 'Dark'}
                </Button>
              ))}
            </ButtonGroup>
          </SettingsSection>

          <SettingsSection title="Password" description="Use at least 6 characters.">
            <VStack spacing={4} align="stretch" as="form" onSubmit={(e) => { e.preventDefault(); handleSavePassword(); }}>
              <FormControl isRequired>
                <FormLabel>Current password</FormLabel>
                <PasswordInput autoComplete="current-password" value={passwordForm.currentPassword} onChange={(e) => handlePasswordChange('currentPassword', e.target.value)} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>New password</FormLabel>
                <PasswordInput autoComplete="new-password" minLength={6} value={passwordForm.newPassword} onChange={(e) => handlePasswordChange('newPassword', e.target.value)} />
              </FormControl>
              <FormControl isRequired isInvalid={passwordMismatch}>
                <FormLabel>Confirm new password</FormLabel>
                <PasswordInput autoComplete="new-password" value={passwordForm.confirmPassword} onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)} />
                <FormErrorMessage>The passwords don’t match.</FormErrorMessage>
              </FormControl>
              <Box>
                <Button type="submit" variant="outline" isLoading={isSavingPassword} isDisabled={passwordMismatch}>Update password</Button>
              </Box>
            </VStack>
          </SettingsSection>

          <SettingsSection title="Session" description="Log out of NutriFlow on this device.">
            <Button variant="outline" onClick={handleLogout}>Log out</Button>
          </SettingsSection>
        </Box>
      </Container>
    </Box>
  );
}

function SettingsSection({ title, description, children }) {
  return (
    <Box display="grid" gridTemplateColumns={{ base: '1fr', md: '220px 1fr' }} gap={{ base: 3, md: 10 }} py={8} borderBottomWidth="1px" borderColor="border">
      <Box>
        <Heading as="h2" size="sm">{title}</Heading>
        <Text fontSize="sm" color="fg.muted" mt={1}>{description}</Text>
      </Box>
      <Box>{children}</Box>
    </Box>
  );
}

export default ProfileSettings;
