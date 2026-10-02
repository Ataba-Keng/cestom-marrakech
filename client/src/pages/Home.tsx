import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Facebook,
  HeartHandshake,
  Instagram,
  Mail,
  MapPin,
  Menu,
  Play,
  Quote,
  Sparkles,
  Users,
  X,
} from "lucide-react";

const logo = "/assets/cestom-logo-white.png";

const slides = [
  {
    image: "/assets/galerie-acceuil.jpg",
    eyebrow: "CESTOM · SECTION MARRAKECH · 2026",
    title: "Une communauté qui avance ensemble.",
    copy: "Créer des liens, accompagner les parcours et faire rayonner la présence togolaise au Maroc.",
    location: "Marrakech, Maroc",
  },
  {
    image: "/assets/galerie-acceuil2.png",
    eyebrow: "CULTURE · RENCONTRES · PARTAGE",
    title: "Nos histoires se rencontrent ici.",
    copy: "Des moments de découverte et d’échange pour faire vivre une communauté étudiante solidaire.",
    location: "Une antenne, des horizons",
  },
  {
    image: "/assets/galerie-acceuil.jpg",
    eyebrow: "ENGAGEMENT ÉTUDIANT",
    title: "Marrakech est notre point de départ.",
    copy: "Un espace pour apprendre, s’entraider et construire les prochains chapitres de notre aventure.",
    location: "Togo · Maroc · Avenir",
  },
];

const activities = [
  {
    number: "01",
    title: "Accueil & orientation",
    description: "Faciliter l’installation et les premiers repères des étudiants et stagiaires togolais.",
    icon: <Users className="size-5" />,
    color: "green",
  },
  {
    number: "02",
    title: "Vie communautaire",
    description: "Créer des rendez-vous qui rapprochent, transmettent et font grandir nos liens.",
    icon: <HeartHandshake className="size-5" />,
    color: "yellow",
  },
  {
    number: "03",
    title: "Réussite & partage",
    description: "Encourager l’entraide, l’excellence et le partage d’expériences entre générations.",
    icon: <BookOpen className="size-5" />,
    color: "red",
  },
];

const stats = [
  { value: "01", label: "antenne à Marrakech", note: "Un point de repère" },
  { value: "03", label: "axes d’engagement", note: "Accueillir · Relier · Inspirer" },
  { value: "∞", label: "histoires à partager", note: "Une mémoire collective" },
];

