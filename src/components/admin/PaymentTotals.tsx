import { QrCode, CreditCard } from "lucide-react";
import { formatPaymentMethod, categorizePayment } from "@/utils/adminUtils";

interface PaymentTotalsProps {
  payments: any[];
  label: string;
}

export const PaymentTotals = ({ payments, label }: PaymentTotalsProps) => {
  const total = payments.reduce((acc, p) => acc + Number(p.amount), 0);
  const byMethod = payments.reduce((acc: Record<string, number>, p) => {
    const m = formatPaymentMethod(p.method);
    acc[m] = (acc[m] || 0) + Number(p.amount);
    return acc;
  }, {});
  const byType = payments.reduce((acc: Record<string, number>, p) => {
    const cat = categorizePayment(p.description);
    acc[cat] = (acc[cat] || 0) + Number(p.amount);
    return acc;
  }, {});

  return (
    <div className="space-y-3">
      <div className="rounded-lg bg-primary/10 p-3 text-center">
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className="font-heading text-xl font-bold gold-text">
          R$ {total.toFixed(2).replace(".", ",")}
        </p>
      </div>
      {Object.keys(byMethod).length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(byMethod).map(([method, val]) => (
            <div key={method} className="rounded-lg bg-secondary/30 p-2 text-center">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                {method === "PIX" ? <QrCode className="h-3 w-3 text-muted-foreground" /> : <CreditCard className="h-3 w-3 text-muted-foreground" />}
                <p className="text-[9px] text-muted-foreground">{method}</p>
              </div>
              <p className="text-xs font-bold text-foreground">R$ {(val as number).toFixed(2).replace(".", ",")}</p>
            </div>
          ))}
        </div>
      )}
      {Object.keys(byType).length > 0 && (
        <div className="space-y-1">
          {Object.entries(byType).map(([type, val]) => (
            <div key={type} className="flex items-center justify-between rounded-lg bg-secondary/20 px-3 py-1.5">
              <span className="text-[10px] text-muted-foreground">{type}</span>
              <span className="text-[10px] font-bold text-foreground">R$ {(val as number).toFixed(2).replace(".", ",")}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
