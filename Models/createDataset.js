const { bigqueryInstance } = require('../Utils/bigqueryInstance');

const createDataset = async (datasetName) => {
  const bigquery = await bigqueryInstance('../config/config.json');
  const result = await bigquery.createDataset(datasetName);

  return result;
};

const main = async () => {
  const result = await createDataset('node_api_test');
  console.log(`Dataset: ${result} is created`);
};

main();
