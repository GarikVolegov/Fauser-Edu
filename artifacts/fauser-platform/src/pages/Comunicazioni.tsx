import { useListAnnouncements, useGetMe } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import {
  Bell,
  Search,
  Megaphone,
  Info,
  AlertTriangle,
  FileText,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export default function Comunicazioni() {
  const { data: user } = useGetMe();
  const { data: announcements, isLoading } = useListAnnouncements();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "circolare":
        return <FileText className="h-5 w-5 text-blue-500" />;
      case "avviso":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "notizia":
        return <Info className="h-5 w-5 text-green-500" />;
      case "comunicato":
        return <Megaphone className="h-5 w-5 text-primary" />;
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const filteredAnnouncements = announcements?.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "all" || item.category === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Comunicazioni</h1>
          <p className="text-muted-foreground mt-1">
            Bacheca ufficiale dell'istituto.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca comunicazioni..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex overflow-x-auto pb-2 md:pb-0 gap-2 hide-scrollbar">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            className="shrink-0"
          >
            Tutte
          </Button>
          <Button
            variant={filter === "circolare" ? "default" : "outline"}
            onClick={() => setFilter("circolare")}
            className="shrink-0"
          >
            Circolari
          </Button>
          <Button
            variant={filter === "avviso" ? "default" : "outline"}
            onClick={() => setFilter("avviso")}
            className="shrink-0"
          >
            Avvisi
          </Button>
          <Button
            variant={filter === "notizia" ? "default" : "outline"}
            onClick={() => setFilter("notizia")}
            className="shrink-0"
          >
            Notizie
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : filteredAnnouncements && filteredAnnouncements.length > 0 ? (
        <div className="space-y-4">
          {filteredAnnouncements.map((announcement, idx) => (
            <motion.div
              key={announcement.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="overflow-hidden hover:border-primary/30 transition-colors group cursor-pointer">
                <div className="flex flex-col sm:flex-row">
                  <div className="p-6 sm:w-[120px] bg-muted/20 flex flex-row sm:flex-col items-center justify-between sm:justify-center border-b sm:border-b-0 sm:border-r gap-2">
                    <div className="flex items-center sm:flex-col gap-2 sm:gap-3 text-center">
                      <div className="h-10 w-10 rounded-full bg-background border flex items-center justify-center">
                        {getCategoryIcon(announcement.category)}
                      </div>
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {getCategoryLabel(announcement.category)}
                      </div>
                    </div>
                    {announcement.publishedAt && (
                      <div className="text-sm font-bold sm:mt-2 text-right sm:text-center">
                        <div className="text-xs font-normal text-muted-foreground">
                          {format(new Date(announcement.publishedAt), "MMM", {
                            locale: it,
                          }).toUpperCase()}
                        </div>
                        {format(new Date(announcement.publishedAt), "dd")}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 p-6 flex flex-col justify-center">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                          {announcement.title}
                        </h3>
                        <p className="text-muted-foreground mt-2 line-clamp-2">
                          {announcement.content}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed rounded-xl">
          <Bell className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium text-foreground">
            Nessuna comunicazione
          </h3>
          <p className="text-muted-foreground">
            Non sono state trovate comunicazioni con i filtri selezionati.
          </p>
          {(searchTerm !== "" || filter !== "all") && (
            <Button
              variant="link"
              onClick={() => {
                setSearchTerm("");
                setFilter("all");
              }}
              className="mt-2"
            >
              Azzera filtri
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
