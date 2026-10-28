import { useContext, useEffect, useState } from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Container,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Grid,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Switch,
  Text,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { changePassword, updateGoals, updateProfile } from '../services/api';
import { handleApiError } from '../utils/apiErrorHandler';
import PasswordInput from '../components/Auth/PasswordInput';
import PageBand from '../components/Global/PageBand';
import useAppearance from '../theme/useAppearance';
import { isGuideHidden, setGuideHidden } from '../components/Dashboard/utils/onboarding';
import YourData from '../components/Settings/YourData';
import YourCoach from '../components/Settings/YourCoach';
import { forgetAccountOnDevice } from '../components/Auth/rememberedUser';

const getAccount = (user) => user?.user || user?.result || user || {};
const DEFAULT_GOALS = { dailyCalories: 2000, dailyProtein: 150, weeklyWorkouts: 5 };
// Same bounds the API enforces (backend/routes/authRoutes.js).
const GOAL_FIELDS = [
  { name: 'dailyCalories', label: 'Daily calories', unit: 'kcal', min: 800, max: 6000, flow: 'fuel' },
  { name: 'dailyProtein', label: 'Daily protein', unit: 'g', min: 20, max: 400, flow: 'fuel' },
  { name: 'weeklyWorkouts', label: 'Workouts per week', unit: 'sessions', min: 0, max: 14, flow: 'train' },
];
const APPEARANCE = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'Follow device' },
];

function SettingsSection({ id, title, description, children }) {
  return (
    <Box
      id={id}
      scrollMarginTop="88px"
      display="grid"
      gridTemplateColumns={{ base: '1fr', md: '220px 1fr' }}
      gap={{ base: 3, md: 10 }}
      py={8}
      borderBottomWidth="1px"
      borderColor="border"
    >
      <Box>
        <Heading as="h2" size="sm">{title}</Heading>
        <Text fontSize="sm" color="fg.muted" mt={1}>{description}</Text>
      </Box>
      <Box>{children}</Box>
    </Box>
  );
}

function Segmented({ label, options, value, onChange }) {
  return (
    <ButtonGroup isAttached size="sm" variant="outline" role="radiogroup" aria-label={label} flexWrap="wrap">
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <Button
            key={option.value}
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            bg={selected ? 'fg' : 'bg.surface'}
            color={selected ? 'bg.surface' : 'fg'}
            borderColor={selected ? 'fg' : 'border'}
            _hover={{ bg: selected ? 'fg' : 'bg.muted' }}
            minW="88px"
          >
            {option.label}
          </Button>
        );
      })}
    </ButtonGroup>
  );
}

