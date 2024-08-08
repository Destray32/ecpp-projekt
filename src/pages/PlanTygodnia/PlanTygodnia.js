import React, { useState, useEffect } from "react";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { DatePicker, Space } from 'antd';

import TydzienInput from "../../Components/TydzienInput";

import "primereact/resources/themes/lara-light-cyan/theme.css";

const { RangePicker } = DatePicker;

export default function PlanTygodniaPage() {
    const [availableGroups, setAvailableGroups] = useState(['wszyscy', 'inne']);
    const [group, setGroup] = useState('wszyscy');
    const [selectedWeek, setSelectedWeek] = useState(1); // selected week ustawiany w TydzienInput
    const [dateRange, setDateRange] = useState([null, null]);

    // useEffect(() => {
    //     console.log(group);
    // }, [group]);

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
        console.log('od: ', dateStrings[0], ', do: ', dateStrings[1]);
        setDateRange([dateStrings[0], dateStrings[1]]);
    };

    return (
        <div className="w-auto h-auto m-2 p-3 bg-amber-100 outline outline-1
         outline-gray-500 flex flex-row items-center space-x-4">
            <div className="w-3/4 h-72 flex flex-col space-y-2 items-start">
                <div className="h-full">
                    <div className="h-full flex flex-col justify-around">
                        <div className="flex flex-row gap-32 items-center">
                            <TydzienInput setSelectedWeek={setSelectedWeek}/>
                            <RangePicker onChange={handlePickerChange}/>
                            <span>{ (dateRange[0] && dateRange[1]) && (dateRange[0] + '  -  ' + dateRange[1])}</span>
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
    )
}