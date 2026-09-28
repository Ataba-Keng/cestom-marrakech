import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { trpc } from "@/lib/trpc";

const MAX_SIZE = 8 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;

type ImageUploaderProps = {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  required?: boolean;
};

export default function ImageUploader({ value, onChange, label = "Image", required = false }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const upload = trpc.media.uploadImage.useMutation();

  useEffect(() => setPreview(value), [value]);

  async function handleFile(file?: File) {
    if (!file) return;
    setError(null);
    if (!ACCEPTED_TYPES.includes(file.type as (typeof ACCEPTED_TYPES)[number])) {
      setError("Format non accepté. Utilisez JPG, PNG, WebP ou GIF.");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("Image trop volumineuse. La limite est de 8 Mo.");
      return;
    }
    setPreview(URL.createObjectURL(file));
    const data = await file.arrayBuffer();
    const base64 = uint8ToBase64(new Uint8Array(data));
    upload.mutate(
      { filename: file.name, mimeType: file.type as (typeof ACCEPTED_TYPES)[number], size: file.size, data: base64 },
      { onSuccess: (result) => onChange(result.url), onError: (uploadError) => setError(uploadError.message) },
    );
  }

  return (
    <div>
      <span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.1em] text-[#587063]">{label}</span>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex h-28 w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-[#cbd9ce] bg-[#f7faf7] sm:w-40">
          {preview ? <img src={preview} alt="Prévisualisation" className="size-full object-cover" /> : <ImagePlus className="size-8 text-[#009b3a]" />}
          {preview && <button type="button" onClick={() => { setPreview(""); onChange(""); }} className="absolute right-2 top-2 rounded-full bg-[#17221c]/75 p-1.5 text-white" aria-label="Retirer l’image"><X className="size-3.5" /></button>}
        </div>
        <div className="flex-1">
          <input ref={inputRef} type="file" accept={ACCEPTED_TYPES.join(",")} aria-label={`Téléverser ${label.toLowerCase()}`} className="mt-3 block w-full text-xs text-[#587063]" required={required && !value} onChange={(event) => void handleFile(event.target.files?.[0])} />
          <button type="button" onClick={() => inputRef.current?.click()} disabled={upload.isPending} className="inline-flex items-center gap-2 rounded-full border border-[#cbd9ce] bg-white px-4 py-2.5 text-sm font-extrabold text-[#075b36] hover:bg-[#e6f0e9] disabled:opacity-60">
            {upload.isPending ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
            {upload.isPending ? "Téléversement…" : preview ? "Remplacer l’image" : "Choisir une image"}
          </button>
          <p className="mt-2 text-xs text-[#74877b]">JPG, PNG, WebP ou GIF · 8 Mo maximum</p>
        </div>
      </div>
      {error && <p className="mt-2 rounded-lg bg-[#fff0f0] px-3 py-2 text-xs font-semibold text-[#a83232]">{error}</p>}
    </div>
  );
}

function uint8ToBase64(bytes: Uint8Array) {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) binary += String.fromCharCode(...Array.from(bytes.subarray(i, i + chunkSize)));
  return btoa(binary);
}
