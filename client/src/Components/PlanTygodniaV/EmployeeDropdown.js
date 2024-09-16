import React, { useState, useEffect } from 'react';
import { MultiSelect } from 'primereact/multiselect';
import Axios from "axios";
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

const EmployeeDropdown = ({ onEmployeeSelect, scheduledEmployees }) => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);

  useEffect(() => {
    fetchEmployees();
  }, [scheduledEmployees]); 

  const fetchEmployees = () => {
    Axios.get("http://localhost:5000/api/pracownicy", { withCredentials: true })
      .then((response) => {
        const scheduledEmployeesArray = Array.isArray(scheduledEmployees) ? scheduledEmployees : [];

        const filteredEmployees = response.data
          .filter(pracownik => pracownik.weeklyPlan) 
          .filter(pracownik => !scheduledEmployeesArray.includes(pracownik.id));

        setEmployees(filteredEmployees.map(pracownik => ({
          label: `${pracownik.name} ${pracownik.surname}`,
          value: pracownik.id,
          weeklyPlan: pracownik.weeklyPlan,
          vacationGroup: pracownik.vacationGroup,
        })));

        const validSelectedEmployees = selectedEmployees.filter(id => filteredEmployees.some(emp => emp.value === id));
        setSelectedEmployees(validSelectedEmployees);
      })
      .catch((error) => {
        console.error("Error fetching employees:", error);
      });
  };

  const handleEmployeeChange = (e) => {
    setSelectedEmployees(e.value);
    onEmployeeSelect(e.value);
  };

  return (
    <div className="card flex justify-content-center">
      <MultiSelect
        key={employees.length}
        value={selectedEmployees}
        options={employees}
        onChange={handleEmployeeChange}
        optionLabel="label"
        placeholder=""
        className="w-96"
        display="chip"
      />
    </div>
  );
};

export default EmployeeDropdown;
