import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight, ChevronDown, Laptop, Truck, Plane,
  Building2, Award, BookOpen, MapPin, Phone, Mail,
  CheckCircle, Clock, Briefcase, Star, Globe,
  Cpu, Network, Server, Layers, Anchor, BarChart3, Wrench,
  Zap, Shield, CalendarDays, ClipboardList, Menu, X,
  GraduationCap, ChevronRight, Plus, Minus, TrendingUp,
  FileText, Bell, MessageSquare,
} from "lucide-react";
import { motion, AnimatePresence, useInView } from "framer-motion";

/* ─── ANIMATION VARIANTS ──────────────────────────────────────────────── */
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const fadeUpVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55 } },
};

/* ─── ANIMATED COUNTER ────────────────────────────────────────────────── */
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / 50;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 30);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

/* ─── COMPONENT ───────────────────────────────────────────────────────── */
export default function Landing() {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
  const [activePercorso, setActivePercorso] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState("");

  /* Sticky header + active section tracking */
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60);
      const sections = ["percorsi", "certificazioni", "pcto", "piattaforma", "footer"];
      for (const id of sections.reverse()) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 120) { setActiveSection(id); break; }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Prevent body scroll when mobile menu open */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  const NAV_LINKS = [
    { label: "Percorsi", id: "percorsi" },
    { label: "Certificazioni", id: "certificazioni" },
    { label: "Stage", id: "pcto" },
    { label: "Piattaforma", id: "piattaforma" },
    { label: "Contatti", id: "footer" },
  ];

  return (
    <div className="min-h-screen bg-white text-foreground" style={{ scrollBehavior: "smooth" }}>
      {/* ═══ STICKY NAV ═══════════════════════════════════════════════ */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white/97 backdrop-blur-md border-b shadow-sm" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
          {/* Logo */}
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-center gap-3">
            <img src={`${basePath}/logo.svg`} alt="Fauser" className="h-9 w-9" />
            <div className="text-left">
              <div className={`font-black text-lg leading-tight transition-colors ${scrolled ? "text-primary" : "text-white"}`}>
                ITT G.Fauser
              </div>
              <div className={`text-xs leading-tight hidden sm:block transition-colors ${scrolled ? "text-muted-foreground" : "text-white/60"}`}>
                Istituto Tecnico Tecnologico · Novara
              </div>
            </div>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(n => (
              <button
                key={n.id}
                onClick={() => scrollTo(n.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeSection === n.id
                    ? scrolled ? "bg-primary/10 text-primary" : "bg-white/20 text-white"
                    : scrolled ? "text-muted-foreground hover:text-primary hover:bg-primary/5" : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                {n.label}
              </button>
            ))}
          </nav>

          {/* CTA + hamburger */}
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button
                variant="ghost"
                size="sm"
                className={`font-medium hidden sm:flex transition-colors ${scrolled ? "" : "text-white hover:text-white hover:bg-white/10"}`}
              >
                Accedi
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm" className="font-semibold rounded-full px-5 bg-amber-400 hover:bg-amber-500 text-[#0d2240]">
                Iscriviti
              </Button>
            </Link>
            <button
              onClick={() => setMobileOpen(v => !v)}
              className={`md:hidden p-2 rounded-lg transition-colors ${scrolled ? "text-primary" : "text-white"}`}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t overflow-hidden"
            >
              <div className="px-5 py-4 space-y-1">
                {NAV_LINKS.map(n => (
                  <button
                    key={n.id}
                    onClick={() => scrollTo(n.id)}
                    className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors flex items-center justify-between"
                  >
                    {n.label} <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
                <div className="pt-3 border-t mt-3 flex gap-3">
                  <Link href="/sign-in" className="flex-1">
                    <Button variant="outline" className="w-full">Accedi</Button>
                  </Link>
                  <Link href="/sign-up" className="flex-1">
                    <Button className="w-full bg-amber-400 hover:bg-amber-500 text-[#0d2240] font-bold">Iscriviti</Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ═══ HERO ═════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20 overflow-hidden bg-gradient-to-br from-[#0a1628] via-[#1e3a5f] to-[#0f2942]">
        {/* Background texture */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[700px] h-[700px] bg-amber-400/8 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "36px 36px" }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 max-w-5xl mx-auto w-full"
        >
          {/* Pill badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-sm text-amber-300 mb-8 font-medium"
          >
            <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            Istituto Tecnico Tecnologico "Giacomo Fauser" · Novara · dal 1923
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white mb-6 leading-[1.05]"
          >
            La scuola che forma<br />
            <span className="text-amber-400">i tecnici di domani.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38, duration: 0.55 }}
            className="text-xl text-blue-100/75 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Tre indirizzi tecnici d'eccellenza — Informatica, Logistica, Costruzioni Aeronautiche.
            Teoria, laboratori e stage in azienda in un percorso quinquennale.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link href="/sign-in">
              <Button size="lg" className="bg-amber-400 hover:bg-amber-500 text-[#0d2240] font-black h-14 px-8 text-base rounded-full shadow-xl shadow-amber-400/25 gap-2 w-full sm:w-auto">
                Accedi alla piattaforma <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <button
              onClick={() => scrollTo("percorsi")}
              className="flex items-center gap-2 text-white/70 hover:text-white text-base font-medium transition-colors h-14 px-6 rounded-full border border-white/20 hover:bg-white/10 w-full sm:w-auto justify-center"
            >
              Scopri i percorsi <ChevronDown className="h-5 w-5" />
            </button>
          </motion.div>

          {/* Stats grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 md:grid-cols-4 rounded-2xl overflow-hidden border border-white/10"
            style={{ background: "rgba(255,255,255,0.05)" }}
          >
            {[
              { raw: 1923, value: null, label: "Anno di fondazione", suffix: "" },
              { raw: 3, value: null, label: "Indirizzi tecnici", suffix: "" },
              { raw: 900, value: "~", label: "Studenti iscritti", suffix: "" },
              { raw: 5, value: null, label: "Anni di percorso", suffix: "" },
            ].map((s, i) => (
              <motion.div key={i} variants={itemVariants} className="px-6 py-5 text-center border-r border-white/5 last:border-r-0">
                <div className="text-3xl font-black text-amber-400">
                  {s.value}{i === 0 ? "1923" : <AnimatedCounter target={s.raw} suffix={i === 3 ? " anni" : ""} />}
                </div>
                <div className="text-xs text-blue-200/50 mt-1 uppercase tracking-wider">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <button onClick={() => scrollTo("percorsi")} className="flex flex-col items-center gap-2 text-white/30 hover:text-white/60 transition-colors">
            <span className="text-[10px] uppercase tracking-[0.2em]">Scorri</span>
            <ChevronDown className="h-5 w-5 animate-bounce" />
          </button>
        </motion.div>
      </section>

      {/* ═══ I TRE PERCORSI FORMATIVI ════════════════════════════════ */}
      <section id="percorsi" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            variants={fadeUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-4 text-primary border-primary/30 bg-primary/5 px-3 py-1">Offerta formativa</Badge>
            <h2 className="text-4xl lg:text-5xl font-black mb-4 text-primary">I tre percorsi quinquennali</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
              Ogni indirizzo ha laboratori dedicati, docenti specializzati e percorsi di stage in aziende reali.
              Scegli quello più vicino alla tua passione.
            </p>
          </motion.div>

          {/* Percorso tab buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            {PERCORSI.map((p, i) => (
              <button
                key={i}
                onClick={() => setActivePercorso(i)}
                className={`flex items-center gap-3 px-5 py-4 rounded-2xl font-semibold text-sm transition-all duration-300 border-2 text-left ${
                  activePercorso === i
                    ? "shadow-lg scale-[1.02]"
                    : "bg-white border-border text-muted-foreground hover:border-primary/30 hover:bg-muted/40"
                }`}
                style={
                  activePercorso === i
                    ? { backgroundColor: p.bgLight, borderColor: p.color, color: p.color }
                    : {}
                }
              >
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
                  style={{ backgroundColor: activePercorso === i ? p.color : "#e5e7eb" }}
                >
                  <p.icon className="h-5 w-5" style={{ color: activePercorso === i ? "#fff" : "#6b7280" }} />
                </div>
                <div>
                  <div className="font-bold">{p.name}</div>
                  <div className="text-xs font-normal opacity-70">{p.tagline}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Percorso detail panel */}
          <AnimatePresence mode="wait">
            {PERCORSI.map((p, i) =>
              activePercorso !== i ? null : (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.3 }}
                  className="grid lg:grid-cols-2 gap-8"
                >
                  {/* LEFT column */}
                  <div className="space-y-5">
                    {/* Hero card */}
                    <div
                      className="p-8 rounded-3xl text-white"
                      style={{ background: `linear-gradient(135deg, ${p.color} 0%, ${p.colorDark} 100%)` }}
                    >
                      <div className="flex items-center gap-4 mb-5">
                        <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                          <p.icon className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-black leading-tight">{p.name}</h3>
                          <p className="text-white/65 text-sm mt-0.5">{p.subtitle}</p>
                        </div>
                      </div>
                      <p className="text-white/85 leading-relaxed">{p.description}</p>
                    </div>

                    {/* Sbocchi */}
                    <div className="p-6 rounded-3xl border-2 bg-white" style={{ borderColor: p.color + "40" }}>
                      <h4 className="font-bold text-primary mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                        <Briefcase className="h-4 w-4" style={{ color: p.color }} />
                        Sbocchi professionali & universitari
                      </h4>
                      <div className="grid grid-cols-2 gap-y-2 gap-x-3">
                        {p.careers.map((c, ci) => (
                          <div key={ci} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle className="h-4 w-4 flex-shrink-0" style={{ color: p.color }} />
                            {c}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Certificazioni */}
                    <div className="p-6 rounded-3xl border-2 bg-white" style={{ borderColor: p.color + "40" }}>
                      <h4 className="font-bold text-primary mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                        <Award className="h-4 w-4" style={{ color: p.color }} />
                        Certificazioni conseguibili
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {p.certs.map((c, ci) => (
                          <span
                            key={ci}
                            className="text-xs font-semibold px-3 py-1.5 rounded-full border"
                            style={{ borderColor: p.color + "50", backgroundColor: p.bgLight, color: p.color }}
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* RIGHT column */}
                  <div className="space-y-5">
                    {/* Piano di studi */}
                    <div className="p-6 rounded-3xl border bg-white shadow-sm">
                      <h4 className="font-bold text-primary mb-5 flex items-center gap-2 text-sm uppercase tracking-wide">
                        <BookOpen className="h-4 w-4" style={{ color: p.color }} />
                        Piano di studi anno per anno
                      </h4>
                      <div className="space-y-4">
                        {p.curriculum.map((anno, ai) => (
                          <div key={ai} className="flex gap-3 items-start">
                            <div
                              className="flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center text-xs font-black text-white mt-0.5"
                              style={{ backgroundColor: ai < 2 ? "#94a3b8" : p.color }}
                            >
                              {ai + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5">
                                {anno.year}
                                {ai < 2 && (
                                  <span className="ml-2 normal-case font-normal text-muted-foreground/60">(materie comuni a tutti gli indirizzi)</span>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {anno.subjects.map((s, si) => (
                                  <span
                                    key={si}
                                    className={`text-xs px-2 py-0.5 rounded-md ${ai < 2 ? "bg-muted text-muted-foreground" : "text-white"}`}
                                    style={ai >= 2 ? { backgroundColor: p.color + "cc" } : {}}
                                  >
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Highlight cards */}
                    <div className="grid grid-cols-2 gap-3">
                      {p.highlights.map((h, hi) => (
                        <div key={hi} className="p-4 rounded-2xl border bg-white shadow-sm hover:shadow-md transition-shadow">
                          <h.icon className="h-6 w-6 mb-2" style={{ color: p.color }} />
                          <div className="text-sm font-bold text-primary">{h.title}</div>
                          <div className="text-xs text-muted-foreground mt-0.5 leading-snug">{h.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ═══ CERTIFICAZIONI ═══════════════════════════════════════════ */}
      <section id="certificazioni" className="py-24 bg-[#f8fafc] border-y">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            variants={fadeUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <Badge variant="outline" className="mb-4 text-primary border-primary/30 bg-primary/5 px-3 py-1">Partner ufficiali</Badge>
            <h2 className="text-4xl font-black mb-4 text-primary">Certificazioni internazionali</h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              Consegui certificazioni riconosciute globalmente durante il tuo percorso scolastico,
              spendibili subito nel curriculum e all'università.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {CERTIFICAZIONI.map((c, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="bg-white rounded-2xl border p-6 flex items-start gap-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 cursor-default"
              >
                <div
                  className="h-14 w-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-white font-black text-sm"
                  style={{ backgroundColor: c.color }}
                >
                  {c.abbrev}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-primary text-base mb-1">{c.name}</div>
                  <div className="text-sm text-muted-foreground leading-relaxed mb-2">{c.desc}</div>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{ backgroundColor: c.color + "18", color: c.color }}
                  >
                    {c.percorso}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ PCTO / STAGE ════════════════════════════════════════════ */}
      <section id="pcto" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              variants={fadeUpVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <Badge variant="outline" className="mb-4 text-primary border-primary/30 bg-primary/5 px-3 py-1">P.C.T.O.</Badge>
              <h2 className="text-4xl font-black mb-5 text-primary leading-tight">
                Stage in azienda<br />già dal terzo anno
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                I <strong>Percorsi per le Competenze Trasversali e per l'Orientamento</strong> portano ogni studente in aziende reali del territorio per almeno <strong>210 ore nel triennio</strong>. Un'esperienza che integra la teoria con la pratica professionale e viene valutata all'esame di maturità.
              </p>
              <div className="space-y-4">
                {PCTO_POINTS.map((pt, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <pt.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-primary">{pt.title}</div>
                      <div className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{pt.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              {PCTO_STATS.map((s, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="p-6 rounded-2xl border bg-white shadow-sm hover:shadow-md transition-all text-center"
                >
                  <div className="text-4xl font-black text-primary mb-1">
                    {s.prefix}<AnimatedCounter target={s.num} suffix={s.suffix} />
                  </div>
                  <div className="text-sm font-semibold text-foreground">{s.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.sub}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ PLATFORM FEATURES ════════════════════════════════════════ */}
      <section id="piattaforma" className="py-24 bg-[#0a1628] text-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            variants={fadeUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <Badge className="mb-4 bg-amber-400/20 text-amber-300 border-amber-400/30 px-3 py-1">Piattaforma digitale</Badge>
            <h2 className="text-4xl font-black mb-4">Tutto in un unico posto</h2>
            <p className="text-blue-200/60 max-w-2xl mx-auto text-lg">
              Inclusa per tutti gli studenti e i docenti iscritti.
              Un ecosistema completo per la vita scolastica quotidiana.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12"
          >
            {PLATFORM_FEATURES.map((f, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="group bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-6 transition-all hover:-translate-y-0.5 cursor-default"
              >
                <div className="h-10 w-10 rounded-xl bg-amber-400/20 flex items-center justify-center mb-4 group-hover:bg-amber-400/30 transition-colors">
                  <f.icon className="h-5 w-5 text-amber-400" />
                </div>
                <h3 className="font-bold text-white mb-1.5">{f.title}</h3>
                <p className="text-sm text-blue-200/55 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            variants={fadeUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center"
          >
            <Link href="/sign-up">
              <Button size="lg" className="bg-amber-400 hover:bg-amber-500 text-[#0d2240] font-black h-14 px-10 text-base rounded-full shadow-xl shadow-amber-400/20 gap-2">
                Registrati gratis <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══ FAQ ══════════════════════════════════════════════════════ */}
      <section className="py-24 bg-[#f8fafc]">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div
            variants={fadeUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <Badge variant="outline" className="mb-4 text-primary border-primary/30 bg-primary/5 px-3 py-1">Domande frequenti</Badge>
            <h2 className="text-4xl font-black mb-4 text-primary">Hai dubbi? Ecco le risposte</h2>
            <p className="text-muted-foreground text-lg">
              Le domande più comuni da genitori e studenti che stanno scegliendo il Fauser.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-3"
          >
            {FAQS.map((faq, i) => (
              <motion.div key={i} variants={itemVariants}>
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full text-left p-5 rounded-2xl bg-white border hover:border-primary/30 transition-all shadow-sm flex items-start justify-between gap-4"
                >
                  <span className="font-semibold text-primary text-base leading-snug">{faq.q}</span>
                  <span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                    {activeFaq === i
                      ? <Minus className="h-3.5 w-3.5 text-primary" />
                      : <Plus className="h-3.5 w-3.5 text-primary" />}
                  </span>
                </button>
                <AnimatePresence>
                  {activeFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-3 bg-white border-x border-b rounded-b-2xl -mt-2 text-muted-foreground leading-relaxed text-sm">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ CTA OPEN DAY ════════════════════════════════════════════ */}
      <section className="py-20 bg-amber-400 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#0d2240] rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#0d2240] rounded-full blur-3xl" />
        </div>
        <motion.div
          variants={fadeUpVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-4xl mx-auto px-6 text-center relative z-10"
        >
          <div className="text-[#0d2240] font-black text-4xl lg:text-5xl mb-4">
            Vieni a scoprirci<br />all'Open Day
          </div>
          <p className="text-[#0d2240]/70 text-lg mb-8 max-w-xl mx-auto">
            Visita i laboratori, incontra i docenti e scopri quale percorso fa per te.
            Le iscrizioni per il prossimo anno scolastico sono aperte.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://www.fauser.edu" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-[#0d2240] hover:bg-[#163055] text-white h-14 px-8 rounded-full font-bold gap-2 w-full sm:w-auto">
                <Globe className="h-5 w-5" /> Sito ufficiale fauser.edu
              </Button>
            </a>
            <Link href="/sign-up">
              <Button
                size="lg"
                className="border-[#0d2240] text-[#0d2240] h-14 px-8 rounded-full font-bold gap-2 w-full sm:w-auto bg-transparent border-2 hover:bg-[#0d2240]/10"
              >
                Accedi alla piattaforma <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ═══ FOOTER ═══════════════════════════════════════════════════ */}
      <footer id="footer" className="bg-[#070f1c] text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-5">
                <img src={`${basePath}/logo.svg`} alt="Logo" className="h-10 w-10 brightness-0 invert" />
                <div>
                  <div className="font-black text-lg leading-tight">ITT G.Fauser</div>
                  <div className="text-xs text-blue-200/40 leading-tight">Istituto Tecnico Tecnologico "Giacomo Fauser"</div>
                </div>
              </div>
              <p className="text-sm text-blue-200/45 leading-relaxed max-w-xs mb-5">
                Scuola tecnica d'eccellenza a Novara dal 1923. Formiamo tecnici nei settori dell'Informatica e Telecomunicazioni, della Logistica e delle Costruzioni Aeronautiche.
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs px-3 py-1 rounded-full border border-white/10 text-blue-200/50">NOTF040002</span>
                <span className="text-xs px-3 py-1 rounded-full border border-white/10 text-blue-200/50">Distretto 51</span>
              </div>
            </div>

            {/* Contatti */}
            <div>
              <div className="font-bold text-xs uppercase tracking-widest text-blue-200/40 mb-5">Contatti</div>
              <div className="space-y-3">
                <a
                  href="https://maps.google.com/?q=Via+Ricci+14+Novara"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2.5 text-sm text-blue-100/60 hover:text-amber-400 transition-colors"
                >
                  <MapPin className="h-4 w-4 mt-0.5 text-amber-400/70 flex-shrink-0" />
                  Via Ricci n.14 — 28100 Novara (NO)
                </a>
                <a
                  href="tel:+390321482419"
                  className="flex items-center gap-2.5 text-sm text-blue-100/60 hover:text-amber-400 transition-colors"
                >
                  <Phone className="h-4 w-4 text-amber-400/70" />
                  +39.0321.482419
                </a>
                <a
                  href="mailto:NOTF040002@istruzione.it"
                  className="flex items-center gap-2.5 text-sm text-blue-100/60 hover:text-amber-400 transition-colors"
                >
                  <Mail className="h-4 w-4 text-amber-400/70" />
                  NOTF040002@istruzione.it
                </a>
              </div>
            </div>

            {/* Percorsi quick links */}
            <div>
              <div className="font-bold text-xs uppercase tracking-widest text-blue-200/40 mb-5">Percorsi</div>
              <div className="space-y-2">
                {PERCORSI.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => { setActivePercorso(i); scrollTo("percorsi"); }}
                    className="flex items-center gap-2 text-sm text-blue-100/55 hover:text-amber-400 transition-colors w-full text-left"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                    {p.name}
                  </button>
                ))}
                <div className="pt-3 border-t border-white/10 mt-3">
                  <button
                    onClick={() => scrollTo("certificazioni")}
                    className="flex items-center gap-2 text-sm text-blue-100/55 hover:text-amber-400 transition-colors w-full text-left"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />Certificazioni
                  </button>
                  <button
                    onClick={() => scrollTo("pcto")}
                    className="flex items-center gap-2 text-sm text-blue-100/55 hover:text-amber-400 transition-colors w-full text-left mt-2"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />Stage P.C.T.O.
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/8 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-blue-200/30">
            <span>© {new Date().getFullYear()} Istituto Tecnico Tecnologico "G.Fauser", Novara. Tutti i diritti riservati.</span>
            <a
              href="https://www.fauser.edu"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-amber-400 transition-colors flex items-center gap-1.5"
            >
              <Globe className="h-3 w-3" /> www.fauser.edu
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ═══ DATA ═══════════════════════════════════════════════════════════ */

const PERCORSI = [
  {
    name: "Informatica e Telecomunicazioni",
    tagline: "Software, reti, sistemi, cybersecurity",
    subtitle: "Settore Tecnologico — Articolazione Informatica",
    icon: Laptop,
    color: "#1d4ed8",
    colorDark: "#1e3a8a",
    bgLight: "#eff6ff",
    description:
      "Forma tecnici capaci di progettare e sviluppare sistemi informatici, applicazioni software, reti e infrastrutture IT. Ampio spazio ai laboratori di programmazione, networking, cybersecurity e cloud computing. Uno degli indirizzi con più sbocchi lavorativi in Italia.",
    curriculum: [
      { year: "1° anno", subjects: ["Matematica", "Italiano", "Inglese", "Scienze", "Fisica", "Chimica", "Tecnologie informatiche"] },
      { year: "2° anno", subjects: ["Matematica", "Inglese", "Scienze applicate", "Fisica", "Tecnologie e tecniche di rappresentazione"] },
      { year: "3° anno", subjects: ["Informatica", "Sistemi e Reti", "Tecnologie e Progettazione", "Telecomunicazioni"] },
      { year: "4° anno", subjects: ["Informatica avanzata", "Sistemi e Reti", "T.P.S.I.T.", "Telecomunicazioni"] },
      { year: "5° anno", subjects: ["Informatica", "Sistemi e Reti", "T.P.S.I.T.", "Gestione Progetto", "Inglese tecnico"] },
    ],
    careers: [
      "Sviluppatore software", "Sistemista IT / DevOps", "Web developer full-stack",
      "Network engineer", "Cybersecurity analyst", "Data analyst",
      "Ingegneria Informatica (università)", "IT consultant",
    ],
    certs: ["ECDL / ICDL", "Cisco IT-Essentials", "Cambridge English B2", "Microsoft Office Specialist", "Google Workspace"],
    highlights: [
      { icon: Cpu, title: "Programmazione", desc: "Python, Java, C#, SQL, HTML/CSS/JS" },
      { icon: Network, title: "Networking", desc: "TCP/IP, VLAN, routing, firewall" },
      { icon: Server, title: "Sistemi operativi", desc: "Linux, Windows Server, VM" },
      { icon: Shield, title: "Cybersecurity", desc: "Sicurezza reti, crittografia, GDPR" },
    ],
  },
  {
    name: "Logistica",
    tagline: "Trasporti, supply chain, infrastrutture",
    subtitle: "Settore Tecnologico — Trasporti e Logistica",
    icon: Truck,
    color: "#b45309",
    colorDark: "#92400e",
    bgLight: "#fffbeb",
    description:
      "Prepara tecnici per la gestione di reti di trasporto, magazzini e supply chain globali. Si studia l'ottimizzazione dei flussi logistici, le normative nazionali ed europee del settore e le tecnologie per la digitalizzazione della catena distributiva.",
    curriculum: [
      { year: "1° anno", subjects: ["Matematica", "Italiano", "Inglese", "Scienze", "Fisica", "Chimica", "Tecnologie applicate"] },
      { year: "2° anno", subjects: ["Matematica", "Inglese", "Scienze applicate", "Fisica", "Tecnologie e tecniche"] },
      { year: "3° anno", subjects: ["Logistica", "Scienze della Navigazione", "Struttura del Mezzo", "Meccanica e Macchine", "Diritto"] },
      { year: "4° anno", subjects: ["Logistica avanzata", "Scienze della Navigazione", "Diritto dei Trasporti", "Meccanica"] },
      { year: "5° anno", subjects: ["Logistica integrata", "Economia dei Trasporti", "Diritto", "Scienze della Navigazione", "Inglese tecnico"] },
    ],
    careers: [
      "Logistic manager", "Supply chain specialist", "Spedizioniere internazionale",
      "Traffic manager", "Fleet manager", "Magazziniere senior",
      "Consulente trasporti", "Ingegneria dei trasporti (università)",
    ],
    certs: ["ECDL / ICDL", "Cambridge English B2", "ADR Trasporto merci pericolose", "Certificazioni FIATA"],
    highlights: [
      { icon: BarChart3, title: "Supply chain", desc: "Pianificazione flussi e scorte" },
      { icon: Globe, title: "Trasporti", desc: "Terrestri, marittimi, aerei" },
      { icon: Layers, title: "Magazzino", desc: "WMS, cross-docking, picking" },
      { icon: Anchor, title: "Normativa EU", desc: "Diritto dei trasporti europeo" },
    ],
  },
  {
    name: "Costruzioni del Mezzo Aereo",
    tagline: "Progettazione, CAD 3D, manutenzione aeronautica",
    subtitle: "Settore Tecnologico — Opzione Costruzioni Aeronautiche",
    icon: Plane,
    color: "#0891b2",
    colorDark: "#0e7490",
    bgLight: "#ecfeff",
    description:
      "Indirizzo unico in Piemonte. Forma tecnici specializzati nella progettazione, costruzione e manutenzione di velivoli. Grande spazio a CAD/CAM 3D con SolidWorks, simulazioni, normative EASA e competenze in avionica. Sbocchi diretti nell'industria aerospaziale.",
    curriculum: [
      { year: "1° anno", subjects: ["Matematica", "Italiano", "Inglese", "Scienze", "Fisica", "Chimica", "Disegno tecnico"] },
      { year: "2° anno", subjects: ["Matematica", "Inglese", "Scienze applicate", "Fisica", "Tecnologie applicate"] },
      { year: "3° anno", subjects: ["Costruzione del Mezzo", "Meccanica e Macchine", "Navigazione Aerea", "CAD 3D SolidWorks", "Elettrotecnica"] },
      { year: "4° anno", subjects: ["Costruzione avanzata", "Propulsione aeronautica", "Navigazione aerea", "Progettazione CAD", "Avionica"] },
      { year: "5° anno", subjects: ["Sistemi aeronautici", "Progettazione avanzata", "Normativa EASA", "Navigazione", "Inglese aeronautico ICAO"] },
    ],
    careers: [
      "Tecnico manutentore aeronautico", "Progettista CAD/CAM", "Operatore ENAC",
      "Tecnico avionica", "Controllore di volo", "Operatore aeroportuale",
      "Ingegneria Aerospaziale (università)", "Produzione aeronautica Leonardo",
    ],
    certs: ["CSWA SolidWorks Associate", "CSWP SolidWorks Professional", "ECDL / ICDL", "Cambridge English B2", "Inglese aeronautico ICAO"],
    highlights: [
      { icon: Wrench, title: "Manutenzione", desc: "Strutture, motori e impianti" },
      { icon: Layers, title: "CAD 3D", desc: "SolidWorks, modellazione e disegno" },
      { icon: Zap, title: "Avionica", desc: "Sistemi elettronici di bordo" },
      { icon: Globe, title: "Normativa EASA", desc: "Regolamenti UE aviazione civile" },
    ],
  },
];

const CERTIFICAZIONI = [
  {
    name: "ECDL / ICDL",
    abbrev: "EC",
    color: "#1d4ed8",
    desc: "Patente europea per l'informatica. Riconosciuta in 150+ Paesi e da molte università italiane per l'esonero da esami di informatica.",
    percorso: "Tutti gli indirizzi",
  },
  {
    name: "Cisco IT-Essentials",
    abbrev: "CS",
    color: "#049fd9",
    desc: "Certificazione Cisco su hardware, sistemi operativi e reti di base. Preparazione per la carriera IT e base per il percorso CCNA.",
    percorso: "Informatica",
  },
  {
    name: "Cambridge English B1/B2",
    abbrev: "CE",
    color: "#c2410c",
    desc: "Certificazioni linguistiche internazionali livello B1 (PET) e B2 (FCE). Riconosciute a livello europeo, valide all'università.",
    percorso: "Tutti gli indirizzi",
  },
  {
    name: "Microsoft Office Specialist",
    abbrev: "MS",
    color: "#107c41",
    desc: "Certificazione ufficiale Microsoft su Word, Excel, PowerPoint. Standard richiesto nelle aziende per profili amministrativi e tecnici.",
    percorso: "Tutti gli indirizzi",
  },
  {
    name: "CSWA — SolidWorks Associate",
    abbrev: "SW",
    color: "#cc0001",
    desc: "Certificazione Dassault Systèmes per la modellazione 3D base con SolidWorks. Richiesta nel settore manifatturiero e aeronautico.",
    percorso: "Costruzioni Aeronautiche",
  },
  {
    name: "CSWP — SolidWorks Professional",
    abbrev: "WP",
    color: "#990000",
    desc: "Livello avanzato SolidWorks. Assemblaggi complessi, superfici avanzate e tavole tecniche normalizzate ISO.",
    percorso: "Costruzioni Aeronautiche",
  },
];

const PCTO_POINTS = [
  { icon: Building2, title: "Aziende del territorio novarese", desc: "Collaborazioni attive con aziende IT, logistiche e del settore aeronautico piemontese e lombardo." },
  { icon: Clock, title: "Minimo 210 ore nel triennio", desc: "Distribuite tra 3°, 4° e 5° anno con affiancamento quotidiano a tutor aziendali." },
  { icon: Star, title: "Tutor scolastico dedicato", desc: "Ogni studente è seguito da un docente referente che coordina il percorso con il tutor in azienda." },
  { icon: GraduationCap, title: "Valorizzato all'esame di Stato", desc: "L'esperienza di stage è presentata e discussa nel colloquio orale della maturità." },
];

const PCTO_STATS = [
  { prefix: "", num: 210, suffix: "+", label: "Ore di stage", sub: "Nel triennio (3°-5° anno)" },
  { prefix: "~", num: 50, suffix: "", label: "Aziende partner", sub: "Attive sul territorio" },
  { prefix: "", num: 100, suffix: "%", label: "Studenti coinvolti", sub: "Stage obbligatorio" },
  { prefix: "", num: 3, suffix: " anni", label: "Anni di esperienza", sub: "Con tutor aziendale" },
];

const PLATFORM_FEATURES = [
  { icon: ClipboardList, title: "Registro elettronico", desc: "Voti, presenze e note disciplinari in tempo reale per studenti e famiglie." },
  { icon: BookOpen, title: "Classroom digitale", desc: "Compiti, materiali e consegne per materia. Upload diretto dei lavori." },
  { icon: CalendarDays, title: "Orario e calendario", desc: "Orario settimanale e calendario eventi scolastici sempre aggiornato." },
  { icon: Bell, title: "Notifiche e annunci", desc: "Circolari, avvisi urgenti e comunicazioni docenti con notifiche push." },
  { icon: MessageSquare, title: "Forum per materia", desc: "Canali di discussione per fare domande ai professori e collaborare coi compagni." },
  { icon: TrendingUp, title: "Analytics per docenti", desc: "Dashboard con andamento della classe, trend voti e tasso di presenza." },
  { icon: Award, title: "Portfolio competenze", desc: "Tracciamento delle competenze acquisite per materia, utile per la maturità." },
  { icon: Plane, title: "Uscite didattiche", desc: "Autorizzazioni digitali e iscrizione alle uscite scolastiche in un click." },
  { icon: FileText, title: "Certificati PDF", desc: "Scarica certificati di iscrizione, frequenza e pagella in autonomia." },
];

const FAQS = [
  {
    q: "Qual è la differenza tra i tre indirizzi?",
    a: "I tre percorsi condividono il biennio comune (1° e 2° anno), poi si differenziano: Informatica si focalizza su sviluppo software, reti e sistemi IT; Logistica su trasporti, supply chain e normative del settore; Costruzioni Aeronautiche su progettazione CAD 3D, manutenzione di velivoli e normative EASA. Tutti rilasciano il diploma di Istituto Tecnico Tecnologico.",
  },
  {
    q: "Dopo il diploma si può andare all'università?",
    a: "Sì, il diploma tecnico dà pieno accesso all'università. Gli ex-studenti Fauser si iscrivono tipicamente a Ingegneria Informatica, Ingegneria dei Trasporti, Ingegneria Aerospaziale, Scienze dell'Informazione e percorsi ITS (Istituti Tecnici Superiori) biennali post-diploma con elevata occupazione.",
  },
  {
    q: "Quanto vale il diploma Fauser nel mondo del lavoro?",
    a: "Il Fauser è uno degli istituti tecnici più riconosciuti del Piemonte. Molte aziende del territorio novarese e lombardo collaborano direttamente con la scuola per i tirocini e spesso assumono direttamente i diplomati. Le certificazioni internazionali conseguite (Cisco, SolidWorks, Cambridge, ECDL) aggiungono ulteriore valore.",
  },
  {
    q: "Cos'è il P.C.T.O. e quando si fa?",
    a: "Il P.C.T.O. (Percorsi per le Competenze Trasversali e per l'Orientamento, ex Alternanza Scuola-Lavoro) sono stage obbligatori in azienda. Si svolgono nel triennio (3°, 4° e 5° anno) per un minimo di 210 ore totali. Lo studente lavora a fianco di professionisti del settore con tutoraggio sia scolastico che aziendale.",
  },
  {
    q: "Ci sono laboratori moderni?",
    a: "Sì. Il Fauser dispone di laboratori di informatica e reti (con apparati Cisco), laboratori CAD/CAM con licenze SolidWorks, laboratori di elettronica e avionica, e aule dedicate alle tecnologie logistiche. La scuola partecipa ai programmi PON/PNRR per il costante aggiornamento delle attrezzature.",
  },
  {
    q: "Come funziona l'iscrizione al primo anno?",
    a: "Le iscrizioni al primo anno avvengono tramite il portale nazionale del Ministero dell'Istruzione (iscrizioni.istruzione.it) solitamente tra gennaio e febbraio. Prima di iscriversi è possibile partecipare agli Open Day organizzati dalla scuola per visitare i laboratori e conoscere i docenti. Per informazioni: NOTF040002@istruzione.it",
  },
  {
    q: "La piattaforma è gratuita per studenti e famiglie?",
    a: "Sì. La piattaforma digitale è inclusa gratuitamente per tutti gli studenti, i docenti e le famiglie dell'ITT G.Fauser. Basta registrarsi con la propria email istituzionale. Consente di accedere al registro elettronico, ai materiali didattici, alle comunicazioni scuola-famiglia e a tutti i servizi digitali dell'istituto.",
  },
];
