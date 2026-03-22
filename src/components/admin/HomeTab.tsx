import { DollarSign, Users, Clock, UserPlus, Home, UserPlus as UserPlusIcon, GraduationCap, CalendarDays } from "lucide-react";
import { AdminTab } from "@/constants/admin";
import { PaymentTotals } from "./PaymentTotals";

interface HomeTabProps {
  nomeGestor: string;
  todayPayments: any[];
  todayClasses: any[];
  setActiveTab: (tab: AdminTab) => void;
  handleConvertTrial: (name: string, phone: string) => void;
}

const HomeTab = ({ nomeGestor, todayPayments, todayClasses, setActiveTab, handleConvertTrial }: HomeTabProps) => {
  return (
    <>
      <div className="mb-4">
        <h1 className="font-heading text-xl font-bold">
          Olá, <span className="gold-text">{nomeGestor}</span> 👋
        </h1>
        <p className="text-sm text-muted-foreground">Bem-vindo ao painel administrativo do CT React.</p>
      </div>

      {/* Recebimentos de Hoje */}
      <div className="glass-card glow-gold p-4 space-y-3">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          <h2 className="font-heading text-sm font-bold">Recebimentos de Hoje</h2>
        </div>
        <PaymentTotals payments={todayPayments} label="Total Recebido" />
        {todayPayments.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">Nenhum recebimento hoje.</p>
        )}
      </div>

      {/* Turmas de Hoje */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="font-heading text-sm font-bold">Turmas de Hoje</h2>
        </div>
        {todayClasses.length > 0 ? (
          todayClasses.map((turma) => (
            <div key={turma.id} className="glass-card p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="font-heading text-sm font-bold">{turma.time_slot}</span>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  turma.bookings.length >= (turma.max_students || 6) ? "bg-destructive/20 text-destructive" : "bg-success/20 text-success"
                }`}>
                  {turma.bookings.length}/{turma.max_students || 6} vagas
                </span>
              </div>
              {turma.bookings.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {turma.bookings.map((b: any, j: number) => (
                    <span key={j} className={`flex items-center gap-1 rounded-full pl-2 pr-1 py-0.5 text-[10px] ${
                      b.isTrial ? "bg-primary/20 text-primary font-semibold" : "bg-secondary/50 text-foreground pr-2"
                    }`}>
                      {b.name}
                      {b.isTrial && (
                        <button onClick={() => handleConvertTrial(b.trialName, b.trialPhone)} className="hover:bg-primary/20 rounded-full p-0.5" title="Converter em Aluno">
                          <UserPlus className="h-3 w-3" />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-muted-foreground">Nenhum aluno confirmado</p>
              )}
            </div>
          ))
        ) : (
          <p className="text-xs text-muted-foreground text-center glass-card p-4">Nenhuma turma em andamento.</p>
        )}
      </div>

      {/* Quick navigation */}
      <div className="space-y-3">
        {[
          { tab: "alunos" as AdminTab, icon: UserPlusIcon, label: "Cadastro de Aluno", desc: "Cadastrar, pesquisar e gerenciar alunos" },
          { tab: "professores" as AdminTab, icon: GraduationCap, label: "Cadastro de Professor", desc: "Cadastrar e gerenciar professores" },
          { tab: "turmas" as AdminTab, icon: CalendarDays, label: "Gerenciamento de Turmas", desc: "Visualizar turmas e atribuir professores" },
        ].map((item) => (
          <button
            key={item.tab}
            onClick={() => setActiveTab(item.tab)}
            className="glass-card flex w-full items-center gap-4 p-4 text-left transition-all hover:border-primary/30 hover:bg-secondary/50 active:scale-[0.98]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <item.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-heading text-sm font-semibold">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </>
  );
};

export default HomeTab;
