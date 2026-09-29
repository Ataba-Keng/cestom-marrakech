import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { trpc } from "@/lib/trpc";

const MAX_SIZE = 8 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
type AcceptedMimeType = (typeof ACCEPTED_TYPES)[number];

type SingleImageUploaderProps = { value?: string; values?: never; onChange: (url: string) => void; label?: string; required?: boolean; multiple?: false };
type MultiImageUploaderProps = { value?: never; values: string[]; onChange: (urls: string[]) => void; label?: string; required?: boolean; multiple: true };
type ImageUploaderProps = SingleImageUploaderProps | MultiImageUploaderProps;

export default function ImageUploader(props: ImageUploaderProps) {
  const { label = "Image", required = false, multiple = false } = props;
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = trpc.media.uploadImage.useMutation();
  const isMultiple = multiple === true;
  const multiProps = props as MultiImageUploaderProps;
  const singleProps = props as SingleImageUploaderProps;
  const initialValues = isMultiple ? multiProps.values : singleProps.value ? [singleProps.value] : [];
  const [previews, setPreviews] = useState<string[]>(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [uploadingCount, setUploadingCount] = useState(0);

  useEffect(() => { setPreviews(isMultiple ? multiProps.values : singleProps.value ? [singleProps.value] : []); }, [isMultiple, multiProps.values, singleProps.value]);

  function notifyChange(urls: string[]) { if (isMultiple) multiProps.onChange(urls); else singleProps.onChange(urls[0] ?? ""); }
  function validateFile(file: File) {
    if (!ACCEPTED_TYPES.includes(file.type as AcceptedMimeType)) return "Format non accepté. Utilisez JPG, PNG, WebP ou GIF.";
    if (file.size > MAX_SIZE) return "Image trop volumineuse. La limite est de 8 Mo par image.";
    return null;
  }
  async function uploadFile(file: File) {
    const validationError = validateFile(file);
    if (validationError) throw new Error(validationError);
    const data = await file.arrayBuffer();
    return upload.mutateAsync({ filename: file.name, mimeType: file.type as AcceptedMimeType, size: file.size, data: uint8ToBase64(new Uint8Array(data)) });
  }
  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError(null);
    const files = Array.from(fileList);
    if (!isMultiple && files.length > 1) { setError("Veuillez sélectionner une seule image."); return; }
    const invalidFile = files.map(validateFile).find(Boolean);
    if (invalidFile) { setError(invalidFile); return; }
    const localPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews(isMultiple ? (current) => [...current, ...localPreviews] : localPreviews);
    setUploadingCount(files.length);
    try {
      const uploadedUrls: string[] = [];
      for (const file of files) uploadedUrls.push((await uploadFile(file)).url);
      const nextValues = isMultiple ? [...(multiProps.values ?? []), ...uploadedUrls] : uploadedUrls;
      setPreviews(nextValues);
      notifyChange(nextValues);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Le téléversement a échoué.");
      setPreviews(isMultiple ? multiProps.values ?? [] : singleProps.value ? [singleProps.value] : []);
    } finally {
      setUploadingCount(0);
      localPreviews.forEach((preview) => URL.revokeObjectURL(preview));
      if (inputRef.current) inputRef.current.value = "";
    }
  }
  function removeImage(index: number) { const nextValues = previews.filter((_, imageIndex) => imageIndex !== index); setPreviews(nextValues); notifyChange(nextValues); }
  const isUploading = uploadingCount > 0 || upload.isPending;

  return <div>
    <span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.1em] text-[#587063]">{label}</span>
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {previews.map((preview, index) => <div key={`${preview}-${index}`} className="group relative aspect-square overflow-hidden rounded-xl border border-[#cbd9ce] bg-[#f7faf7]"><img src={preview} alt={`${label} ${index + 1}`} className="size-full object-cover" /><button type="button" onClick={() => removeImage(index)} disabled={isUploading} className="absolute right-2 top-2 rounded-full bg-[#17221c]/80 p-1.5 text-white hover:bg-[#d62828] disabled:opacity-50" aria-label={`Retirer ${label.toLowerCase()} ${index + 1}`}><X className="size-3.5" /></button>{isMultiple && <span className="absolute bottom-2 left-2 rounded-full bg-[#17221c]/75 px-2 py-1 text-[10px] font-bold text-white">{index + 1}</span>}</div>)}
        {previews.length === 0 && <div className="flex aspect-square items-center justify-center rounded-xl border border-dashed border-[#cbd9ce] bg-[#f7faf7]"><ImagePlus className="size-8 text-[#009b3a]" /></div>}
      </div>
      <div>
        <input ref={inputRef} type="file" accept={ACCEPTED_TYPES.join(",")} multiple={isMultiple} aria-label={`Téléverser ${label.toLowerCase()}`} className="mt-3 block w-full text-xs text-[#587063]" required={required && previews.length === 0} onChange={(event) => void handleFiles(event.target.files)} />
        <button type="button" onClick={() => inputRef.current?.click()} disabled={isUploading} className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#cbd9ce] bg-white px-4 py-2.5 text-sm font-extrabold text-[#075b36] hover:bg-[#e6f0e9] disabled:opacity-60">{isUploading ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}{isUploading ? "Téléversement…" : isMultiple ? "Ajouter des photos" : previews.length > 0 ? "Remplacer l’image" : "Choisir une image"}</button>
        <p className="mt-2 text-xs text-[#74877b]">JPG, PNG, WebP ou GIF · 8 Mo maximum par image{isMultiple && " · Plusieurs photos autorisées"}</p>
      </div>
    </div>
    {error && <p className="mt-2 rounded-lg bg-[#fff0f0] px-3 py-2 text-xs font-semibold text-[#a83232]">{error}</p>}
  </div>;
}

function uint8ToBase64(bytes: Uint8Array) { let binary = ""; const chunkSize = 0x8000; for (let index = 0; index < bytes.length; index += chunkSize) binary += String.fromCharCode(...Array.from(bytes.subarray(index, index + chunkSize))); return btoa(binary); }
