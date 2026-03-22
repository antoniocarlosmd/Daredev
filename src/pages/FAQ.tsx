import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import AppLayout from "@/components/AppLayout";
import { Info } from "lucide-react";

export default function FAQ() {
  const faqs = [
    {
      question: "Como funciona o agendamento de aulas?",
      answer: "Você pode agendar suas aulas na aba 'Agendamento'. O limite de agendamentos dependerá da frequência do seu plano ativo.",
    },
    {
      question: "Posso cancelar uma aula agendada?",
      answer: "Sim, os cancelamentos podem ser feitos através da sua agenda de aulas até 2 horas antes do início da aula.",
    },
    {
      question: "Quais são as formas de pagamento aceitas?",
      answer: "Aceitamos PIX, Cartão de Crédito e Débito. Consulte a secretaria para links de pagamento ou máquinas no local.",
    },
    {
      question: "O que acontece se eu faltar sem cancelar?",
      answer: "A falta sem cancelamento prévio consumirá a aula agendada do seu limite semanal contratado.",
    },
  ];

  return (
    <AppLayout title="Perguntas Frequentes">
      <div className="animate-fade-in space-y-6">
        <div className="glass-card p-6">
          <h2 className="mb-4 font-heading text-lg font-bold gold-text">Dúvidas Frequentes</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-border">
                <AccordionTrigger className="text-sm font-medium hover:text-primary transition-colors text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="glass-card flex items-start gap-4 p-4 border-l-4 border-l-primary bg-primary/5">
          <Info className="mt-0.5 h-5 w-5 text-primary shrink-0" />
          <div>
            <h4 className="text-sm font-semibold mb-1">Aviso Legal</h4>
            <p className="text-xs text-muted-foreground">
              Lembrete: Estas informações são apenas um guia rápido. Todas as regras e condições detalhadas 
              também constam no seu <strong>contrato assinado no momento da matrícula</strong>.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
