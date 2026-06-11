import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, GraduationCap, Laptop, Plane } from "lucide-react";
import { motion } from "framer-motion";

export default function Landing() {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-6 lg:px-12 py-6 flex items-center justify-between bg-card border-b">
        <div className="flex items-center gap-3">
          <img src={`${basePath}/logo.svg`} alt="ITT G.Fauser" className="h-10 w-10" />
          <span className="font-bold text-xl text-primary tracking-tight">ITT G.Fauser</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/sign-in">
            <Button variant="ghost" className="font-medium">Accedi</Button>
          </Link>
          <Link href="/sign-up">
            <Button className="font-medium">Iscriviti</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 lg:py-32 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent rounded-full blur-3xl" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm text-primary mb-8 font-medium">
            <span className="flex h-2 w-2 rounded-full bg-accent mr-2"></span>
            Piattaforma Scolastica Digitale
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-foreground mb-6">
            L'innovazione incontra <br/><span className="text-primary">l'educazione.</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Ecosistema digitale completo per studenti e docenti dell'ITT G.Fauser di Novara. 
            Voti, presenze, materiali didattici e comunicazioni in un unico hub integrato.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-in">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base font-medium rounded-full shadow-lg shadow-primary/20">
                Accedi alla Piattaforma <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Specializations Section */}
      <section className="py-24 bg-card border-t">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">I Nostri Indirizzi</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Formiamo i professionisti di domani in tre aree strategiche per l'innovazione tecnologica e lo sviluppo del territorio.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <SpecializationCard 
              icon={Laptop}
              title="Informatica"
              description="Sviluppo software, sistemi informativi, reti e telecomunicazioni. Preparazione per le sfide del mondo digitale."
              color="text-blue-600"
              bgColor="bg-blue-600/10"
              delay={0.1}
            />
            <SpecializationCard 
              icon={Plane}
              title="Aeronautica"
              description="Progettazione, costruzione e manutenzione di mezzi aerei. Competenze tecniche per il settore aerospaziale."
              color="text-sky-600"
              bgColor="bg-sky-600/10"
              delay={0.2}
            />
            <SpecializationCard 
              icon={BookOpen}
              title="Logistica"
              description="Gestione dei processi di trasporto, infrastrutture e supply chain. Efficienza per le reti distributive globali."
              color="text-amber-600"
              bgColor="bg-amber-600/10"
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src={`${basePath}/logo.svg`} alt="Logo" className="h-8 w-8 brightness-0 invert" />
            <span className="font-bold text-lg">ITT G.Fauser</span>
          </div>
          <div className="text-sm text-primary-foreground/70 text-center md:text-right">
            Via Ricci 14, 28100 Novara (NO)<br/>
            © {new Date().getFullYear()} Istituto Tecnico Tecnologico G.Fauser. Tutti i diritti riservati.
          </div>
        </div>
      </footer>
    </div>
  );
}

function SpecializationCard({ icon: Icon, title, description, color, bgColor, delay }: { icon: any, title: string, description: string, color: string, bgColor: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="p-8 rounded-2xl bg-background border shadow-sm hover:shadow-md transition-shadow group"
    >
      <div className={`h-14 w-14 rounded-xl ${bgColor} ${color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}
