import React, { useState, useEffect } from 'react';
import { Table, Select, Button, message } from 'antd';
import axios from 'axios';
import styles from './UserRoleManager.module.css';

const { Option } = Select;

const UserRoleManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      message.error('Ошибка при загрузке пользователей');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8000/api/users/${userId}/role`, 
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      message.success('Роль успешно обновлена');
      fetchUsers(); // Обновить список пользователей
    } catch (error) {
      message.error('Ошибка при обновлении роли');
      console.error(error);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Логин',
      dataIndex: 'login',
      key: 'login',
    },
    {
      title: 'Имя',
      dataIndex: 'fname',
      key: 'fname',
    },
    {
      title: 'Фамилия',
      dataIndex: 'lname',
      key: 'lname',
    },
    {
      title: 'Отчество',
      dataIndex: 'sname',
      key: 'sname',
    },
    {
      title: 'Роль',
      dataIndex: 'role',
      key: 'role',
      render: (role, record) => (
        <Select
          defaultValue={role}
          style={{ width: 220 }}
          onChange={(value) => handleRoleChange(record.id, value)}
        >
          <Option value="Администратор">Администратор</Option>
          <Option value="Инженер 1 категории">Инженер 1 категории</Option>
          <Option value="Инженер 2 категории">Инженер 2 категории</Option>
          <Option value="Инженер 3 категории">Инженер 3 категории</Option>
          <Option value="Инженер - испытатель 3 категории">Инженер - испытатель 3 категории</Option>
          <Option value="Ведущий инженер">Ведущий инженер</Option>
        </Select>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <h2>Управление ролями пользователей</h2>
      <Table
        dataSource={users}
        columns={columns}
        rowKey="id"
        loading={loading}
      />
    </div>
  );
};

export default UserRoleManager; 