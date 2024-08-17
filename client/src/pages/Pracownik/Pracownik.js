import React, { useState, useEffect, useRef } from "react";
import { Button } from 'primereact/button';
import { Table, Input, Space, Modal } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { Link } from "react-router-dom";
import axios from "axios";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

import { font } from "../../fonts/OpenSans-Regular-normal";

export default function PracownikPage() {
  const [tableData, setTableData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
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
          placeholder={`Szukaj ${dataIndex}`}
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
    },
    {
      title: 'Nazwisko',
      dataIndex: 'surname',
      key: 'surname',
      ...getColumnSearchProps('surname'),
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
      ...getColumnSearchProps('vacationGroup'),
    },
    {
      title: 'Firma',
      dataIndex: 'company',
      filters: [
        {
          text: 'Hejmej Plat',
          value: 'Hejmej Plat',
        },
        {
          text: 'Midebygg',
          value: 'Midebygg',
        },
        {
          text: 'PC Group Sp. z o o.',
          value: 'PC Group Sp. z o o.',
        },
        {
          text: 'PC Husbyggen',
          value: 'PC Husbyggen',
        },
        {
          text: 'Polbygg',
          value: 'Polbygg',
        },
        {
          text: 'Zwolnieni',
          value: 'Zwolnieni',
        },
      ],
      onFilter: (value, record) => record.company.indexOf(value) === 0,
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
      title: 'Kierownik',
      dataIndex: 'manager',
      key: 'manager',
      ...getColumnSearchProps('manager'),
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
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/pracownicy");
            setTableData(response.data);
        } catch (error) {
            console.log(error);
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
            ['Imię', 'Nazwisko', 'Pesel', 'Grupa urlopowa', 'Firma', 'Telefon 1', 'Telefon 2', 'E-mail', 'Kierownik']
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
            employee.manager
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
    const appliedFilters = filters || {};
    const filteredDataFromTable = tableData.filter(item => {
      return Object.keys(appliedFilters).every(key => {
        const filterValues = appliedFilters[key] || [];
        if (Array.isArray(filterValues) && filterValues.length > 0) {
          const itemValue = item[key] ? item[key].toString().toLowerCase() : '';
          return filterValues.some(filterValue => filterValue.toLowerCase() === itemValue || itemValue.includes(filterValue.toLowerCase()));
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
        <Table
          columns={columns}
          dataSource={tableData}
          rowKey="id"
          scroll={{ y: 540 }}
          onChange={handleTableChange}
        />
      </div>
    </div>
  );
}