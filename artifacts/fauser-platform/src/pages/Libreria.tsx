import { useState } from "react";
import { useListMaterials, useListSubjects } from "@workspace/api-client-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  FileText,
  ExternalLink,
  Library as LibraryIcon,
} from "lucide-react";

export default function Libreria() {
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);

  const { data: materials = [] } = useListMaterials();
  const { data: subjects = [] } = useListSubjects();

  const filteredMaterials = materials.filter((m: any) => {
    const matchSearch =
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      (m.description &&
        m.description.toLowerCase().includes(search.toLowerCase()));
    const matchSubject = selectedSubject
      ? m.subjectId === selectedSubject
      : true;
    return matchSearch && matchSubject;
  });

  const getExtension = (url?: string) => {
    if (!url) return "";
    const parts = url.split(".");
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Libreria Condivisa
        </h1>
        <p className="text-muted-foreground mt-1">
          Risorse e materiali didattici per l'approfondimento.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca materiale per titolo o descrizione..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge
          variant={selectedSubject === null ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setSelectedSubject(null)}
        >
          Tutte le materie
        </Badge>
        {subjects.map((s: any) => (
          <Badge
            key={s.id}
            variant={selectedSubject === s.id ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedSubject(s.id)}
          >
            {s.name}
          </Badge>
        ))}
      </div>

      <div className="text-sm text-muted-foreground font-medium">
        {filteredMaterials.length} risorse disponibili
      </div>

      {filteredMaterials.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-lg bg-muted/5">
          <LibraryIcon className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-medium">Nessuna risorsa trovata</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Prova a cambiare i filtri di ricerca.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMaterials.map((m: any) => {
            const ext = getExtension(m.fileUrl);
            return (
              <Card
                key={m.id}
                className="flex flex-col h-full hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-3 flex-none">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <Badge
                      variant="secondary"
                      className="bg-primary/10 text-primary hover:bg-primary/20"
                    >
                      {m.subjectName}
                    </Badge>
                    {ext && (
                      <Badge
                        variant="outline"
                        className="uppercase text-[10px]"
                      >
                        {ext}
                      </Badge>
                    )}
                  </div>
                  <CardTitle
                    className="text-base line-clamp-2 leading-tight"
                    title={m.title}
                  >
                    {m.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-4 flex-1">
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {m.description || "Nessuna descrizione."}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-auto">
                    <FileText className="h-3 w-3" />
                    <span>Caricato da {m.teacherName || "Docente"}</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 border-t flex-none">
                  {m.fileUrl ? (
                    <Button
                      variant="ghost"
                      className="w-full text-primary hover:text-primary hover:bg-primary/5 mt-3"
                      asChild
                    >
                      <a
                        href={m.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" /> Apri risorsa
                      </a>
                    </Button>
                  ) : (
                    <div className="w-full mt-3 text-center py-2 text-sm text-muted-foreground bg-muted/50 rounded-md">
                      Non disponibile
                    </div>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
