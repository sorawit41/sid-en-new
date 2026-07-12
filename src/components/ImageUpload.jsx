import React from 'react';
import { Camera, X } from 'lucide-react';

const MAX_PHOTOS = 4;

/**
 * ImageUpload - A modernized photo uploader for Before, After, and General photos.
 * 
 * @param {string} label - The section label (e.g., "รูปภาพก่อนปรับปรุง", "Nameplate / Layout")
 * @param {Array} photos - Array of photo objects { dataUrl, caption }
 * @param {Function} onChange - (newPhotos) => void
 * @param {number} maxPhotos - max number of photos allowed
 */
export default function ImageUpload({ 
  label, 
  photos = [], 
  onChange, 
  maxPhotos = MAX_PHOTOS 
}) {

  const handleUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    // Check remaining slots
    const availableSlots = maxPhotos - photos.length;
    const filesToProcess = files.slice(0, availableSlots);

    let loadedCount = 0;
    const newPhotos = [...photos];

    filesToProcess.forEach(file => {
      if (!file.type.startsWith('image/')) {
        loadedCount++;
        if (loadedCount === filesToProcess.length) onChange(newPhotos);
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (ev) => {
        newPhotos.push({ dataUrl: ev.target.result, caption: '' });
        loadedCount++;
        if (loadedCount === filesToProcess.length) {
          onChange(newPhotos);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (idx) => {
    const newPhotos = [...photos];
    newPhotos.splice(idx, 1);
    onChange(newPhotos);
  };

  const updateCaption = (idx, caption) => {
    const newPhotos = [...photos];
    newPhotos[idx] = { ...newPhotos[idx], caption };
    onChange(newPhotos);
  };

  return (
    <div className="mb-4">
      {label && <div className="text-xs font-bold text-muted mb-2 uppercase tracking-wider">{label}</div>}
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {photos.map((p, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="relative aspect-4/3 rounded-lg border border-border overflow-hidden bg-bg group shadow-sm">
              <img src={p.dataUrl} alt={`uploaded-${i}`} className="w-full h-full object-cover" />
              <button 
                onClick={(e) => { e.preventDefault(); removePhoto(i); }} 
                className="absolute top-2 right-2 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 cursor-pointer border-none"
              >
                <X size={14} />
              </button>
            </div>
            <input 
              type="text" 
              placeholder="คำบรรยายรูป..."
              value={p.caption || ''}
              onChange={(e) => updateCaption(i, e.target.value)}
              className="w-full bg-surface border border-border rounded-md py-1.5 px-2.5 text-text font-sans text-[11px] outline-none transition-colors duration-200 focus:border-accent"
            />
          </div>
        ))}

        {photos.length < maxPhotos && (
          <label className="relative aspect-4/3 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-colors group">
            <input type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" />
            <Camera size={24} className="text-slate-400 group-hover:text-accent mb-2" />
            <span className="text-xs text-muted group-hover:text-accent">เพิ่มรูปภาพ</span>
          </label>
        )}
      </div>
    </div>
  );
}
