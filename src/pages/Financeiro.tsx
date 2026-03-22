import { useState } from "react";
import { CheckCircle2, AlertCircle, Clock, CreditCard, QrCode, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";

const payments = [
  { month: "Março/2026", value: "R$ 250,00", status: "pendente", due: "10/03/2026", rawValue: 250 },
  { month: "Fevereiro/2026", value: "R$ 250,00", status: "pago", due: "10/02/2026", rawValue: 250 },
  { month: "Janeiro/2026", value: "R$ 250,00", status: "pago", due: "10/01/2026", rawValue: 250 },
  { month: "Dezembro/2025", value: "R$ 250,00", status: "pago", due: "10/12/2025", rawValue: 250 },
];

const Financeiro = () => {
  const navigate = useNavigate();

  const pendentes = payments.filter((p) => p.status === "pendente");

  const handlePagar = (payment: typeof payments[0]) => {
    navigate("/pagamento", { state: { tipo: "mensalidade", descricao: payment.month, valor: payment.rawValue } });
  };

  return (
    <AppLayout title="Financeiro">
      <div className="animate-fade-in space-y-5">
        {/* Payment list */}
        <div>
          <h3 className="mb-3 font-heading text-sm font-bold">Histórico de Pagamentos</h3>
          <div className="space-y-3">
            {payments.map((p, i) => (
              <div
                key={i}
                className={`glass-card p-4 ${
                  p.status === "pendente" ? "border-destructive/30" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {p.status === "pago" ? (
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-destructive" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{p.month}</p>
                      <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="h-3 w-3" /> Venc: {p.due}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-heading text-sm font-bold">{p.value}</p>
                    <p
                      className={`text-[10px] font-semibold ${
                        p.status === "pago" ? "text-success" : "text-destructive"
                      }`}
                    >
                      {p.status === "pago" ? "Pago" : "Pendente"}
                    </p>
                  </div>
                </div>
                {p.status === "pendente" && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <Button
                      className="w-full gold-gradient text-primary-foreground font-heading font-semibold hover:opacity-90"
                      size="sm"
                      onClick={() => handlePagar(p)}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pagar Mensalidade
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Financeiro;
