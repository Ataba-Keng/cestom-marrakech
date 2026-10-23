import {
  ArrowLeft,
  ArrowUpRight,
  BriefcaseBusiness,
  Facebook,
  Instagram,
  MessageCircle,
  Phone,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

function whatsappUrl(phone: string) {
  const digits = phone.replace(/\D/g, "").replace(/^00/, "");
  return digits ? `https://wa.me/${digits}` : "";
}

export default function Talents() {
  const query = trpc.talents.list.useQuery();
  useEffectTitle(
    "Talents & services | Coordination des étudiants et stagiaires togolais au Maroc — Section Marrakech",
  );

  const services = query.data ?? [];
  const [category, setCategory] = useState("Toutes");

  const categories = useMemo(
    () => ["Toutes", ...Array.from(new Set(services.map((service) => service.category)))],
    [services],
  );

  const visibleServices =
    category === "Toutes"
      ? services
      : services.filter((service) => service.category === category);

  return (
    <div className="min-h-screen bg-[#fbfcf9] text-[#17221c]">
      <div className="flag-line" aria-hidden="true">
        <span className="bg-[#009b3a]" />
        <span className="bg-[#f4c430]" />
        <span className="bg-[#d62828]" />
      </div>

      <Header />

      <main>
        <section className="relative overflow-hidden bg-[#B15C01] py-20 text-white sm:py-28">
          <div
            className="absolute -right-20 -top-40 size-[420px] rounded-full border-[60px] border-white/10"
            aria-hidden="true"
          />
          <div className="hero-grid absolute inset-0 opacity-10" aria-hidden="true" />

          <div className="section-shell relative">
            <p className="eyebrow eyebrow-light">
              <span className="eyebrow-dot bg-[#f4c430]" />
              La communauté en action
            </p>
            <h1 className="display-heading mt-6 max-w-4xl text-5xl font-extrabold leading-[0.98] tracking-[-0.06em] sm:text-7xl">
              Talents, compétences et services de la communauté.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-7 text-white/70">
              Découvrez les membres et petites entreprises qui proposent leurs savoir-faire à
              Marrakech. Contactez-les directement selon les moyens renseignés.
            </p>
          </div>
        </section>

        <section className="section-shell py-12 sm:py-16">
          <div className="flex flex-col gap-7 border-b border-[#dfe8e0] pb-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="eyebrow">
                <span className="eyebrow-dot" />
                Annuaire communautaire
              </p>
              <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.04em]">
                Explorer les activités
              </h2>
            </div>

            <div
              className="flex flex-wrap items-center gap-2"
              role="group"
              aria-label="Filtrer les services par catégorie"
            >
              <span className="mr-2 hidden text-xs font-bold uppercase tracking-[0.12em] text-[#74877b] sm:inline-flex">
                Catégorie
              </span>
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  aria-pressed={category === item}
                  className={`rounded-full px-5 py-2.5 text-sm font-extrabold transition-all duration-200 active:scale-[0.97] ${
                    category === item
                      ? "bg-[#B15C01] text-white shadow-lg shadow-[#B15C01]/15"
                      : "border border-[#d4e0d6] bg-white text-[#587063] hover:border-[#B15C01] hover:text-[#B15C01]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between text-sm text-[#74877b]">
            <p>
              <span className="font-extrabold text-[#17221c]">{visibleServices.length}</span>{" "}
              {visibleServices.length > 1 ? "activités présentées" : "activité présentée"}
            </p>
            <div className="hidden items-center gap-2 sm:flex">
              <span className="size-2 rounded-full bg-[#B15C01]" />
              Membres de la communauté
            </div>
          </div>

          {query.isLoading ? (
            <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-96 animate-pulse rounded-[1.5rem] bg-[#e6f0e9]"
                />
              ))}
            </div>
          ) : visibleServices.length === 0 ? (
            <div className="mt-8 rounded-[1.5rem] border border-dashed border-[#cbd9ce] px-6 py-20 text-center">
              <BriefcaseBusiness className="mx-auto size-9 text-[#B15C01]" />
              <h3 className="mt-4 text-xl font-extrabold">Les fiches arrivent bientôt.</h3>
              <p className="mt-2 text-sm text-[#74877b]">
                L’équipe CESTOM prépare les premières présentations de talents et services.
              </p>
            </div>
          ) : (
            <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visibleServices.map((service) => {
                const whatsapp = service.whatsapp ? whatsappUrl(service.phone) : "";

                return (
                  <article
                    key={service.id}
                    className="group overflow-hidden rounded-[1.5rem] border border-[#e1e9e2] bg-white shadow-[0_12px_40px_rgba(20,68,42,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(20,68,42,0.12)]"
                  >
                    <div className="relative aspect-[1.35] overflow-hidden bg-[#dfe8e0]">
                      {service.imageUrl ? (
                        <img
                          src={service.imageUrl}
                          alt={service.name}
                          className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center bg-[linear-gradient(135deg,#e6f0e9,#f9fbf8)]">
                          <BriefcaseBusiness className="size-14 text-[#009b3a]/50" />
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <h2 className="text-xl font-extrabold tracking-[-0.04em] text-[#17221c]">
                        {service.name}
                      </h2>

                      {service.businessName && (
                        <p className="mt-1 text-sm font-bold text-[#B15C01]">
                          {service.businessName}
                        </p>
                      )}

                      <p className="mt-4 text-sm leading-6 text-[#587063]">
                        {service.description}
                      </p>

                      <div className="mt-5 flex flex-wrap gap-2 border-t border-[#edf1ed] pt-4">
                        {service.phone && (
                          <a
                            href={`tel:${service.phone}`}
                            className="inline-flex items-center gap-2 rounded-full bg-[#e6f0e9] px-3.5 py-2 text-xs font-extrabold text-[#587063] hover:bg-[#d5e6d9]"
                          >
                            <Phone className="size-3.5" />
                            Appeler
                          </a>
                        )}

                        {whatsapp && (
                          <a
                            href={whatsapp}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-full bg-[#009b3a] px-3.5 py-2 text-xs font-extrabold text-white hover:bg-[#007d2f]"
                          >
                            <MessageCircle className="size-3.5" />
                            WhatsApp
                          </a>
                        )}

                        {service.facebookUrl && (
                          <a
                            href={service.facebookUrl}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`Facebook de ${service.name}`}
                            className="inline-flex size-9 items-center justify-center rounded-full bg-[#e6f0e9] text-[#1877f2] hover:bg-[#d5e6d9]"
                          >
                            <Facebook className="size-4" />
                          </a>
                        )}

                        {service.instagramUrl && (
                          <a
                            href={service.instagramUrl}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`Instagram de ${service.name}`}
                            className="inline-flex size-9 items-center justify-center rounded-full bg-[#e6f0e9] text-[#c13584] hover:bg-[#d5e6d9]"
                          >
                            <Instagram className="size-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <div className="mt-16 overflow-hidden rounded-[1.5rem] bg-[#f4c430] p-7 sm:p-10">
            <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#B15C01]">
                  Une communauté qui entreprend
                </p>
                <p className="mt-3 max-w-xl text-2xl font-extrabold leading-tight tracking-[-0.04em] text-[#B15C01]">
                  Vous avez une activité ou un savoir-faire à partager avec la communauté ?
                </p>
              </div>
              <a
                href="mailto:cestom.marrakech@gmail.com?subject=Talents%20et%20services"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#B15C01] px-5 py-3.5 text-sm font-extrabold text-white transition-transform hover:-translate-y-0.5"
              >
                Nous contacter <ArrowUpRight className="size-4" />
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#8F4900] py-8 text-white">
        <div className="section-shell flex flex-col gap-2 text-xs text-white/85 sm:flex-row sm:items-center sm:justify-between">
          <span>
            © 2025 Coordination des étudiants et stagiaires togolais au Maroc — Section Marrakech
          </span>
          <span>Coordonner · Accompagner · Inspirer</span>
        </div>
      </footer>
    </div>
  );
}

function Header() {
  return (
    <header className="border-b border-white/20 bg-[#B15C01] pt-1 text-white">
      <div className="section-shell flex items-center justify-between py-5">
        <Link
          href="/"
          className="flex items-center gap-3"
          aria-label="Retour à l’accueil CESTOM"
        >
          <span className="flex h-14 w-52 items-center justify-center sm:w-64">
            <img
              src="/assets/cestom-logo-white.png"
              alt="Logo CESTOM"
              className="h-full w-full object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.22)]"
            />
          </span>
          <span className="hidden border-l border-white/30 pl-3 text-[10px] font-bold uppercase leading-4 tracking-[0.2em] text-white/85 sm:block">
            Coordination des étudiants<br />
            et stagiaires togolais au Maroc<br />
            <span className="text-[#f4c430]">Section Marrakech</span>
          </span>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-2.5 text-xs font-extrabold uppercase tracking-[0.1em] text-white transition-colors hover:bg-white/10"
        >
          <ArrowLeft className="size-4" />
          Accueil
        </Link>
      </div>
    </header>
  );
}

function useEffectTitle(title: string) {
  if (typeof document !== "undefined") document.title = title;
}
