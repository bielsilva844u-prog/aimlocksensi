'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

const purchases = [
  { name: 'Felipe Costa', product: 'PACK DE SENSIBILIDADE PRO' },
  { name: 'Juliana Silva', product: 'HEADTRICK VIP' },
  { name: 'Ricardo Mendes', product: 'PACK DE MIRA PRO' },
  { name: 'Ana Oliveira', product: 'ACESSO VITALÍCIO' },
];

export default function PurchaseNotification() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [currentPurchaseIndex, setCurrentPurchaseIndex] = useState(0);
  const hiddenRoutes = ['/login', '/registrar', '/auxilio-iphone', '/auxilio-android', '/admin', '/conta', '/headtrick', '/gerador'];

  useEffect(() => {
    if (hiddenRoutes.includes(pathname)) return;

    const initialTimeout = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentPurchaseIndex((prevIndex) => (prevIndex + 1) % purchases.length);
        setIsVisible(true);
      }, 500); // fade out duration
    }, 6000); // 5.5s visible + 0.5s hidden

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [pathname]);

  if (hiddenRoutes.includes(pathname)) {
    return null;
  }

  const currentPurchase = purchases[currentPurchaseIndex];

  return (
    <div
      className={cn(
        'fixed bottom-4 left-4 right-4 sm:right-auto z-50 flex items-center gap-3 rounded-lg border border-primary/30 bg-[#110D0D] p-3 text-white shadow-lg transition-all duration-500',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0 pointer-events-none'
      )}
    >
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md border border-primary/30 bg-primary/10">
        <ShoppingCart className="h-6 w-6 text-primary" />
      </div>
      <div>
        <h4 className="text-sm font-semibold">{currentPurchase.name} comprou</h4>
        <p className="text-xs font-bold uppercase tracking-wider text-primary">{currentPurchase.product}</p>
        <p className="mt-1 text-xs text-muted-foreground">agora mesmo • via aimlok.sensi</p>
      </div>
    </div>
  );
}
