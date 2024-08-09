import React, { useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { SelectButton } from 'primereact/selectbutton';
import { Link } from "react-router-dom";

export default function PracownikPage() {

    const [state, setState] = useState("Aktywne");
    const [title, setTitle] = useState(null);
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [manager, setManager] = useState(null);
    const [company, setCompany] = useState([]);
    const [searchField, setSearchField] = useState("Wszystko");
    const [keyword, setKeyword] = useState("");
    const [vacationGroup, setVacationGroup] = useState(null);
    const [letter, setLetter] = useState({name: "Wszystko"});

    const sampleData = [
        {
            id: 1,
            name: "Jan",
            surname: "Kowalski",
            pesel: "12345678901",
            vacationGroup: 1,
            company: "Hejmej Plat",
            phone1: "123456789",
            phone2: "123456789",
            email: "test@wp.pl",
            manager: "Jan Kowalski"
        },
        {
            id: 2,
            name: "Jan",
            surname: "Kowalski",
            pesel: "12345678901",
            vacationGroup: 1,
            company: "Hejmej Plat",
            phone1: "123456789",
            phone2: "123456789",
            email: "test@wp.pl",
            manager: "Jan Kowalski"
        },
        {
            id: 3,
            name: "Jan",
            surname: "Kowalski",
            pesel: "12345678901",
            vacationGroup: 1,
            company: "Hejmej Plat",
            phone1: "123456789",
            phone2: "123456789",
            email: "test@wp.pl",
            manager: "Jan Kowalski"
        }
    ];
    
    const onCompanyChange = (e) => {
        let _company = [...company];

        if(e.checked)
            _company.push(e.value);
        else
            _company.splice(_company.indexOf(e.value), 1);

        setCompany(_company);
        //console.log(_company);
    }

    return (
        <div >
            <div className="w-full md:w-auto h-full m-2 p-3 bg-amber-100 outline outline-1 outline-gray-500 flex flex-row items-center space-x-4">
                <div className="w-3/4 h-72 flex flex-col space-y-2 items-start">
                    <div className="w-full h-2/6">
                        <div className="w-full flex flex-row items-center p-4">
                            <p>Szukaj pracownika</p>
                            <Link to="/home/zmien-dane">
                                <Button label="Zmień swoje dane" className="bg-white outline outline-1 outline-gray-500 p-2 mx-2" />
                            </Link>
                            <Link to="/home/dodaj-pracownika">
                                <Button label="Dodaj pracownika" className="bg-white outline outline-1 outline-gray-500 p-2 mx-2" />
                            </Link>
                            <Button label="Drukuj listę" className="bg-white outline outline-1 outline-gray-500 p-2 mx-2" />
                        </div>
                    </div>
                    <div className="w-full h-4/6 outline outline-1">
                        <form className="w-full h-full flex flex-col space-y-2 p-2">
                            <div className="w-full h-1/2 flex flex-row items-center space-x-2">
                                <Dropdown value={title} onChange={(e) => setTitle(e.value)} options={["Tytul 1","Tytul 2"]} optionLabel="name" editable placeholder="Tytuł"
                                    autoComplete="off" className="w-3/12 p-2" filter showClear/>
                                <InputText value={name} onChange={(e) => setName(e.target.value)} placeholder="Imię" className="w-3/12 p-2" />
                                <InputText value={surname} onChange={(e) => setSurname(e.target.value)} placeholder="Nazwisko" className="w-3/12 p-2" />
                                <Dropdown value={manager} onChange={(e) => setManager(e.value)} options={["Kierownik 1","Kierownik 2"]} optionLabel="name" editable placeholder="Kierownik"
                                    autoComplete="off" className="w-3/12 p-2" filter showClear/>
                            </div>
                            <div className="w-full h-1/2 flex flex-row items-center space-x-2">
                                <Dropdown value={searchField} onChange={(e) => setSearchField(e.value)} options={["Wszystko","Imię","Nazwisko","Pesel","Grupa urlopowa","Firma","Telefon","E-mail","Kierownik"]} optionLabel="name" editable placeholder="Pole wyszukiwania"
                                    autoComplete="off" className="w-3/12 p-2" filter />
                                <InputText value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Słowo kluczowe" className="w-3/12 p-2" />
                                <Dropdown value={vacationGroup} onChange={(e) => setVacationGroup(e.value)} options={["Grupa 1","Grupa 2"]} optionLabel="name" editable placeholder="Grupa urlopowa"
                                    autoComplete="off" className="w-3/12 p-2" filter showClear/>
                                <Button label="Szukaj" className="w-3/12 bg-white outline outline-1 outline-gray-500 p-2" />
                            </div>
                        </form>
                    </div>
                    <div className="w-full h-1/6 flex flex-row items-center">
                        <SelectButton value={letter} onChange={(e) => setLetter(e.value)} optionLabel="name" 
                            options={[{name: "Wszystko"},{name: "A"},{name: "B"},{name: "C"},{name: "D"},{name: "E"},{name: "F"},{name: "G"},{name: "H"},{name: "I"},{name: "J"},{name: "K"},{name: "L"},{name: "M"},{name: "N"},{name: "O"},{name: "P"},{name: "R"},{name: "S"},{name: "T"},{name: "U"},{name: "W"},{name: "Z"}]}
                            className="w-full flex items-center justify-start text-xs" />
                    </div>
                </div>
                <div className="w-1/4 h-full p-3 outline outline-1 flex justify-center items-start">
                    <form className="w-full flex flex-col space-y-1">
                        <Dropdown value={state} onChange={(e) => setState(e.value)} options={["Aktywne","Niekatywne"]} optionLabel="name" editable placeholder="Status"
                            autoComplete="off" className="w-full p-2" />
                        <div className="flex flex-col justify-content-center space-y-1">
                            <div className="flex flex-row items-center">
                                <Checkbox inputId="cb1" value="cb1" onChange={onCompanyChange} checked={company.indexOf('cb1') !== -1} />
                                <label htmlFor="cb1"> Hejmej Plat</label>
                            </div>
                            <div className="flex flex-row items-center">
                                <Checkbox inputId="cb2" value="cb2" onChange={onCompanyChange} checked={company.indexOf('cb2') !== -1} />
                                <label htmlFor="cb2"> Midebygg</label>
                            </div>
                            <div className="flex flex-row items-center">
                                <Checkbox inputId="cb3" value="cb3" onChange={onCompanyChange} checked={company.indexOf('cb3') !== -1} />
                                <label htmlFor="cb3"> PC Group Sp. z o o.</label>
                            </div>
                            <div className="flex flex-row items-center">
                                <Checkbox inputId="cb4" value="cb4" onChange={onCompanyChange} checked={company.indexOf('cb4') !== -1} />
                                <label htmlFor="cb4"> PC Husbyggen</label>
                            </div>
                            <div className="flex flex-row items-center">
                                <Checkbox inputId="cb5" value="cb5" onChange={onCompanyChange} checked={company.indexOf('cb5') !== -1} />
                                <label htmlFor="cb5"> Polbygg</label>
                            </div>
                            <div className="flex flex-row items-center">
                                <Checkbox inputId="cb6" value="cb6" onChange={onCompanyChange} checked={company.indexOf('cb6') !== -1} />
                                <label htmlFor="cb6"> Zwolnieni</label>
                            </div>
                            <Button label="Filtruj" className="w-full bg-white outline outline-1 outline-gray-500 p-2" />
                        </div>
                    </form>
                </div>
            </div>
            <div className="w-full md:w-auto bg-gray-300 h-full m-2 outline outline-1 outline-gray-500">
                <table className="w-full">
                    <thead className="bg-blue-700 text-white">
                        <tr>
                            <th className="border-r">Imię</th>
                            <th className="border-r">Nazwisko</th>
                            <th className="border-r">Pesel</th>
                            <th className="border-r">Grupa urlopowa</th>
                            <th className="border-r">Firma</th>
                            <th className="border-r">Telefon</th>
                            <th className="border-r">Telefon</th>
                            <th className="border-r">E-mail</th>
                            <th className="border-r">Kierownik</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody className="text-center">
                        {sampleData.map((item) => (
                            <tr key={item.id} className="border-b even:bg-gray-200 odd:bg-gray-300">
                                <td className="border-r">{item.name}</td>
                                <td className="border-r">{item.surname}</td>
                                <td className="border-r">{item.pesel}</td>
                                <td className="border-r">{item.vacationGroup}</td>
                                <td className="border-r">{item.company}</td>
                                <td className="border-r">{item.phone1}</td>
                                <td className="border-r">{item.phone2}</td>
                                <td className="border-r">{item.email}</td>
                                <td className="border-r">{item.manager}</td>
                                <td><Button label="Usuń" className="bg-blue-700 text-white p-1 m-0.5" /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}