import { useState, useEffect } from "react";
import { Plus, Search, Pencil, Trash2, Activity, User, Mail, Phone, CalendarDays, Lock, EyeOff, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Modalidade, TipoPlano, 
  modalidadeLabels, tipoPlanoLabels, 
  dayLabels, allTimeSlots, 
  planosConfig, frequencyToCount 
} from "@/constants/admin";
import { formatTelefone, formatCPF } from "@/utils/adminUtils";

interface AlunosTabProps {
  conversionData?: { name: string; phone: string } | null;
  onConversionHandled?: () => void;
}

const AlunosTab = ({ conversionData, onConversionHandled }: AlunosTabProps) => {
  const { toast } = useToast();

  // ── Student State ──
  const [showCadastroForm, setShowCadastroForm] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpf, setCpf] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [modalidadesSelecionadas, setModalidadesSelecionadas] = useState<Modalidade[]>([]);
  const [tipoPlano, setTipoPlano] = useState<TipoPlano | "">("");
  const [frequencia, setFrequencia] = useState("");
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([]);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<Record<number, string>>({});
  const [cadastroLoading, setCadastroLoading] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  const [editStudentData, setEditStudentData] = useState<any>({});

  // ── Avaliacoes State ──
  const [evaluationStudentId, setEvaluationStudentId] = useState<string | null>(null);
  const [evalData, setEvalData] = useState({ weight: "", height: "", body_fat: "", notes: "" });
  const [evalLoading, setEvalLoading] = useState(false);

  // ── Effects ──
  const fetchAndSetStudents = async () => {
    const { data: adminsData } = await supabase.from("user_roles").select("user_id").eq("role", "admin");
    const adminIds = adminsData ? adminsData.map(a => a.user_id) : [];
    const { data: profilesData } = await supabase.from("profiles").select("*").order("name");
    if (profilesData) {
      setStudents(profilesData.filter(p => !adminIds.includes(p.id)));
    } else {
      setStudents([]);
    }
  };

  useEffect(() => {
    fetchAndSetStudents();
  }, []);

  useEffect(() => {
    if (conversionData) {
      setEditingStudent(null);
      setEvaluationStudentId(null);
      setShowCadastroForm(true);
      setNome(conversionData.name);
      setTelefone(conversionData.phone || "");
      if (onConversionHandled) onConversionHandled();
    }
  }, [conversionData]);

  // ── Handlers ──
  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setCadastroLoading(true);
    const { data, error } = await supabase.functions.invoke("create-student", {
      body: {
        email, password: senha, name: nome, phone: telefone, cpf: cpf || null,
        birth_date: dataNascimento || null,
        modality: modalidadesSelecionadas.map(m => modalidadeLabels[m]),
        plan_type: tipoPlanoLabels[tipoPlano as TipoPlano],
        frequency: frequencia,
        scheduled_days: selectedWeekdays,
        scheduled_time_slots: selectedTimeSlots,
      },
    });
    setCadastroLoading(false);

    if (error || data?.error) {
      toast({ title: "Erro ao cadastrar", description: data?.error || error?.message, variant: "destructive" });
      return;
    }
    toast({ title: "Aluno cadastrado com sucesso! ✅" });
    setShowCadastroForm(false);
    // Reset form
    setNome(""); setEmail(""); setTelefone(""); setCpf(""); setDataNascimento(""); setSenha("");
    setModalidadesSelecionadas([]); setTipoPlano(""); setFrequencia(""); setSelectedWeekdays([]); setSelectedTimeSlots({});
    await fetchAndSetStudents();
  };

  const handleDeleteStudent = async (id: string) => {
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (error) { toast({ title: "Erro ao excluir aluno", variant: "destructive" }); return; }
    toast({ title: "Aluno removido" });
    await fetchAndSetStudents();
  };

  const startEditStudent = (student: any) => {
    setEditingStudent(student);
    setEditStudentData({
      name: student.name || "", email: student.email || "", 
      phone: student.phone || "", cpf: student.cpf || "",
      birth_date: student.birth_date || "", modality: student.modality || "",
      plan_type: student.plan_type || "", frequency: student.frequency || "",
    });
  };

  const handleSaveStudent = async () => {
    if (!editingStudent) return;
    const { error } = await supabase.from("profiles").update({
      name: editStudentData.name, phone: editStudentData.phone || null,
      cpf: editStudentData.cpf || null, birth_date: editStudentData.birth_date || null,
      modality: editStudentData.modality || null, plan_type: editStudentData.plan_type || null,
      frequency: editStudentData.frequency || null,
    }).eq("id", editingStudent.id);

    if (error) { toast({ title: "Erro ao atualizar aluno", variant: "destructive" }); return; }
    toast({ title: "Aluno atualizado com sucesso! ✅" });
    setEditingStudent(null);
    await fetchAndSetStudents();
  };

  const handleSaveEvaluation = async () => {
    if (!evaluationStudentId) return;
    setEvalLoading(true);
    const { error } = await supabase.from("evaluations" as any).insert({
      user_id: evaluationStudentId,
      weight: parseFloat(evalData.weight) || null,
      height: parseFloat(evalData.height) || null,
      body_fat: parseFloat(evalData.body_fat) || null,
      notes: evalData.notes || null,
    });
    setEvalLoading(false);
    if (error) { toast({ title: "Erro ao salvar avaliação", variant: "destructive" }); return; }
    toast({ title: "Avaliação salva com sucesso! ✅" });
    setEvaluationStudentId(null);
    setEvalData({ weight: "", height: "", body_fat: "", notes: "" });
  };

  const toggleWeekday = (day: number) => {
    const requiredCount = frequencia ? (frequencyToCount[frequencia] || 0) : 0;
    setSelectedWeekdays((prev) => {
      if (prev.includes(day)) {
        const newDays = prev.filter((d) => d !== day);
        const newSlots = { ...selectedTimeSlots };
        delete newSlots[day];
        setSelectedTimeSlots(newSlots);
        return newDays;
      }
      if (prev.length >= requiredCount) return prev;
      return [...prev, day];
    });
  };

  // ── Computed Values ──
  const availableTiposPlano = modalidadesSelecionadas.length > 0 ? (Object.keys(planosConfig[modalidadesSelecionadas[0]] || {}) as TipoPlano[]) : [];
  const availableFrequencias = modalidadesSelecionadas.length > 0 && tipoPlano ? planosConfig[modalidadesSelecionadas[0]]?.[tipoPlano] || [] : [];
  const requiredDaysCount = frequencia ? (frequencyToCount[frequencia] || 0) : 0;

  const filteredStudents = students.filter((s) => 
    (s.name || "").toLowerCase().includes(studentSearch.toLowerCase()) || 
    (s.email || "").toLowerCase().includes(studentSearch.toLowerCase())
  );

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-bold">Alunos</h2>
        <Button size="sm" onClick={() => { setShowCadastroForm(!showCadastroForm); setEditingStudent(null); setEvaluationStudentId(null); }} className="gold-gradient text-primary-foreground hover:opacity-90">
          <Plus className="h-4 w-4 mr-1" /> Cadastrar
        </Button>
      </div>

      {/* Edit Student Form */}
      {editingStudent && (
        <div className="glass-card p-4 space-y-3 animate-fade-in">
          <h3 className="font-heading text-sm font-bold">Editar Aluno</h3>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] text-muted-foreground">Nome Completo</label>
              <Input value={editStudentData.name} onChange={(e) => setEditStudentData({ ...editStudentData, name: e.target.value })} className="border-border/50 bg-secondary/50 text-foreground focus:border-primary mt-1" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground">E-mail (somente leitura)</label>
              <Input value={editStudentData.email} disabled className="border-border/50 bg-secondary/30 text-muted-foreground mt-1" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground">Telefone</label>
              <Input value={editStudentData.phone} onChange={(e) => setEditStudentData({ ...editStudentData, phone: formatTelefone(e.target.value) })} className="border-border/50 bg-secondary/50 text-foreground focus:border-primary mt-1" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground">CPF</label>
              <Input value={editStudentData.cpf} onChange={(e) => setEditStudentData({ ...editStudentData, cpf: formatCPF(e.target.value) })} placeholder="000.000.000-00" className="border-border/50 bg-secondary/50 text-foreground focus:border-primary mt-1" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground">Data de Nascimento</label>
              <Input type="date" value={editStudentData.birth_date} onChange={(e) => setEditStudentData({ ...editStudentData, birth_date: e.target.value })} className="border-border/50 bg-secondary/50 text-foreground focus:border-primary mt-1" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground">Modalidade</label>
              <Input value={editStudentData.modality} onChange={(e) => setEditStudentData({ ...editStudentData, modality: e.target.value })} className="border-border/50 bg-secondary/50 text-foreground focus:border-primary mt-1" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground">Plano</label>
              <Input value={editStudentData.plan_type} onChange={(e) => setEditStudentData({ ...editStudentData, plan_type: e.target.value })} className="border-border/50 bg-secondary/50 text-foreground focus:border-primary mt-1" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground">Frequência</label>
              <Input value={editStudentData.frequency} onChange={(e) => setEditStudentData({ ...editStudentData, frequency: e.target.value })} className="border-border/50 bg-secondary/50 text-foreground focus:border-primary mt-1" />
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 border-border" onClick={() => setEditingStudent(null)}>Cancelar</Button>
            <Button className="flex-1 gold-gradient text-primary-foreground font-heading font-semibold hover:opacity-90" onClick={handleSaveStudent}>Salvar</Button>
          </div>
        </div>
      )}

      {/* Avaliação Form */}
      {evaluationStudentId && (
        <div className="glass-card p-4 space-y-3 animate-fade-in">
          <h3 className="font-heading text-sm font-bold">Nova Avaliação Física</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-muted-foreground">Peso (kg)</label>
                <Input type="number" step="0.1" value={evalData.weight} onChange={(e) => setEvalData({ ...evalData, weight: e.target.value })} className="border-border/50 bg-secondary/50 text-foreground mt-1" />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground">Altura (m)</label>
                <Input type="number" step="0.01" value={evalData.height} onChange={(e) => setEvalData({ ...evalData, height: e.target.value })} className="border-border/50 bg-secondary/50 text-foreground mt-1" />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground">BF (%)</label>
                <Input type="number" step="0.1" value={evalData.body_fat} onChange={(e) => setEvalData({ ...evalData, body_fat: e.target.value })} className="border-border/50 bg-secondary/50 text-foreground mt-1" />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground">Observações</label>
              <Input value={evalData.notes} onChange={(e) => setEvalData({ ...evalData, notes: e.target.value })} className="border-border/50 bg-secondary/50 text-foreground mt-1" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" className="flex-1 border-border" onClick={() => setEvaluationStudentId(null)}>Cancelar</Button>
            <Button className="flex-1 gold-gradient text-primary-foreground hover:opacity-90" onClick={handleSaveEvaluation} disabled={evalLoading}>
              {evalLoading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      )}

      {showCadastroForm && !editingStudent && !evaluationStudentId && (
        <form onSubmit={handleCadastro} className="glass-card p-4 space-y-3 animate-fade-in">
          <h3 className="font-heading text-sm font-bold">Novo Aluno</h3>
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
            <Input placeholder="CPF" value={cpf} onChange={(e) => setCpf(formatCPF(e.target.value))} className="border-border/50 bg-secondary/50 text-foreground placeholder:text-muted-foreground focus:border-primary" />
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input type="date" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} className="border-border/50 bg-secondary/50 pl-10 text-foreground placeholder:text-muted-foreground focus:border-primary" />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type={mostrarSenha ? "text" : "password"}
                placeholder="Senha (mín. 8 caracteres)"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="border-border/50 bg-secondary/50 pl-10 pr-10 text-foreground placeholder:text-muted-foreground focus:border-primary"
              />
              <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {mostrarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-foreground">Modalidade</Label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(modalidadeLabels) as Modalidade[]).map((key) => {
                const isSelected = modalidadesSelecionadas.includes(key);
                return (
                  <label key={key} className={`flex items-center gap-2 rounded-lg border p-2.5 cursor-pointer transition-all text-xs ${isSelected ? "border-primary bg-primary/10 text-foreground" : "border-border/50 bg-secondary/30 text-muted-foreground hover:border-border"}`}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {
                        setModalidadesSelecionadas(prev => {
                          const newArr = prev.includes(key) ? prev.filter(m => m !== key) : [...prev, key];
                          if (newArr.length === 0) {
                            setTipoPlano(""); setFrequencia(""); setSelectedWeekdays([]); setSelectedTimeSlots({});
                          }
                          return newArr;
                        });
                      }}
                      className="sr-only"
                    />
                    <div className={`h-3 w-3 rounded flex items-center justify-center border-2 ${isSelected ? "border-primary bg-primary" : "border-muted-foreground"}`}>
                      {isSelected && <div className="h-1.5 w-1.5 bg-background" style={{ clipPath: "polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%)" }} />}
                    </div>
                    <span className="font-medium leading-tight">{modalidadeLabels[key]}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {modalidadesSelecionadas.length > 0 && availableTiposPlano.length > 0 && (
            <div className="space-y-2 animate-fade-in">
              <Label className="text-xs font-semibold text-foreground">Tipo de Plano</Label>
              <RadioGroup value={tipoPlano} onValueChange={(v) => { setTipoPlano(v as TipoPlano); setFrequencia(""); setSelectedWeekdays([]); setSelectedTimeSlots({}); }} className="flex gap-2">
                {availableTiposPlano.map((tp) => (
                  <label key={tp} className={`flex-1 flex items-center justify-center rounded-lg border p-2.5 cursor-pointer transition-all text-xs ${tipoPlano === tp ? "border-primary bg-primary/10 text-foreground" : "border-border/50 bg-secondary/30 text-muted-foreground hover:border-border"}`}>
                    <RadioGroupItem value={tp} className="sr-only" />
                    <span className="font-medium">{tipoPlanoLabels[tp]}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>
          )}

          {tipoPlano && availableFrequencias.length > 0 && (
            <div className="space-y-2 animate-fade-in">
              <Label className="text-xs font-semibold text-foreground">Frequência Semanal</Label>
              <RadioGroup value={frequencia} onValueChange={(v) => { setFrequencia(v); setSelectedWeekdays([]); setSelectedTimeSlots({}); }} className="space-y-2">
                {availableFrequencias.map((opt) => (
                  <label key={opt.frequencia} className={`flex items-center justify-between rounded-lg border p-2.5 cursor-pointer transition-all ${frequencia === opt.frequencia ? "border-primary bg-primary/10" : "border-border/50 bg-secondary/30 hover:border-border"}`}>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value={opt.frequencia} className="sr-only" />
                      <div className={`h-3 w-3 rounded-full border-2 flex items-center justify-center ${frequencia === opt.frequencia ? "border-primary" : "border-muted-foreground"}`}>
                        {frequencia === opt.frequencia && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                      </div>
                    <span className="text-xs text-foreground font-medium">{opt.frequencia === "Livre" ? "Livre acesso" : `${opt.frequencia} na semana`}</span>
                  </div>
                  <span className="text-xs font-bold gold-text">{opt.valor}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Weekday + Time slot selection */}
          {frequencia && requiredDaysCount > 0 && (
            <div className="space-y-2 animate-fade-in">
              <Label className="text-xs font-semibold text-foreground">
                Dias e Horários ({selectedWeekdays.length}/{requiredDaysCount})
              </Label>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((day) => {
                  const isSelected = selectedWeekdays.includes(day);
                  const isDisabled = !isSelected && selectedWeekdays.length >= requiredDaysCount;
                  return (
                    <button
                      key={day}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => toggleWeekday(day)}
                      className={`rounded-lg border p-2 text-xs font-medium transition-all text-center ${
                        isSelected ? "border-primary bg-primary/10 text-foreground"
                          : isDisabled ? "border-border/30 bg-secondary/10 text-muted-foreground/40 cursor-not-allowed"
                          : "border-border/50 bg-secondary/30 text-muted-foreground hover:border-border"
                      }`}
                    >
                      {dayLabels[day]?.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
              {selectedWeekdays.sort().map((day) => (
                <div key={day} className="flex items-center gap-2 animate-fade-in">
                  <span className="text-xs font-medium text-foreground w-16">{dayLabels[day]?.slice(0, 3)}:</span>
                  <Select value={selectedTimeSlots[day] || ""} onValueChange={(v) => setSelectedTimeSlots((prev) => ({ ...prev, [day]: v }))}>
                    <SelectTrigger className="h-8 text-xs bg-secondary/30 border-border/50 flex-1">
                      <SelectValue placeholder="Horário" />
                    </SelectTrigger>
                    <SelectContent>
                      {allTimeSlots.map((ts) => (
                        <SelectItem key={ts} value={ts}>{ts}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          )}

          <Button type="submit" disabled={cadastroLoading} className="w-full gold-gradient text-primary-foreground font-heading font-bold hover:opacity-90">
            {cadastroLoading ? "Cadastrando..." : "Confirmar Cadastro"}
          </Button>
        </form>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar por nome ou e-mail..." value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} className="border-border/50 bg-secondary/50 pl-10 text-foreground placeholder:text-muted-foreground focus:border-primary" />
      </div>

      {/* Students List */}
      <div className="space-y-3">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student) => (
            <div key={student.id} className="glass-card p-4 transition-all hover:border-primary/30">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h4 className="font-heading text-sm font-bold">{student.name}</h4>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" /> {student.email}</p>
                  {student.phone && <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" /> {student.phone}</p>}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {Array.isArray(student.modality) && student.modality.map((m: string) => (
                      <span key={m} className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold text-primary uppercase">{m}</span>
                    ))}
                    {student.plan_type && <span className="rounded-full bg-secondary/50 px-2 py-0.5 text-[9px] font-medium text-foreground">{student.plan_type}</span>}
                    {student.frequency && <span className="rounded-full bg-secondary/50 px-2 py-0.5 text-[9px] font-medium text-foreground">{student.frequency}</span>}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => startEditStudent(student)} className="rounded-lg bg-secondary/50 p-2 text-muted-foreground hover:bg-primary/20 hover:text-primary transition-all">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => setEvaluationStudentId(student.id)} className="rounded-lg bg-secondary/50 p-2 text-muted-foreground hover:bg-success/20 hover:text-success transition-all">
                    <Activity className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => handleDeleteStudent(student.id)} className="rounded-lg bg-secondary/50 p-2 text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-all">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-xs text-muted-foreground py-8 glass-card">Nenhum aluno encontrado.</p>
        )}
      </div>
    </>
  );
};

export default AlunosTab;
