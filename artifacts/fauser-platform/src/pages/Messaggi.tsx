import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Users, Send, Settings, Inbox, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@clerk/react";
import { useForm } from "react-hook-form";
import {
  useGetEmailAccount,
  useSaveEmailAccount,
  useGetEmailInbox,
  useGetEmailMessage,
  useSendEmail,
  useListGroupMessages,
  useCreateGroupMessage,
  useGetMe,
  useListClasses,
  getGetEmailInboxQueryKey,
  getListGroupMessagesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.04 } } },
  item: { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } },
};

function EmailSetupDialog({ onSaved }: { onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const saveAccount = useSaveEmailAccount();
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      imapHost: "", imapPort: 993, smtpHost: "", smtpPort: 587,
      username: "", password: "", useSsl: true,
    }
  });

  const onSubmit = (data: any) => {
    saveAccount.mutate({ data: { ...data, imapPort: Number(data.imapPort), smtpPort: Number(data.smtpPort), useSsl: true } }, {
      onSuccess: () => {
        toast({ title: "Account email salvato" });
        setOpen(false);
        onSaved();
      },
      onError: () => toast({ title: "Errore nel salvataggio", variant: "destructive" }),
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" data-testid="button-email-setup">
          <Settings className="h-4 w-4 mr-2" /> Configura Account Email
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configurazione Account Email</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <p className="text-sm text-muted-foreground">Inserisci le credenziali del tuo account email scolastico (IMAP/SMTP).</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>Email / Username</Label>
              <Input {...register("username", { required: true })} placeholder="nome@scuola.it" data-testid="input-email-username" />
            </div>
            <div className="col-span-2">
              <Label>Password</Label>
              <Input type="password" {...register("password", { required: true })} placeholder="••••••••" data-testid="input-email-password" />
            </div>
            <div>
              <Label>Server IMAP</Label>
              <Input {...register("imapHost", { required: true })} placeholder="imap.scuola.it" data-testid="input-imap-host" />
            </div>
            <div>
              <Label>Porta IMAP</Label>
              <Input type="number" {...register("imapPort")} placeholder="993" data-testid="input-imap-port" />
            </div>
            <div>
              <Label>Server SMTP</Label>
              <Input {...register("smtpHost", { required: true })} placeholder="smtp.scuola.it" data-testid="input-smtp-host" />
            </div>
            <div>
              <Label>Porta SMTP</Label>
              <Input type="number" {...register("smtpPort")} placeholder="587" data-testid="input-smtp-port" />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={saveAccount.isPending} data-testid="button-save-email-account">
            {saveAccount.isPending ? "Salvataggio..." : "Salva configurazione"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ComposeDialog({ defaultTo = "" }: { defaultTo?: string }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const sendEmail = useSendEmail();
  const { register, handleSubmit, reset } = useForm({ defaultValues: { to: defaultTo, subject: "", text: "" } });

  const onSubmit = (data: any) => {
    sendEmail.mutate({ data }, {
      onSuccess: () => {
        toast({ title: "Email inviata" });
        reset();
        setOpen(false);
      },
      onError: (err: any) => toast({ title: `Errore: ${err?.message ?? "Invio fallito"}`, variant: "destructive" }),
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" data-testid="button-compose-email">
          <Send className="h-4 w-4 mr-2" /> Scrivi email
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Nuova Email</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>A</Label>
            <Input {...register("to", { required: true })} placeholder="professore@scuola.it" data-testid="input-email-to" />
          </div>
          <div>
            <Label>Oggetto</Label>
            <Input {...register("subject", { required: true })} placeholder="Oggetto del messaggio" data-testid="input-email-subject" />
          </div>
          <div>
            <Label>Messaggio</Label>
            <Textarea {...register("text", { required: true })} rows={6} placeholder="Scrivi il tuo messaggio..." data-testid="textarea-email-body" />
          </div>
          <Button type="submit" className="w-full" disabled={sendEmail.isPending} data-testid="button-send-email">
            {sendEmail.isPending ? "Invio in corso..." : "Invia"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EmailPanel() {
  const [selectedUid, setSelectedUid] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { data: account, isLoading: accountLoading } = useGetEmailAccount();
  const { data: inbox, isLoading: inboxLoading, refetch } = useGetEmailInbox({}, {
    query: { enabled: !!account, queryKey: getGetEmailInboxQueryKey({}) },
  });
  const { data: message, isLoading: msgLoading } = useGetEmailMessage(selectedUid!, {
    query: { enabled: !!selectedUid, queryKey: ["email-message", selectedUid] as any },
  });

  const hasAccount = !!account;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-lg">Posta Elettronica</h2>
          {hasAccount && (
            <Badge variant="secondary" className="text-xs">{account.username}</Badge>
          )}
        </div>
        <div className="flex gap-2">
          <EmailSetupDialog onSaved={() => queryClient.invalidateQueries()} />
          {hasAccount && (
            <>
              <Button variant="outline" size="sm" onClick={() => refetch()} data-testid="button-refresh-inbox">
                <RefreshCw className="h-4 w-4" />
              </Button>
              <ComposeDialog />
            </>
          )}
        </div>
      </div>

      {!hasAccount && !accountLoading && (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
            <Mail className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">Nessun account email configurato</p>
            <p className="text-sm text-muted-foreground mt-1">Configura il tuo account IMAP/SMTP per leggere e inviare email ai professori</p>
          </div>
          <EmailSetupDialog onSaved={() => queryClient.invalidateQueries()} />
        </div>
      )}

      {hasAccount && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 min-h-[500px]">
          {/* Inbox list */}
          <div className="md:col-span-2 border rounded-lg overflow-hidden">
            <div className="p-3 border-b bg-muted/30 flex items-center gap-2">
              <Inbox className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Posta in arrivo</span>
              {inbox && <Badge variant="secondary" className="ml-auto text-xs">{inbox.length}</Badge>}
            </div>
            <div className="overflow-y-auto max-h-[460px]">
              {inboxLoading && (
                <div className="p-6 text-center text-muted-foreground text-sm">Caricamento messaggi...</div>
              )}
              {!inboxLoading && inbox?.length === 0 && (
                <div className="p-6 text-center text-muted-foreground text-sm">Nessun messaggio</div>
              )}
              {!inboxLoading && inbox && inbox.length > 0 && (
                <motion.div variants={stagger.container} initial="hidden" animate="show">
                  {inbox.map((msg) => (
                    <motion.button
                      key={msg.uid}
                      variants={stagger.item}
                      onClick={() => setSelectedUid(msg.uid)}
                      data-testid={`email-item-${msg.uid}`}
                      className={`w-full text-left p-3 border-b hover:bg-muted/50 transition-colors ${selectedUid === msg.uid ? "bg-primary/5 border-l-2 border-l-primary" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm truncate ${!msg.seen ? "font-semibold" : "font-normal"}`}>{msg.from}</p>
                          <p className="text-sm truncate text-muted-foreground">{msg.subject}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className="text-xs text-muted-foreground">{new Date(msg.date).toLocaleDateString("it-IT", { day: "2-digit", month: "short" })}</span>
                          {!msg.seen && <span className="h-2 w-2 rounded-full bg-primary" />}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </div>
          </div>

          {/* Message view */}
          <div className="md:col-span-3 border rounded-lg overflow-hidden">
            {!selectedUid && (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm p-8 text-center">
                <div>
                  <Mail className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p>Seleziona un messaggio per leggerlo</p>
                </div>
              </div>
            )}
            {selectedUid && msgLoading && (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                Caricamento messaggio...
              </div>
            )}
            {selectedUid && message && !msgLoading && (
              <div className="p-4 h-full overflow-y-auto">
                <div className="flex items-center gap-2 mb-4">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedUid(null)} className="md:hidden">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base truncate" data-testid="text-email-subject">{message.subject}</h3>
                    <p className="text-sm text-muted-foreground">Da: {message.from}</p>
                    <p className="text-xs text-muted-foreground">{new Date(message.date).toLocaleString("it-IT")}</p>
                  </div>
                  <ComposeDialog defaultTo={message.from} />
                </div>
                <hr className="mb-4" />
                <div className="prose prose-sm max-w-none text-foreground text-sm leading-relaxed whitespace-pre-wrap" data-testid="text-email-body">
                  {message.text ?? "Nessun contenuto testuale"}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function GroupPanel() {
  const { user: clerkUser } = useUser();
  const { data: me } = useGetMe();
  const { data: classes } = useListClasses();
  const [classId, setClassId] = useState<number | null>(null);
  const [newMsg, setNewMsg] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: messages, isLoading } = useListGroupMessages(
    { classId: classId! },
    { query: { enabled: !!classId, queryKey: getListGroupMessagesQueryKey({ classId: classId! }), refetchInterval: 5000 } }
  );

  const createMsg = useCreateGroupMessage();

  const myClassId = me?.classId ?? null;

  useEffect(() => {
    if (!classId && myClassId) setClassId(myClassId);
    else if (!classId && classes && classes.length > 0) setClassId(classes[0].id);
  }, [myClassId, classes]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!newMsg.trim() || !classId) return;
    createMsg.mutate({ data: { classId, content: newMsg.trim() } }, {
      onSuccess: () => {
        setNewMsg("");
        queryClient.invalidateQueries({ queryKey: getListGroupMessagesQueryKey({ classId: classId! }) });
      },
      onError: () => toast({ title: "Errore nell'invio", variant: "destructive" }),
    });
  };

  const selectedClass = classes?.find(c => c.id === classId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-lg">Gruppo Classe</h2>
          {selectedClass && <Badge variant="secondary">{selectedClass.name}</Badge>}
        </div>
        {classes && classes.length > 1 && (
          <div className="flex gap-1 flex-wrap">
            {classes.map(c => (
              <Button
                key={c.id}
                variant={classId === c.id ? "default" : "outline"}
                size="sm"
                onClick={() => setClassId(c.id)}
                data-testid={`button-class-${c.id}`}
              >
                {c.name}
              </Button>
            ))}
          </div>
        )}
      </div>

      <div className="border rounded-lg overflow-hidden flex flex-col" style={{ height: "520px" }}>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/10">
          {isLoading && <p className="text-center text-sm text-muted-foreground py-8">Caricamento messaggi...</p>}
          {!isLoading && (!messages || messages.length === 0) && (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm">
              <Users className="h-10 w-10 mb-3 opacity-30" />
              <p>Nessun messaggio ancora. Sii il primo!</p>
            </div>
          )}
          <AnimatePresence>
            {messages?.map((msg) => {
              const isMe = me && msg.senderId === me.id;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  data-testid={`message-${msg.id}`}
                >
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${isMe ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-card border rounded-bl-sm"}`}>
                    {!isMe && (
                      <p className="text-xs font-medium mb-1 opacity-70">{msg.senderName}</p>
                    )}
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    <p className={`text-xs mt-1 ${isMe ? "opacity-60 text-right" : "text-muted-foreground"}`}>
                      {new Date(msg.createdAt).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t p-3 flex gap-2 bg-card">
          <Input
            value={newMsg}
            onChange={e => setNewMsg(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Scrivi un messaggio al gruppo..."
            className="flex-1"
            disabled={!classId}
            data-testid="input-group-message"
          />
          <Button
            onClick={handleSend}
            disabled={!newMsg.trim() || !classId || createMsg.isPending}
            data-testid="button-send-group-message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Messaggi() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary tracking-tight">Messaggi</h1>
        <p className="text-muted-foreground text-sm mt-1">Comunicazioni con i professori via email e gruppo classe</p>
      </div>

      <Tabs defaultValue="gruppo" className="space-y-4">
        <TabsList>
          <TabsTrigger value="gruppo" data-testid="tab-gruppo">
            <Users className="h-4 w-4 mr-2" />
            Gruppo Classe
          </TabsTrigger>
          <TabsTrigger value="email" data-testid="tab-email">
            <Mail className="h-4 w-4 mr-2" />
            Email Professori
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gruppo">
          <GroupPanel />
        </TabsContent>

        <TabsContent value="email">
          <EmailPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
