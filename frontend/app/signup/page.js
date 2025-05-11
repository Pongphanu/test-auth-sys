// app/signup/page.js - Sign Up Page
import AuthWrapper from '@/components/AuthWrapper';
import SignUp from '@/components/SignUp';

export default function SignUpPage() {
  return (
    <AuthWrapper requireAuth={false}>
      <SignUp />
    </AuthWrapper>
  );
}