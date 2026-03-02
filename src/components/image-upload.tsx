"use client";

import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus, X, Upload, ZoomIn } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

interface ImageUploadProps {
  /** Current image URL(s) */
  value?: string | string[];
  /** Called when images change */
  onChange?: (value: string | string[]) => void;
  /** Allow multiple files */
  multiple?: boolean;
  /** Max files for multiple mode */
  maxFiles?: number;
  /** Label shown above dropzone */
  label?: string;
  /** Hint text */
  hint?: string;
  /** Aspect ratio class for preview (e.g. "aspect-video", "aspect-square") */
  aspectRatio?: string;
  /** Whether upload is disabled */
  disabled?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  multiple = false,
  maxFiles = 10,
  label,
  hint,
  aspectRatio = "aspect-video",
  disabled = false,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const images: string[] = Array.isArray(value)
    ? value
    : value
      ? [value]
      : [];

  const canAddMore = multiple ? images.length < maxFiles : images.length === 0;

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || !onChange) return;

      const newImages: string[] = [];
      const remaining = multiple ? maxFiles - images.length : 1;
      const filesToProcess = Array.from(files).slice(0, remaining);

      let processed = 0;
      filesToProcess.forEach((file) => {
        if (!file.type.startsWith("image/")) return;

        const reader = new FileReader();
        reader.onload = (e) => {
          const url = e.target?.result as string;
          newImages.push(url);
          processed++;

          if (processed === filesToProcess.length) {
            if (multiple) {
              onChange([...images, ...newImages]);
            } else {
              onChange(newImages[0] ?? "");
            }
          }
        };
        reader.readAsDataURL(file);
      });
    },
    [images, maxFiles, multiple, onChange],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (disabled) return;
      handleFiles(e.dataTransfer.files);
    },
    [disabled, handleFiles],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) setIsDragOver(true);
    },
    [disabled],
  );

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const removeImage = useCallback(
    (index: number) => {
      if (!onChange) return;
      if (multiple) {
        const next = images.filter((_, i) => i !== index);
        onChange(next);
      } else {
        onChange("");
      }
    },
    [images, multiple, onChange],
  );

  return (
    <div className="space-y-2">
      {label && (
        <p className="text-sm font-medium">
          {label}
          {multiple && (
            <span className="text-muted-foreground ml-1">
              ({images.length}/{maxFiles})
            </span>
          )}
        </p>
      )}

      {/* Existing image previews */}
      {images.length > 0 && (
        <div
          className={
            multiple
              ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2"
              : ""
          }
        >
          {images.map((img, idx) => (
            <div
              key={`${idx}-${img.slice(-20)}`}
              className={`relative group rounded-lg overflow-hidden border bg-muted ${aspectRatio}`}
            >
              <img
                src={img}
                alt={`Preview ${idx + 1}`}
                className="absolute inset-0 h-full w-full object-cover"
              />
              {/* Overlay buttons */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPreviewImage(img)}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                {!disabled && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => removeImage(idx)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dropzone */}
      {canAddMore && !disabled && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 cursor-pointer transition-colors
            ${isDragOver ? "border-brand bg-brand/5" : "border-muted-foreground/25 hover:border-brand/50 hover:bg-muted/50"}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple={multiple}
            className="hidden"
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
          {isDragOver ? (
            <Upload className="h-8 w-8 text-brand mb-2" />
          ) : (
            <ImagePlus className="h-8 w-8 text-muted-foreground mb-2" />
          )}
          <p className="text-sm text-muted-foreground text-center">
            {isDragOver
              ? "วางรูปที่นี่"
              : "คลิกเพื่อเลือกรูป หรือลากไฟล์มาวาง"}
          </p>
          {hint && (
            <p className="text-xs text-muted-foreground/70 mt-1">{hint}</p>
          )}
        </div>
      )}

      {/* Zoom Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl p-2">
          <DialogTitle className="sr-only">ดูรูปภาพขนาดเต็ม</DialogTitle>
          {previewImage && (
            <img
              src={previewImage}
              alt="Preview"
              className="w-full h-auto rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** Lightweight gallery with zoom for public pages */
export function ImageGallery({ images, className }: { images: string[]; className?: string }) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  if (!images.length) return null;

  return (
    <>
      <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 ${className ?? ""}`}>
        {images.map((img, idx) => (
          <button
            key={`${idx}-${img.slice(-20)}`}
            type="button"
            onClick={() => setPreviewImage(img)}
            className="relative aspect-video rounded-lg overflow-hidden border bg-muted group cursor-pointer"
          >
            <img
              src={img}
              alt={`รูปที่ ${idx + 1}`}
              className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <ZoomIn className="h-6 w-6 text-white drop-shadow" />
            </div>
          </button>
        ))}
      </div>

      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl p-2">
          <DialogTitle className="sr-only">ดูรูปภาพขนาดเต็ม</DialogTitle>
          {previewImage && (
            <img
              src={previewImage}
              alt="Preview"
              className="w-full h-auto rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
