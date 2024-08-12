import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import AmberBox from '../../Components/AmberBox';
import { Checkbox } from 'primereact/checkbox';
import Axios from 'axios';

export default function TydzienPage() {
    const [selectedWeek, setSelectedWeek] = useState('');
    const [weekRange, setWeekRange] = useState({ start: '', end: '' });
    const [selectedItems, setSelectedItems] = useState([]);
    const [data, setData] = useState([]);

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

    const handleOtworz = () => {
        Axios.post('http://localhost:5000/api/tydzien', { 
            week: selectedWeek
         })
            .then(response => console.log(response.data))
            .catch(error => console.error(error));
    };
    const handleZamknij = () => {
        Axios.delete('http://localhost:5000/api/tydzien', { 
            data: { id: selectedItems }
         })
            .then(response => console.log(response.data))
            .catch(error => console.error(error));
    };
    const handleDrukuj = () => {
        console.log('Drukuj');
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

    useEffect(() => {
        Axios.get('http://localhost:5000/api/tydzien')
            .then(response => setData(response.data))
            .catch(error => console.error(error));
    }, []);

    // useEffect(() => {
    //     console.log(selectedWeek);
    // }, [selectedWeek]);

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
                            <Button label="Otwórz tydzień" onClick={handleOtworz}
                            className="p-button-outlined border-2 p-1 bg-white pr-2 pl-2 ml-6" />
                            <Button label="Zamknij tydzień" onClick={handleZamknij}
                            className="p-button-outlined border-2 p-1 bg-white pr-2 pl-2 ml-6" />
                            <Button label="Drukuj" onClick={handleDrukuj}
                            className="p-button-outlined border-2 p-1 bg-white pr-2 pl-2 ml-6" />
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
                        {data.map((item) => (
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
};
