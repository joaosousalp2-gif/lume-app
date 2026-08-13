import { useState } from "react";
import { ChevronDown, CircleHelp, PhoneCall, ShieldQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const topics = [
  { title: "Falso suporte técnico", text: "Ninguém do banco ou do Lume deve pedir a sua palavra-passe, código de segurança ou acesso remoto ao seu telemóvel. Desligue e contacte o número oficial." },
  { title: "Mensagem urgente de familiar", text: "Se alguém pedir dinheiro com urgência por mensagem, ligue diretamente para essa pessoa usando um número já guardado. Não confie apenas no áudio ou no texto recebido." },
  { title: "Prémios e investimentos garantidos", text: "Promessas de lucro garantido, pressão para decidir agora ou pedidos de depósito para libertar um prémio são sinais de risco. Pare e peça uma segunda opinião." },
  { title: "Links de pagamento", text: "Não abra links inesperados nem instale aplicações enviadas por desconhecidos. Abra o banco através da aplicação oficial ou escreva manualmente o endereço." },
];

export default function ScamPreventionPanel() {
  const [open, setOpen] = useState<number | null>(null);
  const [helpRequested, setHelpRequested] = useState(false);

  return (
    <section aria-labelledby="scam-prevention-title" className="container mx-auto px-4 py-8">
      <Card className="bg-white/95 p-6 shadow-lg">
        <div className="flex items-start gap-3"><div className="rounded-full bg-orange-100 p-3 text-orange-700"><ShieldQuestion className="h-6 w-6" aria-hidden="true" /></div><div><h2 id="scam-prevention-title" className="text-2xl font-bold text-slate-900">Aprenda a reconhecer golpes</h2><p className="mt-1 text-slate-600">Orientações curtas para parar, confirmar e pedir ajuda antes de enviar dinheiro.</p></div></div>
        <div className="mt-5 space-y-2">{topics.map((topic, index) => <div key={topic.title} className="rounded-lg border border-slate-200"><button type="button" className="flex w-full items-center justify-between p-4 text-left font-semibold text-slate-900" aria-expanded={open === index} onClick={() => setOpen(open === index ? null : index)}>{topic.title}<ChevronDown className={`h-5 w-5 transition-transform ${open === index ? "rotate-180" : ""}`} /></button>{open === index && <p className="border-t border-slate-200 p-4 text-slate-700">{topic.text}</p>}</div>)}</div>
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-lg bg-blue-50 p-4"><PhoneCall className="h-5 w-5 text-blue-700" /><p className="flex-1 text-sm text-blue-950">Está a ser pressionado ou não tem a certeza? Pare a operação e fale com uma pessoa de confiança antes de continuar.</p><Button type="button" variant="outline" className="gap-2" onClick={() => setHelpRequested(true)}><CircleHelp className="h-4 w-4" />{helpRequested ? "Pedido registado" : "Preciso de ajuda"}</Button></div>
      </Card>
    </section>
  );
}
