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
  }, [scheduledEmployees]); // Ensure fetchOptions runs whenever scheduledEmployees changes

  const fetchOptions = async () => {
    try {
      // Fetch both employees and vehicles
      const [employeesRes, vehiclesRes] = await Promise.all([
        Axios.get(`https://api-service-ecpp.onrender.com/api/pracownicy`, { withCredentials: true }),
        Axios.get(`https://api-service-ecpp.onrender.com/api/pracownik/pojazdy`, { withCredentials: true })
      ]);
  
      const VehiclesArray = Array.isArray(vehiclesRes.data) ? vehiclesRes.data : [];
      const EmployeesArray = Array.isArray(employeesRes.data) ? employeesRes.data : [];
      const scheduledEmployeesArray = scheduledEmployees || { employees: [], vehicles: [] };
      const scheduledEmployeeIds = new Set((scheduledEmployeesArray.employees || []).map(e => e.id));
      const scheduledVehicleIds = new Set((scheduledEmployeesArray.vehicles || []).map(v => v.idPojazdy));
  
      const filteredVehicles = VehiclesArray
        .filter((vehicle) => !scheduledVehicleIds.has(vehicle.idPojazdy))
        .map((vehicle) => ({
          label: `${vehicle.Nr_rejestracyjny}`,
          value: `vehicle-${vehicle.idPojazdy}`,
          type: 'vehicle',
        }));
  
      const filteredEmployees = EmployeesArray
        .filter((employee) => employee.weeklyPlan) 
        .filter((employee) => !scheduledEmployeeIds.has(employee.id))
        .map((employee) => ({
          label: `${employee.name} ${employee.surname}`,
          value: `employee-${employee.id}`, 
          type: 'employee',
          weeklyPlan: employee.weeklyPlan,
          vacationGroup: employee.vacationGroup,
        }));
  
      const combinedOptions = [...filteredEmployees, ...filteredVehicles];
      setOptions(combinedOptions);
  
      const validSelectedItems = selectedItems.filter((item) =>
        combinedOptions.some((opt) => opt.value === item)
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
        placeholder="Wybierz pracownika/pojazd"
        className="w-96"
        display="chip"
        emptyMessage='Brak dostępnych pracowników/pojazdów'
        itemTemplate={itemTemplate}
      />
    </div>
  );
};

export default EmployeeDropdown;
