import { MessageSquare, Workflow, Tag, BarChart3, Settings, Zap } from "lucide-react";
import { NavLink } from "@/components/NavLink";

const navigation = [
  { name: "Conversas", href: "/", icon: MessageSquare },
  { name: "Funis", href: "/funnels", icon: Workflow },
  { name: "Gatilhos", href: "/triggers", icon: Tag },
  { name: "Estatísticas", href: "/stats", icon: BarChart3 },
  { name: "Configurações", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-[var(--sidebar-width)] bg-sidebar border-r border-sidebar-border flex flex-col z-50">
      {/* Logo */}
      <div className="h-[var(--header-height)] flex items-center gap-3 px-6 border-b border-sidebar-border">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center glow-primary">
          <Zap className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold text-gradient">ZapFlow</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === "/"}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            activeClassName="bg-primary/10 text-primary border border-primary/20"
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-sidebar-accent">
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">ZF</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Minha Conta</p>
            <p className="text-xs text-muted-foreground truncate">Plano Pro</p>
          </div>
        </div>
      </div>
    </aside>
  );
}