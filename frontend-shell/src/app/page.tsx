import { redirect } from 'next/navigation';

export default function RootPage() {
  // The AuthGate in (app)/layout.tsx would do the real check,
  // but the unauthenticated user should land on /login first.
  redirect('/login');
}
