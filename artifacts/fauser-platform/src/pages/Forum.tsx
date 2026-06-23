import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import { useApi } from "@/lib/useApi";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Plus, ArrowLeft, Send } from "lucide-react";
import { motion } from "framer-motion";

function timeAgo(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const mins = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (mins < 60) return `${mins}m fa`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h fa`;
  return `${Math.floor(mins / 1440)}g fa`;
}

interface ForumThread {
  id: number;
  title: string;
  subjectName?: string;
  authorName?: string;
  authorId?: string | number;
  createdAt: string;
  lastReplyAt?: string;
  replyCount?: number;
}
interface ForumPost {
  id: number;
  authorId?: string | number;
  authorName: string;
  content: string;
  createdAt: string;
}

export default function Forum() {
  const { userId } = useAuth();
  const api = useApi();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedThread, setSelectedThread] = useState<ForumThread | null>(
    null,
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    data: threads = [],
    isLoading: threadsLoading,
    isError: threadsError,
  } = useQuery<ForumThread[]>({
    queryKey: ["forum-threads"],
    queryFn: () => api<ForumThread[]>("/api/forum/threads"),
  });

  const { data: posts = [], isLoading: postsLoading } = useQuery<ForumPost[]>({
    queryKey: ["forum-posts", selectedThread?.id],
    enabled: !!selectedThread?.id,
    queryFn: () =>
      api<ForumPost[]>(`/api/forum/threads/${selectedThread!.id}/posts`),
  });

  const createPost = useMutation({
    mutationFn: (content: string) =>
      api(`/api/forum/threads/${selectedThread!.id}/posts`, {
        method: "POST",
        body: { content },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["forum-posts", selectedThread!.id],
      });
      queryClient.invalidateQueries({ queryKey: ["forum-threads"] });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Impossibile inviare il messaggio.",
        variant: "destructive",
      });
    },
  });

  if (selectedThread) {
    return (
      <div className="h-[calc(100vh-8rem)] flex flex-col max-w-4xl mx-auto bg-card border rounded-lg overflow-hidden shadow-sm">
        <div className="p-4 border-b flex items-center gap-4 bg-muted/10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedThread(null)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h2 className="font-bold text-lg leading-tight">
              {selectedThread.title}
            </h2>
            <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="font-normal">
                {selectedThread.subjectName}
              </Badge>
              <span>•</span>
              <span>{selectedThread.authorName}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {postsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-3/4" />
              ))}
            </div>
          ) : (
            posts.map((p: ForumPost) => {
              const isMine = p.authorId === userId;
              return (
                <div
                  key={p.id}
                  className={`flex gap-3 max-w-[85%] ${isMine ? "ml-auto flex-row-reverse" : ""}`}
                >
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {p.authorName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`flex flex-col gap-1 ${isMine ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        {p.authorName}
                      </span>
                      <span className="text-[10px] text-muted-foreground/60">
                        {timeAgo(p.createdAt)}
                      </span>
                    </div>
                    <div
                      className={`p-3 rounded-2xl text-sm ${isMine ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted rounded-tl-sm"}`}
                    >
                      {p.content}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-4 border-t bg-muted/10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const content = fd.get("content") as string;
              if (content.trim()) {
                createPost.mutate(content);
                e.currentTarget.reset();
              }
            }}
            className="flex gap-2"
          >
            <Input
              name="content"
              placeholder="Scrivi una risposta..."
              className="flex-1 rounded-full"
              autoComplete="off"
            />
            <Button
              type="submit"
              size="icon"
              className="rounded-full shrink-0"
              disabled={createPost.isPending}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Forum</h1>
          <p className="text-muted-foreground mt-1">
            Spazio di discussione per materie e argomenti.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nuovo Thread
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crea nuova discussione</DialogTitle>
            </DialogHeader>
            <form className="space-y-4">
              <div className="space-y-2">
                <Input placeholder="Titolo della discussione" />
              </div>
              <div className="space-y-2">
                <Textarea placeholder="Primo messaggio..." rows={4} />
              </div>
              <DialogFooter>
                <Button type="button" onClick={() => setIsDialogOpen(false)}>
                  Pubblica
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {threadsLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : threadsError ? (
        <Card className="flex flex-col items-center justify-center h-48 text-center p-6 border-dashed">
          <CardTitle className="text-lg text-destructive">
            Errore di caricamento
          </CardTitle>
          <CardDescription>
            Impossibile caricare le discussioni. Riprova più tardi.
          </CardDescription>
        </Card>
      ) : threads.length === 0 ? (
        <Card className="flex flex-col items-center justify-center h-48 text-center p-6 border-dashed">
          <MessageSquare className="h-10 w-10 text-muted-foreground mb-4" />
          <CardTitle className="text-lg">Nessuna discussione</CardTitle>
          <CardDescription>
            Sii il primo ad avviare un thread nel forum.
          </CardDescription>
        </Card>
      ) : (
        <div className="space-y-3">
          {threads.map((t: ForumThread, idx: number) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card
                className="cursor-pointer hover-elevate group transition-colors hover:bg-muted/5"
                onClick={() => setSelectedThread(t)}
              >
                <CardContent className="p-4 sm:p-5 flex items-center justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 overflow-hidden">
                    <div className="hidden sm:flex h-10 w-10 rounded-full bg-primary/10 items-center justify-center text-primary shrink-0">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                        {t.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
                        <Badge variant="secondary" className="font-normal">
                          {t.subjectName}
                        </Badge>
                        <span>di {t.authorName}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="hidden sm:inline">
                          Ultimo: {timeAgo(t.lastReplyAt || t.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center shrink-0 w-16">
                    <div className="text-xl font-bold">{t.replyCount || 0}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Risposte
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
