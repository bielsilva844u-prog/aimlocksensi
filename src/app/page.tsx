'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useUser } from '@/firebase';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useUser();

  useEffect(() => {
    // Wait for the user status to be determined
    if (loading) {
      return;
    }

    // This function will run only on the client side
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    if (isStandalone) {
      if (user) {
        // If in PWA and logged in, go to the account page
        router.replace('/conta');
      } else {
        // If in PWA and not logged in, go to the registration page
        router.replace('/registrar');
      }
    } else {
      // If in a normal browser, go to the marketing home page
      router.replace('/inicio');
    }
  }, [router, user, loading]);

  // Render a loading indicator while the redirection logic runs
  return (
    <div className="flex justify-center items-center h-screen bg-background">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );
}
