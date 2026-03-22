export const categorizePayment = (description: string | null): string => {
  const desc = (description || "").toLowerCase();
  if (desc.includes("experimental")) return "Aula Experimental";
  if (desc.includes("alteração") || desc.includes("alteracao")) return "Alteração de Plano";
  if (desc.includes("avaliação") || desc.includes("avaliacao")) return "Avaliação";
  return "Pagamento do Plano";
};

export const formatPaymentMethod = (method: string): string => {
  return method === "cartao" ? "Cartão de Crédito" : "PIX";
};

export const formatCPF = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

export const formatTelefone = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

export const formatBirthDate = (dateStr: string | null) => {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
};
