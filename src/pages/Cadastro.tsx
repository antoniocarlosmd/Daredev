import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, User, Mail, Phone, CalendarDays, Check, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import loginBg from "@/assets/login-bg.jpeg";

type Modalidade = "jiujitsu" | "hibrido" | "powerhitt" | "hibrido_hitt";
type TipoPlano = "mensal" | "trimestral" | "semestral";
type Frequencia = "2x" | "3x" | "4x";

interface PlanoOption {
  frequencia: Frequencia;
  valor: string;
}

const planosConfig: Record<Modalidade, Partial<Record<TipoPlano, PlanoOption[]>>> = {
  jiujitsu: {
    mensal: [{ frequencia: "2x", valor: "R$200" }],
  },
  hibrido: {
    trimestral: [
      { frequencia: "2x", valor: "3x de R$215" },
      { frequencia: "3x", valor: "3x de R$250" },
      { frequencia: "4x", valor: "3x de R$285" },
    ],
    semestral: [
      { frequencia: "2x", valor: "6x de R$199" },
      { frequencia: "3x", valor: "6x de R$235" },
      { frequencia: "4x", valor: "6x de R$269" },
    ],
  },
  powerhitt: {
    trimestral: [
      { frequencia: "2x", valor: "3x de R$145" },
      { frequencia: "3x", valor: "3x de R$169" },
    ],
    semestral: [
      { frequencia: "2x", valor: "6x de R$109" },
      { frequencia: "3x", valor: "6x de R$135" },
    ],
  },
  hibrido_hitt: {
    trimestral: [
      { frequencia: "2x", valor: "3x de R$260" },
      { frequencia: "3x", valor: "3x de R$295" },
      { frequencia: "4x", valor: "3x de R$330" },
    ],
    semestral: [
      { frequencia: "2x", valor: "6x de R$250" },
      { frequencia: "3x", valor: "6x de R$285" },
      { frequencia: "4x", valor: "6x de R$320" },
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

const Cadastro = () => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [modalidade, setModalidade] = useState<Modalidade | "">("");
  const [tipoPlano, setTipoPlano] = useState<TipoPlano | "">("");
  const [frequencia, setFrequencia] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setFotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const formatTelefone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const availableTiposPlano = modalidade
    ? (Object.keys(planosConfig[modalidade as Modalidade] || {}) as TipoPlano[])
    : [];

  const availableFrequencias =
    modalidade && tipoPlano
      ? planosConfig[modalidade as Modalidade]?.[tipoPlano as TipoPlano] || []
      : [];

  const handleModalidadeChange = (val: string) => {
    setModalidade(val as Modalidade);
    setTipoPlano("");
    setFrequencia("");
  };

  const handleTipoPlanoChange = (val: string) => {
    setTipoPlano(val as TipoPlano);
    setFrequencia("");
  };

  const handleCadastro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !email || !telefone || !dataNascimento || !senha) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }
    if (senha.length < 8 || !/[A-Z]/.test(senha) || !/[0-9]/.test(senha) || !/[!@#$%^&*]/.test(senha)) {
      toast({ title: "A senha não atende aos requisitos mínimos", variant: "destructive" });
      return;
    }
    if (!modalidade || !tipoPlano || !frequencia) {
      toast({ title: "Selecione a modalidade, plano e frequência", variant: "destructive" });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      localStorage.setItem("userName", nome);
      toast({ title: "Cadastro realizado com sucesso!", description: "Faça login para acessar o app." });
      navigate("/");
    }, 1200);
  };

  return (
    <div className="relative flex min-h-screen items-start justify-center overflow-y-auto">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${loginBg})` }} />
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />

      <div className="relative z-10 mx-4 my-8 w-full max-w-lg animate-fade-in">
        <div className="glass-card p-6 sm:p-8">
          {/* Header */}
          <div className="mb-6 flex items-center gap-3">
            <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="font-heading text-xl font-bold gold-text">Cadastre-se</h1>
              <p className="text-xs text-muted-foreground">Preencha seus dados para criar sua conta</p>
            </div>
          </div>

          <form onSubmit={handleCadastro} className="space-y-5">
            {/* Foto */}
            <div className="flex justify-center">
              <label className="relative cursor-pointer group">
                <div className="h-24 w-24 rounded-full border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-secondary/50 group-hover:border-primary transition-colors">
                  {fotoPreview ? (
                    <img src={fotoPreview} alt="Foto de perfil" className="h-full w-full object-cover" />
                  ) : (
                    <Camera className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                  )}
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleFotoChange} />
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground whitespace-nowrap">
                  Adicionar foto
                </span>
              </label>
            </div>

            {/* Dados pessoais */}
            <div className="space-y-3">
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Nome completo" value={nome} onChange={(e) => setNome(e.target.value)} className="border-border/50 bg-secondary/50 pl-10 text-foreground placeholder:text-muted-foreground focus:border-primary" />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} className="border-border/50 bg-secondary/50 pl-10 text-foreground placeholder:text-muted-foreground focus:border-primary" />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Telefone com DDD" value={telefone} onChange={(e) => setTelefone(formatTelefone(e.target.value))} className="border-border/50 bg-secondary/50 pl-10 text-foreground placeholder:text-muted-foreground focus:border-primary" />
              </div>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input type="date" placeholder="Data de nascimento" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} className="border-border/50 bg-secondary/50 pl-10 text-foreground placeholder:text-muted-foreground focus:border-primary" />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type={mostrarSenha ? "text" : "password"}
                  placeholder="Senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="border-border/50 bg-secondary/50 pl-10 pr-10 text-foreground placeholder:text-muted-foreground focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {mostrarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="rounded-lg bg-secondary/30 p-3 space-y-1">
                <p className="text-[10px] font-semibold text-muted-foreground mb-1">A senha deve conter:</p>
                <p className={`text-[10px] ${senha.length >= 8 ? "text-success" : "text-muted-foreground"}`}>✓ Mínimo de 8 caracteres</p>
                <p className={`text-[10px] ${/[A-Z]/.test(senha) ? "text-success" : "text-muted-foreground"}`}>✓ Pelo menos uma letra maiúscula</p>
                <p className={`text-[10px] ${/[0-9]/.test(senha) ? "text-success" : "text-muted-foreground"}`}>✓ Pelo menos um número</p>
                <p className={`text-[10px] ${/[!@#$%^&*]/.test(senha) ? "text-success" : "text-muted-foreground"}`}>✓ Pelo menos um caractere especial (!@#$%^&*)</p>
              </div>
            </div>

            {/* Modalidade */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-foreground">Modalidade de Treino</Label>
              <RadioGroup value={modalidade} onValueChange={handleModalidadeChange} className="grid grid-cols-2 gap-2">
                {(Object.keys(modalidadeLabels) as Modalidade[]).map((key) => (
                  <label
                    key={key}
                    className={`flex items-center gap-2 rounded-lg border p-3 cursor-pointer transition-all text-sm ${
                      modalidade === key
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border/50 bg-secondary/30 text-muted-foreground hover:border-border"
                    }`}
                  >
                    <RadioGroupItem value={key} className="sr-only" />
                    <div className={`h-3 w-3 rounded-full border-2 flex items-center justify-center ${modalidade === key ? "border-primary" : "border-muted-foreground"}`}>
                      {modalidade === key && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                    </div>
                    <span className="font-medium leading-tight">{modalidadeLabels[key]}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>

            {/* Tipo de Plano */}
            {modalidade && availableTiposPlano.length > 0 && (
              <div className="space-y-3 animate-fade-in">
                <Label className="text-sm font-semibold text-foreground">Tipo de Plano</Label>
                <RadioGroup value={tipoPlano} onValueChange={handleTipoPlanoChange} className="flex gap-2">
                  {availableTiposPlano.map((tp) => (
                    <label
                      key={tp}
                      className={`flex-1 flex items-center justify-center gap-2 rounded-lg border p-3 cursor-pointer transition-all text-sm ${
                        tipoPlano === tp
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border/50 bg-secondary/30 text-muted-foreground hover:border-border"
                      }`}
                    >
                      <RadioGroupItem value={tp} className="sr-only" />
                      <span className="font-medium">{tipoPlanoLabels[tp]}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Frequência e Valor */}
            {tipoPlano && availableFrequencias.length > 0 && (
              <div className="space-y-3 animate-fade-in">
                <Label className="text-sm font-semibold text-foreground">Frequência Semanal</Label>
                <RadioGroup value={frequencia} onValueChange={setFrequencia} className="space-y-2">
                  {availableFrequencias.map((opt) => (
                    <label
                      key={opt.frequencia}
                      className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-all ${
                        frequencia === opt.frequencia
                          ? "border-primary bg-primary/10"
                          : "border-border/50 bg-secondary/30 hover:border-border"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value={opt.frequencia} className="sr-only" />
                        <div className={`h-3 w-3 rounded-full border-2 flex items-center justify-center ${frequencia === opt.frequencia ? "border-primary" : "border-muted-foreground"}`}>
                          {frequencia === opt.frequencia && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                        </div>
                        <span className="text-sm text-foreground font-medium">{opt.frequencia} na semana</span>
                      </div>
                      <span className="text-sm font-bold gold-text">{opt.valor}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Botão */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full gold-gradient font-heading font-semibold tracking-wide text-primary-foreground hover:opacity-90 transition-opacity"
            >
              {loading ? "Cadastrando..." : "Confirmar Cadastro"}
            </Button>

            <button type="button" className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors" onClick={() => navigate("/")}>
              Já tenho conta. <span className="text-primary font-medium">Fazer login</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Cadastro;
