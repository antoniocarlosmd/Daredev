import { useState, useEffect } from "react";
import { Clock, Plus, Users, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { dayLabels, allTimeSlots } from "@/constants/admin";

interface TurmasTabProps {}

const TurmasTab = ({}: TurmasTabProps) => {
  const { toast } = useToast();
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState(new Date().getDay() || 1);
  const [classesData, setClassesData] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);

  const fetchTeachers = async () => {
    const { data } = await supabase.from("teachers").select("*").order("name");
    setTeachers(data || []);
  };

  const fetchClasses = async () => {
    const todayStr = new Date().toISOString().split("T")[0];
    const { data: classes } = await supabase
      .from("classes")
      .select("id, time_slot, day_of_week, max_students, teacher_id")
      .order("time_slot");

    if (!classes) return;

    const { data: rawBookings } = await supabase
      .from("bookings")
      .select("class_id, user_id, is_trial, trial_name, trial_phone")
      .eq("booking_date", todayStr)
      .eq("status", "confirmed");
    const bookingUserIds = [...new Set((rawBookings || []).map((b) => b.user_id).filter(Boolean))];
    const { data: profilesData } = bookingUserIds.length > 0
      ? await supabase.from("profiles").select("id, name").in("id", bookingUserIds)
      : { data: [] };
    const bookingProfileMap: Record<string, string> = {};
    (profilesData || []).forEach((p: any) => { bookingProfileMap[p.id] = p.name; });
    const bookings = (rawBookings || []).map((b) => ({ ...b, profiles: { name: bookingProfileMap[b.user_id] || null } }));

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
    fetchTeachers();
    fetchClasses();

    const channel = supabase
      .channel("admin-bookings-turmas")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => fetchClasses())
      .on("postgres_changes", { event: "*", schema: "public", table: "classes" }, () => fetchClasses())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
      toast({ title: "Turma criada! ✅" });
      fetchClasses();
    }
  };

  const handleAssignTeacher = async (classId: string, teacherId: string) => {
    await supabase.from("classes").update({ teacher_id: teacherId || null }).eq("id", classId);
    toast({ title: "Professor atualizado" });
    fetchClasses();
  };

  const filteredClasses = classesData.filter((c) => c.day_of_week === selectedDayOfWeek);

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-bold">Turmas</h2>
      </div>

      <div className="flex gap-2 p-1 overflow-x-auto bg-secondary/30 rounded-lg">
        {[1, 2, 3, 4, 5].map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDayOfWeek(day)}
            className={`px-4 py-2 text-xs font-bold rounded-md transition-all whitespace-nowrap ${
              selectedDayOfWeek === day ? "gold-gradient text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {dayLabels[day]}
          </button>
        ))}
      </div>

      <div className="glass-card p-4 space-y-4">
        <h3 className="font-heading text-sm font-bold flex items-center gap-2">
          <Plus className="h-4 w-4 text-primary" /> Nova Turma no {dayLabels[selectedDayOfWeek]}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {allTimeSlots.map((ts) => {
            const exists = filteredClasses.some((c) => c.time_slot === ts);
            return (
              <Button
                key={ts}
                variant="outline"
                size="sm"
                disabled={exists}
                onClick={() => handleAddClass(selectedDayOfWeek, ts)}
                className={`text-[10px] h-8 justify-start font-medium ${
                  exists ? "border-primary/20 bg-primary/5 text-primary/40 opacity-50" : "border-border/50 hover:border-primary/50 hover:bg-primary/5"
                }`}
              >
                <Clock className="h-3 w-3 mr-2 opacity-70" /> {ts} {exists && "(Existente)"}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-heading text-sm font-bold">Horários Ativos</h3>
        {filteredClasses.length > 0 ? (
          filteredClasses.map((turma) => (
            <div key={turma.id} className="glass-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(212,175,55,0.6)]" />
                  <span className="font-heading text-sm font-bold">{turma.time_slot}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full">
                  <Users className="h-3 w-3" />
                  {turma.bookings.length}/{turma.max_students || 6}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <Select value={turma.teacher_id || "none"} onValueChange={(v) => handleAssignTeacher(turma.id, v === "none" ? "" : v)}>
                  <SelectTrigger className="h-8 text-[11px] bg-secondary/30 border-border/50">
                    <SelectValue placeholder="Atribuir Professor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum Professor</SelectItem>
                    {teachers.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {turma.bookings.length > 0 && (
                <div className="space-y-1 pt-1 border-t border-border/30">
                  <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Alunos confirmados:</p>
                  <div className="flex flex-wrap gap-1">
                    {turma.bookings.map((b: any, j: number) => (
                      <span key={j} className={`rounded-full px-2 py-0.5 text-[9px] ${
                        b.isTrial ? "bg-primary/10 text-primary font-bold border border-primary/20" : "bg-secondary/50 text-foreground"
                      }`}>
                        {b.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-center text-xs text-muted-foreground py-8 glass-card">Nenhuma turma criada para este dia.</p>
        )}
      </div>
    </>
  );
};

export default TurmasTab;
