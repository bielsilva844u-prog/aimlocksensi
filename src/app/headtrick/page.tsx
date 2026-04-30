'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { RefreshCw } from 'lucide-react';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  title: string;
  risk: 'risk' | 'baixo' | 'medio';
  description: string;
  defaultOn?: boolean;
}

function LoadingScreen() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[#0e0a0a]">
      <RefreshCw className="h-10 w-10 animate-spin text-primary" />
      <p className="text-lg font-semibold tracking-wider text-white">Verificando acesso...</p>
    </div>
  );
}

function TargetIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3" />
      <line x1="12" y1="3" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="21" />
      <line x1="3" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="21" y2="12" />
    </svg>
  );
}

function FeatureCard({ title, risk, description, defaultOn = false }: FeatureCardProps) {
  const [enabled, setEnabled] = useState(defaultOn);

  return (
    <button type="button" className="ht-feat-card" onClick={() => setEnabled((value) => !value)}>
      <div className="ht-feat-info">
        <div className="ht-feat-title">
          {title} <span className={cn('ht-badge', risk)}>{risk}</span>
        </div>
        <div className="ht-feat-desc">{description}</div>
      </div>
      <span className={cn('ht-tog', enabled && 'on')}>
        <span className="ht-tog-k" />
      </span>
    </button>
  );
}

export default function HeadtrickPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [fov, setFov] = useState(15);
  const [activeButton, setActiveButton] = useState(0);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Acesso Negado',
        description: 'Voce precisa estar logado para acessar esta pagina.',
      });
      router.push('/login');
      return;
    }
    if (!user.activatedProducts?.includes('HEADTRICK')) {
      toast({
        variant: 'destructive',
        title: 'Produto nao ativado',
        description: 'Voce nao tem acesso ao HEADTRICK. Ative uma chave para continuar.',
      });
      router.push('/inicio');
    }
  }, [user, loading, router, toast]);

  if (loading || !user || !user.activatedProducts?.includes('HEADTRICK')) {
    return <LoadingScreen />;
  }

  return (
    <div className="ht-wrap">
      <div className="ht-shell">
        <div className="ht-sidebar">
          {[0, 1, 2, 3].map((item) => (
            <button
              key={item}
              type="button"
              className={cn('ht-sb-btn', activeButton === item && 'active')}
              onClick={() => setActiveButton(item)}
            >
              {item === 0 && <TargetIcon />}
              {item === 1 && (
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.07 4.93a10 10 0 0 0-14.14 0M4.93 19.07a10 10 0 0 0 14.14 0" />
                  <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
                </svg>
              )}
              {item === 2 && (
                <svg viewBox="0 0 24 24">
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="12" x2="14" y2="12" />
                  <line x1="4" y1="18" x2="20" y2="18" />
                  <circle cx="17" cy="12" r="3" />
                </svg>
              )}
              {item === 3 && (
                <svg viewBox="0 0 24 24">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              )}
            </button>
          ))}
        </div>

        <div className="ht-panel">
          <div className="ht-topbar">
            <TargetIcon className="ht-topbar-icon" />
            <span className="ht-topbar-title">{activeButton === 0 ? 'Aimbot' : activeButton === 1 ? 'Precisao' : activeButton === 2 ? 'Ajustes' : 'Extras'}</span>
            <Link href="/inicio" className="ht-close-btn">
              <svg viewBox="0 0 12 12">
                <line x1="1" y1="1" x2="11" y2="11" />
                <line x1="11" y1="1" x2="1" y2="11" />
              </svg>
            </Link>
          </div>

          {activeButton === 0 && (
            <>
              <div className="ht-content">
                <FeatureCard title="Aimbot" risk="risk" description="Aumenta em 25% a hitbox de capa." />
                <FeatureCard title="Precisao Full" risk="baixo" description="Estabiliza a puxada para subir capa." defaultOn />
              </div>

              <div className="ht-slider-area">
                <div className="ht-slider-row">
                  <span className="ht-slider-label">FOV</span>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    step="1"
                    value={fov}
                    onChange={(event) => setFov(Number(event.target.value))}
                  />
                  <span className="ht-slider-val">{fov}</span>
                </div>
              </div>
            </>
          )}

          {activeButton === 1 && (
            <div className="ht-content">
              <FeatureCard title="Head Assist" risk="baixo" description="Prioriza puxadas mais estaveis para a cabeca." defaultOn />
              <FeatureCard title="Lock Smooth" risk="medio" description="Suaviza a transicao da mira no alvo." />
              <FeatureCard title="Anti Shake" risk="baixo" description="Reduz tremidas durante o puxado." defaultOn />
            </div>
          )}

          {activeButton === 2 && (
            <>
              <div className="ht-content">
                <FeatureCard title="DPI Boost" risk="medio" description="Ajusta a resposta do toque para maior velocidade." />
                <FeatureCard title="Drag Control" risk="baixo" description="Controla a puxada para evitar passar do alvo." defaultOn />
              </div>
              <div className="ht-slider-area">
                <div className="ht-slider-row">
                  <span className="ht-slider-label">FORCA</span>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    step="1"
                    value={fov}
                    onChange={(event) => setFov(Number(event.target.value))}
                  />
                  <span className="ht-slider-val">{fov}</span>
                </div>
              </div>
            </>
          )}

          {activeButton === 3 && (
            <div className="ht-content">
              <FeatureCard title="Salvar Perfil" risk="baixo" description="Mantem sua configuracao para o proximo acesso." defaultOn />
              <FeatureCard title="Modo Seguro" risk="baixo" description="Usa ajustes mais discretos e estaveis." defaultOn />
              <FeatureCard title="Reset Config" risk="risk" description="Volta todos os ajustes para o padrao." />
            </div>
          )}

          <div className="ht-footer">
            <div className="ht-footer-sub">Todos os direitos reservados</div>
            <div className="ht-footer-brand">
              <img src="https://i.ibb.co/r214VPf8/download-1.webp" alt="" className="ht-footer-logo" />
              aimlock<span>.sensi</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
