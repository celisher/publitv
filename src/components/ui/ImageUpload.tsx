'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  folder?: string;
  label?: string;
}

export default function ImageUpload({ value, onChange, folder = 'uploads', label }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) onChange(data.url);
    } catch {
      alert('Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-white/70">{label}</label>}
      {value ? (
        <div className="relative w-full h-40 rounded-xl overflow-hidden border border-white/10 group">
          <Image src={value} alt="Preview" fill className="object-cover" unoptimized />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={() => onChange(null)}
              className="p-2 bg-red-600 rounded-full text-white hover:bg-red-700"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'w-full h-40 rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center',
            'cursor-pointer hover:border-red-500/50 hover:bg-white/3 transition-all',
            uploading && 'opacity-50 pointer-events-none'
          )}
        >
          {uploading ? (
            <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <div className="p-3 rounded-full bg-white/5 mb-2">
                <ImageIcon size={24} className="text-white/40" />
              </div>
              <p className="text-sm text-white/40">Arrastra o haz clic para subir</p>
              <p className="text-xs text-white/20 mt-1">JPG, PNG, WebP — max 5MB</p>
            </>
          )}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
    </div>
  );
}
