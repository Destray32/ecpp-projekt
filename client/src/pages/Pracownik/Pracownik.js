import React, { useState, useEffect, useRef } from "react";
import { Button } from 'primereact/button';
import { Table, Input, Space, Modal, ConfigProvider, Select, Form } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import plPL from 'antd/es/locale/pl_PL';
import Highlighter from 'react-highlight-words';
import { Link } from "react-router-dom";
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

import EditableCell from '../../Components/EditableCells';

import { font } from "../../fonts/OpenSans-Regular-normal";

const { Option } = Select;

export default function PracownikPage() {
  const [tableData, setTableData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [firms, setFirms] = useState([]);
  const [groups, setGroups] = useState([]);
  const searchInput = useRef(null);

  const showConfirmModal = (id) => {
    setDeleteId(id);
    setIsModalVisible(true);
  };

  const handleOk = () => {
    if (deleteId) {
      handleDelete(deleteId);
      setDeleteId(null);
    }
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleDelete = (id) => {
    axios.delete(`http://localhost:5000/api/pracownik/${id}`)
      .then((response) => {
        console.log(response);
        fetchEmployees();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
  };

  const getColumnSearchProps = dataIndex => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={node => {
            searchInput.current = node;
          }}
          placeholder={`Szukaj`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Szukaj
          </Button>
          <Button onClick={() => handleReset(clearFilters)} size="small" style={{ width: 90 }}>
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        : '',
    onFilterDropdownOpenChange: visible => {
      if (visible) {
        setTimeout(() => searchInput.current.select());
      }
    },
    render: text =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const columns = [
    {
      title: 'Imię',
      dataIndex: 'name',
      key: 'name',
      ...getColumnSearchProps('name'),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Nazwisko',
      dataIndex: 'surname',
      key: 'surname',
      ...getColumnSearchProps('surname'),
      sorter: (a, b) => a.surname.localeCompare(b.surname),
    },
    {
      title: 'Pesel',
      dataIndex: 'pesel',
      key: 'pesel',
      ...getColumnSearchProps('pesel'),
    },
    {
      title: 'Grupa urlopowa',
      dataIndex: 'vacationGroup',
      key: 'vacationGroup',
      editable: true,
      filters: groups.map(group => ({
        text: group.name,
        value: group.id,
      })),
      onFilter: (value, record) => record.vacationGroup === value,
      render: (text, record) => (
        <EditableCell
          title="Grupa urlopowa"
          editable
          selectOptions={groups}
          record={record}
          onSave={handleSave}
        >
          {text}
        </EditableCell>
      ),
    },
    {
      title: 'Firma',
      dataIndex: 'company',
      key: 'company',
      editable: true,
      filters: firms.map(firm => ({
        text: firm.name,
        value: firm.name,
      })),
      onFilter: (value, record) => record.company === value,
      render: (text, record) => (
        <EditableCell
          title="Firma"
          editable
          selectOptions={firms}
          record={record}
          onSave={handleSave}
        >
          {text}
        </EditableCell>
      ),
    },
    {
      title: 'Telefon',
      dataIndex: 'phone1',
      key: 'phone1',
      ...getColumnSearchProps('phone1'),
    },
    {
      title: 'Telefon',
      dataIndex: 'phone2',
      key: 'phone2',
      ...getColumnSearchProps('phone2'),
    },
    {
      title: 'E-mail',
      dataIndex: 'email',
      key: 'email',
      ...getColumnSearchProps('email'),
    },
    {
      title: 'Akcje',
      key: 'action',
      render: (text, record) => (
        <span>
          <Link to={`/home/edytuj-pracownika/${record.id}`}>
            <Button className="bg-blue-500 text-white p-1 mx-1">Edytuj</Button>
          </Link>
          <Modal
            title="Potwierdź usunięcie"
            open={isModalVisible}
            onOk={handleOk}
            onCancel={handleCancel}
            okText="Tak"
            cancelText="Nie"
          >
            <p>Czy na pewno chcesz usunąć ten rekord?</p>
          </Modal>
          <Button onClick={() => showConfirmModal(record.id)} className="bg-red-500 text-white p-1 mx-1">Usuń</Button>
        </span>
      ),
    },
  ];

  useEffect(() => {
    fetchEmployees();
    fetchFirms();
    fetchGroups();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/pracownicy");
      setTableData(response.data);
      console.log(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchFirms = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/pracownik/firmy");
      setFirms(response.data.map(firm => ({
        id: firm.idFirma,
        name: firm.Nazwa_firmy
      })));
    } catch (error) {
      console.log(error);
    }
  };
  
  const fetchGroups = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/pracownik/grupy");
      setGroups(response.data.map(group => ({
        id: group.idGrupa_urlopowa,
        name: group.Zleceniodawca
      })));
    } catch (error) {
      console.log(error);
    }
  };

  const handleSave = async (id, field, value) => {
    try {
        await axios.put(`http://localhost:5000/api/pracownik/komorka/${id}`, {
            field: field,
            value: value,
        });
        setTableData(prevData => prevData.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    } catch (error) {
        console.error('Update failed:', error);
    }
};

  const printPDF = () => {
    const doc = new jsPDF('landscape');

    doc.setFont("OpenSans-Regular", "normal");
    doc.setFontSize(18);
    doc.text('Lista Pracowników', 14, 12);

    const dataToPrint = filteredData.length > 0 ? filteredData : tableData;

    doc.autoTable({
      head: [
        ['Imię', 'Nazwisko', 'Pesel', 'Grupa urlopowa', 'Firma', 'Telefon 1', 'Telefon 2', 'E-mail']
      ],
      body: dataToPrint.map(employee => [
        employee.name,
        employee.surname,
        employee.pesel,
        employee.vacationGroup,
        employee.company,
        employee.phone1,
        employee.phone2,
        employee.email,
      ]),
      margin: { top: 20 },
      tableWidth: 'auto',
      styles: {
        font: "OpenSans-Regular",
        halign: 'center'
      },
      headStyles: {
        font: "OpenSans-Regular",
        fontStyle: "bold"
      }
    });
    doc.save('lista-pracownikow.pdf');
  };

  const handleTableChange = (pagination, filters, sorter) => {
    let sortedData = [...tableData];
  
    if (sorter.order) {
      sortedData.sort((a, b) => {
        if (sorter.order === 'ascend') {
          return sorter.field === 'name' ? a.name.localeCompare(b.name) : a.surname.localeCompare(b.surname);
        }
        return sorter.field === 'name' ? b.name.localeCompare(a.name) : b.surname.localeCompare(a.surname);
      });
    }
  
    const appliedFilters = filters || {};
    const filteredDataFromTable = sortedData.filter(item => {
      return Object.keys(appliedFilters).every(key => {
        const filterValues = appliedFilters[key] || [];
        if (Array.isArray(filterValues) && filterValues.length > 0) {
          const itemValue = item[key] ? item[key].toString().toLowerCase() : '';
          return filterValues.some(filterValue => {
            const filterValueString = filterValue.toString().toLowerCase();
            return itemValue.includes(filterValueString);
          });
        }
        return true;
      });
    });
  
    setFilteredData(filteredDataFromTable);
  };

  return (
    <div>
      <div className="w-full md:w-auto h-full m-2 p-3 bg-amber-100 outline outline-1 outline-gray-500 flex flex-row items-center space-x-4">
        <div className="flex flex-col space-y-2 items-start">
          <div className="w-full h-2/6">
            <div className="w-full flex flex-row items-center p-4">
              <p>Szukaj pracownika</p>
              <Link to="/home/zmien-dane">
                <Button label="Zmień swoje dane" className="bg-white outline outline-1 outline-gray-500 p-2 mx-2" />
              </Link>
              <Link to="/home/dodaj-pracownika">
                <Button label="Dodaj pracownika" className="bg-white outline outline-1 outline-gray-500 p-2 mx-2" />
              </Link>
              <Button onClick={printPDF} label="Drukuj listę" className="bg-white outline outline-1 outline-gray-500 p-2 mx-2" />
            </div>
          </div>
        </div>
      </div>
      <div className="w-full md:w-auto bg-gray-300 m-2 outline outline-1 outline-gray-500">
        <ConfigProvider locale={plPL}>
          <Table
            components={{
              body: {
                cell: EditableCell,
              },
            }}
            columns={columns}
            dataSource={tableData}
            rowKey="id"
            scroll={{ y: 540 }}
            onChange={handleTableChange}
          />
        </ConfigProvider>
      </div>
    </div>
  );
}