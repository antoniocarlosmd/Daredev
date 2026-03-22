import { useState, useEffect } from "react";
import { CheckCircle2, Clock, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

type Modalidade = "jiujitsu" | "hibrido" | "powerhitt" | "hibrido_hitt";
type TipoPlano = "mensal" | "trimestral" | "semestral";

interface PlanoOption {
  frequencia: string;
  valor: string;
  rawValue: number;
}

const planosConfig: Record<Modalidade, Partial<Record<TipoPlano, PlanoOption[]>>> = {
  jiujitsu: {
    mensal: [{ frequencia: "2x", valor: "R$200/mês", rawValue: 200 }],
  },
  hibrido: {
    trimestral: [
      { frequencia: "2x", valor: "3x de R$215", rawValue: 215 },
      { frequencia: "3x", valor: "3x de R$250", rawValue: 250 },
      { frequencia: "4x", valor: "3x de R$285", rawValue: 285 },
    ],
    semestral: [
      { frequencia: "2x", valor: "6x de R$199", rawValue: 199 },
      { frequencia: "3x", valor: "6x de R$235", rawValue: 235 },
      { frequencia: "4x", valor: "6x de R$269", rawValue: 269 },
    ],
  },
  powerhitt: {
    trimestral: [
      { frequencia: "2x", valor: "3x de R$145", rawValue: 145 },
      { frequencia: "3x", valor: "3x de R$169", rawValue: 169 },
    ],
    semestral: [
      { frequencia: "2x", valor: "6x de R$109", rawValue: 109 },
      { frequencia: "3x", valor: "6x de R$135", rawValue: 135 },
    ],
  },
  hibrido_hitt: {
    trimestral: [
      { frequencia: "2x", valor: "3x de R$260", rawValue: 260 },
      { frequencia: "3x", valor: "3x de R$295", rawValue: 295 },
      { frequencia: "4x", valor: "3x de R$330", rawValue: 330 },
    ],
    semestral: [
      { frequencia: "2x", valor: "6x de R$250", rawValue: 250 },
      { frequencia: "3x", valor: "6x de R$285", rawValue: 285 },
      { frequencia: "4x", valor: "6x de R$320", rawValue: 320 },
    ],
  },
};

const modalidadeLabels: Record<Modalidade, string> = {
  jiujitsu: "JIU-JITSU",
  hibrido: "TREINO HÍBRIDO",
  powerhitt: "POWER HITT",
  hibrido_hitt: "HÍBRIDO + HITT",
};

const tipoPlanoLabels: Record<TipoPlano, string> = {
  mensal: "Mensal",
  trimestral: "Trimestral",
  semestral: "Semestral",
};

const mockPlanInfo = {
  tipo: "Trimestral",
  modalidade: "TREINO HÍBRIDO",
  aulaSemana: "3x semana",
  inicio: "10/12/2025",
  fim: "10/03/2026",
  diasRestantes: 28,
  valor: 250,
};

const Plano = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loadingPayment, setLoadingPayment] = useState(false);

  // Derive plan from profile if available
  const planInfo = {
    tipo: profile?.plan_type || mockPlanInfo.tipo,
    modalidade: Array.isArray(profile?.modality) ? profile.modality.join(", ") : (profile?.modality || mockPlanInfo.modalidade),
    aulaSemana: profile?.frequency || mockPlanInfo.aulaSemana,
    inicio: mockPlanInfo.inicio, // Fetch real data if schema had it
    fim: mockPlanInfo.fim,
    diasRestantes: mockPlanInfo.diasRestantes,
    valor: mockPlanInfo.valor, // Derive from logic if needed
  };

  const handleCheckout = async () => {
    setLoadingPayment(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-preference", {
        body: { amount: planInfo.valor, description: `Mensalidade CT React - ${planInfo.modalidade} (${planInfo.tipo})` }
      });
      if (error) throw error;
      if (data?.init_point) {
        window.location.href = data.init_point;
      }
    } catch (err: any) {
      console.error(err);
      toast({ title: "Erro ao gerar pagamento", description: err.message || "Tente novamente mais tarde.", variant: "destructive" });
    } finally {
      setLoadingPayment(false);
    }
  };

  return (
    <AppLayout title="Meu Plano">
      <div className="animate-fade-in space-y-5">
        {/* Current plan */}
        <div className="glass-card glow-gold p-5">
          <div className="mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <h2 className="font-heading text-sm font-bold">Plano Ativo</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Plano</span>
              <span className="font-heading text-sm font-bold gold-text">{planInfo.tipo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Modalidade</span>
              <span className="text-sm font-medium">{planInfo.modalidade}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Frequência</span>
              <span className="text-sm font-medium">{planInfo.aulaSemana}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Início</span>
              <span className="text-sm font-medium">{planInfo.inicio}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Término</span>
              <span className="text-sm font-medium">{planInfo.fim}</span>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Clock className="h-3 w-3" /> Dias restantes
                </span>
                <span className="font-heading text-xs font-bold text-primary">
                  {planInfo.diasRestantes} dias
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full gold-gradient transition-all"
                  style={{ width: `${(planInfo.diasRestantes / 90) * 100}%` }}
                />
              </div>
            </div>

            <Button 
              onClick={handleCheckout} 
              disabled={loadingPayment}
              className="w-full mt-4 gold-gradient text-primary-foreground font-heading font-semibold hover:opacity-90"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {loadingPayment ? "Gerando Pagamento..." : "Pagar Mensalidade"}
            </Button>
          </div>
        </div>

      </div>
    </AppLayout>
  );
};

export default Plano;
