import React from "react";
import AmberBox from "../../Components/AmberBox";
import { notification } from 'antd';
import { InputText } from 'primereact/inputtext';
import { FloatLabel } from 'primereact/floatlabel';
import { Button } from 'primereact/button';
import { Link } from "react-router-dom";
import axios from "axios";

export default function NowyPojazdPage() {
    const [vehicle, setVehicle] = React.useState({
        numerRejestracyjny: "",
        marka: "",
        uwagi: "",
    });

    const handleSave = () => {
        axios.post("http://localhost:5000/api/pojazdy", vehicle, { withCredentials: true })
            .then((response) => {
                notification.success({ message: 'Pomyślnie dodano nowy pojazd' });
            })
            .catch((error) => {
                if (error.response) {
                    notification.error({ message: error.response.data });
                } else {
                    notification.error({ message: 'Wystąpił nieznany błąd' });
                }
            });
    }
    

    return (
        <div>
            <div className="w-auto h-auto bg-blue-700 outline outline-1 outline-black flex flex-row items-center space-x-4 m-2 p-3 text-white">
                <p>Dodaj nowy pojazd</p>
            </div>
            <AmberBox>
                <div className="flex flex-col items-center space-y-8 p-4 w-full">
                    <FloatLabel className="w-6/12 lg:w-4/12">
                        <InputText id="nrrej" type="text" className="w-full" value={vehicle.numerRejestracyjny} onChange={(e) => setVehicle({ ...vehicle, numerRejestracyjny: e.target.value })} />
                        <label htmlFor="nrrej">Numer rejestracyjny</label>
                    </FloatLabel>
                    
                    <FloatLabel className="w-6/12 lg:w-4/12">
                        <InputText id="marka" type="text" className="w-full" value={vehicle.marka} onChange={(e) => setVehicle({ ...vehicle, marka: e.target.value })} />
                        <label htmlFor="marka">Marka</label>
                    </FloatLabel>
                    
                    <FloatLabel className="w-6/12 lg:w-4/12">
                        <InputText id="uwagi" type="text" className="w-full" value={vehicle.uwagi} onChange={(e) => setVehicle({ ...vehicle, uwagi: e.target.value })} />
                        <label htmlFor="uwagi">Uwagi</label>
                    </FloatLabel>
                    
                    <div className="flex space-x-4 mt-8">
                        <Button label="Dodaj" icon="pi pi-check" className="p-button-outlined border-2 p-1 bg-white text-black pr-2 pl-2 mr-2" onClick={handleSave} />
                        <Link to="/home/pojazdy">
                            <Button label="Anuluj" icon="pi pi-times" className="p-button-outlined border-2 p-1 bg-white text-black pr-2 pl-2" />
                        </Link>
                    </div>
                </div>
            </AmberBox>
        </div>
    );
}
