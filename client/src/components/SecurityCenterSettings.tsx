import { useEffect, useState } from "react";
import { Check, ShieldCheck, Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function SecurityCenterSettings() {
  const contactsQuery = trpc.security.getTrustedContacts.useQuery();
  const preferencesQuery = trpc.security.getPreferences.useQuery();
  const exportQuery = trpc.privacy.exportData.useQuery(undefined, { enabled: false });
  const deletionMutation = trpc.privacy.requestDeletion.useMutation();
  const addContact = trpc.security.addTrustedContact.useMutation({ onSuccess: () => contactsQuery.refetch() });
  const removeContact = trpc.security.removeTrustedContact.useMutation({ onSuccess: () => contactsQuery.refetch() });
  const updatePreferences = trpc.security.updatePreferences.useMutation();
  const [form, setForm] = useState({ name: "", relationship: "", phone: "", email: "" });
  const [savingPreference, setSavingPreference] = useState(false);
  const [deletionText, setDeletionText] = useState("");

  useEffect(() => {
    if (preferencesQuery.data) {
      setSavingPreference(false);
    }
  }, [preferencesQuery.data]);

  const handleAdd = async () => {
    if (!form.name.trim() || !form.relationship.trim() || !form.phone.trim()) {
      toast.error("Preencha nome, relação e telefone do contacto.");
      return;
    }
    try {
      await addContact.mutateAsync({
        name: form.name.trim(),
        relationship: form.relationship.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        notifyFraud: true,
        notifySuspicious: true,
      });
      setForm({ name: "", relationship: "", phone: "", email: "" });
      toast.success("Contacto de confiança adicionado.");
    } catch {
      toast.error("Não foi possível guardar o contacto.");
    }
  };

  const handleExport = async () => {
    const result = await exportQuery.refetch();
    if (!result.data) {
      toast.error("Não foi possível preparar a exportação.");
      return;
    }
    const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `lume-dados-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Os seus dados foram exportados.");
  };

  const handleDeletionRequest = async () => {
    if (deletionText !== "ELIMINAR A MINHA CONTA") return;
    await deletionMutation.mutateAsync({ confirmation: deletionText });
    toast.success("Pedido registado para revisão manual. Nenhum dado foi apagado automaticamente.");
    setDeletionText("");
  };

  const handlePreference = async (values: Parameters<typeof updatePreferences.mutateAsync>[0]) => {
    setSavingPreference(true);
    try {
      await updatePreferences.mutateAsync(values);
      toast.success("Preferência atualizada.");
    } catch {
      setSavingPreference(false);
      toast.error("Não foi possível atualizar a preferência.");
    }
  };

  const preferences = preferencesQuery.data;

  return (
    <section aria-labelledby="security-center-settings-title" className="container mx-auto px-4 py-8">
      <Card className="p-6 bg-white/95 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-green-100 p-3 text-green-700"><ShieldCheck className="h-6 w-6" aria-hidden="true" /></div>
          <div>
            <h2 id="security-center-settings-title" className="text-2xl font-bold text-slate-900">Centro de segurança pessoal</h2>
            <p className="mt-1 text-slate-600">Escolha quem pode ser avisado e como o Lume deve comunicar consigo.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-200 p-4">
            <h3 className="text-lg font-semibold text-slate-900">Contacto de confiança</h3>
            <p className="mt-1 text-sm text-slate-600">O Lume só enviará alertas de segurança com a sua autorização.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Input aria-label="Nome do contacto" placeholder="Nome" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              <Input aria-label="Relação com o contacto" placeholder="Relação" value={form.relationship} onChange={(event) => setForm({ ...form, relationship: event.target.value })} />
              <Input aria-label="Telefone do contacto" placeholder="Telefone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
              <Input aria-label="Email do contacto" placeholder="Email opcional" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            </div>
            <Button className="mt-3 gap-2" onClick={handleAdd} disabled={addContact.isPending}><UserPlus className="h-4 w-4" />Adicionar contacto</Button>
            <div className="mt-4 space-y-2" aria-live="polite">
              {contactsQuery.data?.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between rounded-md bg-slate-50 p-3">
                  <div><p className="font-medium text-slate-900">{contact.name}</p><p className="text-sm text-slate-600">{contact.relationship} · {contact.phone}</p></div>
                  <Button variant="ghost" size="sm" aria-label={`Remover ${contact.name}`} onClick={() => removeContact.mutate({ id: contact.id })}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                </div>
              ))}
              {!contactsQuery.isLoading && !contactsQuery.data?.length && <p className="text-sm text-slate-500">Ainda não adicionou nenhum contacto.</p>}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 p-4">
            <h3 className="text-lg font-semibold text-slate-900">Privacidade e dados</h3>
            <p className="mt-1 text-sm text-slate-600">Pode descarregar os dados associados à sua conta. O pedido de eliminação passa por revisão para evitar perda acidental.</p>
            <div className="mt-4 flex flex-wrap gap-2"><Button type="button" variant="outline" onClick={handleExport} disabled={exportQuery.isFetching}>Descarregar os meus dados</Button><Input aria-label="Confirmação de eliminação" placeholder="Escreva ELIMINAR A MINHA CONTA" value={deletionText} onChange={(event) => setDeletionText(event.target.value)} /></div>
            <Button type="button" variant="outline" className="mt-2 border-red-300 text-red-700" onClick={handleDeletionRequest} disabled={deletionText !== "ELIMINAR A MINHA CONTA" || deletionMutation.isPending}>Pedir eliminação da conta</Button>
          </div>

          <div className="rounded-lg border border-slate-200 p-4">
            <h3 className="text-lg font-semibold text-slate-900">Preferências de acessibilidade</h3>
            <div className="mt-4 space-y-4">
              <label className="flex items-center justify-between gap-4 text-slate-800">
                <span><strong>Modo simplificado</strong><small className="block text-sm text-slate-600">Menos botões e informação mais direta.</small></span>
                <input type="checkbox" className="h-5 w-5" checked={Boolean(preferences?.simplifiedMode)} onChange={(event) => handlePreference({ simplifiedMode: event.target.checked })} disabled={savingPreference} />
              </label>
              <label className="block text-slate-800"><strong>Perfil de voz</strong><select className="mt-2 w-full rounded-md border border-slate-300 p-2" value={preferences?.voiceProfile ?? "pt-BR-natural"} onChange={(event) => handlePreference({ voiceProfile: event.target.value })} disabled={savingPreference}><option value="pt-BR-natural">Português natural</option><option value="pt-BR-feminina">Voz feminina</option><option value="pt-BR-masculina">Voz masculina</option></select></label>
              <label className="block text-slate-800"><strong>Velocidade da voz</strong><select className="mt-2 w-full rounded-md border border-slate-300 p-2" value={preferences?.voiceSpeed ?? "1.0"} onChange={(event) => handlePreference({ voiceSpeed: event.target.value })} disabled={savingPreference}><option value="0.85">0,85x</option><option value="1.0">1x</option><option value="1.25">1,25x</option><option value="1.5">1,5x</option></select></label>
              <label className="flex items-center justify-between gap-4 text-slate-800"><span><strong>Alertas por email</strong><small className="block text-sm text-slate-600">Receber avisos importantes por email.</small></span><input type="checkbox" className="h-5 w-5" checked={preferences?.emailNotifications ?? true} onChange={(event) => handlePreference({ emailNotifications: event.target.checked })} disabled={savingPreference} /></label>
              <label className="flex items-center justify-between gap-4 text-slate-800"><span><strong>Alertas por SMS</strong><small className="block text-sm text-slate-600">Só funciona depois de configurar um fornecedor SMS.</small></span><input type="checkbox" className="h-5 w-5" checked={preferences?.smsNotifications ?? false} onChange={(event) => handlePreference({ smsNotifications: event.target.checked })} disabled={savingPreference} /></label>
              {savingPreference && <p className="flex items-center gap-2 text-sm text-slate-500"><Check className="h-4 w-4" />A guardar preferência...</p>}
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}
