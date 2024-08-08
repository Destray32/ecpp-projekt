import React, { useEffect, useState } from 'react';

export default function TydzienInput ({setSelectedWeek}) {

    const [value, setValue] = useState(1);

    const increment = () => {
        setValue(prevValue => prevValue + 1);
    };

    const decrement = () => {
        setValue(prevValue => Math.max(prevValue - 1, 1)); // żeby min tydzień był 1
    };

    useEffect(() => {
        setSelectedWeek(value);
    }, [value]);

    return (
        <div className="flex gap-4">
            <button onClick={decrement}>{"<<"}</button>
            <span>{"Tydzień " + value}</span>
            <button onClick={increment}>{">>"}</button>
        </div>
    );

}