import { TrendingUp, MessageSquare, Users, Target, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const chartData = [
  { name: "Seg", mensagens: 45, respostas: 32 },
  { name: "Ter", mensagens: 52, respostas: 41 },
  { name: "Qua", mensagens: 38, respostas: 28 },
  { name: "Qui", mensagens: 65, respostas: 48 },
  { name: "Sex", mensagens: 78, respostas: 62 },
  { name: "Sáb", mensagens: 42, respostas: 35 },
  { name: "Dom", mensagens: 28, respostas: 22 },
];

const funnelStats = [
  { name: "Boas-vindas", conversoes: 145, taxa: 52 },
  { name: "Retenção", conversoes: 42, taxa: 35 },
  { name: "Fechamento", conversoes: 78, taxa: 82 },
];

const stats = [
  {
    name: "Mensagens Enviadas",
    value: "1,248",
    change: "+12.5%",
    trend: "up",
    icon: MessageSquare,
  },
  {
    name: "Leads Ativos",
    value: "347",
    change: "+8.2%",
    trend: "up",
    icon: Users,
  },
  {
    name: "Taxa de Resposta",
    value: "68%",
    change: "+5.4%",
    trend: "up",
    icon: TrendingUp,
  },
  {
    name: "Conversões",
    value: "89",
    change: "-2.1%",
    trend: "down",
    icon: Target,
  },
];

export default function Stats() {
  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Estatísticas</h1>
        <p className="text-muted-foreground">Acompanhe o desempenho das suas campanhas</p>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <Card
            key={stat.name}
            className="p-5 animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                stat.trend === 'up' ? 'text-accent' : 'text-destructive'
              }`}>
                {stat.trend === 'up' ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                {stat.change}
              </div>
            </div>
            <p className="text-2xl font-bold mb-1">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.name}</p>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Messages Chart */}
        <Card className="p-6 animate-fade-in" style={{ animationDelay: "200ms" }}>
          <h3 className="font-semibold text-lg mb-6">Mensagens vs Respostas</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorMensagens" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(262, 60%, 58%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(262, 60%, 58%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorRespostas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(160, 100%, 36%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(160, 100%, 36%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 10%, 18%)" />
                <XAxis dataKey="name" stroke="hsl(240, 8%, 65%)" fontSize={12} />
                <YAxis stroke="hsl(240, 8%, 65%)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(240, 15%, 12%)",
                    border: "1px solid hsl(240, 10%, 18%)",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="mensagens"
                  stroke="hsl(262, 60%, 58%)"
                  fillOpacity={1}
                  fill="url(#colorMensagens)"
                />
                <Area
                  type="monotone"
                  dataKey="respostas"
                  stroke="hsl(160, 100%, 36%)"
                  fillOpacity={1}
                  fill="url(#colorRespostas)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Funnel Performance */}
        <Card className="p-6 animate-fade-in" style={{ animationDelay: "300ms" }}>
          <h3 className="font-semibold text-lg mb-6">Desempenho por Funil</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelStats} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 10%, 18%)" />
                <XAxis type="number" stroke="hsl(240, 8%, 65%)" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="hsl(240, 8%, 65%)" fontSize={12} width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(240, 15%, 12%)",
                    border: "1px solid hsl(240, 10%, 18%)",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="taxa" fill="hsl(262, 60%, 58%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}