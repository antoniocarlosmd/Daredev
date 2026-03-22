import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, User, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import loginBg from "@/assets/login-bg.jpeg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, user, role, profile, loading: authLoading } = useAuth();

  // Redirect when auth state changes (handles role-based redirect)
  useEffect(() => {
    if (!authLoading && user && role && profile) {
      if (profile.force_password_change) {
        navigate("/alterar-senha", { replace: true });
        return;
      }
      if (role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [user, role, profile, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const missingFields: string[] = [];
    if (!email) missingFields.push("E-mail");
    if (!password) missingFields.push("Senha");

    if (missingFields.length > 0) {
      toast({ 
        title: "Preencha os campos obrigatórios:", 
        description: missingFields.join(", "),
        variant: "destructive" 
      });
      return;
    }
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setLoading(false);
      toast({ title: "E-mail ou senha incorretos", variant: "destructive" });
      return;
    }

    // Redirect will happen via useEffect when AuthContext updates role
    setLoading(false);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${loginBg})` }}
      />
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />

      <div className="relative z-10 mx-4 w-full max-w-md animate-fade-in">
        <div className="glass-card p-8">
          <div className="mb-8 text-center">
            <h1 className="font-heading text-2xl font-bold tracking-wide gold-text">
              REACT
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Centro de Treinamento e Reabilitação Funcional
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Usuário (e-mail)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-border/50 bg-secondary/50 pl-10 text-foreground placeholder:text-muted-foreground focus:border-primary"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-border/50 bg-secondary/50 pl-10 pr-10 text-foreground placeholder:text-muted-foreground focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full gold-gradient font-heading font-semibold tracking-wide text-primary-foreground hover:opacity-90 transition-opacity"
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full border-primary/50 text-primary hover:bg-primary/10 font-heading font-semibold tracking-wide transition-all"
              onClick={() => navigate("/aula-experimental")}
            >
              <Dumbbell className="h-4 w-4 mr-2" />
              Agende uma Aula Experimental
            </Button>

            <button
              type="button"
              className="w-full text-center text-sm text-muted-foreground hover:text-primary transition-colors"
              onClick={() => navigate("/esqueci-senha")}
            >
              Esqueci minha senha
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
