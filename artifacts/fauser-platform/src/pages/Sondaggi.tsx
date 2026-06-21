import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { BarChart3, Clock, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Sondaggi() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const { data: polls = [], isLoading } = useQuery({
    queryKey: ["polls"],
    queryFn: async () => {
      const token = await getToken();
      const r = await fetch("/api/polls", { headers: { Authorization: `Bearer ${token}` } });
      if (!r.ok) return [];
      return r.json();
    }
  });

  const votePoll = useMutation({
    mutationFn: async ({ pollId, optionId }: { pollId: number, optionId: number }) => {
      const token = await getToken();
      const r = await fetch(`/api/polls/${pollId}/vote`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ optionId })
      });
      return r.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["polls"] })
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sondaggi</h1>
          <p className="text-muted-foreground mt-1">Partecipa alle decisioni della classe e dell'istituto.</p>
        </div>
      </div>

      <Tabs defaultValue="attivi">
        <TabsList>
          <TabsTrigger value="attivi">Attivi</TabsTrigger>
          <TabsTrigger value="chiusi">Chiusi</TabsTrigger>
        </TabsList>

        <TabsContent value="attivi" className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1,2].map(i => <Skeleton key={i} className="h-64" />)}
            </div>
          ) : polls.filter((p:any) => p.status !== 'closed').length === 0 ? (
            <Card className="flex flex-col items-center justify-center h-48 text-center p-6 border-dashed">
              <BarChart3 className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
              <CardTitle className="text-lg">Nessun sondaggio attivo</CardTitle>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {polls.filter((p:any) => p.status !== 'closed').map((poll: any, idx: number) => {
                const totalVotes = poll.options.reduce((acc: number, opt: any) => acc + (opt.voteCount || 0), 0);
                const hasVoted = !!poll.myVoteOptionId;

                return (
                  <motion.div key={poll.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                    <Card className="h-full flex flex-col">
                      <CardHeader className="pb-4">
                        <div className="flex justify-between items-start gap-4 mb-2">
                          <CardTitle className="text-xl leading-tight">{poll.question}</CardTitle>
                          <Badge variant="outline" className="bg-primary/5 text-primary shrink-0 whitespace-nowrap">
                            <Clock className="mr-1 h-3 w-3" /> Attivo
                          </Badge>
                        </div>
                        <CardDescription>Creato da {poll.authorName}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1 space-y-4">
                        {hasVoted ? (
                          <div className="space-y-3">
                            <div className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500" /> Hai già votato
                            </div>
                            {poll.options.map((opt: any) => {
                              const percent = totalVotes > 0 ? ((opt.voteCount || 0) / totalVotes) * 100 : 0;
                              const isMyVote = opt.id === poll.myVoteOptionId;
                              return (
                                <div key={opt.id} className="space-y-1">
                                  <div className="flex justify-between text-sm">
                                    <span className={isMyVote ? "font-bold text-primary" : "text-foreground"}>
                                      {opt.text}
                                    </span>
                                    <span className="font-medium text-muted-foreground">{percent.toFixed(0)}% ({opt.voteCount || 0})</span>
                                  </div>
                                  <Progress value={percent} className={`h-2 ${isMyVote ? "[&>div]:bg-primary" : "[&>div]:bg-muted-foreground/30"}`} />
                                </div>
                              );
                            })}
                            <div className="text-xs text-right text-muted-foreground mt-4 pt-4 border-t">
                              Totale voti: {totalVotes}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {poll.options.map((opt: any) => (
                              <Button 
                                key={opt.id} 
                                variant="outline" 
                                className="w-full justify-start h-auto py-3 px-4 font-normal text-left whitespace-normal hover:border-primary hover:bg-primary/5"
                                onClick={() => votePoll.mutate({ pollId: poll.id, optionId: opt.id })}
                                disabled={votePoll.isPending}
                              >
                                {opt.text}
                              </Button>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>
        <TabsContent value="chiusi" className="mt-6">
          <Card className="flex flex-col items-center justify-center h-48 text-center p-6 border-dashed">
             <CardDescription>Nessun sondaggio chiuso di recente.</CardDescription>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}