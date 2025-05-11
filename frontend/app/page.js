// app/page.js - Sign In Page
import AuthWrapper from '@/components/AuthWrapper';
import SignIn from '@/components/SignIn';

export default function SignInPage() {
  return (
    <AuthWrapper requireAuth={false}>
      <SignIn />
    </AuthWrapper>
  );
}