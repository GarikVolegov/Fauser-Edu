import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import { useGetMe, useListSubjects } from "@workspace/api-client-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Users2, Plus, MessageSquarePlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type TutoringPostType = {
  id: number;
  authorId: number;
  authorName: string;
  subjectId: number;
  subjectName: string;
  type: string;
  description: string;
  status: string;
  classId?: number;
  createdAt: string;
};

export default function Tutoraggio() {
  const { data: user } = useGetMe();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [filterType, setFilterType] = useState<string>("all");
  const [filterSubject, setFilterSubject] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [newPost, setNewPost] = useState({
    subjectId: "",
    type: "offre",
    description: "",
  });

  const { data: subjects = [] } = useListSubjects();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["tutoring"],
    queryFn: async () => {
      const token = await getToken();
      const r = await fetch(`/api/tutoring`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) return [];
      return r.json() as Promise<TutoringPostType[]>;
    },
  });

  const createPost = useMutation({
    mutationFn: async (data: any) => {
      const token = await getToken();
      const r = await fetch("/api/tutoring", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!r.ok) throw new Error("Errore");
      return r.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tutoring"] });
      toast({ title: "Annuncio pubblicato" });
      setIsDialogOpen(false);
      setNewPost({ subjectId: "", type: "offre", description: "" });
    },
  });

  const closePost = useMutation({
    mutationFn: async (id: number) => {
      const token = await getToken();
      const r = await fetch(`/api/tutoring/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "closed" }),
      });
      if (!r.ok) throw new Error("Errore");
      return r.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tutoring"] });
      toast({ title: "Annuncio chiuso" });
    },
  });

  const filteredPosts = posts.filter((p: TutoringPostType) => {
    if (filterType !== "all" && p.type !== filterType) return false;
    if (filterSubject !== "all" && p.subjectId.toString() !== filterSubject)
      return false;
    return true;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Tutoraggio tra Pari
          </h1>
          <p className="text-muted-foreground mt-1">
            Bacheca scambi: offri o cerca aiuto nello studio.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nuovo annuncio
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Pubblica un annuncio</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Tipo di annuncio</Label>
                <ToggleGroup
                  type="single"
                  value={newPost.type}
                  onValueChange={(v) =>
                    v && setNewPost((p) => ({ ...p, type: v }))
                  }
                  className="justify-start"
                >
                  <ToggleGroupItem
                    value="offre"
                    className="data-[state=on]:bg-green-100 data-[state=on]:text-green-800"
                  >
                    Offro aiuto
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="cerca"
                    className="data-[state=on]:bg-amber-100 data-[state=on]:text-amber-800"
                  >
                    Cerco aiuto
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
              <div className="space-y-2">
                <Label>Materia</Label>
                <Select
                  value={newPost.subjectId}
                  onValueChange={(v) =>
                    setNewPost((p) => ({ ...p, subjectId: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona materia" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((s: any) => (
                      <SelectItem key={s.id} value={s.id.toString()}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Descrizione</Label>
                <Textarea
                  value={newPost.description}
                  onChange={(e) =>
                    setNewPost((p) => ({ ...p, description: e.target.value }))
                  }
                  placeholder="Es. Cerco aiuto per recuperare le equazioni di 2° grado..."
                  rows={4}
                />
              </div>
              <Button
                onClick={() =>
                  createPost.mutate({
                    subjectId: parseInt(newPost.subjectId),
                    type: newPost.type,
                    description: newPost.description,
                  })
                }
                disabled={
                  !newPost.subjectId ||
                  newPost.description.length < 10 ||
                  createPost.isPending
                }
              >
                Pubblica
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-muted/30 p-2 rounded-lg">
        <ToggleGroup
          type="single"
          value={filterType}
          onValueChange={(v) => v && setFilterType(v)}
        >
          <ToggleGroupItem value="all">Tutti</ToggleGroupItem>
          <ToggleGroupItem value="offre">Offre aiuto</ToggleGroupItem>
          <ToggleGroupItem value="cerca">Cerca aiuto</ToggleGroupItem>
        </ToggleGroup>
        <div className="h-6 w-px bg-border hidden sm:block"></div>
        <Select value={filterSubject} onValueChange={setFilterSubject}>
          <SelectTrigger className="w-full sm:w-[200px] border-none bg-transparent shadow-none focus:ring-0">
            <SelectValue placeholder="Tutte le materie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutte le materie</SelectItem>
            {subjects.map((s: any) => (
              <SelectItem key={s.id} value={s.id.toString()}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-lg bg-muted/5">
          <Users2 className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-medium">Nessun annuncio</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Non ci sono annunci che corrispondono ai filtri.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPosts.map((post) => (
            <Card
              key={post.id}
              className={`flex flex-col h-full ${post.status === "closed" ? "opacity-50" : ""}`}
            >
              <CardHeader className="pb-3 flex-none">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {post.authorName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-sm">
                        {post.authorName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(post.createdAt), "dd MMM", {
                          locale: it,
                        })}
                      </div>
                    </div>
                  </div>
                  {post.status === "closed" ? (
                    <Badge variant="outline">Chiuso</Badge>
                  ) : post.type === "offre" ? (
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-800 border-green-200"
                    >
                      Offre
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-amber-100 text-amber-800 border-amber-200"
                    >
                      Cerca
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pb-4 flex-1">
                <Badge
                  variant="secondary"
                  className="mb-3 bg-primary/10 text-primary hover:bg-primary/20"
                >
                  {post.subjectName}
                </Badge>
                <p className="text-sm mt-1 whitespace-pre-wrap">
                  {post.description}
                </p>
              </CardContent>
              <CardFooter className="pt-0 border-t flex-none">
                {post.authorId === user?.id && post.status !== "closed" ? (
                  <Button
                    variant="ghost"
                    className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 mt-3"
                    onClick={() => closePost.mutate(post.id)}
                    disabled={closePost.isPending}
                  >
                    Chiudi annuncio
                  </Button>
                ) : post.authorId !== user?.id && post.status !== "closed" ? (
                  <Button
                    variant="ghost"
                    className="w-full text-primary hover:text-primary hover:bg-primary/5 mt-3"
                  >
                    <MessageSquarePlus className="mr-2 h-4 w-4" /> Contatta
                  </Button>
                ) : (
                  <div className="w-full mt-3"></div>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
