import React, { useState } from 'react';
import { Button } from 'primereact/button';
import AmberBox from '../../Components/AmberBox';
import { Checkbox } from 'primereact/checkbox';

const sampleData = [
    {
        id: 1,
        name: "Marek Zając",
        grupaurlopowa: "NCC",
        status1: "Otwarty",
        status2: "Zamknięty"
    },
    {
        id: 2,
        name: "Marek Zając",
        grupaurlopowa: "NCC",
        status1: "Otwarty",
        status2: "Zamknięty"
    },
    {
        id: 3,
        name: "Marek Zając",
        grupaurlopowa: "NCC",
        status1: "Otwarty",
        status2: "Zamknięty"
    }
];

export default function TydzienPage() {
    const [selectedWeek, setSelectedWeek] = useState('');
    const [weekRange, setWeekRange] = useState({ start: '', end: '' });
    const [selectedItems, setSelectedItems] = useState([]);

    const handleCheckboxChange = (id) => {
        setSelectedItems(prevState =>
            prevState.includes(id)
                ? prevState.filter(item => item !== id)
                : [...prevState, id]
        );
    };

    const handleWeekChange = (event) => {
        const weekValue = event.target.value;
        setSelectedWeek(weekValue);
        
        if (weekValue) {
            const startDate = getStartDateOfWeek(weekValue);
            const endDate = getEndDateOfWeek(startDate);
            setWeekRange({ 
                start: formatDate(startDate), 
                end: formatDate(endDate) 
            });
        } else {
            setWeekRange({ start: '', end: '' });
        }
    };

    const getStartDateOfWeek = (weekValue) => {
        const year = parseInt(weekValue.substring(0, 4));
        const week = parseInt(weekValue.substring(6));
        
        const firstDayOfYear = new Date(year, 0, 1);
        const daysOffset = ((week - 1) * 7) - firstDayOfYear.getDay() + 1;
        return new Date(year, 0, 1 + daysOffset);
    };

    const getEndDateOfWeek = (startDate) => {
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        return endDate;
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('pl-PL', {
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric'
        });
    };

    return (
        <div>
            <AmberBox>
                <div className="flex flex-col items-center space-y-8 p-4 w-full">
                    <div className="flex flex-row items-center">
                        <div className="flex flex-row items-center">
                            <p className="mr-2">Wybierz tydzień:</p>
                            <input type="week" onChange={handleWeekChange} />
                            <div className="ml-4">
                                <p>
                                    {weekRange.start && weekRange.end ? ` ${weekRange.start} - ${weekRange.end}` : 'Wybierz tydzień, aby zobaczyć przedział dni'}
                                </p>
                            </div>
                            <Button label="Otwórz tydzień" className="p-button-outlined border-2 p-1 bg-white pr-2 pl-2 ml-6" />
                            <Button label="Zamknij tydzień" className="p-button-outlined border-2 p-1 bg-white pr-2 pl-2 ml-6" />
                            <Button label="Drukuj" className="p-button-outlined border-2 p-1 bg-white pr-2 pl-2 ml-6" />
                        </div>
                    </div>
                    
                </div>
            </AmberBox>
            <div className="w-full md:w-auto bg-gray-300 h-full m-2 outline outline-1 outline-gray-500">
                        <table className="w-full">
                            <thead className="bg-blue-700 text-white">
                                <tr>
                                    <th></th>
                                    <th className="border-r">Imię i nazwisko</th>
                                    <th className="border-r">Grupa urlopowa</th>
                                    <th className="border-r">Status</th>
                                    <th className="border-r">Status</th>
                                </tr>
                            </thead>
                            <tbody className="text-center">
                                {sampleData.map((item) => (
                                    <tr key={item.id} className="border-b even:bg-gray-200 odd:bg-gray-300">
                                        <td className="border-r">
                                            <Checkbox 
                                                inputId={`cb-${item.id}`}
                                                checked={selectedItems.includes(item.id)}
                                                onChange={() => handleCheckboxChange(item.id)}
                                            />
                                        </td>
                                        <td className="border-r">{item.name}</td>
                                        <td className="border-r">{item.grupaurlopowa}</td>
                                        <td className="border-r text-green-600">{item.status1}</td>
                                        <td className="border-r text-red-600">{item.status2}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
        </div>
    );
}
