import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import loginBg from "@/assets/login-bg.jpeg";

const EsqueciSenha = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRecuperar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ title: "Informe seu e-mail", variant: "destructive" });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setEnviado(true);
      toast({ title: "Link enviado!", description: "Verifique sua caixa de entrada." });
    }, 1200);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${loginBg})` }} />
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />

      <div className="relative z-10 mx-4 w-full max-w-md animate-fade-in">
        <div className="glass-card p-8">
          <div className="mb-6 flex items-center gap-3">
            <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="font-heading text-xl font-bold gold-text">Recuperar Senha</h1>
              <p className="text-xs text-muted-foreground">Informe seu e-mail cadastrado</p>
            </div>
          </div>

          {enviado ? (
            <div className="text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm text-foreground">
                Enviamos um link de redefinição de senha para <span className="font-semibold text-primary">{email}</span>.
              </p>
              <p className="text-xs text-muted-foreground">Verifique também a caixa de spam.</p>
              <Button variant="outline" className="w-full mt-4" onClick={() => navigate("/")}>
                Voltar ao Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleRecuperar} className="space-y-5">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Seu e-mail cadastrado"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-border/50 bg-secondary/50 pl-10 text-foreground placeholder:text-muted-foreground focus:border-primary"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full gold-gradient font-heading font-semibold tracking-wide text-primary-foreground hover:opacity-90 transition-opacity"
              >
                {loading ? "Enviando..." : "Enviar Link de Recuperação"}
              </Button>
              <button type="button" className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors" onClick={() => navigate("/")}>
                Voltar ao <span className="text-primary font-medium">Login</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EsqueciSenha;
