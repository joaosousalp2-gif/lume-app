import { useRef, useState } from "react";
import { FileText, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"] as const;

export default function DocumentVault() {
  const inputRef = useRef<HTMLInputElement>(null);
  const documentsQuery = trpc.documentVault.list.useQuery(undefined, { staleTime: 60_000 });
  const uploadMutation = trpc.documentVault.upload.useMutation({ onSuccess: () => documentsQuery.refetch() });
  const [selectedCategory, setSelectedCategory] = useState<"fatura" | "recibo" | "contrato" | "comprovativo" | "outro">("recibo");
  const [title, setTitle] = useState("");

  const handleFile = async (file: File) => {
    if (!allowedTypes.includes(file.type as typeof allowedTypes[number])) {
      toast.error("Formato não suportado. Use JPG, PNG, WEBP ou PDF.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("O documento deve ter no máximo 8 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const result = String(reader.result);
        const fileBase64 = result.split(",")[1];
        if (!fileBase64) throw new Error("Ficheiro inválido");
        await uploadMutation.mutateAsync({ fileBase64, filename: file.name, mimeType: file.type as typeof allowedTypes[number], title: title.trim() || file.name, category: selectedCategory });
        setTitle("");
        toast.success(file.type.startsWith("image/") ? "Documento guardado e analisado. Confirme os dados extraídos." : "Documento guardado no cofre.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Não foi possível guardar o documento.");
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <section aria-labelledby="document-vault-title" className="container mx-auto px-4 py-8">
      <Card className="bg-white/95 p-6 shadow-lg">
        <div className="flex items-start gap-3"><div className="rounded-full bg-purple-100 p-3 text-purple-700"><FileText className="h-6 w-6" aria-hidden="true" /></div><div><h2 id="document-vault-title" className="text-2xl font-bold text-slate-900">Cofre de documentos</h2><p className="mt-1 text-slate-600">Guarde recibos e comprovativos. Fotografias podem ser analisadas, mas confirme sempre os valores antes de os usar.</p></div></div>
        <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_180px_auto]"><input className="rounded-md border border-slate-300 p-2" aria-label="Título do documento" placeholder="Título do documento" value={title} onChange={(event) => setTitle(event.target.value)} /><select className="rounded-md border border-slate-300 p-2" aria-label="Categoria do documento" value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value as typeof selectedCategory)}><option value="recibo">Recibo</option><option value="fatura">Fatura</option><option value="contrato">Contrato</option><option value="comprovativo">Comprovativo</option><option value="outro">Outro</option></select><Button type="button" onClick={() => inputRef.current?.click()} disabled={uploadMutation.isPending} className="gap-2"><UploadCloud className="h-4 w-4" />{uploadMutation.isPending ? "A processar..." : "Adicionar documento"}</Button></div>
        <input ref={inputRef} type="file" accept={allowedTypes.join(",")} className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void handleFile(file); event.currentTarget.value = ""; }} />
        <div className="mt-6 grid gap-3 md:grid-cols-2">{documentsQuery.data?.map((document) => { let extracted: Record<string, unknown> | null = null; try { extracted = document.extractedData ? JSON.parse(document.extractedData) : null; } catch {} return <article key={document.id} className="rounded-lg border border-slate-200 p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold text-slate-900">{document.title}</h3><p className="text-sm text-slate-600">{document.category} · {new Date(document.createdAt).toLocaleDateString("pt-BR")}</p></div><a className="text-sm font-medium text-blue-700 underline" href={document.fileUrl} target="_blank" rel="noreferrer">Abrir</a></div>{extracted && <div className="mt-3 rounded bg-purple-50 p-3 text-sm text-purple-950"><p><strong>Dados extraídos para revisão:</strong> {String(extracted.merchant || "entidade não identificada")}</p><p>Valor: {typeof extracted.amount === "number" ? extracted.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "não identificado"}</p><p>Confiança: {typeof extracted.confidence === "number" ? `${Math.round(extracted.confidence * 100)}%` : "não disponível"}</p></div>}</article>; })}</div>
        {!documentsQuery.isLoading && !documentsQuery.data?.length && <p className="mt-5 text-sm text-slate-600">O seu cofre ainda está vazio.</p>}
      </Card>
    </section>
  );
}
