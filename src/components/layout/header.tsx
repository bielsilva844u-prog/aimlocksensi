'use client';

import Link from 'next/link';
import Image from 'next/image';
import UserNav from './user-nav';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useUser } from '@/firebase';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const aimlokIcon = PlaceHolderImages.find((img) => img.id === 'aimlok-sensi-icon');
  const [isStandalone, setIsStandalone] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);
  }, []);

  if (pathname === '/inicio') {
    return null;
  }

  let homeLink = '/inicio';
  if (isStandalone) {
    homeLink = user ? '/conta' : '/registrar';
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-primary/20 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href={homeLink} className="flex items-center gap-2">
          {aimlokIcon && (
            <Image
              src={aimlokIcon.imageUrl}
              alt={aimlokIcon.description}
              width={28}
              height={28}
              data-ai-hint={aimlokIcon.imageHint}
            />
          )}
          <span className="font-bold text-white sm:inline-block">
            aimlock.sensi
          </span>
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            <UserNav />
          </nav>
        </div>
      </div>
    </header>
  );
}
