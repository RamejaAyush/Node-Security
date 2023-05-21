const { createTable } = require('../Utils/createTable');

const createRoleTable = async () => {
  const location = 'US';
  const tableName = 'users';
  const datasetName = 'node_api';

  const schema = [
    { name: 'id', type: 'STRING', mode: 'REQUIRED' },
    { name: 'username', type: 'STRING', mode: 'REQUIRED' },
    { name: 'password', type: 'STRING', mode: 'NULLABLE' },
    { name: 'email', type: 'STRING', mode: 'REQUIRED' },
    { name: 'SSOUser', type: 'BOOLEAN', mode: 'REQUIRED' },
    { name: 'createdAt', type: 'TIMESTAMP', mode: 'REQUIRED' },
  ];

  const tableOptions = {
    location,
    schema,
  };

  const table = await createTable(tableName, datasetName, tableOptions);

  return table;
};

createRoleTable();
