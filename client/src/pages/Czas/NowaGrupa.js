import React, { useState } from "react";
import { Link } from "react-router-dom";
import AmberBox from "../../Components/AmberBox";
import { InputText } from 'primereact/inputtext';
import { FloatLabel } from 'primereact/floatlabel';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import Axios from "axios";

export default function NowaGrupaPage() {
    const [planTygV, setPlanTygV] = useState(false);
    const [form, setForm] = useState({
        zleceniodawca: '',
        cennik: null,
        stawka: null,
        czyPlanTygV: 0
    });

    const handleSave = () => {
        Axios.post('http://47.76.209.242:5000/api/czas/grupa', {
            zleceniodawca: form.zleceniodawca,
            cennik: form.cennik,
            stawka: form.stawka,
            czyPlanTygV: form.czyPlanTygV
        }, { withCredentials: true })
            .then(res => {
                console.log(res.data);
                window.location.href = '/home/grupy-projektow';
            })
            .catch(err => {
                console.error(err);
            });
    };

    const handleZleceniodawca = (e) => {
        setForm(prev => ({ ...prev, zleceniodawca: e.target.value }));
    }

    const handleCennik = (e) => {
        setForm(prev => ({ ...prev, cennik: e.target.value }));
    }

    const handleStawka = (e) => {
        let value = e.target.value.replace(',', '.');
        setForm(prev => ({ ...prev, stawka: value }));
    }

    const handlePlanTygV = (e) => {
        const checked = e.checked;
        setPlanTygV(checked);
        setForm(prev => ({ ...prev, czyPlanTygV: checked ? 1 : 0 }));
    }

    return (
        <div>
            <div className="w-auto h-auto bg-blue-700 outline outline-1 outline-black flex flex-row items-center space-x-4 m-2 p-3 text-white">
                <p>Dodaj nową grupę</p>
            </div>
            <AmberBox>
                <div className="flex flex-col items-center space-y-8 p-4 w-full">
                    <FloatLabel className="w-6/12 lg:w-4/12">
                        <InputText onChange={handleZleceniodawca} id="zleceniodawca" type="text" className="w-full" />
                        <label htmlFor="zleceniodawca">Zleceniodawca</label>
                    </FloatLabel>
                    
                    <FloatLabel className="w-6/12 lg:w-4/12">
                        <InputText onChange={handleCennik} id="cennik" type="text" className="w-full" />
                        <label htmlFor="cennik">Cennik</label>
                    </FloatLabel>
                    
                    <FloatLabel className="w-6/12 lg:w-4/12">
                        <InputText onChange={handleStawka} id="stawka" type="text" className="w-full" />
                        <label htmlFor="stawka">Stawka/km</label>
                    </FloatLabel>

                    <label htmlFor="planTygV">
                        Plan tygodnia "V"?
                        <Checkbox inputId="PlanTygV" className="mr-2 ml-2" checked={planTygV} onChange={handlePlanTygV} />
                    </label>
                    
                    <div className="flex space-x-4 mt-8">
                        <Button label="Zapisz" icon="pi pi-check" className="p-button-outlined border-2 p-1 bg-white text-black pr-2 pl-2 mr-2" onClick={handleSave} />
                        <Link to="/home/grupy-projektow">
                            <Button label="Anuluj" icon="pi pi-times" className="p-button-outlined border-2 p-1 bg-white text-black pr-2 pl-2" />
                        </Link>
                    </div>
                </div>
            </AmberBox>
        </div>
    );
}
