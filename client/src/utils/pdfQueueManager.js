import { PDFDocument } from 'pdf-lib';
import { notification } from 'antd';

const QUEUE_STORAGE_KEY = 'ecpp_pdf_merge_queue';

/**
 * ArrayBuffer to Base64
 */
const arrayBufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
};

/**
 * Base64 to Uint8Array
 */
const base64ToUint8Array = (base64) => {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
};

/**
 * Get current PDF queue from localStorage
 */
export const getPdfQueue = () => {
    try {
        const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
        if (!raw) return [];
        return JSON.parse(raw);
    } catch (err) {
        console.error('Błąd odczytu kolejki PDF:', err);
        return [];
    }
};

/**
 * Save PDF queue to localStorage
 */
const savePdfQueue = (queue) => {
    try {
        localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
        // Dispatch window custom event so other components update in real time
        window.dispatchEvent(new Event('pdfQueueUpdated'));
    } catch (err) {
        console.error('Błąd zapisu kolejki PDF:', err);
        notification.error({
            message: 'Błąd pamięci',
            description: 'Nie udało się zapisać pliku w kolejce (przekroczono limit pamięci).',
            placement: 'topRight',
        });
    }
};

/**
 * Add PDF arrayBuffer to queue
 */
export const addToPdfQueue = (title, subtitle, arrayBuffer) => {
    try {
        const queue = getPdfQueue();
        const base64 = arrayBufferToBase64(arrayBuffer);
        const newItem = {
            id: Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            title: title || 'Raport PDF',
            subtitle: subtitle || new Date().toLocaleDateString('pl-PL'),
            timestamp: new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }),
            pdfBase64: base64
        };
        queue.push(newItem);
        savePdfQueue(queue);
        notification.success({
            message: 'Dodano do kolejki PDF',
            description: `Raport "${title}" został dodany do zbiorczego PDF (Pozycji w kolejce: ${queue.length}).`,
            placement: 'topRight',
        });
        return queue;
    } catch (err) {
        console.error('Błąd dodawania do kolejki PDF:', err);
    }
};

/**
 * Remove single item from queue
 */
export const removeFromPdfQueue = (id) => {
    const queue = getPdfQueue().filter(item => item.id !== id);
    savePdfQueue(queue);
    return queue;
};

/**
 * Move item in queue (direction: -1 for UP, 1 for DOWN)
 */
export const moveInPdfQueue = (index, direction) => {
    const queue = getPdfQueue();
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= queue.length) return queue;
    const temp = queue[index];
    queue[index] = queue[newIndex];
    queue[newIndex] = temp;
    savePdfQueue(queue);
    return queue;
};

/**
 * Clear entire queue
 */
export const clearPdfQueue = () => {
    savePdfQueue([]);
    notification.info({
        message: 'Wyczyszczono kolejkę',
        description: 'Kolejka raportów PDF została wyczyszczona.',
        placement: 'topRight',
    });
    return [];
};

/**
 * Merge all queued PDFs using pdf-lib and trigger download
 */
export const downloadMergedPdf = async (customFilename) => {
    const queue = getPdfQueue();
    if (queue.length === 0) {
        notification.warning({
            message: 'Kolejka jest pusta',
            description: 'Dodaj przynajmniej jeden raport do kolejki przed wygenerowaniem połączonego pliku PDF.',
            placement: 'topRight',
        });
        return;
    }

    try {
        const mergedPdf = await PDFDocument.create();

        for (const item of queue) {
            const pdfBytes = base64ToUint8Array(item.pdfBase64);
            const pdf = await PDFDocument.load(pdfBytes);
            const pageIndices = pdf.getPageIndices();
            const copiedPages = await mergedPdf.copyPages(pdf, pageIndices);
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }

        const mergedPdfBytes = await mergedPdf.save();

        // Create blob link and trigger download
        const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const defaultName = `Polaczony_Raport_${new Date().toISOString().slice(0, 10)}.pdf`;
        link.href = url;
        link.download = customFilename || defaultName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        notification.success({
            message: 'Pobieranie połączonego PDF',
            description: `Pomyślnie połączono ${queue.length} raportów w jeden plik PDF.`,
            placement: 'topRight',
        });
    } catch (err) {
        console.error('Błąd łączenia plików PDF:', err);
        notification.error({
            message: 'Błąd łączenia PDF',
            description: 'Nie udało się połączyć wybranych plików PDF.',
            placement: 'topRight',
        });
    }
};
