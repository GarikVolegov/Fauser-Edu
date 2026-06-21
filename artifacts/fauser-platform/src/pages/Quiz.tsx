import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import {
  useGetMe,
  useListClasses,
  useListSubjects,
} from "@workspace/api-client-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { motion } from "framer-motion";
import { Plus, PlayCircle, CheckCircle2, Clock } from "lucide-react";

export default function Quiz() {
  const { data: user } = useGetMe();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);

  const { data: quizzes = [], isLoading } = useQuery({
    queryKey: ["quizzes"],
    queryFn: async () => {
      const token = await getToken();
      const r = await fetch("/api/quizzes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) return [];
      return r.json();
    },
  });

  const { data: subjects } = useListSubjects();
  const { data: classes } = useListClasses();

  const createQuiz = useMutation({
    mutationFn: async (data: any) => {
      const token = await getToken();
      const r = await fetch("/api/quizzes", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      return r.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      setIsDialogOpen(false);
    },
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createQuiz.mutate({
      title: fd.get("title"),
      subjectId: Number(fd.get("subjectId")),
      classId: Number(fd.get("classId")),
      duration: Number(fd.get("duration")),
    });
  };

  const isTeacher = user?.role === "admin" || user?.role === "teacher";

  if (selectedQuizId) {
    return (
      <QuizDetail
        quizId={selectedQuizId}
        onBack={() => setSelectedQuizId(null)}
        userRole={user?.role}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quiz</h1>
          <p className="text-muted-foreground mt-1">
            Gestisci e partecipa ai quiz della classe.
          </p>
        </div>
        {isTeacher && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Nuovo Quiz
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crea Nuovo Quiz</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label>Titolo</Label>
                  <Input
                    name="title"
                    required
                    placeholder="Es. Verifica di Storia"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Materia</Label>
                  <Select name="subjectId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona materia" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects?.map((s) => (
                        <SelectItem key={s.id} value={s.id.toString()}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Classe</Label>
                  <Select name="classId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona classe" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes?.map((c: any) => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                          {c.anno}
                          {c.sezione}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Durata (minuti)</Label>
                  <Input
                    type="number"
                    name="duration"
                    required
                    defaultValue={30}
                    min={1}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createQuiz.isPending}>
                    Crea Quiz
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs defaultValue="attivi">
        <TabsList>
          <TabsTrigger value="attivi">
            {isTeacher ? "I miei quiz" : "Quiz attivi"}
          </TabsTrigger>
          <TabsTrigger value="risultati">
            {isTeacher ? "Statistiche" : "I miei risultati"}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="attivi" className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-40" />
              ))}
            </div>
          ) : quizzes.length === 0 ? (
            <Card className="flex flex-col items-center justify-center h-48 text-center p-6 border-dashed">
              <CheckCircle2 className="h-10 w-10 text-muted-foreground mb-4" />
              <CardTitle className="text-lg">Nessun quiz attivo</CardTitle>
              <CardDescription>
                Non ci sono quiz disponibili al momento.
              </CardDescription>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quizzes.map((q: any, idx: number) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="h-full flex flex-col hover-elevate">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start gap-2">
                        <CardTitle className="line-clamp-2 text-lg">
                          {q.title}
                        </CardTitle>
                      </div>
                      <CardDescription>
                        {q.subjectName} • {q.className}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 pb-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="h-4 w-4" /> {q.duration} min
                      </div>
                      <div>{q.questionsCount || 0} domande</div>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Button
                        className="w-full"
                        variant={isTeacher ? "outline" : "default"}
                        onClick={() => setSelectedQuizId(q.id)}
                      >
                        {isTeacher ? (
                          "Gestisci"
                        ) : (
                          <>
                            <PlayCircle className="mr-2 h-4 w-4" /> Inizia
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="risultati" className="mt-6">
          <Card className="flex flex-col items-center justify-center h-48 text-center p-6 border-dashed">
            <CardDescription>Funzionalità in arrivo.</CardDescription>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function QuizDetail({
  quizId,
  onBack,
  userRole,
}: {
  quizId: number;
  onBack: () => void;
  userRole?: string;
}) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const { data: quiz, isLoading } = useQuery({
    queryKey: ["quiz", quizId],
    queryFn: async () => {
      const token = await getToken();
      const r = await fetch(`/api/quizzes/${quizId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) return null;
      return r.json();
    },
  });

  const { data: questions = [] } = useQuery({
    queryKey: ["quiz-questions", quizId],
    queryFn: async () => {
      const token = await getToken();
      const r = await fetch(`/api/quizzes/${quizId}/questions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) return [];
      return r.json();
    },
  });

  const isTeacher = userRole === "admin" || userRole === "teacher";

  useEffect(() => {
    if (!isTeacher && quiz?.duration && timeLeft === null) {
      setTimeLeft(quiz.duration * 60);
    }
  }, [quiz, isTeacher, timeLeft]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    const t = setInterval(
      () => setTimeLeft((prev) => (prev ? prev - 1 : 0)),
      1000,
    );
    return () => clearInterval(t);
  }, [timeLeft]);

  const addQuestion = useMutation({
    mutationFn: async (data: any) => {
      const token = await getToken();
      const r = await fetch(`/api/quizzes/${quizId}/questions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      return r.json();
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["quiz-questions", quizId] }),
  });

  if (isLoading) return <Skeleton className="h-64" />;
  if (!quiz) return <div>Quiz non trovato</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          Indietro
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{quiz.title}</h1>
          <p className="text-muted-foreground">
            {quiz.subjectName} • Durata: {quiz.duration} min
          </p>
        </div>
        {!isTeacher && timeLeft !== null && (
          <div className="text-xl font-mono bg-primary/10 px-4 py-2 rounded-md font-bold text-primary border border-primary/20">
            {Math.floor(timeLeft / 60)
              .toString()
              .padStart(2, "0")}
            :{(timeLeft % 60).toString().padStart(2, "0")}
          </div>
        )}
      </div>

      <div className="space-y-8">
        {questions.map((q: any, i: number) => (
          <Card key={q.id}>
            <CardHeader>
              <CardTitle className="text-lg">Domanda {i + 1}</CardTitle>
              <CardDescription className="text-base font-medium text-foreground mt-2">
                {q.text}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {q.type === "multiple_choice" ? (
                <RadioGroup className="space-y-3">
                  {q.choices?.map((c: any) => (
                    <div
                      key={c.id}
                      className="flex items-center space-x-3 bg-muted/30 p-3 rounded-md border"
                    >
                      <RadioGroupItem
                        value={c.id.toString()}
                        id={`c-${c.id}`}
                        disabled={isTeacher}
                      />
                      <Label
                        htmlFor={`c-${c.id}`}
                        className="flex-1 cursor-pointer font-normal"
                      >
                        {c.text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <Input
                  placeholder="Scrivi la tua risposta..."
                  disabled={isTeacher}
                />
              )}
            </CardContent>
          </Card>
        ))}

        {!isTeacher && questions.length > 0 && (
          <div className="flex justify-end pt-4">
            <Button size="lg" className="w-full sm:w-auto">
              Consegna Quiz
            </Button>
          </div>
        )}

        {isTeacher && (
          <Card className="border-dashed bg-muted/10">
            <CardHeader>
              <CardTitle className="text-lg">Aggiungi Domanda</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  addQuestion.mutate({
                    text: fd.get("text"),
                    type: "open",
                  });
                  e.currentTarget.reset();
                }}
                className="flex gap-4"
              >
                <Input
                  name="text"
                  placeholder="Testo della domanda"
                  required
                  className="flex-1"
                />
                <Button type="submit" disabled={addQuestion.isPending}>
                  Aggiungi
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
