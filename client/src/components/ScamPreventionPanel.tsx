import { useState } from "react";
import { ChevronDown, CircleHelp, PhoneCall, ShieldQuestion, Send, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const topics = [
  { title: "Falso suporte técnico", text: "Ninguém do banco ou do Lume deve pedir a sua palavra-passe, código de segurança ou acesso remoto ao seu telemóvel. Desligue e contacte o número oficial." },
  { title: "Mensagem urgente de familiar", text: "Se alguém pedir dinheiro com urgência por mensagem, ligue diretamente para essa pessoa usando um número já guardado. Não confie apenas no áudio ou no texto recebido." },
  { title: "Prémios e investimentos garantidos", text: "Promessas de lucro garantido, pressão para decidir agora ou pedidos de depósito para libertar um prémio são sinais de risco. Pare e peça uma segunda opinião." },
  { title: "Links de pagamento", text: "Não abra links inesperados nem instale aplicações enviadas por desconhecidos. Abra o banco através da aplicação oficial ou escreva manualmente o endereço." },
];

export default function ScamPreventionPanel() {
  const [open, setOpen] = useState<number | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [subject, setSubject] = useState("Ajuda com transação ou segurança");
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("");
  const helpMutation = trpc.support.requestHumanHelp.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim().length < 10) {
      toast.error("Por favor, escreva uma mensagem com pelo menos 10 caracteres.");
      return;
    }
    try {
      const res = await helpMutation.mutateAsync({ subject, message, phone });
      toast.success(res.message);
      setShowHelpModal(false);
      setMessage("");
      setPhone("");
    } catch {
      toast.error("Não foi possível enviar o pedido de ajuda. Tente novamente.");
    }
  };

  return (
    <section aria-labelledby="scam-prevention-title" className="container mx-auto px-4 py-8">
      <Card className="bg-white/95 p-6 shadow-lg">
        <div className="flex items-start gap-3"><div className="rounded-full bg-orange-100 p-3 text-orange-700"><ShieldQuestion className="h-6 w-6" aria-hidden="true" /></div><div><h2 id="scam-prevention-title" className="text-2xl font-bold text-slate-900">Aprenda a reconhecer golpes e obtenha apoio</h2><p className="mt-1 text-slate-600">Orientações curtas para parar, confirmar e pedir ajuda antes de enviar dinheiro.</p></div></div>
        <div className="mt-5 space-y-2">{topics.map((topic, index) => <div key={topic.title} className="rounded-lg border border-slate-200"><button type="button" className="flex w-full items-center justify-between p-4 text-left font-semibold text-slate-900" aria-expanded={open === index} onClick={() => setOpen(open === index ? null : index)}>{topic.title}<ChevronDown className={`h-5 w-5 transition-transform ${open === index ? "rotate-180" : ""}`} /></button>{open === index && <p className="border-t border-slate-200 p-4 text-slate-700">{topic.text}</p>}</div>)}</div>
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-lg bg-blue-50 p-4"><PhoneCall className="h-5 w-5 text-blue-700" /><p className="flex-1 text-sm text-blue-950">Está a ser pressionado ou não tem a certeza? Pare a operação e fale com uma pessoa de confiança antes de continuar.</p><Button type="button" variant="outline" className="gap-2 bg-blue-600 text-white hover:bg-blue-700" onClick={() => setShowHelpModal(true)}><CircleHelp className="h-4 w-4" />Pedir apoio humano</Button></div>

        {showHelpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="w-full max-w-lg bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-lg font-bold text-slate-900">Pedido de Atendimento Humano</h3>
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowHelpModal(false)}>✕</Button>
              </div>
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Assunto</label>
                  <select className="mt-1 w-full rounded-md border border-slate-300 p-2 text-sm text-slate-900" value={subject} onChange={(e) => setSubject(e.target.value)}>
                    <option value="Ajuda com transação ou segurança">Ajuda com transação ou segurança</option>
                    <option value="Suspeita de golpe">Suspeita de golpe</option>
                    <option value="Dúvida sobre o aplicativo">Dúvida sobre o aplicativo</option>
                    <option value="Outro assunto">Outro assunto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Número de telefone (opcional)</label>
                  <input type="text" className="mt-1 w-full rounded-md border border-slate-300 p-2 text-sm text-slate-900" placeholder="(11) 99999-9999" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Descreva o que aconteceu</label>
                  <textarea className="mt-1 w-full rounded-md border border-slate-300 p-2 text-sm text-slate-900" rows={4} placeholder="Conte-nos os detalhes para que possamos ajudar..." value={message} onChange={(e) => setMessage(e.target.value)} required />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setShowHelpModal(false)}>Cancelar</Button>
                  <Button type="submit" disabled={helpMutation.isPending} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                    <Send className="h-4 w-4" />
                    {helpMutation.isPending ? "A enviar..." : "Enviar pedido"}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </Card>
    </section>
  );
}
