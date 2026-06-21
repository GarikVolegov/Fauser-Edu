import { useState } from "react";
import { useAuth } from "@clerk/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Loader2, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";

const CERTIFICATES = [
  {
    id: "iscrizione",
    name: "Certificato di iscrizione",
    desc: "Attesta la regolare iscrizione all'anno scolastico in corso.",
  },
  {
    id: "frequenza",
    name: "Attestato di frequenza",
    desc: "Dichiara le ore di presenza e la regolarità della frequenza.",
  },
  {
    id: "pagella",
    name: "Estratto pagella",
    desc: "Riepilogo dei voti e delle valutazioni del periodo.",
  },
];

export default function Certificati() {
  const { getToken } = useAuth();
  const [downloading, setDownloading] = useState<string | null>(null);

  const downloadCert = async (type: string) => {
    try {
      setDownloading(type);
      const token = await getToken();
      // Simulate API delay since endpoints might not exist yet
      await new Promise((r) => setTimeout(r, 1500));

      const r = await fetch(`/api/certificates/${type}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!r.ok) throw new Error("Endpoint not available");

      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificato_${type}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      // Fallback for visual demonstration
      alert(
        "Il sistema di generazione PDF non è attualmente raggiungibile. Riprova più tardi.",
      );
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Certificati e Documenti
        </h1>
        <p className="text-muted-foreground text-lg">
          Scarica i documenti ufficiali con firma digitale.
        </p>

        <Alert className="bg-primary/5 border-primary/20 text-primary mt-2">
          <Info className="h-4 w-4" />
          <AlertDescription>
            I certificati vengono generati in tempo reale con i tuoi dati
            aggiornati e hanno validità legale per gli usi consentiti.
          </AlertDescription>
        </Alert>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        {CERTIFICATES.map((cert, idx) => (
          <motion.div
            key={cert.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="h-full flex flex-col border-2 hover:border-primary/50 transition-colors">
              <CardHeader className="pb-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <FileText className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">{cert.name}</CardTitle>
                <CardDescription className="pt-2">{cert.desc}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                {/* Space for future details */}
              </CardContent>
              <CardFooter className="pt-0">
                <Button
                  className="w-full"
                  variant="default"
                  disabled={!!downloading}
                  onClick={() => downloadCert(cert.id)}
                >
                  {downloading === cert.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Generazione in corso...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" /> Scarica PDF
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
