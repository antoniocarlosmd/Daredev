import { useState, useEffect } from "react";
import { DollarSign, Search, Mail, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { PaymentTotals } from "./PaymentTotals";
import { formatBirthDate, formatPaymentMethod, categorizePayment } from "@/utils/adminUtils";

interface PagamentosTabProps {}

const PagamentosTab = ({}: PagamentosTabProps) => {
  const today = new Date().toISOString().split("T")[0];
  const [dataInicio, setDataInicio] = useState(today);
  const [dataFim, setDataFim] = useState(today);
  const [payments, setPayments] = useState<any[]>([]);

  const fetchPayments = async () => {
    const { data: paymentsData } = await supabase
      .from("payments")
      .select("*")
      .gte("created_at", `${dataInicio}T00:00:00`)
      .lte("created_at", `${dataFim}T23:59:59`)
      .eq("status", "paid")
      .order("created_at", { ascending: false });

    if (!paymentsData) {
      setPayments([]);
      return;
    }

    const userIds = [...new Set(paymentsData.map((p) => p.user_id).filter(Boolean))];
    const { data: profilesData } = userIds.length > 0
      ? await supabase.from("profiles").select("id, name").in("id", userIds)
      : { data: [] };
    const profileMap: Record<string, string> = {};
    (profilesData || []).forEach((p: any) => { profileMap[p.id] = p.name; });

    setPayments(paymentsData.map((p) => ({ ...p, profiles: { name: profileMap[p.user_id] || null } })));
  };

  useEffect(() => {
    fetchPayments();
  }, [dataInicio, dataFim]);

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-bold">Relatório de Pagamentos</h2>
      </div>

      <div className="glass-card p-4 space-y-4">
        <h3 className="font-heading text-sm font-bold flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" /> Filtrar por Período
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[10px] text-muted-foreground uppercase font-bold ml-1">Início</label>
            <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="border-border/50 bg-secondary/30 h-9" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] text-muted-foreground uppercase font-bold ml-1">Fim</label>
            <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="border-border/50 bg-secondary/30 h-9" />
          </div>
        </div>
      </div>

      <div className="glass-card glow-gold p-4 space-y-3">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          <h2 className="font-heading text-sm font-bold">Resumo Financeiro</h2>
        </div>
        <PaymentTotals payments={payments} label="Total no Período" />
      </div>

      <div className="space-y-3">
        <h3 className="font-heading text-sm font-bold flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-primary" /> Extrato Detalhado
        </h3>
        {payments.length > 0 ? (
          payments.map((p) => (
            <div key={p.id} className="glass-card p-4 border-l-4 border-l-success animate-fade-in group hover:bg-secondary/20 transition-all">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-bold text-sm leading-tight text-foreground group-hover:text-primary transition-colors">{p.profiles?.name || "Aluno"}</h4>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5"><Mail className="h-3 w-3" /> {p.user_id ? "Aluno Cadastrado" : "Visitante"}</p>
                </div>
                <div className="text-right">
                  <span className="font-heading text-sm font-bold gold-text">R$ {Number(p.amount).toFixed(2).replace(".", ",")}</span>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(p.created_at).toLocaleDateString("pt-BR")} às {new Date(p.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-2 border-t border-border/30">
                <span className="bg-secondary/50 px-2 py-0.5 rounded-full text-[9px] font-bold text-muted-foreground">{formatPaymentMethod(p.method)}</span>
                <span className="bg-primary/10 px-2 py-0.5 rounded-full text-[9px] font-bold text-primary italic">{categorizePayment(p.description)}</span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-xs text-muted-foreground py-8 glass-card">Nenhum pagamento encontrado para este período.</p>
        )}
      </div>
    </>
  );
};

export default PagamentosTab;
