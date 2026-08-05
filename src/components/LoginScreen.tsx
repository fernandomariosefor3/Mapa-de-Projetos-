import { ArrowRight, Cloud, LockKeyhole, Sparkles } from "lucide-react";
import { motion } from "motion/react";

type LoginScreenProps = {
  firebaseReady: boolean;
  busy: boolean;
  error: string;
  onGoogleLogin: () => void;
  onDemo: () => void;
};

export default function LoginScreen({
  firebaseReady,
  busy,
  error,
  onGoogleLogin,
  onDemo,
}: LoginScreenProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f6f3eb] text-[#183b37]">
      <div className="absolute inset-y-0 right-0 hidden w-[46%] bg-[#d9eee7] lg:block" />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute -right-32 top-12 h-[34rem] w-[34rem] rounded-full border-[5rem] border-[#ef765f]/80 lg:right-[-8rem]"
      />
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.15 }}
        className="absolute bottom-[-9rem] right-[15%] hidden h-80 w-80 rotate-12 rounded-[4rem] bg-[#f2c968] lg:block"
      />

      <section className="relative mx-auto grid min-h-screen max-w-7xl items-center px-6 py-12 lg:grid-cols-2 lg:px-12">
        <motion.div
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-xl"
        >
          <div className="mb-14 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#183b37] text-[#f6f3eb] shadow-[0_8px_24px_rgba(24,59,55,0.18)]">
              <span className="font-serif text-xl font-bold">F</span>
            </div>
            <div>
              <p className="font-serif text-xl font-bold leading-none">Mapa de Projetos</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#67807c]">Fernando</p>
            </div>
          </div>

          <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#d65c48]">
            <Sparkles size={16} /> Seu trabalho continua de onde voce parou
          </p>
          <h1 className="font-serif text-5xl font-semibold leading-[1.04] tracking-[-0.04em] sm:text-6xl">
            Oito projetos.
            <br />
            Uma direcao clara.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-[#59716d]">
            Acompanhe decisoes, proximas acoes e verificacoes no trabalho, em
            casa ou pelo celular. Seus dados ficam privados na sua conta.
          </p>

          <div className="mt-10 max-w-md">
            {firebaseReady ? (
              <button
                type="button"
                onClick={onGoogleLogin}
                disabled={busy}
                className="group flex w-full items-center justify-between rounded-2xl bg-[#183b37] px-5 py-4 font-semibold text-white shadow-[0_14px_32px_rgba(24,59,55,0.22)] transition hover:-translate-y-0.5 hover:bg-[#214d47] disabled:cursor-wait disabled:opacity-70"
              >
                <span className="flex items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-white font-bold text-[#4285f4]">G</span>
                  {busy ? "Abrindo sua conta..." : "Entrar com Google"}
                </span>
                <ArrowRight size={19} className="transition-transform group-hover:translate-x-1" />
              </button>
            ) : (
              <div className="rounded-2xl border border-[#d9d1c1] bg-white/70 p-5">
                <p className="flex items-center gap-2 font-semibold text-[#183b37]">
                  <Cloud size={18} /> Firebase ainda nao conectado
                </p>
                <p className="mt-2 text-sm leading-6 text-[#67807c]">
                  A interface esta pronta para receber as chaves do seu projeto
                  Firebase. Enquanto isso, voce pode explorar com dados salvos
                  somente neste navegador.
                </p>
                <button
                  type="button"
                  onClick={onDemo}
                  className="mt-4 flex w-full items-center justify-between rounded-xl bg-[#183b37] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#214d47]"
                >
                  Explorar o painel <ArrowRight size={17} />
                </button>
              </div>
            )}
            {error && <p className="mt-3 text-sm font-medium text-[#bd4434]">{error}</p>}
            <p className="mt-4 flex items-center gap-2 text-xs text-[#718783]">
              <LockKeyhole size={13} /> Acesso pessoal e dados separados por usuario
            </p>
          </div>
        </motion.div>

        <div className="relative hidden h-full min-h-[620px] items-center justify-center lg:flex">
          <motion.div
            initial={{ rotate: -4, y: 30, opacity: 0 }}
            animate={{ rotate: -2, y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="relative w-[390px] rounded-[2rem] border border-white/70 bg-white/85 p-7 shadow-[0_30px_80px_rgba(36,80,72,0.18)] backdrop-blur"
          >
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8a9d99]">Foco agora</p>
                <p className="mt-1 font-serif text-2xl font-semibold">SASE 2026</p>
              </div>
              <span className="rounded-lg bg-[#fff0ed] px-2.5 py-1 text-xs font-bold text-[#c4513e]">Alta</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#e9e5dc]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "46%" }}
                transition={{ duration: 1, delay: 0.8 }}
                className="h-full rounded-full bg-[#ef765f]"
              />
            </div>
            <div className="mt-8 border-l-2 border-[#f2c968] pl-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#8a9d99]">Proxima acao</p>
              <p className="mt-2 leading-6 text-[#35534f]">Definir deploy, autenticacao e perfis das 24 escolas.</p>
            </div>
            <div className="mt-9 grid grid-cols-3 gap-2 border-t border-[#e9e5dc] pt-5 text-center">
              <div><strong className="block font-serif text-2xl">8</strong><span className="text-xs text-[#78908c]">projetos</span></div>
              <div><strong className="block font-serif text-2xl">3</strong><span className="text-xs text-[#78908c]">publicados</span></div>
              <div><strong className="block font-serif text-2xl">5</strong><span className="text-xs text-[#78908c]">em movimento</span></div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
