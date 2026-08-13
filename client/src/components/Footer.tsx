import { Heart, Lightbulb, Mail, MapPin, Phone, Shield } from "lucide-react";

const footerLinks = {
  produto: [
    { label: "Funcionalidades", href: "#funcionalidades" },
    { label: "Segurança", href: "#seguranca" },
    { label: "Como funciona", href: "#como-funciona" },
    { label: "Baixar App", href: "#download" },
  ],
  suporte: [
    { label: "Central de ajuda", href: "#" },
    { label: "Fale connosco", href: "mailto:contato@lumeapp.com.br" },
    { label: "Tutoriais", href: "#lume-tutorial" },
    { label: "Perguntas frequentes", href: "#" },
  ],
  legal: [
    { label: "Política de privacidade", href: "#" },
    { label: "Termos de uso", href: "#" },
    { label: "Proteção de dados (LGPD)", href: "#" },
    { label: "Excluir minha conta", href: "#" },
  ],
};

type FooterLink = { label: string; href: string };

function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <h2 className="mb-4 text-lg font-bold text-white font-heading">{title}</h2>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              className="text-base text-gray-200 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-blue-400"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="bg-slate-800 pt-16 pb-8" aria-label="Rodapé do Lume">
      <div className="container">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <section aria-labelledby="footer-brand-title">
            <div className="mb-4 flex items-center gap-2">
              <div className="logo-glow lume-gradient-blue flex h-10 w-10 items-center justify-center rounded-xl">
                <Lightbulb className="h-6 w-6 text-yellow-300" fill="currentColor" aria-hidden="true" />
              </div>
              <h2 id="footer-brand-title" className="text-2xl font-black text-white font-heading">Lume</h2>
            </div>
            <p className="mb-6 text-base leading-relaxed text-gray-200">
              Iluminando a vida financeira de pessoas com mais de 60 anos. Simples, seguro e feito com carinho.
            </p>
            <address className="flex flex-col gap-3 not-italic">
              <a href="mailto:contato@lumeapp.com.br" className="flex items-center gap-2 text-sm text-gray-200 hover:text-white">
                <Mail className="h-4 w-4 text-blue-400" aria-hidden="true" /> contato@lumeapp.com.br
              </a>
              <a href="tel:+550801234567" className="flex items-center gap-2 text-sm text-gray-200 hover:text-white">
                <Phone className="h-4 w-4 text-green-400" aria-hidden="true" /> 0800 123 4567 (gratuito)
              </a>
              <span className="flex items-center gap-2 text-sm text-gray-200">
                <MapPin className="h-4 w-4 text-yellow-400" aria-hidden="true" /> Brasil
              </span>
            </address>
          </section>

          <nav aria-label="Produto"><FooterColumn title="Produto" links={footerLinks.produto} /></nav>
          <nav aria-label="Suporte"><FooterColumn title="Suporte" links={footerLinks.suporte} /></nav>
          <nav aria-label="Legal e privacidade">
            <FooterColumn title="Legal e privacidade" links={footerLinks.legal} />
            <p className="mt-6 flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-600/15 p-3 text-sm font-semibold text-blue-300">
              <Shield className="h-5 w-5 text-blue-400" aria-hidden="true" /> Dados protegidos pela LGPD
            </p>
          </nav>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-700 pt-8 text-center text-sm text-gray-300 md:flex-row md:text-left">
          <p>© 2026 Lume. Todos os direitos reservados.</p>
          <p className="flex items-center gap-1">Feito com <Heart className="h-4 w-4 text-red-400" fill="currentColor" aria-hidden="true" /> para a melhor geração</p>
        </div>
      </div>
    </footer>
  );
}
