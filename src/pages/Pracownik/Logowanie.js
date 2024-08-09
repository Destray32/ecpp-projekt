import React, { useState, useEffect } from "react";

import PracLogowanieData from "../../data/PracLogowanieData";

export default function LogowaniePage() {
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [computer, setComputer] = useState("");
    const [version, setVersion] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");

    // na przyszlosc pobieranie danych z API
    useEffect(() => {
        // fetch("https://api.example.com/data")
        //     .then((response) => response.json())
        //     .then((data) => {
        //         console.log(data);
        //     });
    }, []);

    return (
        <main>
            <div className="p-4">
                <div className="outline outline-1 outline-gray-500">
                    <table className="w-full">
                        <thead className="bg-blue-700 text-white">
                            <tr>
                                <th className="border-r">Imię</th>
                                <th className="border-r">Naziwsko</th>
                                <th className="border-r">Komputer</th>
                                <th className="border-r">Wersja</th>
                                <th className="border-r">Data</th>
                                <th className="border-r">Czas</th>
                            </tr>
                        </thead>
                        <tbody className="text-center">
                            {PracLogowanieData.sampleData.map((item, i) => (
                                <tr key={i} className="border-b even:bg-gray-200 odd:bg-gray-300">
                                    <td className="border-r">{item.name}</td>
                                    <td className="border-r">{item.surname}</td>
                                    <td className="border-r">{item.computer}</td>
                                    <td className="border-r">{item.version}</td>
                                    <td className="border-r">{item.date}</td>
                                    <td className="border-r">{item.time}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    )
}