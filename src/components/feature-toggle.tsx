'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface FeatureToggleProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  id: string;
}

export default function FeatureToggle({ icon, title, description, id }: FeatureToggleProps) {
  const [isActive, setIsActive] = useState(false);

  return (
    <Card className="glassmorphism border-primary/20 bg-card/50 w-full">
      <CardContent className="p-4 md:p-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="text-primary">{icon}</div>
          <div>
            <h3 className="font-bold text-base md:text-lg text-white">{title}</h3>
            <p className="text-xs md:text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <Label htmlFor={id} className="text-xs text-muted-foreground tracking-widest">
            {isActive ? 'ATIVADO' : 'DESATIVADO'}
          </Label>
          <Switch
            id={id}
            checked={isActive}
            onCheckedChange={setIsActive}
            aria-label={title}
          />
        </div>
      </CardContent>
    </Card>
  );
}
