import LegalPage from './LegalPage';

const SECTIONS = [
  {
    title: 'What NutriFlow stores',
    body: [
      'Your account: name, email, and either a password (stored only as a bcrypt hash) or the link to your Google account if you sign in with Google.',
      'What you log: meals, workouts, morning check-ins, weigh-ins, and the goals and body details you enter.',
      'What you tell the coach: your conversations, your “about you” notes, the short notes the coach keeps, and plans you save.',
      'A profile photo, if you add one. It is cropped to a small square before it is uploaded.',
    ],
  },
  {
    title: 'What it is used for',
    body: 'Only to run NutriFlow for you: your daily verdict, targets, charts and coach answers come from your own logs. There are no ads, no analytics or tracking scripts, and your data is never sold or shared for marketing.',
  },
  {
    title: 'Services that handle your data',
    intro: 'A few outside services are needed to run the site. Each gets only what its job requires:',
    body: [
      'MongoDB Atlas stores the database, and Vercel hosts the site and its server.',
      'Groq runs the AI coach. Your message and a short summary of your recent logs are sent with each question.',
      'The USDA food database and Open Food Facts receive the foods you search for and barcodes you look up, never who you are.',
      'Google receives your sign-in only if you choose Continue with Google.',
      'Gmail sends account emails: confirming your address, password resets, and security notices.',
    ],
  },
  {
    title: 'Cookies and storage',
    body: 'One cookie keeps you signed in. It can’t be read by scripts on the page, works only on this site, and expires after 7 days. Your browser also keeps a few preferences, such as light or dark mode, in its local storage.',
  },
  {
    title: 'Security',
    body: 'Everything travels over HTTPS. Changing or resetting your password signs out every other device, and Settings can sign them out at any time. Sign-in, sign-up and password reset are rate limited. No system is perfectly secure, so use a password you don’t use anywhere else.',
  },
  {
    title: 'Your choices',
    body: 'You can download everything NutriFlow stores about you, or delete your account and all of its data, from Settings under Your data. Deletion is immediate and permanent. You can also turn off account emails in Settings, except the ones you ask for, such as a password reset.',
  },
  {
    title: 'Changes and questions',
    body: 'If this policy changes, the new version will be posted here with a new date. Questions go through the contact page.',
  },
];

function Privacy() {
  return (
    <LegalPage
      title="Privacy Policy"
      description="What NutriFlow stores, why, and who else handles it."
      updated="November 2, 2026"
      sections={SECTIONS}
    />
  );
}

export default Privacy;
