import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

const ZatwierdzWindow = ({ visible, onHide, selectedItems, onConfirm }) => {
    return (
        <Dialog header="Potwierdź zatwierdzenie" visible={visible} onHide={onHide} modal style={{ width: '50vw' }}>
            <div className="m-0">
                <p>Czy na pewno chcesz zatwierdzić następujące urlopy?</p>
                <ul className="list-disc pl-5 mt-3">
                    {selectedItems.map((item, index) => (
                        <li key={index}>
                            {item.imie} {item.nazwisko}: {item.dataOd} - {item.dataDo}
                        </li>
                    ))}
                </ul>
                <div className="flex justify-end mt-4">
                    <Button label="Anuluj" icon="pi pi-times" onClick={onHide} className="p-button-text mr-4" />
                    <Button label="Zatwierdź" icon="pi pi-check" onClick={onConfirm} autoFocus />
                </div>
            </div>
        </Dialog>
    );
};

export default ZatwierdzWindow;