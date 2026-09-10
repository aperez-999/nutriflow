import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Container,
  Divider,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  SimpleGrid,
  Switch,
  Text,
  VStack,
  useColorMode,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { FiBell, FiLock, FiMoon, FiSave, FiUser } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';
import { changePassword, updateProfile } from '../services/api';
import { handleApiError } from '../utils/apiErrorHandler';

const getAccount = (user) => user?.user || user?.result || user || {};

function ProfileSettings() {
  const { user, updateUser } = useContext(AuthContext);
  const account = getAccount(user);
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');
  const surfaceBg = useColorModeValue('gray.50', 'whiteAlpha.50');

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

  const accountStats = useMemo(
    () => [
      { label: 'Theme', value: colorMode === 'light' ? 'Light' : 'Dark' },
      { label: 'Notifications', value: profileForm.notificationsEnabled ? 'Enabled' : 'Disabled' },
      { label: 'Account Email', value: account.email || 'Not available' },
    ],
    [account.email, colorMode, profileForm.notificationsEnabled]
  );

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

  return (
    <Box minH="100vh">
      <Container maxW="container.xl" py={{ base: 6, md: 8 }} px={{ base: 4, md: 6 }}>
        <VStack spacing={8} align="stretch">
          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="2xl" boxShadow="lg">
            <CardBody p={{ base: 6, md: 8 }}>
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} alignItems="center">
                <HStack spacing={5} align="start">
                  <Avatar size="xl" name={account.username || 'User'} bg="teal.500" color="white" />
                  <VStack align="start" spacing={2}>
                    <Badge colorScheme="teal" borderRadius="full" px={3} py={1}>
                      Account Center
                    </Badge>
                    <Heading size="lg">Profile & Settings</Heading>
                    <Text color={mutedColor} maxW="xl">
                      Manage your account details, security, and a few personal preferences from one clean workspace.
                    </Text>
                    <Text fontSize="sm" color={mutedColor}>
                      Signed in as {account.email || 'your account'}
                    </Text>
                  </VStack>
                </HStack>

                <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4}>
                  {accountStats.map((item) => (
                    <Box key={item.label} p={4} borderWidth="1px" borderColor={borderColor} borderRadius="xl" bg={surfaceBg}>
                      <Text fontSize="xs" color={mutedColor} textTransform="uppercase" letterSpacing="widest" mb={1}>
                        {item.label}
                      </Text>
                      <Text fontSize="md" fontWeight="700" noOfLines={1}>
                        {item.value}
                      </Text>
                    </Box>
                  ))}
                </SimpleGrid>
              </SimpleGrid>
            </CardBody>
          </Card>

          <SimpleGrid columns={{ base: 1, xl: 3 }} spacing={6} alignItems="start">
            <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="2xl" boxShadow="sm" gridColumn={{ base: 'auto', xl: 'span 2' }}>
              <CardBody p={{ base: 5, md: 6 }}>
                <VStack align="stretch" spacing={5}>
                  <HStack spacing={3}>
                    <Box as={FiUser} color="teal.400" boxSize={5} />
                    <Heading size="md">Account Details</Heading>
                  </HStack>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl>
                      <FormLabel>Display Name</FormLabel>
                      <Input
                        value={profileForm.username}
                        onChange={(e) => handleProfileChange('username', e.target.value)}
                        placeholder="Your display name"
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Email</FormLabel>
                      <Input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => handleProfileChange('email', e.target.value)}
                        placeholder="you@example.com"
                      />
                    </FormControl>
                  </SimpleGrid>

                  <Divider />

                  <HStack spacing={3}>
                    <Box as={FiBell} color="blue.400" boxSize={5} />
                    <Heading size="sm">Preferences</Heading>
                  </HStack>
                  <Box p={4} borderWidth="1px" borderColor={borderColor} borderRadius="xl" bg={surfaceBg}>
                    <VStack align="stretch" spacing={4}>
                      <HStack justify="space-between" align="center">
                        <Box>
                          <Text fontWeight="600">Notifications</Text>
                          <Text fontSize="sm" color={mutedColor}>
                            Keep lightweight account notifications enabled for important updates.
                          </Text>
                        </Box>
                        <Switch
                          colorScheme="teal"
                          isChecked={profileForm.notificationsEnabled}
                          onChange={(e) => handleProfileChange('notificationsEnabled', e.target.checked)}
                        />
                      </HStack>

                      <HStack justify="space-between" align="center">
                        <Box>
                          <Text fontWeight="600">Dark Mode</Text>
                          <Text fontSize="sm" color={mutedColor}>
                            Toggle the app color theme to match your workspace preference.
                          </Text>
                        </Box>
                        <Button
                          variant="outline"
                          leftIcon={<FiMoon />}
                          onClick={toggleColorMode}
                          borderRadius="full"
                        >
                          {colorMode === 'light' ? 'Enable Dark' : 'Enable Light'}
                        </Button>
                      </HStack>
                    </VStack>
                  </Box>

                  <HStack justify="flex-end">
                    <Button
                      colorScheme="teal"
                      leftIcon={<FiSave />}
                      onClick={handleSaveProfile}
                      isLoading={isSavingProfile}
                    >
                      Save Profile Changes
                    </Button>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>

            <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="2xl" boxShadow="sm">
              <CardBody p={{ base: 5, md: 6 }}>
                <VStack align="stretch" spacing={5}>
                  <HStack spacing={3}>
                    <Box as={FiLock} color="orange.400" boxSize={5} />
                    <Heading size="md">Security</Heading>
                  </HStack>
                  <Text fontSize="sm" color={mutedColor}>
                    Update your password to keep your account secure.
                  </Text>

                  <FormControl>
                    <FormLabel>Current Password</FormLabel>
                    <Input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>New Password</FormLabel>
                    <Input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Confirm New Password</FormLabel>
                    <Input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    />
                  </FormControl>

                  <Button
                    colorScheme="orange"
                    onClick={handleSavePassword}
                    isLoading={isSavingPassword}
                  >
                    Update Password
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
}

export default ProfileSettings;
