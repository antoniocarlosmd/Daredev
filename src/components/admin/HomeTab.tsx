import { useState, useEffect } from "react";
import { DollarSign, Users, Clock, UserPlus, Home, UserPlus as UserPlusIcon, GraduationCap, CalendarDays } from "lucide-react";
import { AdminTab } from "@/constants/admin";
import { supabase } from "@/integrations/supabase/client";
import { PaymentTotals } from "./PaymentTotals";

interface HomeTabProps {
  nomeGestor: string;
  setActiveTab: (tab: AdminTab) => void;
  handleConvertTrial: (name: string, phone: string) => void;
}

const HomeTab = ({ nomeGestor, setActiveTab, handleConvertTrial }: HomeTabProps) => {
  const [todayPayments, setTodayPayments] = useState<any[]>([]);
  const [todayClasses, setTodayClasses] = useState<any[]>([]);
  const today = new Date().toISOString().split("T")[0];

  // Fetch today's payments
  useEffect(() => {
    const fetchTodayPayments = async () => {
      const { data: paymentsData } = await supabase
        .from("payments")
        .select("*")
        .gte("created_at", `${today}T00:00:00`)
        .lte("created_at", `${today}T23:59:59`)
        .eq("status", "paid")
        .order("created_at", { ascending: false });
      if (!paymentsData) { setTodayPayments([]); return; }
      const userIds = [...new Set(paymentsData.map((p) => p.user_id).filter(Boolean))];
      const { data: profilesData } = userIds.length > 0
        ? await supabase.from("profiles").select("id, name").in("id", userIds)
        : { data: [] };
      const profileMap: Record<string, string> = {};
      (profilesData || []).forEach((p: any) => { profileMap[p.id] = p.name; });
      setTodayPayments(paymentsData.map((p) => ({ ...p, profiles: { name: profileMap[p.user_id] || null } })));
    };
    fetchTodayPayments();

    const channel = supabase
      .channel("admin-today-payments")
      .on("postgres_changes", { event: "*", schema: "public", table: "payments" }, () => fetchTodayPayments())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [today]);

  // Fetch today's classes
  useEffect(() => {
    const fetchTodayClasses = async () => {
      const now = new Date();
      const currentDow = now.getDay();
      if (currentDow === 0 || currentDow === 6) {
        setTodayClasses([]);
        return;
      }
      const todayStr = now.toISOString().split("T")[0];
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      const { data: classes } = await supabase
        .from("classes")
        .select("id, time_slot, max_students, teacher_id")
        .eq("day_of_week", currentDow)
        .order("time_slot");

      if (!classes) return;

      const { data: rawBookings } = await supabase
        .from("bookings")
        .select("class_id, user_id, is_trial, trial_name, trial_phone")
        .eq("booking_date", todayStr)
        .eq("status", "confirmed");
      const bookingUserIds = [...new Set((rawBookings || []).map((b) => b.user_id).filter(Boolean))];
      const { data: bookingProfiles } = bookingUserIds.length > 0
        ? await supabase.from("profiles").select("id, name").in("id", bookingUserIds)
        : { data: [] };
      const bookingProfileMap: Record<string, string> = {};
      (bookingProfiles || []).forEach((p: any) => { bookingProfileMap[p.id] = p.name; });
      const bookings = (rawBookings || []).map((b) => ({ ...b, profiles: { name: bookingProfileMap[b.user_id] || null } }));

      const filtered = classes.filter((c) => {
        const [h] = c.time_slot.split(":").map(Number);
        const classEndMinutes = (h + 1) * 60;
        const nowMinutes = currentHour * 60 + currentMinute;
        return nowMinutes < classEndMinutes && nowMinutes >= h * 60;
      });

      let displayClasses = filtered;
      if (filtered.length === 0) {
        displayClasses = classes.filter((c) => {
          const [h] = c.time_slot.split(":").map(Number);
          return h * 60 > currentHour * 60 + currentMinute;
        }).slice(0, 3);
      }
      if (displayClasses.length === 0) displayClasses = classes;

      const enriched = displayClasses.map((c) => {
        const classBookings = bookings?.filter((b) => b.class_id === c.id) || [];
        return {
          ...c,
          bookings: classBookings.map((b) => ({
            name: b.is_trial ? `${b.trial_name} (Experimental)` : (b as any).profiles?.name || "Aluno",
            isTrial: b.is_trial,
            trialName: b.trial_name,
            trialPhone: b.trial_phone,
          })),
        };
      });
      setTodayClasses(enriched);
    };

    fetchTodayClasses();
    const interval = setInterval(fetchTodayClasses, 60000);
    const channel = supabase
      .channel("admin-today-classes")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => fetchTodayClasses())
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

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
