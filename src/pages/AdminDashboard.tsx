import { useState, useEffect } from "react";
import { LogOut, Home, UserPlus, GraduationCap, CalendarDays, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import logoTransparent from "@/assets/logo-transparent.png";

// Modular Components
import HomeTab from "@/components/admin/HomeTab";
import AlunosTab from "@/components/admin/AlunosTab";
import ProfessoresTab from "@/components/admin/ProfessoresTab";
import TurmasTab from "@/components/admin/TurmasTab";
import PagamentosTab from "@/components/admin/PagamentosTab";

// Constants & Utils
import { 
  AdminTab, Modalidade, TipoPlano, 
  planosConfig, modalidadeLabels, tipoPlanoLabels, 
  frequencyToCount 
} from "@/constants/admin";
import { formatTelefone } from "@/utils/adminUtils";

const AdminDashboard = () => {
  const today = new Date().toISOString().split("T")[0];
  const { toast } = useToast();
  const { session, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<AdminTab>("home");
  const [conversionData, setConversionData] = useState<{ name: string; phone: string } | null>(null);
  
  // ── Home & Payments State ──
  const [todayPayments, setTodayPayments] = useState<any[]>([]);
  const [todayClasses, setTodayClasses] = useState<any[]>([]);
  const [dataInicio, setDataInicio] = useState(today);
  const [dataFim, setDataFim] = useState(today);
  const [payments, setPayments] = useState<any[]>([]);

  // ── Classes/Turmas State ──
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState(new Date().getDay() || 1);
  const [classesData, setClassesData] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);

  // ── Teacher State ──
  const [novoProf, setNovoProf] = useState("");
  const [profLoading, setProfLoading] = useState(false);
  const [profSearch, setProfSearch] = useState("");
  const [editingTeacher, setEditingTeacher] = useState<string | null>(null);
  const [editTeacherName, setEditTeacherName] = useState("");

  const nomeGestor = profile?.name?.split(" ")[0] || "Gestor";

  // ── Effects ──
  
  // Fetch today's payments for Home
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

  // Fetch today's classes for Home
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

  // Fetch payments for Payments tab
  useEffect(() => {
    if (activeTab !== "pagamentos") return;
    const fetchPayments = async () => {
      const { data: paymentsTab } = await supabase
        .from("payments")
        .select("*")
        .gte("created_at", `${dataInicio}T00:00:00`)
        .lte("created_at", `${dataFim}T23:59:59`)
        .eq("status", "paid")
        .order("created_at", { ascending: true });
      if (!paymentsTab) { setPayments([]); return; }
      const tabUserIds = [...new Set(paymentsTab.map((p) => p.user_id).filter(Boolean))];
      const { data: tabProfiles } = tabUserIds.length > 0
        ? await supabase.from("profiles").select("id, name").in("id", tabUserIds)
        : { data: [] };
      const tabProfileMap: Record<string, string> = {};
      (tabProfiles || []).forEach((p: any) => { tabProfileMap[p.id] = p.name; });
      setPayments(paymentsTab.map((p) => ({ ...p, profiles: { name: tabProfileMap[p.user_id] || null } })));
    };
    fetchPayments();
  }, [dataInicio, dataFim, activeTab]);

  // Fetch classes for Turmas tab
  const fetchClasses = async () => {
    const todayStr = new Date().toISOString().split("T")[0];
    const { data: classes } = await supabase
      .from("classes")
      .select("id, time_slot, day_of_week, max_students, teacher_id")
      .order("time_slot");

    if (!classes) return;

    const { data: rawBookings2 } = await supabase
      .from("bookings")
      .select("class_id, user_id, is_trial, trial_name, trial_phone")
      .eq("booking_date", todayStr)
      .eq("status", "confirmed");
    const bk2UserIds = [...new Set((rawBookings2 || []).map((b) => b.user_id).filter(Boolean))];
    const { data: bk2Profiles } = bk2UserIds.length > 0
      ? await supabase.from("profiles").select("id, name").in("id", bk2UserIds)
      : { data: [] };
    const bk2Map: Record<string, string> = {};
    (bk2Profiles || []).forEach((p: any) => { bk2Map[p.id] = p.name; });
    const bookings = (rawBookings2 || []).map((b) => ({ ...b, profiles: { name: bk2Map[b.user_id] || null } }));

    const enriched = classes.map((c) => {
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
    setClassesData(enriched);
  };

  useEffect(() => {
    if (activeTab !== "turmas") return;
    fetchClasses();
    const channel = supabase
      .channel("admin-bookings-turmas")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => fetchClasses())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeTab]);

  // Fetch teachers
  useEffect(() => {
    const fetchTeachers = async () => {
      const { data } = await supabase.from("teachers").select("*").order("name");
      setTeachers(data || []);
    };
    fetchTeachers();
  }, []);

  // ── Handlers ──

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const handleAddClass = async (dayOfWeek: number, timeSlot: string) => {
    const { data, error } = await supabase.from("classes").insert({
      day_of_week: dayOfWeek,
      time_slot: timeSlot,
      max_students: 6
    }).select();
    
    if (error) {
      toast({ title: "Erro ao criar turma", description: error.message, variant: "destructive" });
      return;
    }
    if (data) {
      setClassesData((prev) => [...prev, ...data.map(c => ({...c, bookings: []}))]);
      toast({ title: "Turma criada! ✅" });
    }
  };

  const handleAssignTeacher = async (classId: string, teacherId: string) => {
    await supabase.from("classes").update({ teacher_id: teacherId || null }).eq("id", classId);
    setClassesData((prev) => prev.map((c) => c.id === classId ? { ...c, teacher_id: teacherId || null } : c));
    toast({ title: "Professor atualizado" });
  };

  const handleAddTeacher = async () => {
    if (!novoProf.trim()) return;
    setProfLoading(true);
    const { error } = await supabase.from("teachers").insert({ name: novoProf.trim() });
    setProfLoading(false);
    if (error) { toast({ title: "Erro ao cadastrar professor", variant: "destructive" }); return; }
    toast({ title: "Professor cadastrado! ✅" });
    setNovoProf("");
    const { data } = await supabase.from("teachers").select("*").order("name");
    setTeachers(data || []);
  };

  const handleDeleteTeacher = async (id: string) => {
    await supabase.from("teachers").delete().eq("id", id);
    toast({ title: "Professor removido" });
    const { data } = await supabase.from("teachers").select("*").order("name");
    setTeachers(data || []);
  };

  const handleEditTeacher = async (id: string) => {
    if (!editTeacherName.trim()) return;
    await supabase.from("teachers").update({ name: editTeacherName.trim() }).eq("id", id);
    toast({ title: "Professor atualizado" });
    setEditingTeacher(null);
    const { data } = await supabase.from("teachers").select("*").order("name");
    setTeachers(data || []);
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
              todayPayments={todayPayments}
              todayClasses={todayClasses}
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
            <ProfessoresTab
              profSearch={profSearch} setProfSearch={setProfSearch} 
              novoProf={novoProf} setNovoProf={setNovoProf} 
              profLoading={profLoading} handleAddTeacher={handleAddTeacher}
              teachers={teachers} editingTeacher={editingTeacher} setEditingTeacher={setEditingTeacher}
              editTeacherName={editTeacherName} setEditTeacherName={setEditTeacherName}
              handleEditTeacher={handleEditTeacher} handleDeleteTeacher={handleDeleteTeacher}
            />
          )}

          {activeTab === "turmas" && (
            <TurmasTab
              selectedDayOfWeek={selectedDayOfWeek} setSelectedDayOfWeek={setSelectedDayOfWeek}
              classesData={classesData} handleAddClass={handleAddClass}
              teachers={teachers} handleAssignTeacher={handleAssignTeacher}
            />
          )}

          {activeTab === "pagamentos" && (
            <PagamentosTab
              dataInicio={dataInicio} setDataInicio={setDataInicio}
              dataFim={dataFim} setDataFim={setDataFim}
              payments={payments}
            />
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
