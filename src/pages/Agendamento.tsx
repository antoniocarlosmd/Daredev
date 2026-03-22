import { useState, useEffect } from "react";
import { Clock, AlertTriangle, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/AppLayout";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const allTimeSlots = ["06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "16:00", "17:00", "18:00", "19:00"];

const Agendamento = () => {
  const [currentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [spotsMap, setSpotsMap] = useState<Record<string, number>>({});
  const [remainingReschedules] = useState(2);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { profile, user } = useAuth();

  const isInadimplente = profile?.is_inadimplente ?? false;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().getDate();
  const now = new Date();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const isWeekend = (day: number) => {
    const date = new Date(year, month, day);
    const dow = date.getDay();
    return dow === 0 || dow === 6;
  };

  const isUnavailable = (day: number) =>
    isInadimplente || day < today || isWeekend(day);

  useEffect(() => {
    if (!selectedDay || isInadimplente) return;
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
    const selectedDate = new Date(year, month, selectedDay);
    const dayOfWeek = selectedDate.getDay();

    const fetchSpots = async () => {
      const { data: classes } = await supabase
        .from("classes")
        .select("id, time_slot, max_students")
        .eq("day_of_week", dayOfWeek);

      const { data: bookings } = await supabase
        .from("bookings")
        .select("class_id")
        .eq("booking_date", dateStr)
        .eq("status", "confirmed");

      const map: Record<string, number> = {};
      if (classes) {
        classes.forEach((c) => {
          const booked = bookings?.filter((b) => b.class_id === c.id).length || 0;
          map[c.time_slot] = Math.max(0, (c.max_students || 6) - booked);
        });
      }
      setSpotsMap(map);
    };

    fetchSpots();

    const channel = supabase
      .channel(`bookings-${dateStr}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => fetchSpots())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedDay, year, month, isInadimplente]);

  const getAvailableTimeSlots = () => {
    if (!selectedDay) return [];
    const isToday = selectedDay === today;
    
    // Only show slots that have actually been created/configured in the backend
    const configuredSlots = Object.keys(spotsMap).sort();
    
    return configuredSlots.filter((time) => {
      const [hours] = time.split(":").map(Number);
      if (isToday) {
        const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
        return hours * 60 >= currentTotalMinutes + 120; // 2 hours in advance
      }
      return true;
    });
  };

  const availableTimeSlots = getAvailableTimeSlots();

  const handleSchedule = async () => {
    if (!selectedDay || !selectedTime || !user) {
      toast({ title: "Selecione um dia e horário", variant: "destructive" });
      return;
    }

    const spots = spotsMap[selectedTime] ?? 0;
    if (spots <= 0) {
      toast({ title: "Turma lotada neste horário", variant: "destructive" });
      return;
    }

    setLoading(true);
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
    const selectedDate = new Date(year, month, selectedDay);
    const dayOfWeek = selectedDate.getDay();

    const { data: classData } = await supabase
      .from("classes")
      .select("id")
      .eq("day_of_week", dayOfWeek)
      .eq("time_slot", selectedTime)
      .single();

    if (!classData) {
      setLoading(false);
      toast({ title: "Erro ao encontrar a turma", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("bookings").insert({
      user_id: user.id,
      class_id: classData.id,
      booking_date: dateStr,
      status: "confirmed",
    });

    setLoading(false);

    if (error) {
      toast({ title: "Erro ao agendar", description: error.message, variant: "destructive" });
      return;
    }

    toast({
      title: "Aula agendada! 🎉",
      description: `${selectedDay}/${month + 1} às ${selectedTime}`,
    });
    setSelectedDay(null);
    setSelectedTime(null);
  };

  return (
    <AppLayout title="Agendamento">
      <div className="animate-fade-in space-y-5">
        {!isInadimplente && (
          <div className="glass-card flex items-center gap-3 p-3">
            <AlertTriangle className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Remarcações disponíveis</p>
              <p className="font-heading text-lg font-bold text-primary">{remainingReschedules}</p>
            </div>
          </div>
        )}

        <div className="glass-card p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-sm font-bold">
              {months[month]} {year}
            </h2>
          </div>
          <div className="mb-2 grid grid-cols-7 gap-1">
            {daysOfWeek.map((d) => (
              <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
            {days.map((day) => {
              const unavailable = isUnavailable(day);
              const selected = selectedDay === day;
              const weekend = isWeekend(day);
              return (
                <button
                  key={day}
                  disabled={unavailable}
                  onClick={() => { setSelectedDay(day); setSelectedTime(null); }}
                  className={`relative flex h-9 items-center justify-center rounded-md text-xs font-medium transition-all
                    ${unavailable ? "text-muted-foreground/40 cursor-not-allowed" : "hover:bg-secondary"}
                    ${selected ? "gold-gradient text-primary-foreground font-bold" : ""}
                    ${day === today && !selected ? "border border-primary/50" : ""}
                  `}
                >
                  {day}
                  {!isInadimplente && weekend && day >= today && (
                    <span className="absolute -bottom-0.5 text-[6px] text-muted-foreground">Fechado</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {selectedDay && !isInadimplente && (
          <div className="glass-card animate-slide-up p-4">
            <div className="mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <h3 className="font-heading text-sm font-semibold">
                Horários — {selectedDay}/{month + 1}
              </h3>
            </div>
            {availableTimeSlots.length > 0 ? (
              <div className="space-y-3">
                {/* Morning slots */}
                {availableTimeSlots.some((t) => parseInt(t) < 12) && (
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-1.5">Manhã</p>
                    <div className="grid grid-cols-3 gap-2">
                      {availableTimeSlots.filter((t) => parseInt(t) < 12).map((time) => {
                        const spots = spotsMap[time] ?? 6;
                        const full = spots <= 0;
                        return (
                          <button
                            key={time}
                            disabled={full}
                            onClick={() => setSelectedTime(time)}
                            className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all
                              ${full ? "opacity-40 cursor-not-allowed border-border" :
                                selectedTime === time
                                  ? "gold-gradient border-transparent text-primary-foreground"
                                  : "border-border hover:border-primary/40 hover:bg-secondary/50"
                              }`}
                          >
                            {time}
                            <span className={`block text-[9px] mt-0.5 ${full ? "text-destructive" : "text-muted-foreground"}`}>
                              {full ? "Lotada" : `${spots} vaga${spots !== 1 ? "s" : ""}`}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                {/* Afternoon slots */}
                {availableTimeSlots.some((t) => parseInt(t) >= 16) && (
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-1.5">Tarde</p>
                    <div className="grid grid-cols-3 gap-2">
                      {availableTimeSlots.filter((t) => parseInt(t) >= 16).map((time) => {
                        const spots = spotsMap[time] ?? 6;
                        const full = spots <= 0;
                        return (
                          <button
                            key={time}
                            disabled={full}
                            onClick={() => setSelectedTime(time)}
                            className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all
                              ${full ? "opacity-40 cursor-not-allowed border-border" :
                                selectedTime === time
                                  ? "gold-gradient border-transparent text-primary-foreground"
                                  : "border-border hover:border-primary/40 hover:bg-secondary/50"
                              }`}
                          >
                            {time}
                            <span className={`block text-[9px] mt-0.5 ${full ? "text-destructive" : "text-muted-foreground"}`}>
                              {full ? "Lotada" : `${spots} vaga${spots !== 1 ? "s" : ""}`}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-3">
                Nenhum horário disponível para este dia.
              </p>
            )}
          </div>
        )}

        {!isInadimplente && (
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 border-border" onClick={() => { setSelectedDay(null); setSelectedTime(null); }}>
              Cancelar
            </Button>
            <Button
              className="flex-1 gold-gradient text-primary-foreground font-heading font-semibold hover:opacity-90"
              onClick={handleSchedule}
              disabled={loading || !selectedDay || !selectedTime}
            >
              {loading ? "Agendando..." : "Agendar"}
            </Button>
          </div>
        )}

        {isInadimplente && (
          <div className="glass-card border-destructive/30 p-5 animate-fade-in">
            <div className="flex items-start gap-3">
              <ShieldAlert className="h-6 w-6 text-destructive shrink-0 mt-0.5" />
              <div>
                <h3 className="font-heading text-sm font-bold text-destructive mb-1">Agendamento Bloqueado</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Identificamos uma mensalidade em aberto na sua conta. Para voltar a agendar ou remarcar suas aulas, por favor regularize sua situação financeira acessando a tela de <span className="text-primary font-medium">Financeiro</span>.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Se você acredita que isso é um engano, entre em contato com a recepção. 💪
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Agendamento;
