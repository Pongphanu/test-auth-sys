// app/landing/page.js - Landing Page
import AuthWrapper from '@/components/AuthWrapper';
import Landing from '@/components/Landing';

export default function LandingPage() {
  return (
    <AuthWrapper requireAuth={true}>
      <Landing />
    </AuthWrapper>
  );
}