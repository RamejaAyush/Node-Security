const path = require('path');
const { Router } = require('express');
const { v4: uuidv4 } = require('uuid');
const router = Router({ mergeParams: true });
const { bigqueryInstance } = require('../Utils/bigqueryInstance');

const location = 'US';

const validateUser = async (email, role) => {
  let query = `SELECT * FROM atlantean-bebop-383507.node_api.role_requests where requester = '${email}' order by createdAt desc limit 1`;

  const queryOptions = {
    query,
    location,
  };

  console.log(`Executing: ${query}`);

  const bigquery = await bigqueryInstance('./config/config.json');
  const [job] = await bigquery.createQueryJob(queryOptions);
  const [rows] = await job.getQueryResults();

  console.table(rows);

  if (rows.length === 0) {
    return {
      success: true,
      message: `${email} can raise a request`,
      currentRole: 'null',
    };
  }

  if (rows[0].requestStatus === 'pending') {
    return {
      success: false,
      errorCode: 400,
      message: `${email} already has a request in pending state.`,
      currentRole: rows[0].currentRole,
    };
  }

  if (
    rows[0].requestStatus === 'approved' ||
    rows[0].requestStatus === 'rejected'
  ) {
    if (rows[0].currentRole === 'admin') {
      return {
        success: false,
        errorCode: 400,
        message: `${email} has already Admin role.`,
        currentRole: rows[0].currentRole,
      };
    }

    if (
      rows[0].currentRole === 'moderator' &&
      (role === 'guest' || role === 'viewer')
    ) {
      return {
        success: false,
        errorCode: 400,
        message: `${email} has already Moderator role.`,
        currentRole: rows[0].currentRole,
      };
    }

    if (rows[0].currentRole === 'guest' && role === 'viewer') {
      return {
        success: false,
        errorCode: 400,
        message: `${email} has already Guest role.`,
        currentRole: rows[0].currentRole,
      };
    }

    return {
      success: true,
      message: `${email} can make request`,
      currentRole: rows[0].currentRole,
      user: rows[0],
    };
  }
};

const insert = async (request) => {
  try {
    const row = [request];

    const bigquery = await bigqueryInstance('./config/config.json');
    await bigquery.dataset('node_api').table('role_requests').insert(row);

    return {
      success: true,
      message: `Inserted Successfully`,
    };
  } catch (e) {
    return {
      success: false,
      errorCode: 400,
      message: e,
    };
  }
};

const createRequest = async (requester, requestedRole, currentRole) => {
  const requestId = uuidv4();
  const timestamp = new Date().getTime() / 1000;

  const request = {
    requestId,
    requester,
    requestedRole,
    requestStatus: 'pending',
    currentRole,
    createdAt: timestamp,
  };

  const insertRow = await insert(request);

  if (!insertRow.success) {
    return insertRow;
  }

  return {
    success: true,
    message: `Request with Id: ${request.requestId} is raised.`,
    details: request,
  };
};

router.post('/', async (req, res) => {
  let { email, role, reason } = req.body;

  if (email && role && reason) {
    email = email.toLowerCase();
    role = role.toLowerCase();
    const canUserRaiseRequest = await validateUser(email, role);

    if (!canUserRaiseRequest.success) {
      return res.status(400).json(canUserRaiseRequest);
    }

    const raiseRequest = await createRequest(
      email,
      role,
      canUserRaiseRequest.currentRole
    );

    if (!raiseRequest.success) {
      return res.status(400).json(raiseRequest);
    }

    return res.json(raiseRequest);

    return res.sendFile(
      path.join(__dirname, '../public', 'successRaised.html')
    );
  } else {
    return res.status(400).json({
      errorCode: 400,
      message: `email, reason & role fields are required`,
    });
  }
});

module.exports = router;
