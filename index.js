/* jshint esversion: 8 */
var express = require('express');
var cors = require('cors');
var path = require('path');
var app = express();
var port = process.env.PORT || 8084;

const changePassword = require('./apis/changePassword');
const createUser = require('./apis/createUser');
const login = require('./apis/login');
const lostPassword = require('./apis/lostPassword');
const resetPassword = require('./apis/resetPassword');
const verifyUser = require('./apis/verifyUser');




let corsOptions = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
};

app.use(express.json());

// Register Routes
var router = express.Router();
router.use(cors(corsOptions));

router
    .route('/changePassword')
    .post(cors(corsOptions), (req, res) => changePassword.handler(req.body, res));

router
    .route('/createUser')
    .post(cors(corsOptions), (req, res) => createUser.handler(req.body, res));

router
    .route('/login')
    .post(cors(corsOptions), (req, res) => login.handler(req.body, res));

router
    .route('/lostPassword')
    .post(cors(corsOptions), (req, res) => lostPassword.handler(req.body, res));

router
    .route('/resetPassword')
    .post(cors(corsOptions), (req, res) => resetPassword.handler(req.body, res));

router
    .route('/verifyUser')
    .post(cors(corsOptions), (req, res) => verifyUser.handler(req.body, res));

app.use('/', router);

// Start Server
app.listen(port);
console.log('start node at port ' + port + '...');
