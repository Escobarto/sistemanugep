import React from 'react';
import { X, Printer } from 'lucide-react';

export default function QrCodeModal({ data, onClose }) {
  if (!data) return null;

  // Gera link para API pública de QR Code
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(data.id + '|' + data.regNumber)}`;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60]" onClick={onClose}>
        <div className="bg-white p-6 rounded-xl max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-slate-800">Etiqueta de Inventário</h3>
                <button onClick={onClose}><X size={20} className="text-slate-400"/></button>
            </div>
            
            <div className="border-2 border-black p-4 inline-block mb-4 bg-white">
                <img src={qrUrl} alt="QR Code" />
                <p className="text-xs font-mono font-bold mt-2">{data.regNumber}</p>
            </div>
            
            <p className="text-sm text-slate-600 mb-6">Cole esta etiqueta na obra ou na prateleira.</p>
            
            <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold w-full flex items-center justify-center gap-2 transition-colors">
                <Printer size={18}/> Imprimir Etiqueta
            </button>
        </div>
    </div>
  );
}
