import { CalendarDays, ClipboardCheck, CreditCard, FileText, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";

const menuItems = [
  { icon: User, label: "Meu Perfil", description: "Dados pessoais e configurações", path: "/perfil" },
  { icon: FileText, label: "Meu Plano", description: "Detalhes do seu plano atual", path: "/plano" },
  { icon: CreditCard, label: "Financeiro", description: "Pagamentos e faturas", path: "/financeiro" },
  { icon: CalendarDays, label: "Agendamento / Remarcação", description: "Agende ou remarque suas aulas", path: "/agendamento" },
  { icon: ClipboardCheck, label: "Avaliação", description: "Agende sua avaliação física", path: "/avaliacao" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const nomeUsuario = profile?.name?.split(" ")[0] || "Aluno";

  return (
    <AppLayout title="Início">
      <div className="animate-fade-in space-y-4">
        <div className="mb-6">
          <h1 className="font-heading text-xl font-bold">
            Olá, <span className="gold-text">{nomeUsuario}</span> 👋
          </h1>
          <p className="text-sm text-muted-foreground">Bem-vindo ao REACT Centro de Treinamento</p>
        </div>

        <div className="glass-card glow-gold p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Modalidade</p>
              <p className="font-heading text-sm font-semibold">{profile?.modality || "—"}</p>
            </div>
            <div className="gold-gradient rounded-lg px-3 py-1.5">
              <span className="font-heading text-xs font-bold text-primary-foreground">
                {profile?.frequency ? `${profile.frequency} Semana` : "—"}
              </span>
            </div>
          </div>
          {profile?.plan_type && (
            <div className="mt-2 pt-2 border-t border-border/30">
              <p className="text-xs text-muted-foreground">Plano</p>
              <p className="font-heading text-sm font-semibold">{profile.plan_type}</p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {menuItems.map((item, index) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="glass-card flex w-full items-center gap-4 p-4 text-left transition-all hover:border-primary/30 hover:bg-secondary/50 active:scale-[0.98]"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-heading text-sm font-semibold">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="glass-card p-4">
          <h3 className="mb-3 font-heading text-sm font-bold">Horários de Funcionamento</h3>
          <p className="text-xs text-muted-foreground">Segunda à Sexta</p>
          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success" />
              <span className="text-xs">06:00 — 12:00</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-destructive" />
              <span className="text-xs text-muted-foreground">12:00 — 16:00 (Fechado)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success" />
              <span className="text-xs">16:00 — 20:00</span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
