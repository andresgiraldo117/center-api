const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const app = express();
const routerUsers = require('./routes/index');
const { logErrors, wrapErrors, errorHandler } = require("./middlewares/ErrorHandler");
const path = require('path');

//DataBase
require('./db');

//Middlewares
app.use(cors());
app.use(helmet());
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));
app.use(morgan('dev'));

//Routes
app.use('/', routerUsers);

//ErrorHanddler
app.use(logErrors);
app.use(wrapErrors);
app.use(errorHandler);

module.exports = app;