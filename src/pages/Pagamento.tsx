import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CreditCard, QrCode, ArrowLeft, Lock, RefreshCw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import AppLayout from "@/components/AppLayout";
import { useToast } from "@/hooks/use-toast";

const Pagamento = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { tipo, descricao, valor } = (location.state as any) || { tipo: "mensalidade", descricao: "", valor: 0 };

  const [metodo, setMetodo] = useState<"cartao" | "pix" | null>(null);
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  // Card fields
  const [numeroCartao, setNumeroCartao] = useState("");
  const [nomeCartao, setNomeCartao] = useState("");
  const [validade, setValidade] = useState("");
  const [cvv, setCvv] = useState("");
  const [recorrente, setRecorrente] = useState(false);

  const formatCardNumber = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const formatValidade = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  const handlePagar = () => {
    if (metodo === "cartao") {
      if (!numeroCartao || !nomeCartao || !validade || !cvv) {
        toast({ title: "Preencha todos os dados do cartão", variant: "destructive" });
        return;
      }
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSucesso(true);
    }, 2000);
  };

  if (sucesso) {
    return (
      <AppLayout title="Pagamento">
        <div className="animate-fade-in flex flex-col items-center justify-center py-16 space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/20">
            <Check className="h-8 w-8 text-success" />
          </div>
          <h2 className="font-heading text-lg font-bold">Pagamento Confirmado!</h2>
          <p className="text-sm text-muted-foreground text-center">
            {metodo === "cartao" ? "Pagamento via cartão de crédito" : "Pagamento via PIX"} de <span className="font-semibold text-foreground">R$ {valor},00</span> realizado com sucesso.
          </p>
          {recorrente && metodo === "cartao" && (
            <p className="text-xs text-primary flex items-center gap-1">
              <RefreshCw className="h-3 w-3" /> Renovação automática ativada
            </p>
          )}
          <Button
            className="gold-gradient text-primary-foreground font-heading font-semibold hover:opacity-90 mt-4"
            onClick={() => navigate("/financeiro")}
          >
            Voltar ao Financeiro
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Pagamento">
      <div className="animate-fade-in space-y-5">
        {/* Summary */}
        <div className="glass-card glow-gold p-4">
          <p className="text-xs text-muted-foreground">Pagamento referente a</p>
          <p className="font-heading text-sm font-bold">{descricao || tipo}</p>
          <p className="font-heading text-xl font-bold gold-text mt-1">R$ {valor},00</p>
        </div>

        {/* Security badge */}
        <div className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2">
          <Lock className="h-4 w-4 text-success" />
          <p className="text-[10px] text-success font-medium">Ambiente seguro • Dados criptografados</p>
        </div>

        {/* Payment method selection */}
        <div>
          <h3 className="mb-3 font-heading text-sm font-bold">Forma de Pagamento</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setMetodo("cartao")}
              className={`glass-card flex flex-col items-center gap-2 p-4 transition-all ${
                metodo === "cartao" ? "border-primary glow-gold" : "hover:border-border"
              }`}
            >
              <CreditCard className={`h-6 w-6 ${metodo === "cartao" ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-xs font-semibold ${metodo === "cartao" ? "gold-text" : "text-muted-foreground"}`}>
                Cartão de Crédito
              </span>
            </button>
            <button
              onClick={() => setMetodo("pix")}
              className={`glass-card flex flex-col items-center gap-2 p-4 transition-all ${
                metodo === "pix" ? "border-primary glow-gold" : "hover:border-border"
              }`}
            >
              <QrCode className={`h-6 w-6 ${metodo === "pix" ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-xs font-semibold ${metodo === "pix" ? "gold-text" : "text-muted-foreground"}`}>
                PIX
              </span>
            </button>
          </div>
        </div>

        {/* Credit Card Form */}
        {metodo === "cartao" && (
          <div className="glass-card p-4 space-y-3 animate-fade-in">
            <Input
              placeholder="Número do cartão"
              value={numeroCartao}
              onChange={(e) => setNumeroCartao(formatCardNumber(e.target.value))}
              className="border-border/50 bg-secondary/50 text-foreground placeholder:text-muted-foreground focus:border-primary"
            />
            <Input
              placeholder="Nome impresso no cartão"
              value={nomeCartao}
              onChange={(e) => setNomeCartao(e.target.value)}
              className="border-border/50 bg-secondary/50 text-foreground placeholder:text-muted-foreground focus:border-primary"
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="MM/AA"
                value={validade}
                onChange={(e) => setValidade(formatValidade(e.target.value))}
                className="border-border/50 bg-secondary/50 text-foreground placeholder:text-muted-foreground focus:border-primary"
              />
              <Input
                placeholder="CVV"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                className="border-border/50 bg-secondary/50 text-foreground placeholder:text-muted-foreground focus:border-primary"
              />
            </div>

            {/* Recorrência */}
            <div className="flex items-center justify-between rounded-lg bg-secondary/30 p-3">
              <div>
                <p className="text-xs font-semibold text-foreground">Renovação automática</p>
                <p className="text-[10px] text-muted-foreground">Cobrar mensalidade automaticamente</p>
              </div>
              <Switch checked={recorrente} onCheckedChange={setRecorrente} />
            </div>
          </div>
        )}

        {/* PIX */}
        {metodo === "pix" && (
          <div className="glass-card p-4 animate-fade-in text-center space-y-3">
            <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-xl bg-secondary/50 border border-border/50">
              <div className="text-center">
                <QrCode className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
                <p className="text-[10px] text-muted-foreground">QR Code será gerado<br/>ao confirmar</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Ao confirmar, um QR Code PIX será gerado para pagamento imediato.
            </p>
          </div>
        )}

        {/* Pay button */}
        {metodo && (
          <Button
            className="w-full gold-gradient text-primary-foreground font-heading font-semibold hover:opacity-90"
            disabled={loading}
            onClick={handlePagar}
          >
            {loading ? "Processando..." : `Pagar R$ ${valor},00`}
          </Button>
        )}
      </div>
    </AppLayout>
  );
};

export default Pagamento;
