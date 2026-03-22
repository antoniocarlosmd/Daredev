import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import loginBg from "@/assets/login-bg.jpeg";

const AlterarSenha = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, refreshProfile, role } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "A senha precisa ter no mínimo 6 caracteres.", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "As senhas não coincidem.", variant: "destructive" });
      return;
    }
    
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast({ title: "Erro ao atualizar senha", variant: "destructive", description: error.message });
      setLoading(false);
      return;
    }

    if (user) {
      await supabase.from("profiles").update({ force_password_change: false }).eq("id", user.id);
      await refreshProfile();
      toast({ title: "Senha alterada com sucesso!" });
      navigate(role === "admin" ? "/admin" : "/dashboard", { replace: true });
    }
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
              PRIMEIRO ACESSO
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Por segurança, você deve alterar a senha inicial.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Nova Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-border/50 bg-secondary/50 pl-10 text-foreground placeholder:text-muted-foreground focus:border-primary"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Confirmar Nova Senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="border-border/50 bg-secondary/50 pl-10 text-foreground placeholder:text-muted-foreground focus:border-primary"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full gold-gradient font-heading font-semibold tracking-wide text-primary-foreground hover:opacity-90 transition-opacity"
            >
              {loading ? "Atualizando..." : "Alterar Senha e Acessar"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AlterarSenha;
