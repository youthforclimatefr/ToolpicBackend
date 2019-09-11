const express = require('express');
const router = express.Router();

const puppeteer = require('puppeteer');

const bodyParser = require(__dirname + '/bodyParser.js');
router.use(bodyParser);


module.exports = router;
