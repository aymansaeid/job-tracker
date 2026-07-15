import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Brain,
  Mail,
  BarChart3,
  Kanban,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import React, { useRef } from "react";

function Feature3DCard({
  icon: Icon,
  title,
  desc,
  tag,
  gradient,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  tag: string;
  gradient: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["8deg", "-8deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-8deg", "8deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / rect.width - 0.5;
    const yPct = mouseY / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateY,
        rotateX,
        transformStyle: "preserve-3d",
      }}
      className="group relative h-80 w-full cursor-pointer rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-white/[0.01] p-8 backdrop-blur-2xl transition-shadow duration-500 hover:border-cyan-500/40 hover:shadow-[0_0_60px_rgba(34,211,238,0.25)]"
    >
      {/* floating glow orb */}
      <div
        className={`pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full ${gradient} opacity-0 blur-[60px] transition-opacity duration-700 group-hover:opacity-40`}
      />

      {/* Layer 1 – icon + tag (translateZ: 20px) */}
      <div
        style={{ transform: "translateZ(20px)" }}
        className="flex items-center justify-between"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] shadow-inner transition-all duration-300 group-hover:scale-110 group-hover:border-cyan-500/30 group-hover:bg-cyan-500/10">
          <Icon
            size={22}
            className="text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]"
          />
        </div>
        <span className="rounded-full border border-white/[0.05] bg-white/[0.03] px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-slate-400 transition-colors group-hover:text-cyan-300">
          {tag}
        </span>
      </div>

      {/* Layer 2 – text (translateZ: 40px) */}
      <div
        style={{ transform: "translateZ(40px)" }}
        className="space-y-3"
      >
        <h3 className="font-display text-xl font-bold tracking-tight text-white transition-colors group-hover:text-cyan-300">
          {title}
        </h3>
        <p className="text-sm font-normal leading-relaxed text-slate-400">
          {desc}
        </p>
      </div>

      {/* Layer 3 – CTA (translateZ: 25px) */}
      <div
        style={{ transform: "translateZ(25px)" }}
        className="-translate-x-2 flex items-center gap-2 text-xs font-semibold text-cyan-400 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
      >
        <span>Explore Architecture</span>
        <ArrowRight size={14} />
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Feature data                                                      */
/* ------------------------------------------------------------------ */
const FEATURES = [
  {
    icon: Brain,
    title: "Autonomous Email Telemetry",
    desc: "Multilingual LLMs scan your inbox in real‑time, extracting interview dates, HackerRank links, and offer details seamlessly.",
    tag: "AI Core v2.5",
    gradient: "bg-cyan-500",
  },
  {
    icon: Kanban,
    title: "3D Spatial Kanban Grid",
    desc: "Zero‑latency drag‑and‑drop pipeline. Visualize your career progression with studio‑grade fluid physics and instant state saving.",
    tag: "Workflow",
    gradient: "bg-violet-500",
  },
  {
    icon: BarChart3,
    title: "Predictive Career Analytics",
    desc: "Track response velocities, conversion ratios, and ATS rejection bottlenecks with real‑time interactive charting.",
    tag: "Telemetry",
    gradient: "bg-emerald-500",
  },
  {
    icon: Mail,
    title: "Zero‑Knowledge Security",
    desc: "Strict OAuth 2.0 isolation. Your private communications stay encrypted while our neural models process actionable career metadata.",
    tag: "SecOps",
    gradient: "bg-pink-500",
  },
];

