import { useState } from "react";
import { Phone, Calendar, Mail, Pencil, Lock, Eye, EyeOff, Camera, Check, X, User, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const formatCPF = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

const formatBirthDate = (dateStr: string | null) => {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
};

const Perfil = () => {
  const { profile, user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editCpf, setEditCpf] = useState("");
  const [editBirthDate, setEditBirthDate] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const initials = profile?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("") || "?";

  const startEditing = () => {
    setEditName(profile?.name || "");
    setEditEmail(profile?.email || "");
    setEditPhone(profile?.phone || "");
    setEditCpf((profile as any)?.cpf || "");
    setEditBirthDate(profile?.birth_date || "");
    setNewPassword("");
    setAvatarFile(null);
    setAvatarPreview(null);
    setEditing(true);
  };

  const formatTelefone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    try {
      let avatarUrl = profile?.avatar_url || null;

      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop();
        const path = `avatars/${user.id}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(path, avatarFile, { upsert: true });

        if (!uploadError) {
          const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
          avatarUrl = urlData.publicUrl;
        }
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          name: editName,
          email: editEmail,
          phone: editPhone || null,
          birth_date: editBirthDate || null,
          avatar_url: avatarUrl,
          cpf: editCpf || null,
        } as any)
        .eq("id", user.id);

      if (profileError) throw profileError;

      if (newPassword) {
        const { error: pwError } = await supabase.auth.updateUser({ password: newPassword });
        if (pwError) throw pwError;
      }

      if (editEmail !== profile?.email) {
        const { error: emailError } = await supabase.auth.updateUser({ email: editEmail });
        if (emailError) throw emailError;
      }

      await refreshProfile();
      setEditing(false);
      toast({ title: "Perfil atualizado com sucesso! ✅" });
    } catch (err: any) {
      toast({ title: "Erro ao atualizar", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const displayAvatar = avatarPreview || profile?.avatar_url;

  return (
    <AppLayout title="Meu Perfil">
      <div className="animate-fade-in space-y-5">
        <div className="flex flex-col items-center py-4">
          <div className="relative">
            {displayAvatar ? (
              <img src={displayAvatar} alt="Avatar" className="h-20 w-20 rounded-full object-cover border-2 border-primary" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full gold-gradient glow-gold">
                <span className="font-heading text-2xl font-bold text-primary-foreground">{initials}</span>
              </div>
            )}
            {editing && (
              <label className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Camera className="h-3.5 w-3.5" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            )}
          </div>
          <h2 className="mt-3 font-heading text-lg font-bold">{profile?.name || "—"}</h2>
        </div>

        {!editing ? (
          <>
            <div className="space-y-3">
              {[
                { icon: User, label: "Nome Completo", value: profile?.name },
                { icon: Mail, label: "E-mail", value: profile?.email },
                { icon: Phone, label: "Telefone", value: profile?.phone },
                { icon: FileText, label: "CPF", value: (profile as any)?.cpf },
                { icon: Calendar, label: "Nascimento", value: formatBirthDate(profile?.birth_date || null) },
              ].map((item) => (
                <div key={item.label} className="glass-card flex items-center gap-3 p-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">{item.label}</p>
                    <p className="text-sm font-medium">{item.value || "—"}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button onClick={startEditing} variant="outline" className="w-full border-primary/50 text-primary hover:bg-primary/10">
              <Pencil className="h-4 w-4 mr-2" /> Editar Perfil
            </Button>
            <Button onClick={() => window.location.href='/faq'} variant="ghost" className="w-full text-muted-foreground hover:text-foreground">
              Perguntas Frequentes (FAQ)
            </Button>
          </>
        ) : (
          <div className="space-y-3 animate-fade-in">
            <div className="glass-card p-4 space-y-3">
              <div>
                <label className="text-[10px] text-muted-foreground">Nome Completo</label>
                <Input value={editName} disabled className="border-border/50 bg-secondary/50 text-foreground focus:border-primary mt-1 opacity-50 cursor-not-allowed" />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground">E-mail</label>
                <Input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="border-border/50 bg-secondary/50 text-foreground focus:border-primary mt-1" />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground">Telefone</label>
                <Input value={editPhone} onChange={(e) => setEditPhone(formatTelefone(e.target.value))} className="border-border/50 bg-secondary/50 text-foreground focus:border-primary mt-1" />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground">CPF</label>
                <Input value={editCpf} disabled placeholder="000.000.000-00" className="border-border/50 bg-secondary/50 text-foreground focus:border-primary mt-1 opacity-50 cursor-not-allowed" />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground">Data de Nascimento</label>
                <Input type="date" value={editBirthDate} disabled className="border-border/50 bg-secondary/50 text-foreground focus:border-primary mt-1 opacity-50 cursor-not-allowed" />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground">Nova Senha (deixe em branco para manter)</label>
                <div className="relative mt-1">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nova senha"
                    className="border-border/50 bg-secondary/50 text-foreground pr-10 focus:border-primary"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 border-border" onClick={() => setEditing(false)} disabled={saving}>
                <X className="h-4 w-4 mr-1" /> Cancelar
              </Button>
              <Button className="flex-1 gold-gradient text-primary-foreground font-heading font-semibold hover:opacity-90" onClick={handleSave} disabled={saving}>
                {saving ? "Salvando..." : <><Check className="h-4 w-4 mr-1" /> Salvar</>}
              </Button>
            </div>
          </div>
        )}


      </div>
    </AppLayout>
  );
};

export default Perfil;
