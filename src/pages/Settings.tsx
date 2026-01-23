import { Key, Bell, User, Shield, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function Settings() {
  return (
    <div className="min-h-screen p-8 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Configurações</h1>
        <p className="text-muted-foreground">Gerencie sua conta e integrações</p>
      </div>

      <div className="space-y-6">
        {/* API Integration */}
        <Card className="p-6 animate-fade-in">
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
        <Card className="p-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
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
        <Card className="p-6 animate-fade-in" style={{ animationDelay: "200ms" }}>
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
        <Card className="p-6 animate-fade-in" style={{ animationDelay: "300ms" }}>
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