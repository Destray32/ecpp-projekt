import React, { useState, useEffect } from 'react';
import { MultiSelect } from 'primereact/multiselect';
import Axios from "axios";
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

const EmployeeDropdown = ({ onEmployeeSelect, scheduledEmployees }) => {
  const [options, setOptions] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    fetchOptions();
  }, [scheduledEmployees]);

  const fetchOptions = async () => {
    try {
      const [employeesRes, vehiclesRes] = await Promise.all([
        Axios.get('http://localhost:5000/api/pracownicy', { withCredentials: true }),
        Axios.get('http://localhost:5000/api/pracownik/pojazdy', { withCredentials: true })
      ]);

      const VehiclesArray = Array.isArray(vehiclesRes.data) ? vehiclesRes.data : [];
      const filteredVehicles = VehiclesArray
      .filter((vehicle) => !scheduledEmployees.includes(vehicle.idPojazdy))
      .map((vehicle) => ({
        label: `${vehicle.Nr_rejestracyjny}`,
        value: `vehicle-${vehicle.idPojazdy}`,
        type: 'vehicle',
      }));

      const scheduledEmployeesArray = Array.isArray(scheduledEmployees) ? scheduledEmployees : [];
      const filteredEmployees = employeesRes.data
        .filter((employee) => employee.weeklyPlan)
        .filter((employee) => !scheduledEmployeesArray.includes(employee.id))
        .map((employee) => ({
          label: `${employee.name} ${employee.surname}`,
          value: `employee-${employee.id}`, 
          type: 'employee',
          weeklyPlan: employee.weeklyPlan,
          vacationGroup: employee.vacationGroup,
        }));

      setOptions([...filteredEmployees, ...filteredVehicles]);


      const validSelectedItems = selectedItems.filter((item) =>
        [...filteredVehicles, ...filteredEmployees].some((opt) => opt.value === item)
      );
      setSelectedItems(validSelectedItems);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const handleSelectionChange = (e) => {
    setSelectedItems(e.value);
    onEmployeeSelect(e.value);
  };

  const itemTemplate = (option) => (
    <div>
      {option.type === 'employee' ? (
        <span>👤 {option.label}</span>
      ) : (
        <span>🚗 {option.label}</span>
      )}
    </div>
  );

  return (
    <div className="card flex justify-content-center">
      <MultiSelect
        value={selectedItems}
        options={options}
        onChange={handleSelectionChange}
        optionLabel="label"
        placeholder=""
        className="w-96"
        display="chip"
        emptyMessage='Brak dostępnych pracowników/pojazdów'
        itemTemplate={itemTemplate}
      />
    </div>
  );
};

export default EmployeeDropdown;
