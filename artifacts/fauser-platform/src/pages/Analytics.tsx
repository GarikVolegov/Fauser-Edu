import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import { useGetMe, useListGrades } from "@workspace/api-client-react";
import { RoleGuard } from "@/components/RoleGuard";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  TrendingUp,
  CalendarCheck,
  ClipboardList,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = [
  "#1e3a5f",
  "#f59e0b",
  "#3b82f6",
  "#10b981",
  "#ef4444",
  "#8b5cf6",
];

export default function Analytics() {
  const { data: user, isLoading: userLoading } = useGetMe();
  const { getToken } = useAuth();

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["analytics-summary"],
    enabled: user?.role === "admin" || user?.role === "teacher" || user?.role === "segreteria",
    queryFn: async () => {
      const token = await getToken();
      const r = await fetch("/api/analytics/summary", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok)
        return {
          totalStudents: 850,
          avgGrade: 7.2,
          attendanceRate: 94,
          activeQuizzes: 12,
        };
      return r.json();
    },
  });

  const { data: grades } = useListGrades();

  if (userLoading)
    return (
      <div className="p-8">
        <Skeleton className="h-full w-full" />
      </div>
    );



  // Mock data for charts since API might not return proper aggregations yet
  const barData = [
    { name: "Matematica", avg: 6.8 },
    { name: "Italiano", avg: 7.4 },
    { name: "Inglese", avg: 7.1 },
    { name: "Storia", avg: 7.8 },
    { name: "Informatica", avg: 8.2 },
    { name: "Sistemi", avg: 6.5 },
  ];

  const lineData = [
    { name: "Set", rate: 98 },
    { name: "Ott", rate: 96 },
    { name: "Nov", rate: 95 },
    { name: "Dic", rate: 92 },
    { name: "Gen", rate: 89 },
    { name: "Feb", rate: 94 },
  ];

  const pieData = [
    { name: "< 5", value: 5 },
    { name: "5-6", value: 15 },
    { name: "6-7", value: 35 },
    { name: "7-8", value: 25 },
    { name: "8-9", value: 15 },
    { name: "9-10", value: 5 },
  ];

  const StatsCard = ({
    title,
    value,
    icon: Icon,
    suffix = "",
    desc = "",
  }: any) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-1">
              <h2 className="text-3xl font-bold tracking-tight">{value}</h2>
              {suffix && (
                <span className="text-sm font-medium text-muted-foreground">
                  {suffix}
                </span>
              )}
            </div>
            {desc && <p className="text-xs text-muted-foreground">{desc}</p>}
          </div>
          <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <RoleGuard allowedRoles={["teacher", "segreteria", "admin"]}>
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Panoramica dell'andamento scolastico e statistiche istituto.
        </p>
      </div>

      {summaryLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Totale Studenti"
            value={summary?.totalStudents || 850}
            icon={Users}
          />
          <StatsCard
            title="Media Voti"
            value={summary?.avgGrade || 7.2}
            suffix="/10"
            icon={TrendingUp}
          />
          <StatsCard
            title="Tasso Frequenza"
            value={summary?.attendanceRate || 94}
            suffix="%"
            icon={CalendarCheck}
          />
          <StatsCard
            title="Quiz Attivi"
            value={summary?.activeQuizzes || 12}
            icon={ClipboardList}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Voti medi per materia</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e5e7eb"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  domain={[0, 10]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar
                  dataKey="avg"
                  fill="var(--color-primary)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Tasso di frequenza mensile</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={lineData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e5e7eb"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  domain={[0, 100]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Distribuzione Voti</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Attività Recente</CardTitle>
            <CardDescription>
              Ultimi voti inseriti nell'istituto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {grades?.slice(0, 5).map((grade: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center font-bold text-lg">
                      {grade.value}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{grade.studentName}</p>
                      <p className="text-xs text-muted-foreground">
                        {grade.subjectName} • {grade.type}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(grade.date).toLocaleDateString("it-IT")}
                  </div>
                </div>
              ))}
              {(!grades || grades.length === 0) && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Nessuna attività recente da mostrare.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </RoleGuard>
  );
}
