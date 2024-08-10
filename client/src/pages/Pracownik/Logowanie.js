import React, { useState, useEffect } from "react";
import axios from "axios";

export default function LogowaniePage() {
    const [logData, setLogData] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:5000/api/logi")
            .then((response) => {
                setLogData(response.data);
            })
            .catch((error) => {
                console.log(error);
            });
    }
    , []);

    return (
        <main>
            <div className="p-2">
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
                            {logData.map((item, i) => (
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