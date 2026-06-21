import { useGetMe } from "@workspace/api-client-react";
import { useUser } from "@clerk/react";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function Profilo() {
  const { data: user } = useGetMe();
  const { user: clerkUser } = useUser();

  if (!user || !clerkUser) return null;

  const qrData = JSON.stringify({
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    role: user.role,
    classId: user.classId,
  });

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profilo Utente</h1>
        <p className="text-muted-foreground mt-1">
          Gestisci i tuoi dati personali e la tua tessera virtuale.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Dati Personali</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center space-y-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={clerkUser.imageUrl} />
              <AvatarFallback className="text-2xl">
                {user.firstName[0]}
                {user.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="default" className="uppercase">
                {user.role}
              </Badge>
              {user.classId && (
                <Badge variant="secondary">Classe ID: {user.classId}</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary text-primary-foreground border-none overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <CardHeader>
            <CardTitle className="text-primary-foreground/90">
              Tessera Virtuale
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6 relative z-10">
            <div className="bg-white p-4 rounded-xl mb-4">
              <QRCodeSVG value={qrData} size={180} level="M" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-xl tracking-tight">ITT G.Fauser</h3>
              <p className="text-primary-foreground/70 text-sm">
                A.S. 2023/2024
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