/* ------------------------------------------------------------------ */
/*  Main Landing Page                                                 */
/* ------------------------------------------------------------------ */
export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030308] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Ambient cosmic lighting */}
      <div
        className="pointer-events-none fixed -left-40 -top-40 h-[600px] w-[600px] animate-pulse rounded-full bg-gradient-to-tr from-cyan-600/20 to-violet-600/20 blur-[160px]"
        style={{ animationDuration: "8s" }}
      />
      <div
        className="pointer-events-none fixed -right-40 top-1/3 h-[500px] w-[500px] animate-pulse rounded-full bg-gradient-to-bl from-indigo-500/15 to-emerald-500/15 blur-[160px]"
        style={{ animationDuration: "12s" }}
      />

      {/* Studio grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, #ffffff 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Floating navigation */}
      <motion.nav
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="sticky top-6 z-50 mx-auto max-w-6xl px-6"
      >
        <div className="flex h-16 items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.04] px-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] backdrop-blur-2xl">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotateZ: 180, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-violet-500 shadow-[0_0_20px_rgba(34,211,238,0.5)]"
            >
              <Sparkles size={18} className="text-white" />
            </motion.div>
            <span className="font-display text-lg font-black tracking-wider text-white drop-shadow-md">
              JOBTRACKER<span className="text-cyan-400">.AI</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login">
              <button className="px-3 py-2 font-mono text-xs font-bold uppercase tracking-wider text-slate-300 transition-colors hover:text-cyan-400">
                Sign In
              </button>
            </Link>
            <Link to="/register">
              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 25px rgba(34,211,238,0.6)",
                }}
                whileTap={{ scale: 0.95 }}
                className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 font-display text-xs font-extrabold uppercase tracking-wider text-zinc-950 shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all"
              >
                Launch Workspace
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero section */}
      <section className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-6 pb-32 pt-20 text-center">
        {/* Top pill */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-10 inline-flex items-center gap-2.5 rounded-full border border-white/[0.1] bg-gradient-to-r from-cyan-500/10 via-violet-500/10 to-pink-500/10 px-4 py-2 font-mono text-xs text-cyan-300 shadow-[0_0_30px_rgba(34,211,238,0.15)] backdrop-blur-xl"
        >
          <Zap size={14} className="animate-bounce text-cyan-400" />
          <span>NEXT‑GEN AI CAREER ORCHESTRATION</span>
          <span className="h-1.5 w-1.5 animate-ping rounded-full bg-cyan-400" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 text-6xl font-black leading-[0.95] tracking-tight sm:text-7xl md:text-8xl lg:text-9xl"
        >
          <span className="text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
            Manage applications like
          </span>
          <br />
          <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-pink-500 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(139,92,246,0.3)]">
            engineering tasks.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mx-auto mb-14 max-w-2xl text-lg font-normal leading-relaxed text-slate-400 sm:text-xl"
        >
          Leave spreadsheets behind. Connect your Gmail, and let multilingual AI
          automatically identify interviews, schedules, and job‑related emails then
          manage your entire career pipeline with a high‑performance 3D Kanban
          workspace.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex w-full max-w-md flex-col items-center justify-center gap-5 sm:flex-row"
        >
          <Link to="/register" className="w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/20 bg-gradient-to-r from-cyan-500 via-indigo-500 to-violet-600 px-9 py-5 font-display text-sm font-extrabold text-white shadow-[0_0_40px_rgba(6,182,212,0.4)] hover:opacity-95 sm:w-auto"
            >
              Start Free Trial
              <ArrowRight size={18} />
            </motion.button>
          </Link>
          <Link to="/login" className="w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.08)" }}
              className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.04] px-8 py-5 font-display text-sm font-bold text-white backdrop-blur-xl transition-all hover:bg-white/[0.08] sm:w-auto"
            >
              Try it
            </motion.button>
          </Link>
        </motion.div>

        {/* 3D dashboard preview */}
        <motion.div
          initial={{ opacity: 0, y: 60, rotateX: 20 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20 w-full max-w-5xl rounded-3xl border border-white/[0.1] bg-gradient-to-b from-white/[0.08] to-transparent p-1 shadow-[0_20px_80px_rgba(0,0,0,0.8)]"
        >
          <div className="relative overflow-hidden rounded-[22px] bg-[#080910]/90 p-6 backdrop-blur-3xl md:p-8">
            {/* Window bar */}
            <div className="mb-6 flex items-center justify-between border-b border-white/[0.06] pb-6">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500/60" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
                <div className="h-3 w-3 rounded-full bg-green-500/60" />
                <span className="ml-4 font-mono text-xs text-slate-500">
                  jobtracker-engine // stage: interview‑ready
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 font-mono text-[10px] text-emerald-400">
                  LLM SYNC ACTIVE
                </span>
              </div>
            </div>

            {/* Simulated Kanban */}
            <div className="grid gap-6 text-left md:grid-cols-3">
              <div className="relative overflow-hidden rounded-2xl border border-white/[0.05] bg-white/[0.02] p-5">
                <div className="mb-2 font-mono text-[10px] uppercase text-slate-500">
                  Applied // 2 Days Ago
                </div>
                <div className="mb-1 text-base font-bold text-white">
                  Backend Engineer (.NET)
                </div>
                <div className="mb-4 font-mono text-xs text-cyan-400">
                  TechNova Yazılım
                </div>
                <div className="flex items-center justify-between border-t border-white/[0.04] pt-3 text-[11px] text-slate-400">
                  <span>Istanbul, TR</span>
                  <span className="h-2 w-2 rounded-full bg-yellow-400" />
                </div>
              </div>

              {/* AI‑detected card with levitation */}
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  boxShadow: [
                    "0 0 20px rgba(34,211,238,0.1)",
                    "0 0 40px rgba(34,211,238,0.3)",
                    "0 0 20px rgba(34,211,238,0.1)",
                  ],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/15 via-violet-500/10 to-transparent p-5 shadow-2xl"
              >
                <div className="absolute right-3 top-3 animate-pulse rounded bg-cyan-500 px-2 py-0.5 font-mono text-[9px] font-black uppercase tracking-wider text-zinc-950">
                  AI DETECTED
                </div>
                <div className="mb-2 font-mono text-[10px] uppercase text-cyan-300">
                  Stage 2 // Technical Interview
                </div>
                <div className="mb-1 text-base font-bold text-white">
                  Software Engineer
                </div>
                <div className="mb-4 font-mono text-xs text-violet-300">
                  NexusTech Studios
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.06] p-2.5 font-mono text-[11px] text-slate-200">
                  <Sparkles size={14} className="shrink-0 text-cyan-400" />
                  <span className="truncate">Teams Meet: Friday @ 14:30</span>
                </div>
              </motion.div>

              <div className="relative overflow-hidden rounded-2xl border border-white/[0.05] bg-white/[0.02] p-5 opacity-60">
                <div className="mb-2 font-mono text-[10px] uppercase text-slate-500">
                  Offer // Pending
                </div>
                <div className="mb-1 text-base font-bold text-white">
                  Full‑Stack Architect
                </div>
                <div className="mb-4 font-mono text-xs text-pink-400">
                  CloudScale Labs
                </div>
                <div className="flex items-center justify-between border-t border-white/[0.04] pt-3 text-[11px] text-slate-400">
                  <span>Remote // $120k</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Feature grid */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-36">
        <div className="mb-20 text-center">
          <span className="mb-3 block font-mono text-xs font-bold uppercase tracking-[0.3em] text-cyan-400">
            ENGINEERING SPECIFICATIONS
          </span>
          <h2 className="text-4xl font-black tracking-tight text-white md:text-6xl">
            Built for the{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent">
              Modern Engineer.
            </span>
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <Feature3DCard key={i} {...f} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-32">
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="rounded-[36px] border border-white/20 bg-gradient-to-r from-cyan-900/40 via-violet-900/40 to-pink-900/40 p-1 shadow-[0_0_100px_rgba(139,92,246,0.3)] backdrop-blur-3xl"
        >
          <div className="relative overflow-hidden rounded-[34px] bg-[#06070D]/90 px-8 py-16 text-center md:p-20">
            <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-cyan-500/20 blur-[100px]" />
            <div className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-violet-500/20 blur-[100px]" />

            <h2 className="mb-6 text-4xl font-black tracking-tight text-white md:text-6xl">
              Ready to automate your pipeline?
            </h2>
            <p className="mx-auto mb-10 max-w-xl text-lg font-normal text-slate-300">
              Join thousands of software engineers tracking their interviews with
              zero latency and full AI automation.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/register">
                <motion.button
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 0 35px rgba(34,211,238,0.8)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-10 py-5 font-display text-sm font-black uppercase tracking-wider text-zinc-950 shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                >
                  Create Workspace <ArrowRight size={18} />
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.08] bg-zinc-950/80 py-12 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500">
              <Sparkles size={14} className="font-bold text-zinc-950" />
            </div>
            <span className="font-display text-base font-bold tracking-wider text-white">
              JOBTRACKER
            </span>
          </div>
          <p className="font-mono text-xs uppercase tracking-widest text-slate-500">
            © {new Date().getFullYear()} ENGINEERED FOR EXCELLENCE. ALL RIGHTS
            RESERVED.
          </p>
        </div>
      </footer>
    </div>
  );
}