export default function Home() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 6500);

    return () => window.clearInterval(timer);
  }, []);

  const slide = slides[activeSlide];
  const goToSlide = (index: number) => setActiveSlide((index + slides.length) % slides.length);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fbfcf9] text-[#17221c]">
      <div className="flag-line" aria-hidden="true">
        <span className="bg-[#009b3a]" />
        <span className="bg-[#f4c430]" />
        <span className="bg-[#d62828]" />
      </div>

      <header className="absolute inset-x-0 top-1 z-30 text-white">
        <div className="section-shell">
          <div className="flex items-center justify-between border-b border-white/20 py-5">
            <a href="#accueil" className="flex items-center gap-3" aria-label="Coordination des étudiants et stagiaires togolais au Maroc — Section Marrakech, accueil">
              <span className="flex h-14 w-52 items-center justify-center sm:w-64">
                <img src={logo} alt="Logo CESTOM" className="h-full w-full object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.22)]" />
              </span>
              <span className="hidden border-l border-white/30 pl-3 text-[10px] font-bold uppercase leading-4 tracking-[0.2em] text-white/85 sm:block">
                Coordination des étudiants et<br />
                stagiaires togolais au Maroc<br />
                <span className="text-[#f4c430]">Section Marrakech</span>
              </span>
            </a>

            <nav className="ml-auto hidden shrink-0 items-center gap-6 lg:flex xl:gap-7" aria-label="Navigation principale">
              <a className="nav-link nav-link-active" href="#accueil">Accueil</a>
              <a className="nav-link" href="#association">À propos</a>
              <a className="nav-link" href="#activites">Activités</a>
              <a className="nav-link" href="/actualites">Actualités</a>
              <a className="nav-link" href="/bureau-executif">Bureau exécutif</a>
              <a className="nav-link" href="/galerie">Galerie</a>
            </nav>

            <a href="#contact" className="ml-3 hidden shrink-0 items-center gap-2 rounded-full bg-[#f4c430] px-5 py-3 text-xs font-extrabold uppercase tracking-[0.12em] text-[#17221c] transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.97] md:flex">
              Nous rejoindre <ArrowUpRight className="size-4" />
            </a>

            <button
              type="button"
              className="rounded-full border border-white/30 p-2.5 lg:hidden"
              aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>

          {menuOpen && (
            <nav className="mt-2 grid gap-1 rounded-2xl border border-white/15 bg-[#B15C01]/95 p-3 shadow-2xl backdrop-blur lg:hidden" aria-label="Navigation mobile">
              {[
                ["Accueil", "#accueil"],
                ["À propos", "#association"],
                ["Activités", "#activites"],
                ["Actualités", "/actualites"],
                ["Bureau exécutif", "/bureau-executif"],
                ["Galerie", "/galerie"],
                ["Nous rejoindre", "#contact"],
              ].map(([label, href]) => (
                <a key={href} href={href} onClick={() => setMenuOpen(false)} className="rounded-xl px-4 py-3 text-sm font-semibold text-white/90 hover:bg-white/10">
                  {label}
                </a>
              ))}
            </nav>
          )}
        </div>
      </header>

      <main>
        <section id="accueil" className="hero-shell relative isolate flex min-h-[710px] items-end overflow-hidden bg-[#B15C01] pt-32 text-white">
          {slides.map((item, index) => (
            <div
              key={item.image}
              className={`absolute inset-0 -z-20 bg-cover bg-center transition-opacity duration-700 ${index === activeSlide ? "opacity-100" : "opacity-0"}`}
              style={{ backgroundImage: `url(${item.image})` }}
              aria-hidden="true"
            />
          ))}
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(4,32,20,.90)_0%,rgba(4,32,20,.70)_42%,rgba(4,32,20,.25)_100%)]" />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(0deg,rgba(4,25,16,.72)_0%,transparent_40%)]" />
          <div className="hero-grid absolute inset-0 -z-10 opacity-20" aria-hidden="true" />

          <div className="section-shell relative z-10 grid w-full items-end gap-12 pb-14 lg:grid-cols-[minmax(0,1fr)_320px] lg:pb-20">
            <div className="max-w-3xl">
              <div className="mb-7 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.25em] text-[#f4c430]">
                <Sparkles className="size-4" />
                <span>{slide.eyebrow}</span>
              </div>
              <h1 className="display-heading max-w-3xl text-5xl font-extrabold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-8xl">
                {slide.title}
              </h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-white/80 sm:text-lg">{slide.copy}</p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <a href="#association" className="inline-flex items-center gap-3 rounded-full bg-white px-6 py-3.5 text-sm font-extrabold text-[#B15C01] transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.97]">
                  Découvrir la CESTOM <ArrowRight className="size-4" />
                </a>
                <a href="/galerie" className="inline-flex items-center gap-2 rounded-full border border-white/35 px-5 py-3.5 text-sm font-bold text-white transition-colors hover:bg-white/10">
                  <Play className="size-4 fill-current" /> Voir nos moments
                </a>
              </div>
            </div>

            <div className="hidden rounded-[1.75rem] border border-white/20 bg-white/10 p-5 backdrop-blur-md lg:block">
              <div className="mb-10 flex items-center justify-between text-xs font-bold uppercase tracking-[0.18em] text-white/70">
                <span>En ce moment</span>
                <span className="inline-flex items-center gap-2 text-[#f4c430]"><span className="size-2 rounded-full bg-[#f4c430]" />À Marrakech</span>
              </div>
              <p className="max-w-[210px] text-2xl font-extrabold leading-tight tracking-[-0.03em]">Une communauté, plusieurs parcours, un même élan.</p>
              <div className="mt-8 flex items-end justify-between border-t border-white/15 pt-4">
                <span className="text-xs leading-5 text-white/65">Coordonner<br />pour mieux avancer</span>
                <span className="text-4xl font-black text-[#f4c430]">01</span>
              </div>
            </div>
          </div>

          <div className="section-shell absolute inset-x-0 bottom-0 z-20 flex items-center justify-between border-t border-white/20 py-5 text-sm">
            <div className="flex items-center gap-4 text-white/75">
              <span className="font-bold text-white">{String(activeSlide + 1).padStart(2, "0")}</span>
              <span className="h-px w-16 bg-white/35 sm:w-28" />
              <span>{String(slides.length).padStart(2, "0")}</span>
              <span className="hidden sm:inline">{slide.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => goToSlide(activeSlide - 1)} className="rounded-full border border-white/30 p-2.5 text-white transition-colors hover:bg-white/15" aria-label="Photo précédente"><ChevronLeft className="size-4" /></button>
              <button type="button" onClick={() => goToSlide(activeSlide + 1)} className="rounded-full border border-white/30 p-2.5 text-white transition-colors hover:bg-white/15" aria-label="Photo suivante"><ChevronRight className="size-4" /></button>
            </div>
          </div>
        </section>

        <section id="association" className="section-shell py-24 sm:py-32">
          <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
            <div>
              <p className="eyebrow"><span className="eyebrow-dot" />Notre raison d’être</p>
              <h2 className="section-heading mt-6 max-w-md">Faire de chaque parcours une force collective.</h2>
              <div className="mt-8 flex items-start gap-4 border-l-2 border-[#f4c430] pl-5 text-sm leading-6 text-[#587063]">
                <Quote className="mt-1 size-5 shrink-0 text-[#B15C01]" />
                <p>La Coordination des étudiants et stagiaires togolais au Maroc — Section Marrakech est un espace de repères, de solidarité et d’ambition pour les étudiants et stagiaires togolais au Maroc.</p>
              </div>
            </div>
            <div className="max-w-xl lg:pt-8">
              <p className="text-lg leading-8 text-[#40534a]">Nous créons des passerelles entre les personnes, les expériences et les opportunités. Notre antenne accompagne les nouveaux arrivants, anime la vie communautaire et garde vivante la mémoire de nos moments partagés.</p>
              <a href="#activites" className="group mt-8 inline-flex items-center gap-3 text-sm font-extrabold uppercase tracking-[0.12em] text-[#B15C01]">Explorer nos engagements <span className="flex size-9 items-center justify-center rounded-full bg-[#e6f0e9] transition-colors group-hover:bg-[#f4c430]"><ArrowRight className="size-4" /></span></a>
            </div>
          </div>

          <div className="mt-20 grid border-y border-[#dfe8e0] sm:grid-cols-3">
            {stats.map((stat, index) => (
              <div key={stat.label} className={`stat-block relative py-8 sm:px-7 ${index !== 0 ? "border-t border-[#dfe8e0] sm:border-l sm:border-t-0" : ""}`}>
                <span className="text-6xl font-black tracking-[-0.06em] text-[#B15C01]">{stat.value}</span>
                <p className="mt-4 text-sm font-extrabold uppercase tracking-[0.1em] text-[#17221c]">{stat.label}</p>
                <p className="mt-1 text-sm text-[#74877b]">{stat.note}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="activites" className="bg-[#B15C01] py-24 text-white sm:py-32">
          <div className="section-shell">
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <div>
                <p className="eyebrow eyebrow-light"><span className="eyebrow-dot bg-[#f4c430]" />Ce qui nous rassemble</p>
                <h2 className="section-heading mt-6 max-w-xl text-white">Des actions concrètes, une présence qui compte.</h2>
              </div>
              <a href="#contact" className="inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.12em] text-[#f4c430]">Parler avec nous <ArrowUpRight className="size-4" /></a>
            </div>

            <div className="mt-14 grid gap-4 lg:grid-cols-3">
              {activities.map((activity) => (
                <article key={activity.number} className="activity-card group rounded-[1.5rem] border border-white/15 bg-white/[0.07] p-7 transition-transform duration-300 hover:-translate-y-1 hover:bg-white/[0.12] sm:p-8">
                  <div className="flex items-start justify-between">
                    <span className={`activity-icon activity-icon-${activity.color}`}>{activity.icon}</span>
                    <span className="text-sm font-bold text-white/35">{activity.number}</span>
                  </div>
                  <h3 className="mt-16 text-2xl font-extrabold tracking-[-0.04em]">{activity.title}</h3>
                  <p className="mt-4 min-h-14 text-sm leading-6 text-white/65">{activity.description}</p>
                  <span className="mt-7 block h-px w-10 bg-[#f4c430] transition-all duration-300 group-hover:w-full" />
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="galerie" className="section-shell py-24 sm:py-32">
          <div className="grid items-end gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="eyebrow"><span className="eyebrow-dot bg-[#d62828]" />Mémoire en images</p>
              <h2 className="section-heading mt-6 max-w-md">Les moments qui restent.</h2>
              <p className="mt-6 max-w-md text-base leading-7 text-[#587063]">La galerie de la CESTOM sera organisée par année et par événement pour retrouver facilement les souvenirs de notre communauté.</p>
              <a href="/galerie" className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#cbd9ce] px-5 py-3 text-sm font-bold text-[#B15C01] transition-colors hover:border-[#B15C01] hover:bg-[#e6f0e9]">Voir les archives <ArrowRight className="size-4" /></a>
            </div>
            <div className="gallery-preview grid grid-cols-[1.05fr_.95fr] gap-4">
              <div className="relative min-h-[380px] overflow-hidden rounded-[1.5rem] bg-[#dfe8e0]">
                <img src="/assets/galerie-acceuil2.png" alt="Souvenir de la communauté CESTOM Marrakech" className="absolute inset-0 size-full object-cover transition-transform duration-700 hover:scale-105" />
                <div className="absolute inset-x-4 bottom-4 rounded-xl bg-[#17221c]/80 p-4 text-white backdrop-blur-sm"><span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#f4c430]">Nos souvenirs</span><p className="mt-1 font-bold">La communauté CESTOM Marrakech</p></div>
              </div>
              <div className="grid gap-4">
                <div className="relative min-h-[182px] overflow-hidden rounded-[1.5rem] bg-[#dfe8e0]"><img src="/assets/galerie-acceuil.jpg" alt="Moment de vie de la communauté CESTOM Marrakech" className="absolute inset-0 size-full object-cover transition-transform duration-700 hover:scale-105" /></div>
                <div className="relative min-h-[182px] overflow-hidden rounded-[1.5rem] bg-[#dfe8e0]"><img src="/assets/galerie-acceuil2.png" alt="Activité de la communauté CESTOM Marrakech" className="absolute inset-0 size-full object-cover transition-transform duration-700 hover:scale-105" /></div>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="section-shell pb-24 sm:pb-32">
          <div className="relative overflow-hidden rounded-[2rem] bg-[#f4c430] px-7 py-12 sm:px-14 sm:py-16 lg:px-20">
            <div className="absolute -right-12 -top-24 size-72 rounded-full border-[40px] border-[#B15C01]/10" aria-hidden="true" />
            <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="eyebrow text-[#B15C01]"><span className="eyebrow-dot bg-[#d62828]" />Restons connectés</p>
                <h2 className="mt-5 max-w-2xl text-4xl font-black leading-[1.02] tracking-[-0.05em] text-[#B15C01] sm:text-5xl">Une question, une idée, une envie de contribuer ?</h2>
              </div>
              <a href="mailto:cestom.marrakech@gmail.com" className="inline-flex items-center justify-center gap-3 rounded-full bg-[#B15C01] px-6 py-4 text-sm font-extrabold text-white transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.97]"><Mail className="size-4" /> Nous écrire <ArrowUpRight className="size-4" /></a>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#8F4900] py-10 text-white">
        <div className="section-shell flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-44 items-center justify-center"><img src={logo} alt="Logo CESTOM" className="h-full w-full object-contain drop-shadow-[0_3px_6px_rgba(0,0,0,0.35)]" /></span>
            <div><p className="max-w-xs text-sm font-extrabold">Coordination des étudiants et stagiaires togolais au Maroc — Section Marrakech</p><p className="mt-1 text-xs text-white/75">Coordonner · Accompagner · Inspirer</p></div>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-white/85">
            <span className="inline-flex items-center gap-2"><MapPin className="size-3.5 text-[#f4c430]" /> Marrakech, Maroc</span>
            <a href="mailto:cestom.marrakech@gmail.com" className="inline-flex items-center gap-2 transition-colors hover:text-white"><Mail className="size-3.5 text-[#f4c430]" /> cestom.marrakech@gmail.com</a>
            <span className="flex items-center gap-3 border-l border-white/15 pl-5"><a href="https://www.facebook.com/CestomMarrakech/" target="_blank" rel="noreferrer" aria-label="Facebook CESTOM Marrakech"><Facebook className="size-4" /></a><a href="https://www.instagram.com/cestom__marrakech?stkn=bHRoemJsNTJyYTYy" target="_blank" rel="noreferrer" aria-label="Instagram CESTOM Marrakech"><Instagram className="size-4" /></a></span>
          </div>
        </div>
        <div className="section-shell mt-8 border-t border-white/25 pt-5 text-[11px] text-white/65">© {new Date().getFullYear()} Coordination des étudiants et stagiaires togolais au Maroc — Section Marrakech</div>
      </footer>
    </div>
  );
}
