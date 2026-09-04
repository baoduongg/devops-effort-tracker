"use client";

import { useRef, useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Textarea } from "@/components/ui/textarea";
import { storage } from "@/lib/firebase";

interface ImagePasteInputProps {
  text: string;
  onTextChange: (text: string) => void;
  onImageUploaded: (url: string | null) => void;
}

export function ImagePasteInput({ text, onTextChange, onImageUploaded }: ImagePasteInputProps): React.JSX.Element {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const uidRef = useRef(`${Date.now()}`);

  async function handlePaste(e: React.ClipboardEvent<HTMLTextAreaElement>): Promise<void> {
    const item = Array.from(e.clipboardData.items).find((i) => i.type.startsWith("image/"));
    if (!item) return;
    const file = item.getAsFile();
    if (!file) return;

    setUploading(true);
    const storageRef = ref(storage, `chatImages/${uidRef.current}/${Date.now()}.png`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    setPreviewUrl(url);
    onImageUploaded(url);
    setUploading(false);
  }

  return (
    <div className="space-y-2">
      <Textarea
        placeholder="Paste text or an image (Cmd/Ctrl+V)…"
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        onPaste={handlePaste}
        rows={4}
      />
      {uploading && <p className="text-sm text-muted-foreground">Uploading image…</p>}
      {previewUrl && !uploading && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={previewUrl} alt="Pasted screenshot" className="max-h-40 rounded-md border" />
      )}
    </div>
  );
}
