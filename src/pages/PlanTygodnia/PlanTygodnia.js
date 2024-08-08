import React, { useState, useEffect } from "react";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { DatePicker } from 'antd';

import TydzienInput from "../../Components/TydzienInput";
import PracownikData from "../../data/PlanTygodniaData";

import "primereact/resources/themes/lara-light-cyan/theme.css";

const { RangePicker } = DatePicker;

export default function PlanTygodniaPage() {
    const [availableGroups, setAvailableGroups] = useState(['wszyscy', 'inne']);
    const [group, setGroup] = useState('wszyscy');
    const [selectedWeek, setSelectedWeek] = useState(1); // selected week ustawiany w TydzienInput
    const [dateRange, setDateRange] = useState([null, null]);
    const [selectedRowIds, setSelectedRowIds] = useState([]); // stan do pierwszej kolumny z checkboxami
    // stany do śledzenia zaznaczonych checkboxów w kolumnach M1-M5
    const [selectedM1, setSelectedM1] = useState([]); 
    const [selectedM2, setSelectedM2] = useState([]); 
    const [selectedM3, setSelectedM3] = useState([]); 
    const [selectedM4, setSelectedM4] = useState([]); 
    const [selectedM5, setSelectedM5] = useState([]);


    // useEffect(() => {
    //     console.log(group);
    // }, [group]);

    //// podglad stanu zaznaczonych checkboxów
    // useEffect(() => {
    //     console.log('Selected rows:', selectedRowIds);
    //     console.log('Selected M1:', selectedM1);
    //     console.log('Selected M2:', selectedM2);
    //     console.log('Selected M3:', selectedM3);
    //     console.log('Selected M4:', selectedM4);
    //     console.log('Selected M5:', selectedM5);
    // }, [selectedRowIds, selectedM1, selectedM2, selectedM3, selectedM4, selectedM5]);

    useEffect(() => {
        console.log(selectedWeek);
    }, [selectedWeek]);

    const handleDrukujGrupe = () => {
        console.log('Drukuj grupe');
    }

    const handleDrukuj = () => {
        console.log('Drukuj');
    }

    const handlePickerChange = (dates, dateStrings) => {
        // console.log('od: ', dateStrings[0], ', do: ', dateStrings[1]);
        setDateRange([dateStrings[0], dateStrings[1]]);
    };

    // funkcja do obsługi zmiany stanu checkboxa w pierwszej kolumnie
    const handleRowCheckboxChange = (rowIndex) => {
        setSelectedRowIds(prevSelectedRows => {
            if (prevSelectedRows.includes(rowIndex)) {
                return prevSelectedRows.filter(id => id !== rowIndex);
            } else {
                return [...prevSelectedRows, rowIndex];
            }
        });
    };

    // funkcja do obsługi zmiany stanu checkboxa w kolumnach M1-M5
    // przepraszam za wielki switch ;_;
    const handleColumnCheckboxChange = (columnIndex, rowIndex) => {
        switch (columnIndex) {
            case 4:
                setSelectedM1(prevSelectedM1 => {
                    if (prevSelectedM1.includes(rowIndex)) {
                        return prevSelectedM1.filter(id => id !== rowIndex);
                    } else {
                        return [...prevSelectedM1, rowIndex];
                    }
                });
                break;
            case 5:
                setSelectedM2(prevSelectedM2 => {
                    if (prevSelectedM2.includes(rowIndex)) {
                        return prevSelectedM2.filter(id => id !== rowIndex);
                    } else {
                        return [...prevSelectedM2, rowIndex];
                    }
                });
                break;
            case 6:
                setSelectedM3(prevSelectedM3 => {
                    if (prevSelectedM3.includes(rowIndex)) {
                        return prevSelectedM3.filter(id => id !== rowIndex);
                    } else {
                        return [...prevSelectedM3, rowIndex];
                    }
                });
                break;
            case 7:
                setSelectedM4(prevSelectedM4 => {
                    if (prevSelectedM4.includes(rowIndex)) {
                        return prevSelectedM4.filter(id => id !== rowIndex);
                    } else {
                        return [...prevSelectedM4, rowIndex];
                    }
                });
                break;
            case 8:
                setSelectedM5(prevSelectedM5 => {
                    if (prevSelectedM5.includes(rowIndex)) {
                        return prevSelectedM5.filter(id => id !== rowIndex);
                    } else {
                        return [...prevSelectedM5, rowIndex];
                    }
                });
                break;
            default:
                break;
        }
    };

    return (
        <main>
            <div className="w-auto h-auto m-2 p-3 bg-amber-100 outline outline-1
         outline-gray-500 flex flex-row items-center space-x-4">
                <div className="w-3/4 h-72 flex flex-col space-y-2 items-start">
                    <div className="h-full">
                        <div className="h-full flex flex-col justify-around">
                            <div className="flex flex-row gap-32 items-center">
                                <TydzienInput setSelectedWeek={setSelectedWeek} />
                                <RangePicker onChange={handlePickerChange} />
                                <span>{(dateRange[0] && dateRange[1]) && (dateRange[0] + '  -  ' + dateRange[1])}</span>
                            </div>
                            <div>
                                <span>Grupa</span>
                                <Dropdown value={group} onChange={(e) => setGroup(e.value)}
                                    options={availableGroups} optionLabel="name"
                                    editable placeholder="" autoComplete='off'
                                    className="ml-4 md:w-14rem p-4" />
                            </div>
                        </div>
                    </div>

                </div>
                <div className="flex gap-24">
                    <Button label="Drukuj grupe" className="bg-white w-[9rem] h-[3rem]"
                        text raised onClick={handleDrukujGrupe} />
                    <Button label="Drukuj" className="bg-white w-[9rem] h-[3rem]"
                        text raised onClick={handleDrukuj} />
                </div>
            </div>


            <div class="grid grid-cols-[3fr,1fr] gap-5">
                <div id="lewa" class="grid grid-cols-auto-fit gap-2.5 p-4">
                    <div className="outline outline-1 outline-gray-500">
                        <table className="w-full">
                            <thead className="bg-blue-700 text-white">
                                <tr>
                                    <th className="border-r"></th>
                                    <th className="border-r">Nazwisko</th>
                                    <th className="border-r">Imię</th>
                                    <th className="border-r">Grupa</th>
                                    <th className="border-r">M1</th>
                                    <th className="border-r">M2</th>
                                    <th className="border-r">M3</th>
                                    <th className="border-r">M4</th>
                                    <th className="border-r">M5</th>
                                    <th className="border-r">Opis</th>
                                    
                                </tr>
                            </thead>
                            <tbody className="text-center">
                                {PracownikData.sampleData.map((item, i) => (
                                    <tr key={i} className="border-b even:bg-gray-200 odd:bg-gray-300">
                                        <td className="border-r">
                                            <input
                                                type="checkbox"
                                                checked={selectedRowIds.includes(i)}
                                                onChange={() => handleRowCheckboxChange(i)}
                                            />
                                        </td>
                                        <td className="border-r">{item.surname}</td>
                                        <td className="border-r">{item.name}</td>
                                        <td className="border-r">{item.vacationGroup}</td>
                                        <td className="border-r">
                                            <input
                                                type="checkbox"
                                                checked={selectedM1.includes(i)}
                                                onChange={() => handleColumnCheckboxChange(4, i)}
                                            />
                                        </td>
                                        <td className="border-r">
                                            <input
                                                type="checkbox"
                                                checked={selectedM2.includes(i)}
                                                onChange={() => handleColumnCheckboxChange(5, i)}
                                            />
                                        </td>
                                        <td className="border-r">
                                            <input
                                                type="checkbox"
                                                checked={selectedM3.includes(i)}
                                                onChange={() => handleColumnCheckboxChange(6, i)}
                                            />
                                        </td>
                                        <td className="border-r">
                                            <input
                                                type="checkbox"
                                                checked={selectedM4.includes(i)}
                                                onChange={() => handleColumnCheckboxChange(7, i)}
                                            />
                                        </td>
                                        <td className="border-r">
                                            <input
                                                type="checkbox"
                                                checked={selectedM5.includes(i)}
                                                onChange={() => handleColumnCheckboxChange(8, i)}
                                            />
                                        </td>
                                        <td className="border-r">{item.opis}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div id="prawa" class="flex flex-col gap-5">

                </div>
            </div>
        </main>
    )
}