import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Plus, Search } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

export default function Diario() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [search, setSearch] = useState("");
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["diary"],
    queryFn: async () => {
      const token = await getToken();
      const r = await fetch("/api/diary", { headers: { Authorization: `Bearer ${token}` } });
      if (!r.ok) return [];
      return r.json();
    }
  });

  const createEntry = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      const r = await fetch("/api/diary", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Nuova nota", content: "" })
      });
      return r.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["diary"] });
      setSelectedId(data.id);
      setTitle(data.title);
      setContent(data.content);
    }
  });

  const updateEntry = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      const token = await getToken();
      const r = await fetch(`/api/diary/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      return r.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["diary"], (old: any) => 
        old?.map((e: any) => e.id === data.id ? data : e)
      );
    }
  });

  const selectedEntry = entries.find((e: any) => e.id === selectedId);

  useEffect(() => {
    if (selectedEntry) {
      setTitle(selectedEntry.title || "");
      setContent(selectedEntry.content || "");
    }
  }, [selectedId, selectedEntry?.id]);

  const handleSave = () => {
    if (selectedId) {
      updateEntry.mutate({ id: selectedId, data: { title, content } });
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(handleSave, 500);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(handleSave, 500);
  };

  const filteredEntries = entries.filter((e: any) => 
    e.title?.toLowerCase().includes(search.toLowerCase()) || 
    e.subjectName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-card border rounded-lg overflow-hidden shadow-sm">
      {/* Sidebar */}
      <div className="w-80 border-r flex flex-col bg-muted/10">
        <div className="p-4 border-b space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" /> Diario
            </h2>
            <Button size="icon" variant="ghost" onClick={() => createEntry.mutate()} disabled={createEntry.isPending}>
              <Plus className="h-5 w-5" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Cerca nota..." 
              className="pl-9 h-9 bg-background" 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              Nessuna nota trovata.
            </div>
          ) : (
            filteredEntries.map((e: any) => (
              <div 
                key={e.id}
                onClick={() => setSelectedId(e.id)}
                className={`p-4 border-b cursor-pointer transition-colors hover:bg-muted/50 ${selectedId === e.id ? 'bg-primary/5 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'}`}
              >
                <div className="font-medium truncate">{e.title || "Senza titolo"}</div>
                <div className="flex justify-between items-center mt-1">
                  <div className="text-xs text-muted-foreground truncate">{e.subjectName || "Generale"}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {format(new Date(e.updatedAt), "d MMM", { locale: it })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col bg-background">
        {selectedId ? (
          <div className="flex-1 flex flex-col p-6 max-w-4xl mx-auto w-full">
            <Input 
              value={title}
              onChange={handleTitleChange}
              onBlur={handleSave}
              placeholder="Titolo nota..."
              className="text-3xl font-bold border-0 px-0 focus-visible:ring-0 shadow-none h-auto py-2 rounded-none mb-4"
            />
            <div className="flex items-center gap-2 mb-8 text-sm text-muted-foreground">
              <span>{selectedEntry?.subjectName || "Generale"}</span>
              <span>•</span>
              <span>Ultima modifica: {selectedEntry && format(new Date(selectedEntry.updatedAt), "d MMMM yyyy, HH:mm", { locale: it })}</span>
            </div>
            <Textarea 
              value={content}
              onChange={handleContentChange}
              onBlur={handleSave}
              placeholder="Scrivi i tuoi appunti qui..."
              className="flex-1 border-0 px-0 focus-visible:ring-0 shadow-none resize-none text-base leading-relaxed"
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <BookOpen className="h-16 w-16 mb-4 opacity-20" />
            <p className="text-lg">Seleziona una nota dal menu laterale</p>
            <p className="text-sm">o creane una nuova per iniziare</p>
          </div>
        )}
      </div>
    </div>
  );
}