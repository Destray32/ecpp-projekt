import React, { useEffect, useState } from "react";
import AmberBox from "../../Components/AmberBox";
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from "primereact/checkbox";
import axios from "axios";
import 'jspdf-autotable';
import PDF_PracownikAnalizaCzasu from "../../Components/Raporty/PDF_PracownikAnalizaCzasu";
import PDF_AnalizaSwiadczenPracowniczych from "../../Components/Raporty/PDF_AnalizaSwiadczenPracowniczych";
import PDF_SprawozdanieSzczegolowe from "../../Components/Raporty/PDF_SprawozdanieSzczegolowe";
import PDF_SprawozdaniePodsumowanie from "../../Components/Raporty/PDF_SprawozdaniePodsumowanie";
import { notification } from "antd";
import checkUserType from "../../utils/accTypeUtils";

export default function RaportyPage() {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [Projekt, setProjekt] = useState(null);
    const [projektyOptions, setProjektyOptions] = useState([]);
    const [showRaportyFirma, setShowRaportyFirma] = useState(false);
    const [showRaportyPracownik, setShowRaportyPracownik] = useState(false);
    const [interfaceFirma, setInterfaceFirma] = useState(false);
    const [interfacePracownik, setInterfacePracownik] = useState(false);
    const [pracownik, setPracownik] = useState(null);
    const [availablePracownicy, setAvailablePracownicy] = useState([]);
    const [ignorujDatyFirma, setIgnorujDatyFirma] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [wybranyRaport, setWybranyRaport] = useState(null);
    const [raport, setRaport] = useState([]);
    const [accountType, setAccountType] = useState('');
    const [imie, setImie] = useState('');
    const [nazwisko, setNazwisko] = useState('');

    useEffect(() => {
        checkUserType(setAccountType);
        getImie();
    }, []);

    const getImie = async () => {
        try {
            const response = await axios.get('https://qubis.pl:5000/api/imie', { withCredentials: true });
            const { name, surename } = response.data;
            setImie(`${name}`);
            setNazwisko(`${surename}`);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        fetchProjektyPracownicy();
    }, []);

    useEffect(() => {
        if (Projekt && !projektyOptions.some(p => p.value === Projekt)) {
            setProjekt(null);
        }
    }, [projektyOptions, Projekt]);

    useEffect(() => {
        fetchProjektyAndRaport();
    }, [startDate, endDate, ignorujDatyFirma]);

    useEffect(() => {
        if (imie && nazwisko) {
            fetchProjektyPracownicy();
        }
    }, [imie, nazwisko, accountType]);

    const fetchProjektyPracownicy = async () => {
        try {
            const response = await axios.get('https://qubis.pl:5000/api/pracownicy', { withCredentials: true });
            const pracownicy = response.data;
            let pracownicyOptions = [];
            if(accountType === 'Pracownik') {
                pracownicyOptions = pracownicy
                .filter(item => item.name === imie && item.surname === nazwisko)
                .map(pracownik => ({ label: `${pracownik.name} ${pracownik.surname}`, value: pracownik.id }));
            } else {
                pracownicyOptions = pracownicy.map(pracownik => ({ label: `${pracownik.name} ${pracownik.surname}`, value: pracownik.id }));
            }
            setAvailablePracownicy(pracownicyOptions);
        } catch (error) {
            console.log(error);
        }
    }

    const fetchProjektyAndRaport = () => {
        Promise.all([
            axios.get("https://qubis.pl:5000/api/czas/projekty", { withCredentials: true }),
            axios.get('https://qubis.pl:5000/api/generujRaport', { withCredentials: true })
        ])
        .then(([projektyResponse, raportResponse]) => {
            const projekty = projektyResponse.data.projekty.map(projekt => ({
                label: projekt.NazwaKod_Projektu,
                value: projekt.id,
            }));
            
            const raportData = raportResponse.data.raport;
            setRaport(raportData);
            console.log("projekty.js", projektyResponse);
            console.log("raport.js", raportResponse);
    
            let filteredProjekty = projekty;
    
            if (!ignorujDatyFirma && startDate && endDate) {
                const startDateObj = new Date(startDate);
                const endDateObj = new Date(endDate);
    
                const projectsInDateRange = new Set(
                    raportData
                        .filter(entry => {
                            const [day, month, year] = entry.Data.split('.');
                            const entryDate = new Date(year, month - 1, day);
                            return entryDate >= startDateObj && entryDate <= endDateObj;
                        })
                        .map(entry => entry.ProjektID)
                );
    
                filteredProjekty = projekty.filter(projekt => 
                    projectsInDateRange.has(projekt.value)
                );
            }
    
            setProjektyOptions(filteredProjekty);
            
            if (Projekt && !filteredProjekty.some(p => p.value === Projekt)) {
                setProjekt(null);
            }
        })
        .catch((error) => {
            console.error(error);
            notification.error({
                message: 'Błąd',
                description: 'Nie udało się pobrać danych projektów i raportów',
                placement: 'topRight',
            });
        });
    };

    const handleGenerateReport = () => {
        if (!wybranyRaport || 
            (['Sprawozdanie z działalności - szczegółowe', 'Sprawozdanie z działalności - podsumowanie'].includes(wybranyRaport) && !Projekt) ||
            (['Analiza świadczeń pracowniczych', 'Pracownik Analiza czasu - działalność'].includes(wybranyRaport) && !pracownik) ||
            (!ignorujDatyFirma && (!startDate || !endDate))) {
            
            notification.info({
                message: 'Informacja',
                description: 'Wypełnij wszystkie wymagane pola',
                placement: 'topRight',
            });
            return;
        }

        let filteredRaport = raport;

        if (Projekt && ['Sprawozdanie z działalności - szczegółowe', 'Sprawozdanie z działalności - podsumowanie'].includes(wybranyRaport)) {
            filteredRaport = raport.filter(entry => entry.ProjektID === Projekt);
        }

        switch (wybranyRaport) {
            case "Sprawozdanie z działalności - szczegółowe":
                PDF_SprawozdanieSzczegolowe(filteredRaport, startDate, endDate, Projekt);
                break;
            case "Sprawozdanie z działalności - podsumowanie":
                PDF_SprawozdaniePodsumowanie(filteredRaport, startDate, endDate, Projekt);
                break;
            case "Analiza świadczeń pracowniczych":
                PDF_AnalizaSwiadczenPracowniczych(filteredRaport, startDate, endDate, pracownik);
                break;
            case "Pracownik Analiza czasu - działalność":
                PDF_PracownikAnalizaCzasu(filteredRaport, startDate, endDate, pracownik);
                break;
            default:
                break;
        }
    };

    const handleGenerateWszystkie = () => {
        if(!ignorujDatyFirma && (!startDate || !endDate)) {
            notification.info({
                message: 'Informacja',
                description: 'Wypełnij wszystkie wymagane pola',
                placement: 'topRight',
            });
            return;
        }	

        switch (wybranyRaport) {
            case "Sprawozdanie z działalności - szczegółowe":
                PDF_SprawozdanieSzczegolowe(raport, startDate, endDate);
                break;
            case "Sprawozdanie z działalności - podsumowanie":
                PDF_SprawozdaniePodsumowanie(raport, startDate, endDate);
                break;
            default:
                break;
        }
    };

    const przejscieDoInterfejsuFirma = () => {
        setInterfaceFirma(true);
        setInterfacePracownik(false);
    };

    const przejscieDoInterfejsuPracownik = () => {
        setInterfaceFirma(false);
        setInterfacePracownik(true);
    };

    const handleRowClick = (rowName) => {
        setSelectedRow(rowName);
        if (rowName === "Sprawozdanie z działalności - szczegółowe" || 
            rowName === "Sprawozdanie z działalności - podsumowanie") {
            przejscieDoInterfejsuFirma();
        } else {
            przejscieDoInterfejsuPracownik();
        }
        setWybranyRaport(rowName);
    };

    const getRowStyle = (rowName) => {
        return selectedRow === rowName ? { fontWeight: 'bold', textDecoration: 'underline' } : {};
    };

    return (
        <div>
            <div className="w-auto h-auto bg-blue-700 outline outline-1 outline-black flex flex-row items-center space-x-4 m-2 p-3 text-white">
                <p>Opcje</p>
            </div>
            <AmberBox>
              <div className="flex flex-col items-center justify-center space-y-4 w-full">
                  <p>Wybierz okres raportowania</p>
                  
                  <div className="flex flex-row items-center space-x-4">
                    <input
                        type="date"
                        className="p-2.5 rounded"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        disabled={interfaceFirma && ignorujDatyFirma}
                    />
                    <input
                        type="date"
                        className="p-2.5 rounded"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        disabled={interfaceFirma && ignorujDatyFirma}
                    />
                </div>
          
                  {interfaceFirma && (
                      <div className="flex items-center">
                          <Checkbox
                              inputId="firma"
                              checked={ignorujDatyFirma}
                              onChange={() => setIgnorujDatyFirma(!ignorujDatyFirma)}
                          />
                          <span className="ml-2">Ignoruj daty</span>
                      </div>
                  )}
          
                  {interfacePracownik && (
                      <Dropdown
                          value={pracownik}
                          options={availablePracownicy}
                          onChange={(e) => setPracownik(e.value)}
                          showClear
                          filter
                          className=""
                          filterInputAutoFocus
                          resetFilterOnHide
                          placeholder="Wybierz pracownika"
                      />
                  )}
          
                  <div className="flex flex-col items-center space-y-4">
                      {interfaceFirma && (
                          <Dropdown
                              value={Projekt}
                              options={projektyOptions}
                              onChange={(e) => setProjekt(e.value)}
                              showClear
                              placeholder="Wybierz projekt"
                              emptyMessage="Brak projektów"
                              filter
                              className="w-3/4"
                              filterInputAutoFocus
                              resetFilterOnHide
                          />
                      )}
                      
                      <div className="flex flex-row items-center space-x-4">
                          <Button
                              onClick={handleGenerateReport}
                              label="Generuj raport"
                              className="p-button-outlined border-2 p-2.5 bg-white text-black stable-button"
                          />
                          
                          {interfaceFirma && (
                              <Button
                                  onClick={handleGenerateWszystkie}
                                  label="Generuj wszystkie"
                                  className="p-button-outlined border-2 p-2.5 bg-white text-black stable-button"
                              />
                          )}
                      </div>
                  </div>
              </div>
          </AmberBox>
            <div className="w-auto h-auto bg-blue-700 outline outline-1 outline-black flex flex-row items-center space-x-4 m-2 p-3 text-white">
                <p>Raporty</p>
            </div>
            <div className="w-auto bg-gray-300 h-full m-2 outline outline-1 outline-gray-500">
            <table className="w-full">
                <tbody className="text-left cursor-pointer">
                    <tr className="border-b hover:underline even:bg-gray-200 odd:bg-gray-300"
                        onClick={() => {if (accountType !== 'Pracownik' || accountType !== 'Kierownik') setShowRaportyFirma(!showRaportyFirma)}}>
                        <th className="border-r">Raporty dla firmy</th>
                    </tr>
                    <tr className={`${showRaportyFirma ? "" : "hidden"}`}>
                        <td onClick={() => handleRowClick("Sprawozdanie z działalności - szczegółowe")}
                            style={getRowStyle("Sprawozdanie z działalności - szczegółowe")}
                            className="border-r hover:underline even:bg-gray-200 odd:bg-gray-300">
                            Szczegółowy
                        </td>
                    </tr>
                    <tr className={`${showRaportyFirma ? "" : "hidden"}`}>
                        <td onClick={() => handleRowClick("Sprawozdanie z działalności - podsumowanie")}
                            style={getRowStyle("Sprawozdanie z działalności - podsumowanie")}
                            className="border-r hover:underline even:bg-gray-200 odd:bg-gray-300">
                            Podsumowanie
                        </td>
                    </tr>

                    <tr className="border-b hover:underline even:bg-gray-200 odd:bg-gray-300"
                        onClick={() => setShowRaportyPracownik(!showRaportyPracownik)}>
                        <th className="border-r">Raporty dla pracownika</th>
                    </tr>
                    <tr className={`${showRaportyPracownik ? "" : "hidden"}`}>
                        <td onClick={() => handleRowClick("Analiza świadczeń pracowniczych")}
                            style={getRowStyle("Analiza świadczeń pracowniczych")}
                            className="border-r hover:underline even:bg-gray-200 odd:bg-gray-300">
                            Szczegółowy
                        </td>
                    </tr>
                    <tr className={`${showRaportyPracownik ? "" : "hidden"}`}>
                        <td onClick={() => handleRowClick("Pracownik Analiza czasu - działalność")}
                            style={getRowStyle("Pracownik Analiza czasu - działalność")}
                            className="border-r hover:underline even:bg-gray-200 odd:bg-gray-300">
                            Podsumowanie
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
);
}