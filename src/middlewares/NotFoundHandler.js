const boom = require('@hapi/boom');

function notFoundHandler(req, res) {
  const {
    output: { status, payload }
  } = boom.notFound();

  res.status(status).json(payload);
}

module.exports = notFoundHandler;