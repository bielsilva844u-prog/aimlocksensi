'use client';

import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface FeatureRowProps {
  title: string;
  defaultOn?: boolean;
}

interface RangeBlockProps {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
}

interface GeneratedSensi {
  miraLivre: number;
  redDot: number;
  scope2x: number;
  scope4x: number;
  sniper: number;
  dpi: number;
}

function LoadingScreen() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[#0c0a0a]">
      <RefreshCw className="h-10 w-10 animate-spin text-primary" />
      <p className="text-lg font-semibold tracking-wider text-white">Verificando acesso...</p>
    </div>
  );
}

function TargetIcon() {
  return (
    <svg viewBox="0 0 16 16">
      <circle cx="8" cy="8" r="6" />
      <circle cx="8" cy="8" r="2" />
      <line x1="8" y1="2" x2="8" y2="4" />
      <line x1="8" y1="12" x2="8" y2="14" />
      <line x1="2" y1="8" x2="4" y2="8" />
      <line x1="12" y1="8" x2="14" y2="8" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg className="gs-sec-arrow" viewBox="0 0 14 14">
      <polyline points="5,3 9,7 5,11" />
    </svg>
  );
}

function FeatureRow({ title, defaultOn = false }: FeatureRowProps) {
  const [enabled, setEnabled] = useState(defaultOn);

  return (
    <div className="gs-feat-row">
      <div>
        <div className="gs-feat-name">{title}</div>
        <div className={cn('gs-feat-state', enabled ? 'on' : 'off')}>
          {enabled ? 'ATIVADO' : 'DESATIVADO'}
        </div>
      </div>
      <button type="button" className={cn('gs-tog', enabled && 'on')} onClick={() => setEnabled((value) => !value)}>
        <span className="gs-tog-k" />
      </button>
    </div>
  );
}

function RangeBlock({ label, min, max, step = 1, value, onChange }: RangeBlockProps) {
  return (
    <div className="gs-slider-block">
      <div className="gs-slider-top">
        <span className="gs-slider-name">{label}</span>
        <span className="gs-slider-num">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}

function rand(min: number, max: number) {
  return Math.round(Math.random() * (max - min) + min);
}

export default function GeradorPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [platform, setPlatform] = useState<'android' | 'ios'>('android');
  const [game, setGame] = useState<'Free Fire' | 'Free Fire MAX'>('Free Fire');
  const [dpi, setDpi] = useState(800);
  const [sens, setSens] = useState(50);
  const [freeAim, setFreeAim] = useState(72);
  const [generated, setGenerated] = useState<GeneratedSensi | null>(null);

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
    if (!user.activatedProducts?.includes('GERADOR-SENSI')) {
      toast({
        variant: 'destructive',
        title: 'Produto nao ativado',
        description: 'Voce nao tem acesso ao GERADOR DE SENSI. Ative uma chave para continuar.',
      });
      router.push('/inicio');
    }
  }, [user, loading, router, toast]);

  if (loading || !user || !user.activatedProducts?.includes('GERADOR-SENSI')) {
    return <LoadingScreen />;
  }

  const handleGenerate = () => {
    const base = sens;
    const idealDpi = dpi <= 800 ? 800 : dpi <= 1600 ? 1200 : 1600;

    setGenerated({
      miraLivre: rand(base - 5, base + 10),
      redDot: rand(base - 10, base + 5),
      scope2x: rand(Math.max(10, base - 20), base - 5),
      scope4x: rand(Math.max(5, base - 30), base - 15),
      sniper: rand(Math.max(3, base - 40), Math.max(5, base - 25)),
      dpi: idealDpi,
    });
  };

  return (
    <div className="gs-app">
      <div className="gs-hero">
        <div className="gs-hero-badge">
          <div className="gs-hero-badge-img">
            <TargetIcon />
          </div>
        </div>
        <div className="gs-hero-line1">Gerador de</div>
        <div className="gs-hero-line2">Sensibilidade Aimlock</div>
        <div className="gs-hero-sub">Otimizador de DPI &amp; Sensi</div>
      </div>

      <div className="gs-os-tabs">
        <button type="button" className={cn('gs-os-tab', platform === 'android' && 'on')} onClick={() => setPlatform('android')}>
          Android
        </button>
        <button type="button" className={cn('gs-os-tab', platform === 'ios' && 'on')} onClick={() => setPlatform('ios')}>
          iOS
        </button>
      </div>

      <div className="gs-section">
        <div className="gs-sec-head">
          <ChevronIcon />
          <span className="gs-sec-label">Modelo do dispositivo</span>
        </div>
        <div className="gs-sec-body">
          <input className="gs-input-field" type="text" placeholder="Digite o modelo do seu celular" />
          <div className="gs-game-options">
            {(['Free Fire', 'Free Fire MAX'] as const).map((option) => (
              <button
                key={option}
                type="button"
                className={cn('gs-game-option', game === option && 'on')}
                onClick={() => setGame(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="gs-section">
        <div className="gs-sec-head">
          <ChevronIcon />
          <span className="gs-sec-label">Funcoes &amp; Otimizacao</span>
        </div>
        <div className="gs-sec-body">
          <FeatureRow title="FPS a Milhao (120+ FPS)" defaultOn />
          <FeatureRow title="Metodo Full HS" defaultOn />
          <FeatureRow title="Mira Nao Passar" />
          <FeatureRow title="Anti Recoil" />
        </div>
      </div>

      <div className="gs-slider-section">
        <RangeBlock label="DPI base" min={200} max={3200} step={50} value={dpi} onChange={setDpi} />
        <RangeBlock label="Sensibilidade geral" min={1} max={100} value={sens} onChange={setSens} />
        <RangeBlock label="Mira livre" min={1} max={100} value={freeAim} onChange={setFreeAim} />
      </div>

      <button type="button" className="gs-gen-btn" onClick={handleGenerate}>
        Gerar Sensibilidade
        <svg viewBox="0 0 16 16">
          <polyline points="6,3 11,8 6,13" />
        </svg>
      </button>

      {generated && (
        <div className="gs-result-box show">
          <div className="gs-result-title">Sua sensibilidade gerada</div>
          <div className="gs-result-grid">
            <div className="gs-rcard"><div className="gs-rcard-label">Mira livre</div><div className="gs-rcard-val">{generated.miraLivre}<span> geral</span></div></div>
            <div className="gs-rcard"><div className="gs-rcard-label">Mira c/ escopo</div><div className="gs-rcard-val">{generated.redDot}<span> red dot</span></div></div>
            <div className="gs-rcard"><div className="gs-rcard-label">2x escopo</div><div className="gs-rcard-val">{generated.scope2x}<span> 2x</span></div></div>
            <div className="gs-rcard"><div className="gs-rcard-label">4x escopo</div><div className="gs-rcard-val">{generated.scope4x}<span> 4x</span></div></div>
            <div className="gs-rcard"><div className="gs-rcard-label">Sniper</div><div className="gs-rcard-val">{generated.sniper}<span> sniper</span></div></div>
            <div className="gs-rcard"><div className="gs-rcard-label">DPI ideal</div><div className="gs-rcard-val">{generated.dpi}<span> DPI</span></div></div>
          </div>
        </div>
      )}

      <div className="gs-foot">
        <div className="gs-foot-txt">Versao 1.0 - Powered by</div>
        <div className="gs-foot-brand">aimlock.sensi</div>
      </div>
    </div>
  );
}
