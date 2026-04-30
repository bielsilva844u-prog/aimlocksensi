'use client';

import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ToggleRowProps {
  label: string;
  defaultOn?: boolean;
}

interface RangeRowProps {
  label: string;
  min: number;
  max: number;
  defaultValue: number;
}

function LoadingScreen() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[#111214]">
      <RefreshCw className="h-10 w-10 animate-spin text-[#9b8fff]" />
      <p className="text-lg font-semibold tracking-wider text-white">
        Verificando acesso...
      </p>
    </div>
  );
}

function ToggleRow({ label, defaultOn = false }: ToggleRowProps) {
  const [enabled, setEnabled] = useState(defaultOn);

  return (
    <button type="button" className="mod-row" onClick={() => setEnabled((value) => !value)}>
      <span className={cn('mod-rlabel', enabled && 'on')}>{label}</span>
      <span className={cn('mod-tog', enabled && 'on')}>
        <span className="mod-tog-k" />
      </span>
    </button>
  );
}

function RangeRow({ label, min, max, defaultValue }: RangeRowProps) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div className="mod-srow">
      <div className="mod-slabel">
        <span>{label}</span>
        <em>{value}</em>
      </div>
      <input
        className="mod-range"
        type="range"
        min={min}
        max={max}
        step="1"
        value={value}
        onChange={(event) => setValue(Number(event.target.value))}
      />
    </div>
  );
}

export default function AuxilioIphonePage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [injecting, setInjecting] = useState(false);
  const [injected, setInjected] = useState(false);
  const [fps, setFps] = useState(144);
  const [ping, setPing] = useState(22);

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
    if (!user.activatedProducts?.includes('AUXILIO-IPHONE')) {
      toast({
        variant: 'destructive',
        title: 'Produto nao ativado',
        description: 'Voce nao tem acesso ao AUXILIO DE MIRA IPHONE. Ative uma chave para continuar.',
      });
      router.push('/inicio');
    }
  }, [user, loading, router, toast]);

  useEffect(() => {
    const interval = setInterval(() => {
      setFps(138 + Math.floor(Math.random() * 13));
      setPing(18 + Math.floor(Math.random() * 10));
    }, 900);

    return () => clearInterval(interval);
  }, []);

  if (loading || !user || !user.activatedProducts?.includes('AUXILIO-IPHONE')) {
    return <LoadingScreen />;
  }

  const handleInject = () => {
    setInjecting(true);
    setTimeout(() => {
      setInjecting(false);
      setInjected(true);
      toast({
        title: 'Injetado com sucesso',
        description: 'O auxilio de mira foi aplicado.',
      });
    }, 3000);
  };

  const handleOpenFreeFire = () => {
    window.location.href = 'freefire://';
  };

  const handleSaveConfig = () => {
    toast({
      title: 'Config salva',
      description: 'Sua configuracao foi salva com sucesso.',
    });
  };

  return (
    <div className="mod-wrap">
      <div className="mod-panel">
        <div className="mod-topbar">
          <div className="mod-tabs">
            <button type="button" className="mod-tab mod-tab-title on">
              Auxilio de Mira
            </button>
          </div>
          <div className="mod-corner">
            <div className={cn('mod-dot2', !injected && 'off')} />
            <span className="mod-corner-txt">{injected ? 'ACTIVE' : 'OFF'}</span>
          </div>
        </div>

        <div className="mod-pane on">
          <div className="mod-body mod-body-single">
            <div className="mod-col">
              <div className="mod-sec">Aimbot</div>
              <ToggleRow label="Aimbot" defaultOn />
              <ToggleRow label="Silent aim" defaultOn />
              <ToggleRow label="FOV circle" />
              <ToggleRow label="Silent aim FOV" defaultOn />
              <div className="mod-divider" />
              <RangeRow label="FOV size" min={0} max={180} defaultValue={37} />
              <RangeRow label="Head priority" min={0} max={100} defaultValue={0} />
              <RangeRow label="Scope offset" min={0} max={100} defaultValue={0} />
            </div>
          </div>
        </div>

        <div className="mod-footer">
          <div className="mod-ft-l">
            <div className="mod-ft-stat">
              fps <span>{fps}</span>
            </div>
            <div className="mod-ft-stat">
              ping <span>{ping}ms</span>
            </div>
          </div>
          <div className="mod-footer-actions">
            {injected && (
              <button type="button" className="mod-save-inline-btn" onClick={handleSaveConfig}>
                <img src="https://i.ibb.co/XxxxfVQf/1160356.png" alt="" className="mod-save-icon" />
                SALVAR CONFIG
              </button>
            )}
            <button
              type="button"
              className="mod-inject-btn"
              onClick={injected ? handleOpenFreeFire : handleInject}
              disabled={injecting}
            >
              {injecting ? 'INJETANDO...' : injected ? 'ABRIR O FREE FIRE' : 'INJETAR'}
            </button>
          </div>
        </div>
      </div>

      {injecting && (
        <div className="mod-inject-popup">
          <div className="mod-inject-box">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <p>Injetando...</p>
          </div>
        </div>
      )}
    </div>
  );
}
