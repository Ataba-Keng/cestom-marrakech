import { ArrowLeft, CalendarDays } from "lucide-react";
import { Link, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";

export default function NewsDetail() {
  const [, params] = useRoute<{ id: string }>("/actualites/:id");
  const id = Number(params?.id);
  const query = trpc.news.byId.useQuery({ id }, { enabled: Number.isInteger(id) && id > 0 });
  if (query.isLoading) return <div className="section-shell py-24">Chargement…</div>;
  const post = query.data;
  if (!post) return <div className="section-shell py-24"><h1 className="text-3xl font-extrabold">Publication introuvable</h1><Link href="/actualites" className="mt-5 inline-flex items-center gap-2 font-bold text-[#075b36]"><ArrowLeft className="size-4" /> Retour aux actualités</Link></div>;
  if (typeof document !== "undefined") document.title = `${post.title} | Coordination des étudiants et stagiaires togolais au Maroc — Section Marrakech`;
  return <div className="min-h-screen bg-[#fbfcf9] text-[#17221c]"><header className="border-b border-[#dfe8e0] bg-white pt-1"><div className="section-shell flex items-center justify-between py-5"><Link href="/actualites" className="inline-flex items-center gap-2 font-extrabold text-[#075b36]"><ArrowLeft className="size-4" /> Actualités</Link><Link href="/" className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#075b36]">Coordination des étudiants et stagiaires togolais au Maroc — Section Marrakech</Link></div></header><main className="section-shell max-w-4xl py-14 sm:py-20"><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#009b3a]">{post.category}</p><h1 className="display-heading mt-5 text-5xl font-extrabold leading-[0.98] tracking-[-0.06em] sm:text-7xl">{post.title}</h1><p className="mt-6 inline-flex items-center gap-2 text-sm text-[#74877b]"><CalendarDays className="size-4" />{post.publishedAt}</p>{post.imageUrl && <img src={post.imageUrl} alt="" className="mt-10 max-h-[520px] w-full rounded-[1.5rem] object-cover" />}<p className="mt-10 text-xl font-semibold leading-8 text-[#40534a]">{post.excerpt}</p><div className="prose prose-lg mt-8 max-w-none whitespace-pre-wrap leading-8 text-[#40534a]">{post.content}</div></main></div>;
}
