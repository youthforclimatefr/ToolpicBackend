const express = require('express');
const router = express.Router();
const fs = require('fs');
const puppeteer = require('puppeteer');

// Parse body up to 10mb
const bodyParser = require('body-parser');
router.use(bodyParser.json({
  limit: '10mb'
}));

// Launch Chromium browser
const browserPromise = puppeteer.launch({
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox'
  ],
  ignoreHTTPSErrors: true,
	dumpio: false
});

// Living Toolpic instance whose global scope offers the methods we will execute to render the image
const instanceRoot = 'https://toolpic.fridaysforfuture.de/__render_api.html';
//const instanceRoot = 'http://localhost:443/__render_api.html';

// Handle /eulate/format request
router.post('/:format?', async function(req, res) {

  // Get format and fall back to PNG
  const format = req.params.format || 'png';

  // Get requested JSON body
  const bodyJSON = req.body;

  // Get document description object by using the given document index from the JSON body
  const docDescriptor = bodyJSON.template.documents[bodyJSON.doc];

  // Get loaded browser instance from promise to variable
  const browser = await browserPromise;
  // Create a new page and wait for success
  const page = await browser.newPage();
  // Make background transparent (important for alpha transparency)
  page._emulationManager._client.send('Emulation.setDefaultBackgroundColorOverride', {
    color: {
      r: 0,
      g: 0,
      b: 0,
      a: 0
    }
  });

  // Set viewport to boundings of the requested document
  await page.setViewport({
    width: docDescriptor.width,
    height: docDescriptor.height
  });

  /*page.on('pageerror', error => {
    console.error(error.message);
  });*/




  // Go to living Toolpic instance for rendering process
  await page.goto(instanceRoot);

  console.log("Loaded page!");

  // Apply start() function of living Toolpic instance that does the magic and initializes the given template with the given data and properties
  const result = await page.evaluate(async function(template, docIndex, data, renderings) {

    return await start(template, docIndex, data, renderings);

  }, bodyJSON.template, bodyJSON.doc, bodyJSON.data, bodyJSON.renderings);

  console.log(result);

  // How many times the data needs to be updated to ensure that all sizes and values will be calculated correctly
  const dataUpdatesCount = 1;

  // Repeat update() function of living toolpic instance often as needed to ensure that the rendering process knows all calculated sizes and fonts
  for (var i = 0; i < dataUpdatesCount; i++) {
    // Always wait 100ms before the next update() applies
    await new Promise(function(resolve, reject) {
      setTimeout(async function() {
        await page.evaluate(async function(data) {
          return update(data);
        }, bodyJSON.data);
        resolve(true);
      }, 100);
    });
  }

  // Wait 0ms (async) to continue
  await new Promise(function(resolve, reject) {
    setTimeout(async function() {
      resolve(true);
    }, 0);
  });

  // Get SVG content
  const svg = await page.evaluate(function() {
    return document.getElementsByTagName("svg")[0].outerHTML;
  });

  //
  if (format == "svg") {
    await page.close();


    // Send 'Content-Length' header
    res.header('Content-Length', svg.length);
    res.header('Content-Type', 'image/svg+xml');
    // Send buffer back
    res.send(svg);
  }
  else if (format == "jpg") {

    const jpgBuffer = await page.screenshot({
      type: 'jpeg'
    });
    await page.close();


    // Send 'Content-Length' header
    res.header('Content-Length', jpgBuffer.length);
    res.header('Content-Type', 'image/jpeg');
    // Send buffer back
    res.write(jpgBuffer, 'binary');
    // End request
    res.end(null, 'binary');
  }
  else {
    const pngBuffer = await page.screenshot();
    await page.close();


    // Send 'Content-Length' header
    res.header('Content-Length', pngBuffer.length);
    res.header('Content-Type', 'image/png');
    // Send buffer back
    res.write(pngBuffer, 'binary');
    // End request
    res.end(null, 'binary');
  }

  const time = Date.now();

  fs.appendFile(__dirname + '/log/log.txt', time + "\n", function (err) {
    if (err) console.error(err);
  });
  console.log(time);


});


module.exports = router;
