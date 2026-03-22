import { useState, useEffect } from "react";
import { LogOut, Home, UserPlus, GraduationCap, CalendarDays, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import logoTransparent from "@/assets/logo-transparent.png";

// Modular Components
import HomeTab from "@/components/admin/HomeTab";
import AlunosTab from "@/components/admin/AlunosTab";
import ProfessoresTab from "@/components/admin/ProfessoresTab";
import TurmasTab from "@/components/admin/TurmasTab";
import PagamentosTab from "@/components/admin/PagamentosTab";

// Constants & Utils
import { AdminTab } from "@/constants/admin";

const AdminDashboard = () => {
  const { toast } = useToast();
  const { session, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<AdminTab>("home");
  const [conversionData, setConversionData] = useState<{ name: string; phone: string } | null>(null);
  

  const nomeGestor = profile?.name?.split(" ")[0] || "Gestor";

  // ── Effects ──


  // ── Handlers ──

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };




  const handleConvertTrial = (name: string, phone: string) => {
    setConversionData({ name, phone });
    setActiveTab("alunos");
  };



  const navItems = [
    { key: "home" as AdminTab, icon: Home, label: "Início" },
    { key: "alunos" as AdminTab, icon: UserPlus, label: "Alunos" },
    { key: "professores" as AdminTab, icon: GraduationCap, label: "Professores" },
    { key: "turmas" as AdminTab, icon: CalendarDays, label: "Turmas" },
    { key: "pagamentos" as AdminTab, icon: DollarSign, label: "Pagamentos" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-lg">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <img src={logoTransparent} alt="REACT" className="h-8 w-8 object-contain" />
            <span className="font-heading text-sm font-bold gold-text">Painel Admin</span>
          </div>
          <button onClick={handleLogout} className="text-muted-foreground hover:text-foreground transition-colors">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-4 pb-24 pt-4">
        <div className="animate-fade-in space-y-5">
          {activeTab === "home" && (
            <HomeTab
              nomeGestor={nomeGestor}
              setActiveTab={setActiveTab}
              handleConvertTrial={handleConvertTrial}
            />
          )}

          {activeTab === "alunos" && (
            <AlunosTab 
              conversionData={conversionData} 
              onConversionHandled={() => setConversionData(null)} 
            />
          )}

          {activeTab === "professores" && (
            <ProfessoresTab />
          )}

          {activeTab === "turmas" && (
            <TurmasTab />
          )}

          {activeTab === "pagamentos" && (
            <PagamentosTab />
          )}
        </div>
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/90 backdrop-blur-lg">
        <div className="mx-auto flex max-w-md items-center justify-between px-2 py-2">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-2 transition-all duration-300 ${
                activeTab === item.key ? "gold-gradient text-primary-foreground shadow-lg scale-110" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              }`}
            >
              <item.icon className={`h-5 w-5 ${activeTab === item.key ? "animate-bounce" : ""}`} />
              <span className="text-[10px] font-bold tracking-tight uppercase">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default AdminDashboard;
