import LegalPage from './LegalPage';

const SECTIONS = [
  {
    title: 'Using NutriFlow',
    body: 'NutriFlow is free for personal, non-commercial use. By creating an account or using the site, you agree to these terms. If you don’t agree, please don’t use it.',
  },
  {
    title: 'Not medical advice',
    body: 'NutriFlow’s verdicts, targets, plans and coach answers are general guidance worked out from what you log. They are not medical, nutritional or training advice for your situation, and the AI coach can be wrong. Talk to a doctor or a qualified professional before changing your diet or training, especially if you have a health condition, an injury or are pregnant. Stop any exercise that causes pain or dizziness.',
  },
  {
    title: 'Your account',
    body: 'Keep your sign-in details to yourself; you are responsible for what happens under your account. If you think someone else has used it, reset your password, which signs out every other device.',
  },
  {
    title: 'Fair use',
    body: 'Don’t try to break, overload or get around the limits of the service, access other people’s data, or use it to send spam. Daily limits on the AI coach keep it free for everyone. Accounts that misuse the service may be removed.',
  },
  {
    title: 'Your content',
    body: 'What you log and write stays yours. NutriFlow only uses it to run the service for you, as the privacy policy describes, and you can download or delete it at any time.',
  },
  {
    title: 'Changes and availability',
    body: 'NutriFlow is provided as is, without warranties. Features may change, and the service may be paused or stopped. To the extent the law allows, NutriFlow isn’t liable for losses that come from using it.',
  },
  {
    title: 'Governing law',
    body: 'These terms are governed by the laws of the United States. If they change, the new version will be posted here with a new date.',
  },
];

function Terms() {
  return (
    <LegalPage
      title="Terms of Service"
      description="The rules for using NutriFlow, in plain language."
      updated="November 2, 2026"
      sections={SECTIONS}
    />
  );
}

export default Terms;
