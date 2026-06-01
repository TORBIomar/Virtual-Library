import { useState, useRef } from "react";
import { Upload, CheckCircle2 } from "lucide-react";

export function Dropzone({
  label,
  accept,
  onFile,
}: {
  label: string;
  accept: string;
  onFile: (file: File) => void;
}) {
  const [over, setOver] = useState(false);
  const [name, setName] = useState<string | null>(null);
  const ref = useRef<HTMLInputElement>(null);

  const handle = (f: File | undefined) => {
    if (!f) return;
    setName(f.name);
    onFile(f);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault(); setOver(false);
        handle(e.dataTransfer.files?.[0]);
      }}
      onClick={() => ref.current?.click()}
      className={`relative rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
        over ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-muted-foreground hover:bg-surface/50"
      }`}
    >
      <input ref={ref} type="file" accept={accept} className="hidden" onChange={(e) => handle(e.target.files?.[0] ?? undefined)} />
      {name ? (
        <div className="flex items-center justify-center gap-2 text-sm text-primary">
          <CheckCircle2 className="w-4 h-4" /> {name}
        </div>
      ) : (
        <>
          <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
          <div className="text-sm font-medium">{label}</div>
          <div className="text-xs text-muted-foreground mt-1">Drag & drop or click to browse</div>
        </>
      )}
    </div>
  );
}
