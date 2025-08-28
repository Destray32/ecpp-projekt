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
    const [selectedZleceniodawcy, setSelectedZleceniodawcy] = useState([]);
    const [uniqueZleceniodawcy, setUniqueZleceniodawcy] = useState([]);
    const baseUrl = process.env.REACT_APP_BASE_URL;
    useEffect(() => {
        checkUserType(setAccountType);
        getImie();
        fetchPracownicy(); // Add this line
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

    // Add this new function after getImie()
    const fetchPracownicy = async () => {
        try {
            const response = await axios.get(`${baseUrl}/api/pracownicy`, { withCredentials: true });
            const pracownicyOptions = response.data.map(pracownik => ({
                label: `${pracownik.name} ${pracownik.surname}`,
                value: pracownik.id
            }));
            
            // Sort employees alphabetically by label
            pracownicyOptions.sort((a, b) => a.label.localeCompare(b.label));
            
            setAvailablePracownicy(pracownicyOptions);
            setAllPracownicyOptions(pracownicyOptions);
            
        } catch (error) {
            console.error('Error fetching employees:', error);
            notification.error({
                message: 'Błąd',
                description: 'Nie udało się pobrać listy pracowników',
                placement: 'topRight',
            });
        }
    };

    // Add useEffect to handle auto-selection after both accountType and employees are loaded
    useEffect(() => {
        if (accountType === 'Pracownik' && availablePracownicy.length > 0 && imie && nazwisko) {
            const currentUser = availablePracownicy.find(p => 
                p.label.includes(imie) && p.label.includes(nazwisko)
            );
            if (currentUser) {
                setPracownik(currentUser.value);
                // Filter to show only current user for Pracownik account type
                setAvailablePracownicy([currentUser]);
            }
        } else if (accountType !== 'Pracownik' && allPracownicyOptions.length > 0) {
            // For non-Pracownik accounts, show all employees
            setAvailablePracownicy(allPracownicyOptions);
        }
    }, [accountType, allPracownicyOptions, imie, nazwisko]);

    useEffect(() => {
        setStartDate('');
        setEndDate('');
    }, [ignorujDatyFirma, accountType]);

    useEffect(() => {
        if (Projekt && projektyOptions.length > 0) {
            // Check if project is available in grouped structure
            const projectStillAvailable = projektyOptions.some(group => 
                group.items && group.items.some(p => p.value === Projekt)
            );
            if (!projectStillAvailable) {
                setProjekt(null);
            }
        }
    }, [projektyOptions, Projekt]);

    // Update to ensure date changes trigger project filtering
    useEffect(() => {
        fetchProjektyAndRaport();
    }, [startDate, endDate, selectedZleceniodawcy, ignorujDatyFirma]);

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
            
            // Sort projects alphabetically by label
            projekty.sort((a, b) => a.label.localeCompare(b.label));
            
            const raportData = raportResponse.data.raport;
            setRaport(raportData);
    
            let filteredProjekty = projekty;

            // Only filter by date range if dates are selected AND not ignored AND we're in company interface
            if (interfaceFirma && !ignorujDatyFirma && startDate && endDate) {
                const startDateObj = new Date(startDate);
                const endDateObj = new Date(endDate);
    
                // Extract all project IDs that have entries within the date range
                const projectsInDateRange = new Set(
                    raportData
                        .filter(entry => {
                            if (!entry.Data) return false;
                            const datePart = entry.Data.split(' ')[0]; 
                            const [day, month, year] = datePart.split('.'); 
                            const entryDate = new Date(`${year}-${month}-${day}`);
                            return entryDate >= startDateObj && entryDate <= endDateObj;
                        })
                        .map(entry => entry.ProjektID)
                );
    
                // Filter the projects to only include those used in the date range
                filteredProjekty = projekty.filter(projekt => 
                    projectsInDateRange.has(projekt.value)
                );
                
            }

            // Extract unique zleceniodawcy from ALL projects if no date range is applied
            // or from filtered projects if date range is applied
            const sourceForZleceniodawcy = (interfaceFirma && !ignorujDatyFirma && startDate && endDate) ? filteredProjekty : projekty;
            const zleceniodawcySet = new Set(sourceForZleceniodawcy.map(projekt => projekt.zleceniodawca || 'Bez zleceniodawcy'));
            
            // Define special order for zleceniodawcy (same as in grupy.dostepnegrupy.js)
            const specialOrder = {
                "NCW Plåt": 1,
                "NCC": 2,
                "Do dyspozycji": 98,
                "-------------------------------": 99,
                "Urlopy": 100,
                "Urlop tacierzyński / L4": 101
            };
            
            // Sort zleceniodawcy by the special order, then alphabetically
            const zleceniodawcyList = Array.from(zleceniodawcySet).sort((a, b) => {
                const orderA = specialOrder[a] || 50;
                const orderB = specialOrder[b] || 50;
                
                if (orderA !== orderB) return orderA - orderB;
                return a.localeCompare(b, 'pl', { sensitivity: 'base' });
            });
            
            setUniqueZleceniodawcy(zleceniodawcyList);
            
            // If we have selected zleceniodawcy, filter projects by them
            if (selectedZleceniodawcy.length > 0) {
                filteredProjekty = filteredProjekty.filter(projekt => 
                    selectedZleceniodawcy.includes(projekt.zleceniodawca || 'Bez zleceniodawcy')
                );
            }
    
            // Group projects by zleceniodawca for display (restore grouped structure)
            const groupedProjekty = filteredProjekty.reduce((groups, projekt) => {
                const zleceniodawca = projekt.zleceniodawca || 'Bez zleceniodawcy';
                if (!groups[zleceniodawca]) {
                    groups[zleceniodawca] = [];
                }
                groups[zleceniodawca].push(projekt);
                return groups;
            }, {});
            
            // Convert to PrimeReact's optgroup format with special order
            const groupedOptions = zleceniodawcyList
                .filter(zleceniodawca => groupedProjekty[zleceniodawca] && groupedProjekty[zleceniodawca].length > 0)
                .map(zleceniodawca => ({
                    label: `${zleceniodawca} (${groupedProjekty[zleceniodawca].length})`,
                    items: groupedProjekty[zleceniodawca]
                }));
            
            setProjektyOptions(groupedOptions);
            
            // Remove the duplicate project availability check from here
            // It's now handled in the useEffect above
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

    // Filter by project for company reports
    if (Projekt && ['Sprawozdanie z działalności - szczegółowe', 'Sprawozdanie z działalności - podsumowanie'].includes(wybranyRaport)) {
        filteredRaport = filteredRaport.filter(entry => entry.ProjektID === Projekt);
    }

    // Filter by employee for employee reports
    if (pracownik && ['Analiza świadczeń pracowniczych', 'Pracownik Analiza czasu - działalność'].includes(wybranyRaport)) {
        filteredRaport = filteredRaport.filter(entry => entry.PracownikID === pracownik);
    }

    // Filter by date range if not ignored
    if (!ignorujDatyFirma && startDate && endDate) {
        filteredRaport = filteredRaport.filter(entry => {
            if (!entry.Data) return false;
            const datePart = entry.Data.split(' ')[0]; 
            const [day, month, year] = datePart.split('.'); 
            const entryDate = new Date(`${year}-${month}-${day}`);
            return entryDate >= new Date(startDate) && entryDate <= new Date(endDate);
        });
    }

    // Check if there's any data after all filtering
    if (filteredRaport.length === 0) {
        let message = 'Brak danych dla wybranych kryteriów.';
        
        if (['Analiza świadczeń pracowniczych', 'Pracownik Analiza czasu - działalność'].includes(wybranyRaport)) {
            message = 'Brak danych dla wybranego pracownika w podanym okresie.';
        } else if (['Sprawozdanie z działalności - szczegółowe', 'Sprawozdanie z działalności - podsumowanie'].includes(wybranyRaport)) {
            message = 'Brak danych dla wybranego projektu w podanym okresie.';
        }
        
        notification.info({
            message: 'Brak danych',
            description: message,
            placement: 'topRight',
        });
        return;
    }

    const passedStartDate = ignorujDatyFirma ? null : startDate;
    const passedEndDate = ignorujDatyFirma ? null : endDate;

    // Create zleceniodawca mapping from grouped projektyOptions
    const projectZleceniodawcaMapping = {};
    projektyOptions.forEach(group => {
        if (group.items) {
            group.items.forEach(projekt => {
                projectZleceniodawcaMapping[projekt.value] = projekt.zleceniodawca;
            });
        }
    });

    switch (wybranyRaport) {
        case "Sprawozdanie z działalności - szczegółowe":
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

        // Filter the report data based on selected criteria
        let filteredRaport = raport;

        // Filter by date range if not ignored and dates are provided
        if (!ignorujDatyFirma && startDate && endDate) {
            filteredRaport = filteredRaport.filter(entry => {
                if (!entry.Data) return false;
                const datePart = entry.Data.split(' ')[0]; 
                const [day, month, year] = datePart.split('.'); 
                const entryDate = new Date(`${year}-${month}-${day}`);
                return entryDate >= new Date(startDate) && entryDate <= new Date(endDate);
            });
        }

        // Filter by selected zleceniodawcy if any are selected
        if (selectedZleceniodawcy.length > 0) {
            filteredRaport = filteredRaport.filter(entry => {
                // Get zleceniodawca from the entry or from project mapping
                const entryZleceniodawca = entry.Zleceniodawca || 'Bez zleceniodawcy';
                return selectedZleceniodawcy.includes(entryZleceniodawca);
            });
        }

        // Create zleceniodawca mapping from grouped projektyOptions
        const projectZleceniodawcaMapping = {};
        projektyOptions.forEach(group => {
            if (group.items) {
                group.items.forEach(projekt => {
                    projectZleceniodawcaMapping[projekt.value] = projekt.zleceniodawca;
                });
            }
        });

        const passedStartDate = ignorujDatyFirma ? null : startDate;
        const passedEndDate = ignorujDatyFirma ? null : endDate;

        switch (wybranyRaport) {
            case "Sprawozdanie z działalności - szczegółowe":
                PDF_SprawozdanieSzczegolowe(filteredRaport, passedStartDate, passedEndDate, null, projectZleceniodawcaMapping);
                break;
            case "Sprawozdanie z działalności - podsumowanie":
                PDF_SprawozdaniePodsumowanie(filteredRaport, passedStartDate, passedEndDate, null, projectZleceniodawcaMapping);
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

        let filtered = raport.filter(e => {
            if (!e.Data) return false;
            const [datePart] = e.Data.split(' ');
            const [d, m, y] = datePart.split('.');
            const dt = new Date(`${y}-${m}-${d}`);
            return dt >= sd && dt <= ed;
        });

        // If user is Pracownik, filter to show only their data
        if (accountType === 'Pracownik' && pracownik) {
            filtered = filtered.filter(e => e.PracownikID === pracownik);
        }

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
        setIgnorujDatyFirma(false);
        setPracownik(null);
        // Trigger project reload when switching to company interface
        fetchProjektyAndRaport();
        // Removed date reset to preserve dates between reports
    };

    const przejscieDoInterfejsuPracownik = () => {
        setInterfaceFirma(false);
        setInterfacePracownik(true);
        setProjekt(null);
        setIgnorujDatyFirma(false);
        
        // Ensure employees are loaded when switching to employee interface
        if (availablePracownicy.length === 0) {
            fetchPracownicy();
        }
        
        if (accountType === 'Pracownik') {
            // For Pracownik account type, auto-select current user and filter options
            const currentUser = allPracownicyOptions.find(p => 
                p.label.includes(imie) && p.label.includes(nazwisko)
            );
            if (currentUser) {
                setPracownik(currentUser.value);
                setAvailablePracownicy([currentUser]);
            }
        } else {
            setPracownik(null);
            setAvailablePracownicy(allPracownicyOptions);
        }
        // Auto-selection will be handled by the useEffect above
        // Removed date reset to preserve dates between reports
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

    // Function to handle zleceniodawca checkbox changes
    const handleZleceniodawcaChange = (zleceniodawca) => {
        if (selectedZleceniodawcy.includes(zleceniodawca)) {
            setSelectedZleceniodawcy(selectedZleceniodawcy.filter(z => z !== zleceniodawca));
        } else {
            setSelectedZleceniodawcy([...selectedZleceniodawcy, zleceniodawca]);
        }
    };

    // Function to select/deselect all zleceniodawca
    const handleSelectAllZleceniodawcy = (select) => {
        if (select) {
            setSelectedZleceniodawcy([...uniqueZleceniodawcy]);
        } else {
            setSelectedZleceniodawcy([]);
        }
    };

    // Reset selected zleceniodawca when dates change
    useEffect(() => {
        setSelectedZleceniodawcy([]);
    }, [startDate, endDate, ignorujDatyFirma]);

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
          
                  {/* Fixed layout with better positioning */}
                  {interfaceFirma && (
                      <div className="flex w-full relative" style={{ minHeight: "180px" }}>
                          {/* Zleceniodawcy filter on left side with fixed width */}
                          <div className="absolute left-4 bottom-1 w-64">
                              <div className="border rounded bg-white p-2">
                                  <div className="font-bold pb-1 mb-1 border-b">Filtruj po zleceniodawcy:</div>
                                  <div className="flex justify-between mb-2">
                                      <span 
                                          onClick={() => handleSelectAllZleceniodawcy(true)}
                                          className="text-xs text-blue-600 cursor-pointer hover:underline"
                                      >
                                          Zaznacz wszystkie
                                      </span>
                                      <span 
                                          onClick={() => handleSelectAllZleceniodawcy(false)}
                                          className="text-xs text-blue-600 cursor-pointer hover:underline"
                                      >
                                          Odznacz wszystkie
                                      </span>
                                  </div>
                                  <div className="max-h-80 overflow-y-auto border rounded">
                                      {uniqueZleceniodawcy.map(zleceniodawca => (
                                          <div key={zleceniodawca} className="flex items-center bg-gray-100 p-1">
                                              <Checkbox
                                                  inputId={`zlec_${zleceniodawca}`}
                                                  checked={selectedZleceniodawcy.includes(zleceniodawca)}
                                                  onChange={() => handleZleceniodawcaChange(zleceniodawca)}
                                              />
                                              <label htmlFor={`zlec_${zleceniodawca}`} className="ml-2 cursor-pointer text-sm truncate">
                                                  {zleceniodawca}
                                              </label>
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          </div>

                          {/* Projects and buttons properly centered with fixed width */}
                          <div className="flex-1 flex justify-center">
                              <div className="w-96 flex flex-col items-center">
                                  <Dropdown
                                      value={Projekt}
                                      options={projektyOptions}
                                      onChange={(e) => setProjekt(e.value)}
                                      showClear
                                      placeholder="Wybierz projekt"
                                      emptyMessage="Brak projektów"
                                      filter
                                      className="w-full"
                                      filterInputAutoFocus
                                      resetFilterOnHide
                                      optionGroupLabel="label"
                                      optionGroupChildren="items"
                                      optionGroupTemplate={(option) => (
                                          <div className="flex justify-between items-center font-bold text-blue-800 p-2 border-b">
                                              <span>{option.label}</span>
                                          </div>
                                      )}
                                  />
                                  <div className="flex flex-row items-center space-x-4 mt-4 justify-center">
                                      <Button
                                          onClick={handleGenerateReport}
                                          label="Generuj raport"
                                          className="p-button-outlined border-2 p-2.5 bg-white text-black stable-button"
                                      />
                                      <Button
                                          onClick={handleGenerateWszystkie}
                                          label="Generuj wszystkie"
                                          className="p-button-outlined border-2 p-2.5 bg-white text-black stable-button"
                                      />
                                  </div>
                              </div>
                          </div>
                      </div>
                  )}
                  
                  {/* Only show this for non-firma interface */}
                  {interfacePracownik && (
                      <div className="flex flex-row items-center space-x-4">
                          <Button
                              onClick={handleGenerateReport}
                              label="Generuj raport"
                              className="p-button-outlined border-2 p-2.5 bg-white text-black stable-button"
                          />
                          <Button
                              onClick={handleGenerateAllEmployees}
                              label="Generuj wszystkie"
                              className="p-button-outlined border-2 p-2.5 bg-white text-black stable-button"
                          />
                      </div>
                  )}
              </div>
          </AmberBox>
            <div className="w-auto h-auto bg-blue-700 outline outline-1 outline-black flex flex-row items-center space-x-4 m-2 p-3 text-white">
                <p>Raporty</p>
            </div>
            <div className="w-auto bg-gray-300 h-full m-2 outline outline-1 outline-gray-500">
            <table className="w-full">
                <tbody className="text-left cursor-pointer">
                    <tr className={`border-b ${accountType !== 'Pracownik' ? 'hover:underline cursor-pointer' : 'cursor-not-allowed opacity-50'} even:bg-gray-200 odd:bg-gray-300`}
                        onClick={() => {
                            if (accountType !== 'Pracownik') {
                                setShowRaportyFirma(!showRaportyFirma);
                            }
                        }}>
                        <th className="border-r">Raporty dla firmy</th>
                    </tr>
                    <tr className={`${showRaportyFirma && accountType !== 'Pracownik' ? "" : "hidden"}`}>
                        <td onClick={() => {
                            if (accountType !== 'Pracownik') {
                                handleRowClick("Sprawozdanie z działalności - szczegółowe");
                            }
                        }}
                            style={getRowStyle("Sprawozdanie z działalności - szczegółowe")}
                            className={`border-r ${accountType !== 'Pracownik' ? 'hover:underline cursor-pointer' : 'cursor-not-allowed opacity-50'} even:bg-gray-200 odd:bg-gray-300`}>
                            Szczegółowy
                        </td>
                    </tr>
                    <tr className={`${showRaportyFirma && accountType !== 'Pracownik' ? "" : "hidden"}`}>
                        <td onClick={() => {
                            if (accountType !== 'Pracownik') {
                                handleRowClick("Sprawozdanie z działalności - podsumowanie");
                            }
                        }}
                            style={getRowStyle("Sprawozdanie z działalności - podsumowanie")}
                            className={`border-r ${accountType !== 'Pracownik' ? 'hover:underline cursor-pointer' : 'cursor-not-allowed opacity-50'} even:bg-gray-200 odd:bg-gray-300`}>
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