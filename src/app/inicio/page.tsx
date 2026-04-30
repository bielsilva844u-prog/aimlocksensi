'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Flame,
  Play,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const discordInviteUrl = 'https://discord.gg/9dHsE5HgfJ';

const feedbacks = [
  {
    name: 'Joao P.',
    time: 'HA 1 DIA',
    quote: 'O auxilio de mira e bizarro, parece que nao erro um tiro. Melhor compra que fiz pro meu Android.',
    avatar: 'bg-[radial-gradient(circle_at_30%_30%,#7dd3fc,#334155_45%,#020617_75%)]',
  },
  {
    name: 'Rodrigo T.',
    time: 'HA 3 DIAS',
    quote: 'Uso no iPhone e e 100% seguro. O suporte no Discord me ajudou a configurar tudo certinho.',
    avatar: 'bg-[radial-gradient(circle_at_65%_35%,#64748b,#14532d_42%,#050505_78%)]',
  },
  {
    name: 'Anderson G.',
    time: 'HA 2 DIAS',
    quote: 'Ativacao em menos de 5 minutos. O painel ficou simples e o treino ajudou muito na sensi.',
    avatar: 'bg-[radial-gradient(circle_at_35%_35%,#fef3c7,#78716c_38%,#111827_76%)]',
  },
  {
    name: 'Vitor H.',
    time: 'HA 5 DIAS',
    quote: 'Diferente de tudo que ja testei. A mira ficou mais estavel e parei de passar do alvo.',
    avatar: 'bg-[radial-gradient(circle_at_50%_30%,#f5f5f4,#a8a29e_36%,#1c1917_78%)]',
  },
  {
    name: 'Ricardo S.',
    time: 'HA 1 SEMANA',
    quote: 'O melhor auxilio de mira que usei. A estabilidade no iOS e muito boa.',
    avatar: 'bg-[radial-gradient(circle_at_50%_15%,#fafafa,#d4d4d8_48%,#09090b_80%)]',
  },
  {
    name: 'Fernando B.',
    time: 'HA 4 DIAS',
    quote: 'Entrei pelo Discord e ja consegui liberar meu acesso. Valeu demais.',
    avatar: 'bg-[radial-gradient(circle_at_40%_30%,#7dd3fc,#b45309_44%,#1c1917_78%)]',
  },
];

export default function InicioPage() {
  const router = useRouter();

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      router.replace('/registrar');
    }
  }, [router]);

  return (
    <main className="inicio-bg">
      <section className="relative z-10 flex min-h-screen w-full max-w-5xl flex-col justify-center px-4 py-6 sm:px-6">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
          <img
            src="https://i.ibb.co/j0nypC2/download.png"
            alt="Aimlock Sensi"
            className="mb-4 h-16 w-auto object-contain sm:h-20"
          />

          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-black/40 px-4 py-2 text-[0.68rem] font-black uppercase tracking-[0.18em] text-primary shadow-lg shadow-primary/10">
            <Flame className="h-4 w-4" />
            Aimlock Sensi
          </div>

          <h1 className="mt-5 font-headline text-4xl leading-none tracking-normal text-white sm:text-6xl md:text-7xl">
            Veja o auxilio de mira em acao
          </h1>

          <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-zinc-300 sm:text-base">
            Veja o video completo e entre no Discord para liberar seu auxilio.
          </p>

          <div className="mt-6 w-full">
            <div className="inicio-video-shell">
              <div className="aspect-video overflow-hidden rounded-md bg-zinc-950">
                <iframe
                  className="h-full w-full"
                  src="https://www.youtube.com/embed/lE2D0L4A-4c"
                  title="VSL Auxilio Free Fire"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
          </div>

          <Button asChild size="lg" className="gerador-button mt-5 h-14 w-full max-w-md text-base font-black uppercase tracking-wide">
            <Link href={discordInviteUrl}>
              <img
                src="https://i.ibb.co/hF0rXQ1Q/6c5ffa32-cf9b-4735-a85b-d923fc1ba747.png"
                alt=""
                className="mr-2 h-6 w-6 object-contain"
              />
              Entrar no Discord
            </Link>
          </Button>

          <div className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
            <Play className="h-4 w-4 text-primary" />
            Video + acesso direto
          </div>
        </div>
      </section>

      <section className="relative z-10 w-full px-4 pb-14 sm:px-6">
        <div className="mx-auto w-full max-w-5xl">
          <div className="text-center">
            <h2 className="font-headline text-3xl leading-none tracking-normal text-white sm:text-5xl">
              O que nossos clientes dizem{' '}
              <span className="text-primary drop-shadow-[0_0_16px_rgba(255,59,59,0.65)]">sobre a Aimlock Sensi</span>
            </h2>
            <p className="mt-4 text-xs font-black uppercase tracking-[0.22em] text-zinc-500">
              + de 100.000 clientes satisfeitos <span className="text-yellow-500">★</span>
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {feedbacks.map((feedback) => (
              <article key={feedback.name} className="feedback-card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-full border border-primary ${feedback.avatar}`} />
                    <div>
                      <h3 className="text-sm font-black text-white">{feedback.name}</h3>
                      <div className="mt-1 flex gap-0.5 text-primary">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star key={index} className="h-3.5 w-3.5 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="pt-2 font-headline text-xs tracking-normal text-zinc-400">{feedback.time}</span>
                </div>

                <p className="mt-6 text-sm font-bold italic leading-7 text-zinc-100 sm:text-base">
                  &quot;{feedback.quote}&quot;
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
