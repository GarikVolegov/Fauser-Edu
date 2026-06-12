import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight, ChevronDown, Laptop, Truck, Plane, GraduationCap,
  Building2, Award, Users, BookOpen, MapPin, Phone, Mail,
  CheckCircle, Clock, Briefcase, Star, ChevronRight, Globe,
  Cpu, Network, Server, Layers, Anchor, BarChart3, Wrench,
  Zap, Shield, CalendarDays, ClipboardList,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55 },
};

const staggerChildren = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.12 } },
  viewport: { once: true },
};

export default function Landing() {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
  const [activePercorso, setActivePercorso] = useState<number>(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white text-foreground font-sans">
      {/* ──────────────────── STICKY NAV ──────────────────── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white/95 backdrop-blur border-b shadow-sm" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={`${basePath}/logo.svg`} alt="Fauser" className="h-9 w-9" />
            <div>
              <span className="font-bold text-lg text-primary leading-tight block">ITT G.Fauser</span>
              <span className="text-xs text-muted-foreground leading-tight block hidden sm:block">Istituto Tecnico Tecnologico · Novara</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            {[
              { label: "Percorsi", id: "percorsi" },
              { label: "Certificazioni", id: "certificazioni" },
              { label: "Stage", id: "pcto" },
              { label: "La piattaforma", id: "piattaforma" },
              { label: "Contatti", id: "footer" },
            ].map(n => (
              <button
                key={n.id}
                onClick={() => scrollTo(n.id)}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                {n.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm" className="font-medium">Accedi</Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm" className="font-medium rounded-full px-5">Iscriviti</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ──────────────────── HERO ──────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20 overflow-hidden bg-gradient-to-br from-[#0d2240] via-[#1e3a5f] to-[#163055]">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-amber-400/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-3xl" />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 max-w-5xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-sm text-amber-300 mb-8 font-medium"
          >
            <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            Istituto Tecnico Tecnologico "Giacomo Fauser" · Novara
          </motion.div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white mb-6 leading-[1.08]">
            La scuola che forma<br />
            <span className="text-amber-400">i tecnici di domani.</span>
          </h1>

          <p className="text-xl text-blue-100/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            Dal 1923, formiamo professionisti nei settori dell'Informatica, della Logistica e dell'Aeronautica.
            Un percorso quinquennale che unisce teoria, laboratorio e stage in azienda.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/sign-in">
              <Button size="lg" className="bg-amber-400 hover:bg-amber-500 text-[#0d2240] font-bold h-14 px-8 text-base rounded-full shadow-xl shadow-amber-400/20 gap-2">
                Accedi alla Piattaforma <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              onClick={() => scrollTo("percorsi")}
              className="border-white/20 text-white hover:bg-white/10 h-14 px-8 text-base rounded-full gap-2 bg-transparent"
            >
              Scopri i percorsi <ChevronDown className="h-5 w-5" />
            </Button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10 rounded-2xl overflow-hidden border border-white/10">
            {[
              { value: "1923", label: "Anno di fondazione" },
              { value: "3", label: "Indirizzi tecnici" },
              { value: "~900", label: "Studenti iscritti" },
              { value: "5 anni", label: "Durata del percorso" },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="bg-white/5 px-6 py-5 text-center"
              >
                <div className="text-3xl font-black text-amber-400">{s.value}</div>
                <div className="text-xs text-blue-200/60 mt-1 uppercase tracking-wide">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <button onClick={() => scrollTo("percorsi")} className="text-white/40 hover:text-white/70 transition-colors flex flex-col items-center gap-2">
            <span className="text-xs uppercase tracking-widest">Scorri</span>
            <ChevronDown className="h-5 w-5 animate-bounce" />
          </button>
        </motion.div>
      </section>

      {/* ──────────────────── PERCORSI FORMATIVI ──────────────────── */}
      <section id="percorsi" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-16">
            <Badge variant="outline" className="mb-4 text-primary border-primary/30 bg-primary/5 px-3 py-1">Offerta formativa</Badge>
            <h2 className="text-4xl lg:text-5xl font-black mb-4 text-primary">I nostri tre percorsi</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
              Tre indirizzi tecnici distinti, ciascuno con laboratori dedicati, docenti specializzati
              e sbocchi professionali diretti nel mondo del lavoro.
            </p>
          </motion.div>

          {/* Tab selector */}
          <div className="flex flex-col md:flex-row gap-3 justify-center mb-12">
            {PERCORSI.map((p, i) => (
              <button
                key={i}
                onClick={() => setActivePercorso(i)}
                className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-semibold text-sm transition-all duration-300 border-2 ${
                  activePercorso === i
                    ? "shadow-md"
                    : "bg-white border-border text-muted-foreground hover:border-primary/20"
                }`}
                style={activePercorso === i ? { backgroundColor: p.bgActive, borderColor: p.color, color: p.color } : {}}
              >
                <div className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: activePercorso === i ? p.color : "#f3f4f6" }}>
                  <p.icon className="h-5 w-5" style={{ color: activePercorso === i ? "white" : "#6b7280" }} />
                </div>
                <span>{p.name}</span>
              </button>
            ))}
          </div>

          {/* Active percorso detail */}
          <AnimatePresence mode="wait">
            {PERCORSI.map((p, i) =>
              activePercorso === i ? (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.35 }}
                  className="grid lg:grid-cols-2 gap-8"
                >
                  {/* Left: description + sbocchi */}
                  <div className="space-y-6">
                    <div className="p-8 rounded-3xl text-white" style={{ background: `linear-gradient(135deg, ${p.color}, ${p.colorDark})` }}>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center">
                          <p.icon className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-black">{p.name}</h3>
                          <p className="text-white/70 text-sm mt-1">{p.subtitle}</p>
                        </div>
                      </div>
                      <p className="text-white/90 leading-relaxed text-base">{p.description}</p>
                    </div>

                    <div className="p-6 rounded-3xl border-2 bg-white" style={{ borderColor: p.color + "33" }}>
                      <h4 className="font-bold text-primary mb-4 flex items-center gap-2">
                        <Briefcase className="h-5 w-5" style={{ color: p.color }} />
                        Sbocchi professionali
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {p.careers.map((c, ci) => (
                          <div key={ci} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle className="h-4 w-4 flex-shrink-0" style={{ color: p.color }} />
                            {c}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 rounded-3xl border-2 bg-white" style={{ borderColor: p.color + "33" }}>
                      <h4 className="font-bold text-primary mb-4 flex items-center gap-2">
                        <Award className="h-5 w-5" style={{ color: p.color }} />
                        Certificazioni conseguibili
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {p.certs.map((c, ci) => (
                          <span key={ci} className="text-xs font-semibold px-3 py-1.5 rounded-full border"
                            style={{ borderColor: p.color + "55", backgroundColor: p.bgActive, color: p.color }}>
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: piano di studi + materie */}
                  <div className="space-y-4">
                    <div className="p-6 rounded-3xl border bg-white shadow-sm">
                      <h4 className="font-bold text-primary mb-5 flex items-center gap-2">
                        <BookOpen className="h-5 w-5" style={{ color: p.color }} />
                        Piano di studi quinquennale
                      </h4>
                      <div className="space-y-3">
                        {p.curriculum.map((anno, ai) => (
                          <div key={ai} className="flex gap-3 items-start">
                            <div className="flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center text-xs font-black text-white mt-0.5"
                              style={{ backgroundColor: p.color }}>
                              {ai + 1}
                            </div>
                            <div>
                              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{anno.year}</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {anno.subjects.map((s, si) => (
                                  <span key={si} className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground">{s}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {p.highlights.map((h, hi) => (
                        <div key={hi} className="p-4 rounded-2xl border bg-white shadow-sm">
                          <h.icon className="h-6 w-6 mb-2" style={{ color: p.color }} />
                          <div className="text-sm font-semibold text-primary">{h.title}</div>
                          <div className="text-xs text-muted-foreground mt-1">{h.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : null
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ──────────────────── CERTIFICAZIONI ──────────────────── */}
      <section id="certificazioni" className="py-24 bg-[#f8fafc] border-y">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-16">
            <Badge variant="outline" className="mb-4 text-primary border-primary/30 bg-primary/5 px-3 py-1">Partner ufficiali</Badge>
            <h2 className="text-4xl font-black mb-4 text-primary">Certificazioni riconosciute</h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              Al Fauser ottieni certificazioni internazionali durante il percorso scolastico,
              spendibili subito nel mondo del lavoro.
            </p>
          </motion.div>

          <motion.div
            variants={staggerChildren}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {CERTIFICAZIONI.map((c, i) => (
              <motion.div
                key={i}
                variants={{ initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 } }}
                className="bg-white rounded-2xl border p-6 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-black text-base"
                  style={{ backgroundColor: c.color }}>
                  {c.abbrev}
                </div>
                <div>
                  <div className="font-bold text-primary text-base mb-1">{c.name}</div>
                  <div className="text-sm text-muted-foreground leading-relaxed">{c.desc}</div>
                  <div className="mt-2">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: c.color + "18", color: c.color }}>
                      {c.percorso}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ──────────────────── PCTO / STAGE ──────────────────── */}
      <section id="pcto" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div {...fadeUp}>
              <Badge variant="outline" className="mb-4 text-primary border-primary/30 bg-primary/5 px-3 py-1">P.C.T.O.</Badge>
              <h2 className="text-4xl font-black mb-6 text-primary leading-tight">
                Stage in azienda<br />già dal terzo anno
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                I Percorsi per le Competenze Trasversali e per l'Orientamento (ex Alternanza Scuola-Lavoro)
                portano ogni studente in aziende del territorio per un minimo di <strong>210 ore</strong> nel triennio.
                Un'esperienza reale che integra la teoria con la pratica professionale.
              </p>
              <div className="space-y-4">
                {PCTO_POINTS.map((pt, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <pt.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-primary">{pt.title}</div>
                      <div className="text-sm text-muted-foreground mt-0.5">{pt.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div {...fadeUp} className="grid grid-cols-2 gap-4">
              {PCTO_AZIENDE.map((az, i) => (
                <div key={i} className="p-5 rounded-2xl border bg-white shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
                  <div className="text-3xl font-black text-primary mb-1">{az.value}</div>
                  <div className="text-sm font-semibold text-foreground">{az.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{az.sub}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ──────────────────── PLATFORM FEATURES ──────────────────── */}
      <section id="piattaforma" className="py-24 bg-[#0d2240] text-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-16">
            <Badge className="mb-4 bg-amber-400/20 text-amber-300 border-amber-400/30 px-3 py-1">Piattaforma digitale</Badge>
            <h2 className="text-4xl font-black mb-4">Tutto in un unico posto</h2>
            <p className="text-blue-200/70 max-w-2xl mx-auto text-lg">
              La piattaforma digitale del Fauser è inclusa per tutti gli studenti e i docenti iscritti.
              Un ecosistema completo per la vita scolastica quotidiana.
            </p>
          </motion.div>

          <motion.div
            variants={staggerChildren}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {PLATFORM_FEATURES.map((f, i) => (
              <motion.div
                key={i}
                variants={{ initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 } }}
                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-6 transition-colors"
              >
                <div className="h-10 w-10 rounded-xl bg-amber-400/20 flex items-center justify-center mb-4">
                  <f.icon className="h-5 w-5 text-amber-400" />
                </div>
                <h3 className="font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-blue-200/60 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div {...fadeUp} className="text-center mt-12">
            <Link href="/sign-up">
              <Button size="lg" className="bg-amber-400 hover:bg-amber-500 text-[#0d2240] font-bold h-14 px-10 text-base rounded-full shadow-xl shadow-amber-400/20 gap-2">
                Inizia ad usarla <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ──────────────────── OPEN DAY ──────────────────── */}
      <section className="py-20 bg-amber-400">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div {...fadeUp}>
            <div className="text-[#0d2240] font-black text-4xl lg:text-5xl mb-4">
              Vieni a scoprirci all'Open Day
            </div>
            <p className="text-[#0d2240]/70 text-lg mb-8 max-w-xl mx-auto">
              Visita i laboratori, incontra i docenti e scopri quale percorso fa per te.
              L'iscrizione al prossimo anno scolastico è aperta.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="https://www.fauser.edu" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="bg-[#0d2240] hover:bg-[#163055] text-white h-14 px-8 rounded-full font-bold gap-2">
                  <Globe className="h-5 w-5" /> Visita il sito ufficiale
                </Button>
              </a>
              <Link href="/sign-up">
                <Button size="lg" variant="outline" className="border-[#0d2240]/30 text-[#0d2240] hover:bg-[#0d2240]/10 h-14 px-8 rounded-full font-bold gap-2 bg-transparent">
                  Registrati alla piattaforma <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ──────────────────── FOOTER ──────────────────── */}
      <footer id="footer" className="bg-[#0d1f35] text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img src={`${basePath}/logo.svg`} alt="Logo" className="h-10 w-10 brightness-0 invert" />
                <div>
                  <div className="font-black text-lg">ITT G.Fauser</div>
                  <div className="text-xs text-blue-200/50">Istituto Tecnico Tecnologico "Giacomo Fauser"</div>
                </div>
              </div>
              <p className="text-sm text-blue-200/50 leading-relaxed max-w-xs">
                Scuola tecnica di eccellenza a Novara dal 1923.
                Formiamo tecnici nei settori dell'Informatica, della Logistica e delle Costruzioni Aeronautiche.
              </p>
            </div>
            <div>
              <div className="font-bold text-sm uppercase tracking-wide text-blue-200/50 mb-4">Contatti</div>
              <div className="space-y-3 text-sm text-blue-100/70">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-amber-400 flex-shrink-0" />
                  Via Ricci n.14 — 28100 Novara (NO)
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-amber-400" />
                  +39.0321.482419
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-amber-400" />
                  NOTF040002@istruzione.it
                </div>
              </div>
            </div>
            <div>
              <div className="font-bold text-sm uppercase tracking-wide text-blue-200/50 mb-4">Percorsi</div>
              <div className="space-y-2 text-sm text-blue-100/70">
                <button onClick={() => { scrollTo("percorsi"); setActivePercorso(0); }} className="block hover:text-amber-400 transition-colors text-left">Informatica e Telecomunicazioni</button>
                <button onClick={() => { scrollTo("percorsi"); setActivePercorso(1); }} className="block hover:text-amber-400 transition-colors text-left">Logistica</button>
                <button onClick={() => { scrollTo("percorsi"); setActivePercorso(2); }} className="block hover:text-amber-400 transition-colors text-left">Costruzioni del Mezzo Aereo</button>
                <div className="pt-2 border-t border-white/10">
                  <div className="text-blue-200/40 text-xs">Codice: NOTF040002</div>
                  <div className="text-blue-200/40 text-xs">Distretto Scolastico 51</div>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-blue-200/40">
            <span>© {new Date().getFullYear()} Istituto Tecnico Tecnologico G.Fauser, Novara. Tutti i diritti riservati.</span>
            <a href="https://www.fauser.edu" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors flex items-center gap-1">
              <Globe className="h-3 w-3" /> www.fauser.edu
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── DATA ─────────────────────────────────────────────────────────── */

const PERCORSI = [
  {
    name: "Informatica e Telecomunicazioni",
    subtitle: "Settore Tecnologico — Articolazione Informatica",
    icon: Laptop,
    color: "#1d4ed8",
    colorDark: "#1e3a8a",
    bgActive: "#eff6ff",
    description:
      "Il percorso forma tecnici capaci di analizzare, progettare e sviluppare sistemi informatici, applicazioni software, reti di telecomunicazione e infrastrutture IT. Ampio spazio a laboratori di programmazione, networking e cybersecurity.",
    curriculum: [
      { year: "1° anno — Biennio comune", subjects: ["Matematica", "Italiano", "Inglese", "Scienze", "Tecnologie informatiche", "Fisica", "Chimica"] },
      { year: "2° anno — Biennio comune", subjects: ["Matematica", "Inglese", "Scienze applicate", "Tecnologie e tecniche", "Informatica"] },
      { year: "3° anno — Triennio", subjects: ["Informatica", "Sistemi e Reti", "Tecnologie e Progettazione", "Telecomunicazioni", "GPOI"] },
      { year: "4° anno — Triennio", subjects: ["Informatica avanzata", "Sistemi e Reti", "Tecnologie e Progettazione", "Telecomunicazioni", "GPOI"] },
      { year: "5° anno — Diplomastico", subjects: ["Informatica", "Sistemi e Reti", "T.P.S.I.T.", "Gestione Progetto", "Inglese tecnico"] },
    ],
    careers: [
      "Sviluppatore software", "Sistemista IT", "Network engineer", "Web developer",
      "Cybersecurity analyst", "Data analyst", "DevOps engineer", "IT consultant",
    ],
    certs: ["ECDL / ICDL", "Cisco IT-Essentials", "Cambridge English", "Microsoft Office", "Google for Education"],
    highlights: [
      { icon: Cpu, title: "Programmazione", desc: "Python, Java, C#, SQL, HTML/CSS" },
      { icon: Network, title: "Networking", desc: "TCP/IP, LAN, WAN, routing" },
      { icon: Server, title: "Sistemi", desc: "Linux, Windows Server, virtualizzazione" },
      { icon: Shield, title: "Sicurezza", desc: "Cybersecurity e protezione dati" },
    ],
  },
  {
    name: "Logistica",
    subtitle: "Settore Tecnologico — Trasporti e Logistica",
    icon: Truck,
    color: "#b45309",
    colorDark: "#92400e",
    bgActive: "#fffbeb",
    description:
      "Il percorso prepara figure professionali nella gestione dei trasporti, delle infrastrutture e della supply chain. Si studiano le reti logistiche, le normative del settore, la gestione di magazzini e le tecnologie per l'ottimizzazione dei flussi.",
    curriculum: [
      { year: "1° anno — Biennio comune", subjects: ["Matematica", "Italiano", "Inglese", "Scienze", "Fisica", "Chimica", "Tecnologie applicate"] },
      { year: "2° anno — Biennio comune", subjects: ["Matematica", "Inglese", "Scienze applicate", "Fisica", "Tecnologie e tecniche"] },
      { year: "3° anno — Triennio", subjects: ["Logistica", "Scienze della Navigazione", "Struttura del Mezzo", "Meccanica e Macchine", "Diritto"] },
      { year: "4° anno — Triennio", subjects: ["Logistica avanzata", "Scienze della Navigazione", "Diritto ed Economia dei Trasporti", "Meccanica"] },
      { year: "5° anno — Diplomastico", subjects: ["Logistica integrata", "Economia dei Trasporti", "Diritto", "Scienze della Navigazione", "Inglese tecnico"] },
    ],
    careers: [
      "Logistic manager", "Supply chain specialist", "Spedizioniere", "Magazziniere senior",
      "Traffic manager", "Operatore portuale", "Consulente trasporti", "Fleet manager",
    ],
    certs: ["ECDL / ICDL", "Cambridge English", "Patentino logistica ADR", "Certificazioni FIATA"],
    highlights: [
      { icon: BarChart3, title: "Supply chain", desc: "Gestione flussi e scorte" },
      { icon: Globe, title: "Trasporti", desc: "Terrestri, marittimi e aerei" },
      { icon: Layers, title: "Magazzino", desc: "WMS, cross-docking, picking" },
      { icon: Anchor, title: "Normativa", desc: "Diritto dei trasporti UE" },
    ],
  },
  {
    name: "Costruzioni del Mezzo Aereo",
    subtitle: "Settore Tecnologico — Trasporti e Logistica, Opzione Aeronautica",
    icon: Plane,
    color: "#0891b2",
    colorDark: "#0e7490",
    bgActive: "#ecfeff",
    description:
      "Indirizzo unico in Piemonte, forma tecnici per il settore aerospaziale: progettazione, costruzione e manutenzione di velivoli. Grande spazio ai laboratori di CAD/CAM, alle simulazioni di volo e alle normative internazionali EASA.",
    curriculum: [
      { year: "1° anno — Biennio comune", subjects: ["Matematica", "Italiano", "Inglese", "Scienze", "Fisica", "Chimica", "Disegno tecnico"] },
      { year: "2° anno — Biennio comune", subjects: ["Matematica", "Inglese", "Scienze applicate", "Fisica", "Tecnologie aeronautiche base"] },
      { year: "3° anno — Triennio", subjects: ["Costruzione del Mezzo", "Meccanica e Macchine", "Scienze della Navigazione Aerea", "CAD 3D", "Elettrotecnica"] },
      { year: "4° anno — Triennio", subjects: ["Costruzione del Mezzo avanzata", "Propulsione aeronautica", "Navigazione aerea", "Progettazione CAD", "Avionica"] },
      { year: "5° anno — Diplomastico", subjects: ["Sistemi aeronautici", "Progettazione avanzata", "Normativa EASA", "Navigazione", "Inglese tecnico aeronautico"] },
    ],
    careers: [
      "Tecnico manutentore aeronautico", "Progettista CAD/CAM", "Controllore di volo",
      "Tecnico avionica", "Operatore aeroportuale", "Ingegneria aerospaziale (università)",
      "Tecnico ENAC", "Produzione aeronautica",
    ],
    certs: ["CSWA SolidWorks Associate", "CSWP SolidWorks Professional", "ECDL / ICDL", "Cambridge English", "Inglese aeronautico ICAO"],
    highlights: [
      { icon: Wrench, title: "Manutenzione", desc: "Strutture, motori, impianti" },
      { icon: Layers, title: "CAD/CAM", desc: "SolidWorks, disegno tecnico 3D" },
      { icon: Zap, title: "Avionica", desc: "Sistemi elettronici di bordo" },
      { icon: Globe, title: "Normativa EASA", desc: "Regolamenti UE aviazione civile" },
    ],
  },
];

const CERTIFICAZIONI = [
  { name: "ECDL / ICDL", abbrev: "EC", color: "#1d4ed8", desc: "Patente europea per l'informatica. Riconosciuta in oltre 150 Paesi e da molte università italiane ai fini dell'esonero da esami.", percorso: "Tutti gli indirizzi" },
  { name: "Cisco IT-Essentials", abbrev: "CS", color: "#049fd9", desc: "Certificazione Cisco sull'hardware, i sistemi operativi e le reti fondamentali. Preparazione per la carriera IT e base per CCNA.", percorso: "Informatica" },
  { name: "Cambridge English", abbrev: "CE", color: "#c2410c", desc: "Certificazioni B1/B2 di lingua inglese riconosciute a livello europeo. Valore aggiunto per il curriculum e l'accesso universitario.", percorso: "Tutti gli indirizzi" },
  { name: "Microsoft Office Specialist", abbrev: "MS", color: "#107c41", desc: "Certificazione ufficiale Microsoft su Word, Excel, PowerPoint. Standard richiesto in molte aziende per i profili amministrativi e tecnici.", percorso: "Tutti gli indirizzi" },
  { name: "CSWA — SolidWorks Associate", abbrev: "SW", color: "#cc0001", desc: "Certificazione ufficiale Dassault Systèmes per la modellazione 3D con SolidWorks. Richiesta nel settore industriale e aeronautico.", percorso: "Costruzioni Aeronautiche" },
  { name: "CSWP — SolidWorks Professional", abbrev: "WP", color: "#cc0001", desc: "Livello avanzato della certificazione SolidWorks. Include assemblaggi complessi, superfici e disegni tecnici normati.", percorso: "Costruzioni Aeronautiche" },
];

const PCTO_POINTS = [
  { icon: Building2, title: "Aziende del territorio novarese", desc: "Collaborazioni con aziende IT, logistiche e del settore aeronautico piemontese." },
  { icon: Clock, title: "Minimo 210 ore nel triennio", desc: "Il monte ore è distribuito tra 3°, 4° e 5° anno con affiancamento a tutor aziendali." },
  { icon: Star, title: "Tutor scolastico dedicato", desc: "Ogni studente è seguito da un docente referente che coordina il percorso con l'azienda." },
  { icon: GraduationCap, title: "Valutazione per l'esame di Stato", desc: "L'esperienza di stage entra nel colloquio dell'esame di maturità." },
];

const PCTO_AZIENDE = [
  { value: "210+", label: "Ore di stage", sub: "Nel triennio (3°-5° anno)" },
  { value: "50+", label: "Aziende partner", sub: "Attive sul territorio" },
  { value: "3", label: "Anni di esperienza", sub: "Distribuite nel triennio" },
  { value: "100%", label: "Studenti coinvolti", sub: "Stage obbligatorio per tutti" },
];

const PLATFORM_FEATURES = [
  { icon: ClipboardList, title: "Registro elettronico", desc: "Voti, presenze e note disciplinari in tempo reale per studenti e famiglie." },
  { icon: BookOpen, title: "Classroom digitale", desc: "Compiti, materiali e consegne organizzati per materia. Upload diretto dei lavori." },
  { icon: CalendarDays, title: "Orario e calendario", desc: "Orario settimanale personalizzato e calendario eventi scolastici sempre aggiornato." },
  { icon: Mail, title: "Comunicazioni", desc: "Annunci ufficiali, circolari e messaggi dal corpo docente in un unico feed." },
  { icon: Users, title: "Forum per materia", desc: "Canali di discussione per fare domande ai professori e collaborare coi compagni." },
  { icon: Award, title: "Portfolio competenze", desc: "Tracciamento delle competenze acquisite per materia, utile per l'esame di maturità." },
  { icon: Plane, title: "Uscite didattiche", desc: "Gestione autorizzazioni digitali e iscrizione alle uscite scolastiche con un click." },
  { icon: GraduationCap, title: "Certificati digitali", desc: "Scarica certificati di iscrizione, frequenza e pagella direttamente dalla piattaforma." },
  { icon: BarChart3, title: "Analytics per docenti", desc: "Dashboard con andamento della classe, trend voti e tasso di presenza per materia." },
];
