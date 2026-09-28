import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowUpRight, CalendarDays, ChevronLeft, ChevronRight, Filter, Images, MapPin, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

type GalleryItem = {
  id?: number;
  year: number;
  title: string;
  category: string;
  date: string;
  location: string;
  image: string;
  alt: string;
  count: string;
};

const fallbackGalleryItems: GalleryItem[] = [
 
];

export default function Gallery() {
  const [selectedYear, setSelectedYear] = useState("Toutes");
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const albumsQuery = trpc.gallery.list.useQuery();

const galleryItems = useMemo<GalleryItem[]>(() => {
  if (!albumsQuery.data?.length) return [];

  return albumsQuery.data.map((album) => ({
    id: album.id,
    year: album.year,
    title: album.title,
    category: album.category,
    date: album.eventDate,
    location: album.location,
    image: album.imageUrl,
    alt: album.imageAlt,
    count: `${album.photoCount} photos`,
  }));
}, [albumsQuery.data]);

  const years = useMemo(
    () => ["Toutes", ...Array.from(new Set(galleryItems.map((item) => item.year))).sort((a, b) => b - a).map(String)],
    [galleryItems],
  );

  const filteredItems = useMemo(
    () => selectedYear === "Toutes" ? galleryItems : galleryItems.filter((item) => String(item.year) === selectedYear),
    [galleryItems, selectedYear],
  );

  const selectedIndex = selectedItem ? filteredItems.findIndex((item) => item.title === selectedItem.title) : -1;

  const moveLightbox = (direction: number) => {
    if (selectedIndex < 0) return;
    const nextIndex = (selectedIndex + direction + filteredItems.length) % filteredItems.length;
    setSelectedItem(filteredItems[nextIndex]);
  };

  useEffect(() => {
    if (!selectedItem) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedItem(null);
      if (event.key === "ArrowLeft") moveLightbox(-1);
      if (event.key === "ArrowRight") moveLightbox(1);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedItem, selectedIndex]);

  return (
    <div className="min-h-screen bg-[#fbfcf9] text-[#17221c]">
      <div className="flag-line" aria-hidden="true"><span className="bg-[#009b3a]" /><span className="bg-[#f4c430]" /><span className="bg-[#d62828]" /></div>

      <header className="border-b border-[#dfe8e0] bg-white pt-1">
        <div className="section-shell flex items-center justify-between py-5">
          <Link href="/" className="flex items-center gap-3" aria-label="Retour à l’accueil CESTOM">
            <span className="flex h-12 w-44 items-center justify-center overflow-hidden rounded-xl bg-white px-2 py-1 shadow-sm ring-1 ring-[#e3e9e3] sm:w-56"><img src="/assets/cestom-logo.webp" alt="Logo CESTOM" className="h-full w-full object-contain" /></span>
            <span className="hidden border-l border-[#dfe8e0] pl-3 text-[10px] font-extrabold uppercase leading-4 tracking-[0.18em] text-[#075b36] sm:block">Coordination des étudiants<br />et stagiaires togolais au Maroc<br /><span className="text-[#009b3a]">Section Marrakech</span></span>
          </Link>
          <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-[#cbd9ce] px-4 py-2.5 text-xs font-extrabold uppercase tracking-[0.1em] text-[#075b36] transition-colors hover:bg-[#e6f0e9]"><ArrowLeft className="size-4" /> Retour à l’accueil</Link>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-[#075b36] py-20 text-white sm:py-28">
          <div className="absolute -right-20 -top-40 size-[420px] rounded-full border-[60px] border-[#009b3a]/30" aria-hidden="true" />
          <div className="hero-grid absolute inset-0 opacity-10" aria-hidden="true" />
          <div className="section-shell relative">
            <p className="eyebrow eyebrow-light"><span className="eyebrow-dot bg-[#f4c430]" />Mémoire en images</p>
            <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
              <div>
                <h1 className="display-heading max-w-3xl text-5xl font-extrabold leading-[0.98] tracking-[-0.06em] sm:text-7xl">Nos années, nos visages, nos histoires.</h1>
                <p className="mt-7 max-w-xl text-base leading-7 text-white/70 sm:text-lg">Retrouvez les moments forts de la Coordination des étudiants et stagiaires togolais au Maroc — Section Marrakech, classés par année et par événement.</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/15 bg-white/[0.08] p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.16em] text-white/60"><span>Archives</span><Images className="size-5 text-[#f4c430]" /></div>
                <div className="mt-7 flex items-end gap-3"><span className="text-6xl font-black tracking-[-0.07em] text-[#f4c430]">{new Set(galleryItems.map((item) => item.year)).size}</span><span className="pb-2 text-sm leading-5 text-white/65">années de<br />souvenirs</span></div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-shell py-12 sm:py-16">
          <div className="flex flex-col gap-7 border-b border-[#dfe8e0] pb-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="eyebrow"><span className="eyebrow-dot" />Explorer les archives</p>
              <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.04em]">Filtrer par année</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrer les albums par année">
              <span className="mr-2 hidden items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#74877b] sm:inline-flex"><Filter className="size-4" /> Année</span>
              {years.map((year) => (
                <button key={year} type="button" onClick={() => setSelectedYear(year)} aria-pressed={selectedYear === year} className={`rounded-full px-5 py-2.5 text-sm font-extrabold transition-all duration-200 active:scale-[0.97] ${selectedYear === year ? "bg-[#075b36] text-white shadow-lg shadow-[#075b36]/15" : "border border-[#d4e0d6] bg-white text-[#587063] hover:border-[#075b36] hover:text-[#075b36]"}`}>
                  {year}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between text-sm text-[#74877b]">
            <p><span className="font-extrabold text-[#17221c]">{filteredItems.length}</span> {filteredItems.length > 1 ? "albums" : "album"} {selectedYear !== "Toutes" ? `en ${selectedYear}` : "dans les archives"}</p>
            <div className="hidden items-center gap-2 sm:flex"><span className="size-2 rounded-full bg-[#009b3a]" /> Albums disponibles</div>
          </div>

          {filteredItems.length > 0 ? (
            <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map((item) => (
                <article key={`${item.year}-${item.title}`} className="group overflow-hidden rounded-[1.5rem] border border-[#e1e9e2] bg-white shadow-[0_12px_40px_rgba(20,68,42,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(20,68,42,0.12)]">
                  <button type="button" onClick={() => setSelectedItem(item)} className="relative block aspect-[1.35] w-full overflow-hidden bg-[#dfe8e0] text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#f4c430]" aria-label={`Ouvrir l’album ${item.title}`}>
                    <img src={item.image} alt={item.alt} className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-x-4 top-4 flex items-center justify-between"><span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-extrabold text-[#075b36] shadow-sm backdrop-blur-sm">{item.year}</span><span className="rounded-full bg-[#17221c]/75 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm">{item.count}</span></div>
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#17221c]/50 to-transparent" />
                    <span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-extrabold text-[#075b36] opacity-0 shadow-sm transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">Ouvrir</span>
                  </button>
                  <div className="p-6">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#009b3a]">{item.category}</p>
                    <h3 className="mt-3 text-xl font-extrabold tracking-[-0.04em] text-[#17221c]">{item.title}</h3>
                    <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t border-[#edf1ed] pt-4 text-xs text-[#74877b]"><span className="inline-flex items-center gap-1.5"><CalendarDays className="size-3.5" />{item.date}</span><span className="inline-flex items-center gap-1.5"><MapPin className="size-3.5" />{item.location}</span></div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-[1.5rem] border border-dashed border-[#cbd9ce] px-6 py-20 text-center"><Images className="mx-auto size-8 text-[#009b3a]" /><h3 className="mt-4 text-xl font-extrabold">Aucun album pour cette année</h3><p className="mt-2 text-sm text-[#74877b]">Les prochaines archives seront bientôt disponibles.</p></div>
          )}

          <div className="mt-16 overflow-hidden rounded-[1.5rem] bg-[#f4c430] p-7 sm:p-10">
            <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center"><div><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#075b36]">Une galerie qui grandit</p><p className="mt-3 max-w-xl text-2xl font-extrabold leading-tight tracking-[-0.04em] text-[#075b36]">Vous avez des photos d’un événement à partager avec la communauté ?</p></div><a href="mailto:cestom.marrakech@gmail.com" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#075b36] px-5 py-3.5 text-sm font-extrabold text-white transition-transform hover:-translate-y-0.5">Nous contacter <ArrowUpRight className="size-4" /></a></div>
          </div>
        </section>
      </main>

      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07150e]/95 p-4 backdrop-blur-sm sm:p-8" role="dialog" aria-modal="true" aria-label={`Album ${selectedItem.title}`} onClick={() => setSelectedItem(null)}>
          <div className="relative flex max-h-full w-full max-w-6xl flex-col items-center" onClick={(event) => event.stopPropagation()}>
            <div className="mb-4 flex w-full items-center justify-between gap-4 text-white sm:mb-5">
              <div><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#f4c430]">{selectedItem.year} · {selectedItem.category}</p><h2 className="mt-1 text-xl font-extrabold tracking-[-0.03em] sm:text-2xl">{selectedItem.title}</h2></div>
              <button type="button" onClick={() => setSelectedItem(null)} className="rounded-full border border-white/25 p-2.5 text-white transition-colors hover:bg-white/10" aria-label="Fermer la visionneuse"><X className="size-5" /></button>
            </div>
            <div className="relative flex max-h-[72vh] w-full items-center justify-center overflow-hidden rounded-[1.25rem] bg-black/30">
              <img src={selectedItem.image} alt={selectedItem.alt} className="max-h-[72vh] w-full object-contain" />
              <button type="button" onClick={() => moveLightbox(-1)} className="absolute left-3 rounded-full border border-white/30 bg-[#17221c]/70 p-3 text-white backdrop-blur-sm transition-colors hover:bg-[#075b36] sm:left-5" aria-label="Photo précédente"><ChevronLeft className="size-5" /></button>
              <button type="button" onClick={() => moveLightbox(1)} className="absolute right-3 rounded-full border border-white/30 bg-[#17221c]/70 p-3 text-white backdrop-blur-sm transition-colors hover:bg-[#075b36] sm:right-5" aria-label="Photo suivante"><ChevronRight className="size-5" /></button>
            </div>
            <div className="mt-4 flex w-full items-center justify-between text-xs text-white/55"><span>{selectedItem.date} · {selectedItem.location}</span><span>{selectedIndex + 1} / {filteredItems.length} · Échap pour fermer</span></div>
          </div>
        </div>
      )}

      <footer className="bg-[#17221c] py-8 text-white"><div className="section-shell flex flex-col gap-2 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between"><span>© 2025 Coordination des étudiants et stagiaires togolais au Maroc — Section Marrakech</span><span>Coordonner · Accompagner · Inspirer</span></div></footer>
    </div>
  );
}
