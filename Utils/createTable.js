const { bigqueryInstance } = require('../Utils/bigqueryInstance');

const createTable = async (tableName, datasetName, tableOptions) => {
  const bigquery = await bigqueryInstance('../config/config.json');

  const result = await bigquery
    .dataset(datasetName)
    .createTable(tableName, tableOptions);

  return result;
};

module.exports = {
  createTable,
};
