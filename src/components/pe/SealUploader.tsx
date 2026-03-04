import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, AlertTriangle } from 'lucide-react';

interface SealUploaderProps {
  currentUrl?: string | null;
  onUpload: (file: File) => Promise<void>;
  label: string;
  maxSizeMb?: number;
  previewSize?: number; // pt
}

const SealUploader = ({ currentUrl, onUpload, label, maxSizeMb = 5, previewSize = 180 }: SealUploaderProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noTransparency, setNoTransparency] = useState(false);

  const handleFile = async (file: File) => {
    setError(null);
    setNoTransparency(false);
    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`File must be under ${maxSizeMb} MB`);
      return;
    }
    if (!['image/png', 'image/svg+xml'].includes(file.type)) {
      setError('Accepted formats: PNG, SVG');
      return;
    }

    // Check transparency
    if (file.type === 'image/png') {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.src = url;
      await new Promise((r) => (img.onload = r));
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let hasTransparent = false;
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] < 250) { hasTransparent = true; break; }
      }
      URL.revokeObjectURL(url);
      if (!hasTransparent) setNoTransparency(true);
    }

    setUploading(true);
    try {
      await onUpload(file);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">{label}</p>
      <div
        className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
        onClick={() => inputRef.current?.click()}
      >
        {currentUrl ? (
          <img
            src={currentUrl}
            alt={label}
            className="mx-auto"
            style={{ width: previewSize, height: label.includes('Signature') ? previewSize / 3 : previewSize, objectFit: 'contain' }}
          />
        ) : (
          <div className="space-y-2">
            <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Click to upload PNG or SVG</p>
            <p className="text-xs text-muted-foreground">Max {maxSizeMb} MB · Transparent background preferred</p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/svg+xml"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </div>
      {uploading && <p className="text-xs text-muted-foreground animate-pulse">Uploading…</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
      {noTransparency && (
        <div className="flex items-start gap-2 text-xs text-yellow-600 dark:text-yellow-400">
          <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
          <span>Your image has a white background. For best results, use a PNG with a transparent background.</span>
        </div>
      )}
      {currentUrl && (
        <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
          Replace
        </Button>
      )}
    </div>
  );
};

export default SealUploader;
