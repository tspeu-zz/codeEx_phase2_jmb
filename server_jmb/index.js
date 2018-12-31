const express = require('express');

const app = express();
const bodyParser = require("body-parser");
const _ = require('lodash');
const REST_API_ROOT = '/api';

//ALLOW CORS
const allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
}
app.use(allowCrossDomain);

/* Express configuration */
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


/* Init server listening */
const server = app.listen(3003, ()=> {
    console.log('server api running at port '+ server.address().port);
});

/* Router configuration */
app.use(REST_API_ROOT, require('./api/routes/router'));