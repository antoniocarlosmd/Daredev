export type AdminTab = "home" | "alunos" | "professores" | "turmas" | "pagamentos";
export type Modalidade = "jiujitsu" | "hibrido" | "powerhitt" | "hibrido_hitt";
export type TipoPlano = "mensal" | "trimestral" | "semestral";
export type Frequencia = "2x" | "3x" | "4x" | "Livre";

export interface PlanoOption {
  frequencia: Frequencia;
  valor: string;
}

export const planosConfig: Record<Modalidade, Partial<Record<TipoPlano, PlanoOption[]>>> = {
  jiujitsu: { mensal: [{ frequencia: "2x", valor: "R$200" }] },
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
    trimestral: [{ frequencia: "Livre", valor: "Consulte Tabela" }],
    semestral: [{ frequencia: "Livre", valor: "Consulte Tabela" }],
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

export const modalidadeLabels: Record<Modalidade, string> = {
  jiujitsu: "JIU-JITSU",
  hibrido: "TREINO HÍBRIDO",
  powerhitt: "POWER HITT",
  hibrido_hitt: "HÍBRIDO + HITT",
};

export const tipoPlanoLabels: Record<TipoPlano, string> = {
  mensal: "Mensal",
  trimestral: "Trimestral",
  semestral: "Semestral",
};

export const allTimeSlots = ["06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "16:00", "17:00", "18:00", "19:00"];
export const dayLabels: Record<number, string> = {
  1: "Segunda",
  2: "Terça",
  3: "Quarta",
  4: "Quinta",
  5: "Sexta",
};

export const frequencyToCount: Record<string, number> = {
  "2x": 2,
  "3x": 3,
  "4x": 4,
};