function Settings() {
  const { user, updateUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const account = getAccount(user);
  const toast = useToast();
  const [appearance, setAppearance] = useAppearance();

  const [profileForm, setProfileForm] = useState({
    username: account.username || '',
    email: account.email || '',
    notificationsEnabled: account.preferences?.notificationsEnabled ?? true,
  });
  const [goalsForm, setGoalsForm] = useState({ ...DEFAULT_GOALS, ...account.goals });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showGuide, setShowGuide] = useState(() => !isGuideHidden(account._id));
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingGoals, setIsSavingGoals] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    setProfileForm({
      username: account.username || '',
      email: account.email || '',
      notificationsEnabled: account.preferences?.notificationsEnabled ?? true,
    });
  }, [account.email, account.preferences?.notificationsEnabled, account.username]);

  // Links like /settings#goals land on that section.
  useEffect(() => {
    if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView({ block: 'start' });
  }, [location.hash]);

  const handleProfileChange = (field, value) => setProfileForm((prev) => ({ ...prev, [field]: value }));
  const handlePasswordChange = (field, value) => setPasswordForm((prev) => ({ ...prev, [field]: value }));

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const response = await updateProfile({
        username: profileForm.username,
        email: profileForm.email,
        preferences: { notificationsEnabled: profileForm.notificationsEnabled },
      });
      updateUser({ ...user, user: response.user });
      toast({ title: 'Profile saved', status: 'success', duration: 2500, isClosable: true });
    } catch (error) {
      handleApiError(error, 'updating profile', toast);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const goalErrors = Object.fromEntries(GOAL_FIELDS.map((field) => {
    const value = Number(goalsForm[field.name]);
    const ok = goalsForm[field.name] !== '' && Number.isInteger(value) && value >= field.min && value <= field.max;
    return [field.name, ok ? null : `Use a whole number from ${field.min} to ${field.max}.`];
  }));
  const goalsValid = Object.values(goalErrors).every((error) => !error);

  const handleSaveGoals = async (e) => {
    e.preventDefault();
    if (!goalsValid) return;
    setIsSavingGoals(true);
    try {
      const response = await updateGoals({
        dailyCalories: Number(goalsForm.dailyCalories),
        dailyProtein: Number(goalsForm.dailyProtein),
        weeklyWorkouts: Number(goalsForm.weeklyWorkouts),
      });
      updateUser({ ...user, user: response.user });
      toast({ title: 'Goals saved', status: 'success', duration: 2500, isClosable: true });
    } catch (error) {
      handleApiError(error, 'updating goals', toast);
    } finally {
      setIsSavingGoals(false);
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) return;
    setIsSavingPassword(true);
    try {
      const response = await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast({ title: response.message || 'Password updated', status: 'success', duration: 2500, isClosable: true });
    } catch (error) {
      handleApiError(error, 'changing password', toast);
    } finally {
      setIsSavingPassword(false);
    }
  };

  const toggleGuide = (visible) => {
    setShowGuide(visible);
    setGuideHidden(account._id, !visible);
  };

  const passwordMismatch = Boolean(passwordForm.confirmPassword) && passwordForm.newPassword !== passwordForm.confirmPassword;

  return (
    <Box>
      <PageBand title="Settings" description="Make NutriFlow fit how you train and eat." />
      <Container maxW="880px" px={{ base: 4, md: 6 }} py={{ base: 2, md: 4 }}>
        <SettingsSection id="goals" title="Goals" description="Your targets drive the dashboard bars, plans and advice.">
          <form onSubmit={handleSaveGoals}>
            <Grid templateColumns={{ base: '1fr', sm: 'repeat(3, 1fr)' }} gap={3}>
              {GOAL_FIELDS.map((field) => (
                <FormControl key={field.name} isInvalid={Boolean(goalErrors[field.name])}>
                  <FormLabel color={`${field.flow}.fg`}>{field.label}</FormLabel>
                  <InputGroup>
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={field.min}
                      max={field.max}
                      value={goalsForm[field.name]}
                      onChange={(e) => setGoalsForm((prev) => ({ ...prev, [field.name]: e.target.value }))}
                      pr="72px"
                    />
                    <InputRightElement pointerEvents="none" w="72px" color="fg.muted" fontSize="sm">{field.unit}</InputRightElement>
                  </InputGroup>
                  <FormErrorMessage>{goalErrors[field.name]}</FormErrorMessage>
                </FormControl>
              ))}
            </Grid>
            <Button type="submit" mt={4} isLoading={isSavingGoals} isDisabled={!goalsValid}>Save goals</Button>
          </form>
        </SettingsSection>

        <SettingsSection id="coach" title="Your coach" description="What it should know about you, and what it has remembered.">
          <YourCoach about={account.about} toast={toast} onSaved={(saved) => updateUser({ ...user, user: saved })} />
        </SettingsSection>

        <SettingsSection title="Appearance" description="Pick a mode, or let NutriFlow follow your device.">
          <Segmented label="Appearance" options={APPEARANCE} value={appearance} onChange={setAppearance} />
        </SettingsSection>

        <SettingsSection title="Today page" description="Choose what shows up on your dashboard.">
          <Flex justify="space-between" align="center" gap={4}>
            <Box>
              <Text fontWeight="600" fontSize="sm">Getting-started guide</Text>
              <Text fontSize="sm" color="fg.muted">Show the four first steps until you finish them.</Text>
            </Box>
            <Switch colorScheme="gray" isChecked={showGuide} onChange={(e) => toggleGuide(e.target.checked)} aria-label="Show getting-started guide" />
          </Flex>
        </SettingsSection>

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
                <Text fontWeight="600" fontSize="sm">Account emails</Text>
                <Text fontSize="sm" color="fg.muted">Messages about your account, like password changes.</Text>
              </Box>
              <Switch
                colorScheme="gray"
                isChecked={profileForm.notificationsEnabled}
                onChange={(e) => handleProfileChange('notificationsEnabled', e.target.checked)}
                aria-label="Account emails"
              />
            </Flex>
            <Box>
              <Button onClick={handleSaveProfile} isLoading={isSavingProfile}>Save profile</Button>
            </Box>
          </VStack>
        </SettingsSection>

        <SettingsSection title="Password" description="Use at least 6 characters.">
          <VStack spacing={4} align="stretch" as="form" onSubmit={handleSavePassword}>
            <FormControl isRequired>
              <FormLabel>Current password</FormLabel>
              <PasswordInput autoComplete="current-password" value={passwordForm.currentPassword} onChange={(e) => handlePasswordChange('currentPassword', e.target.value)} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>New password</FormLabel>
              <PasswordInput autoComplete="new-password" minLength={6} value={passwordForm.newPassword} onChange={(e) => handlePasswordChange('newPassword', e.target.value)} />
              <FormHelperText color="fg.muted">At least 6 characters.</FormHelperText>
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

        <SettingsSection id="data" title="Your data" description="It is yours: take a copy, or delete it all.">
          <YourData
            toast={toast}
            onDeleted={() => {
              forgetAccountOnDevice(account._id);
              logout();
              navigate('/', { replace: true });
              toast({ title: 'Your account was deleted', description: 'Everything in it is gone. Thanks for trying NutriFlow.', status: 'success', duration: 5000, isClosable: true });
            }}
          />
        </SettingsSection>

        <SettingsSection title="Session" description="Log out of NutriFlow on this device.">
          <Button variant="outline" onClick={() => { logout(); navigate('/login'); }}>Log out</Button>
        </SettingsSection>
      </Container>
    </Box>
  );
}

export default Settings;
