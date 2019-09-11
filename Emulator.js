const express = require('express');
const router = express.Router();

const fs = require('fs');

const puppeteer = require('puppeteer');

const bodyParser = require(__dirname + '/bodyParser.js');
router.use(bodyParser);

const browserPromise = puppeteer.launch({
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox'
  ],
  ignoreHTTPSErrors: true,
	dumpio: false
});

const instanceRoot = 'https://dev.maurice-conrad.eu/toolpic/__render.html';

router.post('/', async function(req, res) {

  const log = {
    errors: 0,
    time: {
      start: Date.now(),
      end: null
    },
    userAgent: req.headers["user-agent"]
  };

  var bodyJSON = {};
  try {
    bodyJSON = JSON.parse(req.body.toString());
  }
  catch (e) {
    res.status(500).send({
      error: "Invalid POST body"
    });
    return null;
  }

  const browser = await browserPromise;
  const page = await browser.newPage();
  page._emulationManager._client.send('Emulation.setDefaultBackgroundColorOverride', {
    color: {
      r: 0,
      g: 0,
      b: 0,
      a: 0
    }
  });

  if (!bodyJSON.template) {
    log.errors++;
    bodyJSON.template = __defaultTemplate;
  }

  const docDescriptor = bodyJSON.template.documents[bodyJSON.doc];

  await page.setViewport({
    width: docDescriptor.width,
    height: docDescriptor.height
  });

  await page.goto(instanceRoot);

  console.log("Loaded page!");


  const result = await page.evaluate(async function(template, docIndex, data) {
    return await start(template, docIndex, data);
  }, bodyJSON.template, bodyJSON.doc, bodyJSON.data);

  console.log(result);


  const pngBuffer = await page.screenshot();
  await page.close();

  log.time.end = Date.now();

  try {
    const logFile = __dirname + '/log-emulate.txt';
    fs.appendFileSync(logFile, '\n' + Date.now());
  }
  catch (e) {
    console.error(e);
  }



  // Send 'Content-Length' header
  res.header('Content-Length', pngBuffer.length);
  res.header('Content-Type', 'image/png');
  // Send buffer back
  res.write(pngBuffer, 'binary');
  // End request
  res.end(null, 'binary');


});

const __defaultTemplate = {
  "name": "Profile Picture",
  "root": "https://toolpic.fridaysforfuture.de/sharepic/templates/profile/template.json",
  "preview": "data/templates/profile/preview.svg",
  "documents": [
    {
      "width": 1200,
      "height": 1200,
      "src": "data/templates/profile/document.svg",
      "alias": "1:1"
    }
  ],
  "fonts": [
    {
      "name": "Jost-600",
      "src": "fonts/Jost/Jost-600-Semi.ttf",
      "mime": "font/truetype"
    }
  ],
  "fields": [
    {
      "type": "selection",
      "description": "Background",
      "key": "pic",
      "default": {
        "value": "data/templates/influence/bg.jpg"
      },
      "properties": {
        "items": [
          {
            "type": "file"
          }
        ]
      }
    },
    {
      "type": "number",
      "description": "Scale",
      "key": "scale",
      "default": 0.7,
      "properties": {
        "value": 0.7,
        "max": 1,
        "min": 0.6,
        "step": 0.01,
        "kind": "slider"
      }
    },
    {
      "type": "line",
      "description": "Hashtag",
      "key": "hashtag",
      "default": "#AllForClimate",
      "properties": {

      }
    }
  ]
};

module.exports = router;
