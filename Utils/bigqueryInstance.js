const { BigQuery } = require('@google-cloud/bigquery');

const bigqueryInstance = async (path) => {
  const authenticateOptions = {
    keyFilename: path,
    projectId: 'atlantean-bebop-383507',
  };

  const bigquery = new BigQuery(authenticateOptions);

  return bigquery;
};

module.exports = {
  bigqueryInstance,
};
