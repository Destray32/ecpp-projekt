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
    const [allPracownicyOptions, setAllPracownicyOptions] = useState([]);
    const baseUrl = process.env.REACT_APP_BASE_URL;
    useEffect(() => {
        checkUserType(setAccountType);
        getImie();
    }, []);

    const getImie = async () => {
        try {
            const response = await axios.get(`${baseUrl}/api/imie`, { withCredentials: true });
            const { name, surename } = response.data;
            setImie(`${name}`);
            setNazwisko(`${surename}`);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        setStartDate('');
        setEndDate('');
    }, [ignorujDatyFirma, accountType]);

    useEffect(() => {
        if (Projekt && !projektyOptions.some(p => p.value === Projekt)) {
            setProjekt(null);
        }
    }, [projektyOptions, Projekt]);

    useEffect(() => {
        fetchProjektyAndRaport();
    }, [startDate, endDate, ignorujDatyFirma]);

    useEffect(() => {
        axios.get(`${baseUrl}/api/pracownicy`, { withCredentials: true })
            .then(res => {
                const opts = res.data.map(p => ({ label: `${p.name} ${p.surname}`, value: p.id }));
                setAllPracownicyOptions(opts);
                setAvailablePracownicy(opts);

                if (accountType === 'Pracownik') {
                    const self = opts.find(o => o.label === `${imie} ${nazwisko}`);
                    if (self) {
                        setPracownik(self.value);
                        setAvailablePracownicy([self]);
                    }
                }
            });
    }, [accountType, imie, nazwisko]);

    useEffect(() => {
        if (!interfacePracownik || !startDate || !endDate) {
            setAvailablePracownicy(allPracownicyOptions);
            return;
        }

        const sd = new Date(startDate);
        const ed = new Date(endDate);

        const pracInRange = new Set(
            raport
            .filter(e => {
                if (!e.PracownikID || !e.Data) return false;
                // tu oddzielamy część daty od czasu
                const [datePart] = e.Data.split(' ');
                const [d, m, y] = datePart.split('.');
                const dt = new Date(`${y}-${m}-${d}`);
                return dt >= sd && dt <= ed;
            })
            .map(e => e.PracownikID)
        );

        setAvailablePracownicy(
            allPracownicyOptions.filter(p => pracInRange.has(p.value))
        );
    }, [interfacePracownik, startDate, endDate, raport, allPracownicyOptions]);


    const fetchProjektyAndRaport = () => {
        Promise.all([
            axios.get(`${baseUrl}/api/czas/projekty`, { withCredentials: true }),
            axios.get(`${baseUrl}/api/generujRaport`, { withCredentials: true })
        ])
        .then(([projektyResponse, raportResponse]) => {
            const projekty = projektyResponse.data.projekty.map(projekt => ({
                label: projekt.NazwaKod_Projektu,
                value: projekt.id,
                zleceniodawca: projekt.Zleceniodawca,
            }));
            
            const raportData = raportResponse.data.raport;
            setRaport(raportData);
    
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
        filteredRaport = filteredRaport.filter(entry => entry.ProjektID === Projekt);
    }

    if (!ignorujDatyFirma) {
        filteredRaport = filteredRaport.filter(entry => {
            if (!entry.Data) return false;
            const datePart = entry.Data.split(' ')[0]; 
            const [day, month, year] = datePart.split('.'); 
            const entryDate = new Date(`${year}-${month}-${day}`);
            return entryDate >= new Date(startDate) && entryDate <= new Date(endDate);
        });
    }

    // Dodaj warunek: jeśli raport jest dla pracownika i nie ma danych, nie generuj PDF
    if ((wybranyRaport === "Analiza świadczeń pracowniczych" || wybranyRaport === "Pracownik Analiza czasu - działalność") && filteredRaport.length === 0) {
        notification.info({
            message: 'Brak danych',
            description: 'Brak danych dla wybranego pracownika w podanym okresie.',
            placement: 'topRight',
        });
        return;
    }

    const passedStartDate = ignorujDatyFirma ? null : startDate;
    const passedEndDate = ignorujDatyFirma ? null : endDate;

    switch (wybranyRaport) {
        case "Sprawozdanie z działalności - szczegółowe":
            const projectZleceniodawcaMapping = {};
            projektyOptions.forEach(projekt => {
                projectZleceniodawcaMapping[projekt.value] = projekt.zleceniodawca;
            });
            PDF_SprawozdanieSzczegolowe(filteredRaport, passedStartDate, passedEndDate, Projekt, projectZleceniodawcaMapping);
            break;
        case "Sprawozdanie z działalności - podsumowanie":
            PDF_SprawozdaniePodsumowanie(filteredRaport, passedStartDate, passedEndDate, Projekt);
            break;
        case "Analiza świadczeń pracowniczych":
            PDF_AnalizaSwiadczenPracowniczych(filteredRaport, passedStartDate, passedEndDate, pracownik);
            break;
        case "Pracownik Analiza czasu - działalność":
            PDF_PracownikAnalizaCzasu(filteredRaport, passedStartDate, passedEndDate, pracownik);
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
                // Pass null for projekt to generate for all projects
                // Make zleceniodawca mapping available for each project
                const projectZleceniodawcaMapping = {};
                projektyOptions.forEach(projekt => {
                    projectZleceniodawcaMapping[projekt.value] = projekt.zleceniodawca;
                });
                PDF_SprawozdanieSzczegolowe(raport, startDate, endDate, null, projectZleceniodawcaMapping);
                break;
            case "Sprawozdanie z działalności - podsumowanie":
                PDF_SprawozdaniePodsumowanie(raport, startDate, endDate);
                break;
            default:
                break;
        }
    };
    const handleGenerateAllEmployees = () => {
        if (!startDate || !endDate) {
            notification.info({
            message: 'Informacja',
            description: 'Wypełnij daty',
            placement: 'topRight'
            });
            return;
        }

        const [sd, ed] = [new Date(startDate), new Date(endDate)];

        const filtered = raport.filter(e => {
            if (!e.Data) return false;
            const [datePart] = e.Data.split(' ');
            const [d, m, y] = datePart.split('.');
            const dt = new Date(`${y}-${m}-${d}`);
            return dt >= sd && dt <= ed;
        });

        switch (wybranyRaport) {
            case "Analiza świadczeń pracowniczych":
            PDF_AnalizaSwiadczenPracowniczych(filtered, startDate, endDate, null);
            break;
            case "Pracownik Analiza czasu - działalność":
            PDF_PracownikAnalizaCzasu(filtered, startDate, endDate, null);
            break;
        }
        };


    const przejscieDoInterfejsuFirma = () => {
        setInterfaceFirma(true);
        setInterfacePracownik(false);
        setProjekt(null);
        setStartDate('');
        setEndDate('');
        setIgnorujDatyFirma(false);
        setPracownik(null);
    };

    const przejscieDoInterfejsuPracownik = () => {
        setInterfaceFirma(false);
        setInterfacePracownik(true);
        setProjekt(null);
        setStartDate('');
        setEndDate('');
        setIgnorujDatyFirma(false);
        if (accountType !== 'Pracownik') {
            setPracownik(null);
        }
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
                        min={startDate || undefined}
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
                          showClear={accountType !== 'Pracownik'}
                          filter
                          className=""
                          filterInputAutoFocus
                          resetFilterOnHide
                          placeholder="Wybierz pracownika"
                          disabled={accountType === 'Pracownik'}
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
                      {interfacePracownik && (
                            <Button
                            onClick={handleGenerateAllEmployees}
                            label="Generuj wszystkie"
                            className="p-button-outlined border-2 p-2.5 bg-white text-black stable-button"
                            />
                        )}
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
                        onClick={() => {
                            if (accountType !== 'Pracownik') {
                                setShowRaportyFirma(!showRaportyFirma);
                            }
                        }}>
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