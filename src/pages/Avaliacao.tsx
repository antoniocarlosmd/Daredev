import { useState, useEffect } from "react";
import { Activity, Calendar, Weight, Ruler, Percent, FileText } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Avaliacao = () => {
  const { user } = useAuth();
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchEvals = async () => {
      const { data } = await supabase
        .from("evaluations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setEvaluations(data || []);
      setLoading(false);
    };
    fetchEvals();
  }, [user]);

  if (loading) {
    return (
      <AppLayout title="Minhas Avaliações">
        <div className="flex justify-center py-20">
           <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Minhas Avaliações">
      <div className="animate-fade-in space-y-5">
        {evaluations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
            <Activity className="mb-4 h-12 w-12 text-muted-foreground" />
            <h2 className="font-heading text-lg font-bold">Nenhuma Avaliação</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Você ainda não possui nenhuma avaliação física cadastrada no sistema.
            </p>
          </div>
        ) : (
          evaluations.map((ev) => (
            <div key={ev.id} className="glass-card p-5 animate-slide-up space-y-4">
              <div className="flex items-center gap-2 border-b border-border/50 pb-3">
                <Calendar className="h-4 w-4 text-primary" />
                <h3 className="font-heading text-sm font-bold">
                  {new Date(ev.created_at).toLocaleDateString("pt-BR")}
                </h3>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-secondary/30 p-3 text-center">
                  <Weight className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
                  <p className="text-[10px] text-muted-foreground">Peso</p>
                  <p className="font-bold">{ev.weight} kg</p>
                </div>
                <div className="rounded-lg bg-secondary/30 p-3 text-center">
                  <Ruler className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
                  <p className="text-[10px] text-muted-foreground">Altura</p>
                  <p className="font-bold">{ev.height} m</p>
                </div>
                <div className="rounded-lg bg-secondary/30 p-3 text-center">
                  <Percent className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
                  <p className="text-[10px] text-muted-foreground">BF</p>
                  <p className="font-bold">{ev.body_fat}%</p>
                </div>
              </div>
              {ev.notes && (
                <div className="rounded-lg bg-primary/5 p-3 text-sm">
                  <div className="flex items-center gap-1 mb-1">
                    <FileText className="h-3 w-3 text-primary" />
                    <span className="text-[10px] font-semibold text-primary">Observações</span>
                  </div>
                  <p className="text-muted-foreground text-xs">{ev.notes}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </AppLayout>
  );
};

export default Avaliacao;
