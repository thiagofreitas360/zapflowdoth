import { useState, useMemo } from "react";
import { 
  Key, 
  Bell, 
  User, 
  Shield, 
  ExternalLink, 
  Users, 
  TrendingUp, 
  Calendar,
  Tag,
  Plus,
  Trash2,
  ShoppingCart,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { leads, defaultLabels, LeadLabel } from "@/data/mockData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type DateRange = "today" | "week" | "month" | "custom";

export default function Settings() {
  const [dateRange, setDateRange] = useState<DateRange>("today");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [labels, setLabels] = useState<LeadLabel[]>(defaultLabels);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("#6E56CF");
  const [isAddingLabel, setIsAddingLabel] = useState(false);

  // Calculate metrics based on date range
  const metrics = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    
    const getStartDate = () => {
      switch (dateRange) {
        case "today":
          return today;
        case "week":
          const weekAgo = new Date(now);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return weekAgo.toISOString().split("T")[0];
        case "month":
          const monthAgo = new Date(now);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return monthAgo.toISOString().split("T")[0];
        case "custom":
          return customStart || today;
        default:
          return today;
      }
    };

    const startDate = getStartDate();
    const endDate = dateRange === "custom" && customEnd ? customEnd : today;

    const filteredLeads = leads.filter((lead) => {
      const arrivalDate = lead.arrivalDate;
      return arrivalDate >= startDate && arrivalDate <= endDate;
    });

    const totalLeads = filteredLeads.length;
    const metaAdsLeads = filteredLeads.filter((l) => l.arrivalSource === "meta_ads").length;
    const organicLeads = filteredLeads.filter((l) => l.arrivalSource === "organic").length;
    const referralLeads = filteredLeads.filter((l) => l.arrivalSource === "referral").length;
    const purchasedLeads = filteredLeads.filter((l) => l.hasPurchased).length;
    const conversionRate = totalLeads > 0 ? ((purchasedLeads / totalLeads) * 100).toFixed(1) : "0";

    return {
      totalLeads,
      metaAdsLeads,
      organicLeads,
      referralLeads,
      purchasedLeads,
      conversionRate,
    };
  }, [dateRange, customStart, customEnd]);

  const handleAddLabel = () => {
    if (!newLabelName.trim()) return;
    
    const newLabel: LeadLabel = {
      id: `l${Date.now()}`,
      name: newLabelName.trim(),
      color: newLabelColor,
    };
    
    setLabels([...labels, newLabel]);
    setNewLabelName("");
    setNewLabelColor("#6E56CF");
    setIsAddingLabel(false);
  };

  const handleDeleteLabel = (labelId: string) => {
    setLabels(labels.filter((l) => l.id !== labelId));
  };

  const dateRangeLabels: Record<DateRange, string> = {
    today: "Hoje",
    week: "Últimos 7 dias",
    month: "Último mês",
    custom: "Personalizado",
  };

  const predefinedColors = [
    "#00B37E", "#F59E0B", "#EF4444", "#3B82F6", 
    "#8B5CF6", "#EC4899", "#06B6D4", "#6E56CF"
  ];

  return (
    <div className="min-h-screen p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Configurações</h1>
        <p className="text-muted-foreground">Gerencie sua conta, métricas e integrações</p>
      </div>

      <div className="space-y-6">
        {/* Lead Metrics */}
        <Card className="p-6 animate-fade-in">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-accent" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">Métricas de Leads</h3>
              <p className="text-sm text-muted-foreground">Acompanhe a chegada e conversão dos seus leads</p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
                <SelectTrigger className="w-40 bg-secondary border-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="week">Últimos 7 dias</SelectItem>
                  <SelectItem value="month">Último mês</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Custom date range inputs */}
          {dateRange === "custom" && (
            <div className="flex gap-4 mb-6 p-4 bg-secondary/50 rounded-lg">
              <div className="flex-1">
                <Label htmlFor="startDate">Data inicial</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="mt-2 bg-background border-0"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="endDate">Data final</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="mt-2 bg-background border-0"
                />
              </div>
            </div>
          )}

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-secondary/50 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">Total de Leads</span>
              </div>
              <p className="text-3xl font-bold text-foreground">{metrics.totalLeads}</p>
            </div>

            <div className="p-4 rounded-lg bg-secondary/50 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-muted-foreground">Meta Ads</span>
              </div>
              <p className="text-3xl font-bold text-foreground">{metrics.metaAdsLeads}</p>
            </div>

            <div className="p-4 rounded-lg bg-secondary/50 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span className="text-sm text-muted-foreground">Orgânico</span>
              </div>
              <p className="text-3xl font-bold text-foreground">{metrics.organicLeads}</p>
            </div>

            <div className="p-4 rounded-lg bg-secondary/50 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="w-5 h-5 text-purple-500" />
                <span className="text-sm text-muted-foreground">Indicação</span>
              </div>
              <p className="text-3xl font-bold text-foreground">{metrics.referralLeads}</p>
            </div>

            <div className="p-4 rounded-lg bg-accent/10 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <ShoppingCart className="w-5 h-5 text-accent" />
                <span className="text-sm text-muted-foreground">Compraram</span>
              </div>
              <p className="text-3xl font-bold text-accent">{metrics.purchasedLeads}</p>
            </div>

            <div className="p-4 rounded-lg bg-primary/10 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">Conversão</span>
              </div>
              <p className="text-3xl font-bold text-primary">{metrics.conversionRate}%</p>
            </div>
          </div>
        </Card>

        {/* Labels Management */}
        <Card className="p-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Tag className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">Etiquetas</h3>
              <p className="text-sm text-muted-foreground">Crie e gerencie etiquetas para organizar seus leads</p>
            </div>
            <Dialog open={isAddingLabel} onOpenChange={setIsAddingLabel}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-1" />
                  Nova Etiqueta
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Nova Etiqueta</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="labelName">Nome da etiqueta</Label>
                    <Input
                      id="labelName"
                      value={newLabelName}
                      onChange={(e) => setNewLabelName(e.target.value)}
                      placeholder="Ex: Cliente VIP"
                      className="mt-2 bg-secondary border-0"
                    />
                  </div>
                  <div>
                    <Label>Cor</Label>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {predefinedColors.map((color) => (
                        <button
                          key={color}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            newLabelColor === color ? "border-foreground scale-110" : "border-transparent"
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setNewLabelColor(color)}
                        />
                      ))}
                      <Input
                        type="color"
                        value={newLabelColor}
                        onChange={(e) => setNewLabelColor(e.target.value)}
                        className="w-8 h-8 p-0 border-0 cursor-pointer"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
                    <span className="text-sm text-muted-foreground">Preview:</span>
                    <span
                      className="px-3 py-1 text-sm font-medium rounded-full text-white"
                      style={{ backgroundColor: newLabelColor }}
                    >
                      {newLabelName || "Nova Etiqueta"}
                    </span>
                  </div>
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90"
                    onClick={handleAddLabel}
                    disabled={!newLabelName.trim()}
                  >
                    Criar Etiqueta
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex flex-wrap gap-2">
            {labels.map((label) => (
              <div
                key={label.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-white group"
                style={{ backgroundColor: label.color }}
              >
                <span className="text-sm font-medium">{label.name}</span>
                <button
                  onClick={() => handleDeleteLabel(label.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/20 rounded-full p-0.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* API Integration */}
        <Card className="p-6 animate-fade-in" style={{ animationDelay: "200ms" }}>
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Key className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Integração Meta API</h3>
              <p className="text-sm text-muted-foreground">Configure sua chave da API oficial do WhatsApp Business</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="api-key">Chave da API</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="Insira sua chave da API..."
                className="mt-2 bg-secondary border-0"
              />
            </div>
            <div>
              <Label htmlFor="phone-id">ID do Número</Label>
              <Input
                id="phone-id"
                placeholder="Ex: 123456789012345"
                className="mt-2 bg-secondary border-0"
              />
            </div>
            <div className="flex items-center gap-3">
              <Button className="bg-primary hover:bg-primary/90">Salvar Configurações</Button>
              <Button variant="outline" className="gap-2">
                <ExternalLink className="w-4 h-4" />
                Documentação Meta
              </Button>
            </div>
          </div>
        </Card>

        {/* Profile */}
        <Card className="p-6 animate-fade-in" style={{ animationDelay: "300ms" }}>
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Perfil</h3>
              <p className="text-sm text-muted-foreground">Atualize suas informações pessoais</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                defaultValue="Meu Negócio"
                className="mt-2 bg-secondary border-0"
              />
            </div>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                defaultValue="contato@meunegocio.com"
                className="mt-2 bg-secondary border-0"
              />
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="p-6 animate-fade-in" style={{ animationDelay: "400ms" }}>
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bell className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Notificações</h3>
              <p className="text-sm text-muted-foreground">Configure como você quer ser notificado</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Novas mensagens</p>
                <p className="text-sm text-muted-foreground">Receba alertas quando um lead responder</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Conversões</p>
                <p className="text-sm text-muted-foreground">Seja notificado sobre novas conversões</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Relatório semanal</p>
                <p className="text-sm text-muted-foreground">Receba um resumo semanal por e-mail</p>
              </div>
              <Switch />
            </div>
          </div>
        </Card>

        {/* Security */}
        <Card className="p-6 animate-fade-in" style={{ animationDelay: "500ms" }}>
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Segurança</h3>
              <p className="text-sm text-muted-foreground">Proteja sua conta</p>
            </div>
          </div>

          <div className="space-y-4">
            <Button variant="outline">Alterar Senha</Button>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Autenticação em duas etapas</p>
                <p className="text-sm text-muted-foreground">Adicione uma camada extra de segurança</p>
              </div>
              <Switch />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
