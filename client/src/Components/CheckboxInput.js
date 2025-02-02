import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';

const CheckboxInput = ({ label, value, onChangeCheckBox, onChangeInput }) => {
    const [checked, setChecked] = useState(false);

    const handleChange = () => {
        setChecked(!checked);
        onChangeCheckBox(!checked);
    };



    return (
        <div className="flex items-center">
            <input
                type="checkbox"
                className="mr-2 w-8 h-8 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                checked={checked}
                onChange={handleChange}
            />
            <InputText
                placeholder={label}
                className="ml-4 md:w-14rem p-4"
                onChange={onChangeInput}
            />
        </div>
    );
};

export default CheckboxInput;