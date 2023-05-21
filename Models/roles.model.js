const { createTable } = require('../Utils/createTable');

const createRoleTable = async () => {
  const location = 'US';
  const tableName = 'role_requests';
  const datasetName = 'node_api';

  const schema = [
    { name: 'requestId', type: 'STRING', mode: 'NULLABLE' },
    { name: 'requester', type: 'STRING', mode: 'NULLABLE' },
    { name: 'requestedRole', type: 'STRING', mode: 'NULLABLE' },
    { name: 'requestStatus', type: 'STRING', mode: 'NULLABLE' },
    { name: 'requestReason', type: 'STRING', mode: 'NULLABLE' },
    { name: 'currentRole', type: 'STRING', mode: 'NULLABLE' },
    { name: 'admin', type: 'STRING', mode: 'NULLABLE' },
    { name: 'actionMessage', type: 'STRING', mode: 'NULLABLE' },
    { name: 'createdAt', type: 'TIMESTAMP', mode: 'NULLABLE' },
  ];

  const tableOptions = {
    location,
    schema,
  };

  const table = await createTable(tableName, datasetName, tableOptions);

  return table;
};

createRoleTable();
