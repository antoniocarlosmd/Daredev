import { useNavigate, useLocation } from "react-router-dom";
import { CalendarDays, ClipboardCheck, CreditCard, FileText, Home, User } from "lucide-react";

const navItems = [
  { icon: Home, label: "Início", path: "/dashboard" },
  { icon: User, label: "Perfil", path: "/perfil" },
  { icon: FileText, label: "Plano", path: "/plano" },
  { icon: CreditCard, label: "Financeiro", path: "/financeiro" },
  { icon: CalendarDays, label: "Agendar", path: "/agendamento" },
  { icon: ClipboardCheck, label: "Avaliação", path: "/avaliacao" },
];

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg safe-area-bottom">
      <div className="mx-auto flex max-w-md items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? "drop-shadow-[0_0_6px_hsl(var(--gold)/0.5)]" : ""}`} />
              <span className="text-[10px] font-medium font-heading">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
