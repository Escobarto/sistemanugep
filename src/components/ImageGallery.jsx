import React from 'react';
import { X } from 'lucide-react';

export default function ImageGallery({ images, onRemove, readOnly = false }) {
  if (!images || images.length === 0) return null;

  return (
    <div className="mt-2">
      <p className="text-xs font-bold text-slate-500 mb-2">Galeria Adicional ({images.length})</p>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {images.map((img, i) => (
          <div key={i} className="relative w-20 h-20 flex-shrink-0 group">
            <img 
                src={img} 
                className="w-full h-full object-cover rounded border cursor-pointer hover:opacity-80" 
                onClick={() => window.open(img, '_blank')}
            />
            {!readOnly && (
                <button 
                    type="button" 
                    onClick={() => onRemove(i)} 
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <X size={10}/>
                </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
