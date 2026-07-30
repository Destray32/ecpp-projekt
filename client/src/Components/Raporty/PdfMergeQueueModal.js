import React, { useState, useEffect } from 'react';
import {
    getPdfQueue,
    removeFromPdfQueue,
    moveInPdfQueue,
    clearPdfQueue,
    downloadMergedPdf
} from '../../utils/pdfQueueManager';

const PdfMergeQueueModal = ({ isOpen, onClose }) => {
    const [queue, setQueue] = useState([]);

    const reloadQueue = () => {
        setQueue(getPdfQueue());
    };

    useEffect(() => {
        if (isOpen) {
            reloadQueue();
        }

        const handleUpdate = () => {
            reloadQueue();
        };

        window.addEventListener('pdfQueueUpdated', handleUpdate);
        return () => window.removeEventListener('pdfQueueUpdated', handleUpdate);
    }, [isOpen]);

    if (!isOpen) return null;

    const handleRemove = (id) => {
        const updated = removeFromPdfQueue(id);
        setQueue(updated);
    };

    const handleMove = (index, dir) => {
        const updated = moveInPdfQueue(index, dir);
        setQueue(updated);
    };

    const handleClear = () => {
        const updated = clearPdfQueue();
        setQueue(updated);
    };

    const handleDownload = async () => {
        await downloadMergedPdf();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] border border-gray-200">
                {/* Modal Header */}
                <div className="bg-blue-700 text-white p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">📑</span>
                        <h3 className="font-bold text-lg">Kolejka Połączonych Raportów PDF ({queue.length})</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white font-bold text-xl px-2 py-1 transition"
                    >
                        ✕
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-4 overflow-y-auto flex-1 space-y-3 bg-gray-50">
                    {queue.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 bg-white rounded border border-dashed border-gray-300">
                            <span className="text-3xl block mb-2">📭</span>
                            <p className="font-bold text-gray-700 mb-1">Kolejka raportów jest pusta</p>
                            <p className="text-xs text-gray-500">
                                Przejdź do zakładki z raportami, wybierz interesujące Cię parametry/daty i kliknij przycisk <span className="font-semibold text-blue-600">"➕ Dodaj do połączonego PDF"</span>.
                            </p>
                        </div>
                    ) : (
                        queue.map((item, index) => (
                            <div
                                key={item.id}
                                className="bg-white p-3.5 rounded border border-gray-200 shadow-sm flex items-center justify-between gap-3 hover:border-blue-300 transition"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center flex-shrink-0">
                                        {index + 1}
                                    </span>
                                    <div className="min-w-0">
                                        <h4 className="font-bold text-gray-800 text-sm truncate">{item.title}</h4>
                                        <p className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                                            <span>📅 {item.subtitle}</span>
                                            <span>•</span>
                                            <span>🕒 {item.timestamp}</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Item Controls */}
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    <button
                                        type="button"
                                        disabled={index === 0}
                                        onClick={() => handleMove(index, -1)}
                                        className="p-1.5 border rounded text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition text-xs font-bold"
                                        title="Przesuń wyżej"
                                    >
                                        ▲
                                    </button>
                                    <button
                                        type="button"
                                        disabled={index === queue.length - 1}
                                        onClick={() => handleMove(index, 1)}
                                        className="p-1.5 border rounded text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition text-xs font-bold"
                                        title="Przesuń niżej"
                                    >
                                        ▼
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleRemove(item.id)}
                                        className="p-1.5 border border-red-200 rounded text-red-600 hover:bg-red-50 transition text-xs font-bold ml-1"
                                        title="Usuń z kolejki"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Modal Footer */}
                <div className="bg-white p-4 border-t flex flex-wrap items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={handleClear}
                        disabled={queue.length === 0}
                        className="text-xs font-bold text-red-600 hover:text-red-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                        🗑️ Wyczyść kolejkę
                    </button>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border rounded font-semibold text-gray-700 hover:bg-gray-50 text-sm transition"
                        >
                            Zamknij
                        </button>
                        <button
                            type="button"
                            onClick={handleDownload}
                            disabled={queue.length === 0}
                            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded shadow transition text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            🚀 Pobierz połączony PDF ({queue.length})
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PdfMergeQueueModal;
