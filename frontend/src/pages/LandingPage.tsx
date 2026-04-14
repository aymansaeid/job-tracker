import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Brain, Mail, BarChart3, Kanban, CheckCircle2, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Variants } from "framer-motion"

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
}

const FEATURES = [
  {
    icon: Brain,
    title: 'AI-Powered Tracking',
    desc: 'Our AI reads your Gmail and automatically detects interview invites, rejections, and offers.',
    color: 'text-cyan-400',
    bg:    'bg-cyan-500/10 border-cyan-500/20',
  },
  {
    icon: Kanban,
    title: 'Visual Kanban Board',
    desc: 'Drag and drop your applications through stages. See your entire pipeline at a glance.',
    color: 'text-violet-400',
    bg:    'bg-violet-500/10 border-violet-500/20',
  },
  {
    icon: BarChart3,
    title: 'Smart Dashboard',
    desc: 'Track response rates and application counts with a beautiful real-time dashboard.',
    color: 'text-emerald-400',
    bg:    'bg-emerald-500/10 border-emerald-500/20',
  },
  {
    icon: Mail,
    title: 'Gmail Integration',
    desc: 'One-click OAuth connection. We scan for patterns — your emails stay private.',
    color: 'text-sky-400',
    bg:    'bg-sky-500/10 border-sky-500/20',
  },
]

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-surface-base overflow-hidden">

      {/* Background orbs */}
      <div className="orb w-[500px] h-[500px] -top-32 -left-32 opacity-20"
           style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.25) 0%, transparent 70%)' }} />
      <div className="orb w-[400px] h-[400px] top-1/2 -right-24 opacity-15"
           style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)', animationDelay: '5s' }} />

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.03]"
           style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      {/* ── Navbar ───────────────────────────────────────── */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-50 max-w-6xl mx-auto px-6 h-16 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <span className="font-display font-bold text-white text-lg">JobTracker</span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-cyan-500/15 text-cyan-400 border border-cyan-500/25 uppercase tracking-widest">
            AI
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/login">
            <button className="btn-ghost py-2 px-4">Sign in</button>
          </Link>
          <Link to="/register">
            <button className="btn-primary py-2 px-4">Get started free</button>
          </Link>
        </div>
      </motion.nav>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-32 text-center">

        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 text-xs font-medium text-slate-300 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <Sparkles size={12} className="text-cyan-400" />
          AI-powered job application intelligence
          <ChevronRight size={12} className="text-slate-500" />
        </motion.div>

        <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={1}
                   className="font-display text-5xl md:text-7xl font-bold leading-[0.95] mb-6 tracking-tight">
          <span className="text-white">Stop guessing.</span>
          <br />
          <span className="gradient-text">Start knowing.</span>
        </motion.h1>

        <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2}
                  className="text-lg text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed">
          JobTracker uses AI to scan your Gmail, detect interview invites and rejections automatically,
          and keep your job search organised in a beautiful Kanban board.
        </motion.p>

        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/register">
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="btn-primary flex items-center gap-2 px-8 py-4 text-base shadow-glow-cyan"
            >
              Start tracking free
              <ArrowRight size={16} />
            </motion.button>
          </Link>
          <Link to="/login">
            <motion.button
              whileHover={{ scale: 1.02 }}
              className="btn-ghost flex items-center gap-2 px-8 py-4 text-base"
            >
              Sign in to your account
            </motion.button>
          </Link>
        </motion.div>

      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-28">

        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                    className="text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400 mb-3 block">Features</span>
          <h2 className="font-display text-4xl font-bold text-white mb-3">
            Everything you need to land <span className="gradient-text">your dream job</span>
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto">
            Built for serious job seekers who want clarity and control.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
              whileHover={{ y: -4 }}
              className={`glow-border glass rounded-2xl p-6 border ${f.bg}`}
            >
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${f.bg}`}>
                <f.icon size={20} className={f.color} />
              </div>
              <h3 className="font-display font-bold text-white mb-2 text-sm">{f.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>

      </section>

      {/* ── CTA Banner ───────────────────────────────────── */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-28">
        <motion.div
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="glass rounded-3xl border border-white/10 p-12 text-center relative overflow-hidden"
        >
          <div className="orb w-64 h-64 -top-16 -left-16 opacity-20"
               style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.3) 0%, transparent 70%)' }} />
          <div className="orb w-64 h-64 -bottom-16 -right-16 opacity-15"
               style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)' }} />
          <div className="relative z-10">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              Take control of your job search.
            </h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              Free to start. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {[
                'AI Gmail scanning',
                'Kanban board',
                'Application history',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-slate-300">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="btn-primary inline-flex items-center gap-2 px-10 py-4 text-base shadow-glow-cyan"
                >
                  Create free account <ArrowRight size={16} />
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/[0.06] py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-brand flex items-center justify-center">
              <Sparkles size={11} className="text-white" />
            </div>
            <span className="font-display font-bold text-slate-400 text-sm">JobTracker</span>
          </div>
          <p className="text-xs text-slate-600">© {new Date().getFullYear()} JobTracker. All rights reserved.</p>
        </div>
      </footer>

    </div>
  )
}