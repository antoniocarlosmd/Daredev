import { GraduationCap, Plus, Search, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ProfessoresTabProps {
  profSearch: string;
  setProfSearch: (v: string) => void;
  novoProf: string;
  setNovoProf: (v: string) => void;
  profLoading: boolean;
  handleAddTeacher: () => void;
  teachers: any[];
  editingTeacher: string | null;
  setEditingTeacher: (v: string | null) => void;
  editTeacherName: string;
  setEditTeacherName: (v: string) => void;
  handleEditTeacher: (id: string) => void;
  handleDeleteTeacher: (id: string) => void;
}

const ProfessoresTab = ({
  profSearch, setProfSearch, novoProf, setNovoProf, profLoading,
  handleAddTeacher, teachers, editingTeacher, setEditingTeacher,
  editTeacherName, setEditTeacherName, handleEditTeacher, handleDeleteTeacher
}: ProfessoresTabProps) => {

  const filteredTeachers = teachers.filter((t) => 
    (t.name || "").toLowerCase().includes(profSearch.toLowerCase())
  );

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-bold">Professores</h2>
      </div>

      <div className="glass-card p-4 space-y-3">
        <h3 className="font-heading text-sm font-bold">Novo Professor</h3>
        <div className="flex gap-2">
          <Input placeholder="Nome do Professor" value={novoProf} onChange={(e) => setNovoProf(e.target.value)} className="border-border/50 bg-secondary/50 text-foreground placeholder:text-muted-foreground focus:border-primary" />
          <Button onClick={handleAddTeacher} disabled={profLoading} className="gold-gradient text-primary-foreground">
            {profLoading ? "..." : <Plus className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar professor..." value={profSearch} onChange={(e) => setProfSearch(e.target.value)} className="border-border/50 bg-secondary/50 pl-10 text-foreground placeholder:text-muted-foreground focus:border-primary" />
      </div>

      <div className="space-y-3">
        {filteredTeachers.length > 0 ? (
          filteredTeachers.map((teacher) => (
            <div key={teacher.id} className="glass-card p-4">
              {editingTeacher === teacher.id ? (
                <div className="flex gap-2">
                  <Input value={editTeacherName} onChange={(e) => setEditTeacherName(e.target.value)} className="border-border/50 bg-secondary/50 text-foreground flex-1" />
                  <Button size="sm" onClick={() => handleEditTeacher(teacher.id)} className="gold-gradient text-primary-foreground">Salvar</Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingTeacher(null)}>X</Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/50">
                      <GraduationCap className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <span className="font-medium">{teacher.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingTeacher(teacher.id); setEditTeacherName(teacher.name); }} className="rounded-lg bg-secondary/50 p-2 text-muted-foreground hover:bg-primary/20 hover:text-primary transition-all">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDeleteTeacher(teacher.id)} className="rounded-lg bg-secondary/50 p-2 text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-all">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-center text-xs text-muted-foreground py-8 glass-card">Nenhum professor encontrado.</p>
        )}
      </div>
    </>
  );
};

export default ProfessoresTab;
