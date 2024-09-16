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

  const fetchOptions = () => {
    Promise.all([
      Axios.get('http://localhost:5000/api/pracownik/pojazdy', { withCredentials: true }),
      Axios.get('http://localhost:5000/api/pracownicy', { withCredentials: true })
    ])
    .then(([vehiclesRes, employeesRes]) => {
      const VehiclesArray = Array.isArray(vehiclesRes.data) ? vehiclesRes.data : [];
      const filteredVehicles = VehiclesArray.map((vehicle) => ({
        label: `${vehicle.Nr_rejestracyjny}`,
        value: vehicle.idPojazdy,
        type: 'vehicle',
      }));

      const scheduledEmployeesArray = Array.isArray(scheduledEmployees) ? scheduledEmployees : [];
      const filteredEmployees = employeesRes.data
        .filter((employee) => employee.weeklyPlan)
        .filter((employee) => !scheduledEmployeesArray.includes(employee.id))
        .map((employee) => ({
          label: `${employee.name} ${employee.surname}`,
          value: employee.id,
          type: 'employee',
          weeklyPlan: employee.weeklyPlan,
          vacationGroup: employee.vacationGroup,
        }));

      setOptions([...filteredVehicles, ...filteredEmployees]);

      // Ensure that selectedItems only contains valid options
      const validSelectedItems = selectedItems.filter((item) =>
        [...filteredVehicles, ...filteredEmployees].some((opt) => opt.value === item)
      );
      setSelectedItems(validSelectedItems);
    })
    .catch((err) => {
      console.error("Error fetching data:", err);
    });
  };

  const handleSelectionChange = (e) => {
    console.log('Selected items:', e.value); // Debugging log
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
        placeholder="Select..."
        className="w-96"
        display="chip"
        itemTemplate={itemTemplate} // Custom rendering for each item
      />
    </div>
  );
};

export default EmployeeDropdown;
