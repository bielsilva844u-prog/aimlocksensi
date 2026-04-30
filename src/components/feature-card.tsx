'use client';

import { useToast } from '@/hooks/use-toast';

interface FeatureCardProps {
  title: string;
  risk?: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export default function FeatureCard({
  title,
  risk,
  description,
  checked,
  onCheckedChange,
}: FeatureCardProps) {
  const { toast } = useToast();

  const handleClick = () => {
    const newCheckedState = !checked;
    onCheckedChange(newCheckedState);

    if (newCheckedState) {
      toast({
        title: 'Ativando...',
        description: `${title} está sendo ativado.`,
      });
      setTimeout(() => {
        toast({
          title: 'Ativação Concluída',
          description: `${title} foi ativado com sucesso.`,
        });
      }, 1500);
    } else {
      toast({
        title: 'Desativado',
        description: `${title} foi desativado.`,
      });
    }
  };

  return (
    <div
      className="feature-card"
      data-state={checked ? 'checked' : 'unchecked'}
      onClick={handleClick}
      role="switch"
      aria-checked={checked}
    >
      <div className="feature-card-content">
        <h3>
          {title}
          {risk && <span className="risk">({risk})</span>}
        </h3>
        <p>{description}</p>
      </div>
      <div className="feature-toggle-circle" />
    </div>
  );
}
