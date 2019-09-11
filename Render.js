const express = require('express');
const router = express.Router();

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

const formatHandlers = {
  async pdf(body) {
    const browser = await browserPromise;

    const page = await browser.newPage();

    const svgContext = body.toString("base64");
    const dataUrl = 'data:image/svg+xml;base64,' + svgContext;
    await page.goto(dataUrl);

    const pdfBuffer = await page.pdf({
      format: 'A4'
    });

    await page.close();

    return {
      contentType: "application/pdf",
      buffer: pdfBuffer
    };
  },
  async png(body) {
    const bodyStr = body.toString("utf8");

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

    const viewBoxMatch = Array.from(bodyStr.match(/viewBox="[0-9]{1,} [0-9]{1,} ([0-9]{1,}) ([0-9]{1,})"/)).slice(1).map(Number);

    await page.setViewport({
      width: viewBoxMatch[0],
      height: viewBoxMatch[1]
    });

    const svgContext = body.toString("base64");
    const dataUrl = 'data:image/svg+xml;base64,' + svgContext;
    await page.goto(dataUrl);

    const pngBuffer = await page.screenshot();

    await page.close();

    return {
      contentType: "image/png",
      buffer: pngBuffer
    };
  },
  async multipdf(body) {
    const browser = await browserPromise;
    const page = await browser.newPage();

    const svgStrs = JSON.parse(body.toString()).slice(0, 2);
    const dataUrls = svgStrs.map(str => ('data:image/svg+xml;base64,' + str));

    const svgContexts = svgStrs.map(str => Buffer.from(str, "base64").toString());

    const styleSheets = [];
    for (var i = 0; i < svgContexts.length; i++) {
      const stylePos = {
        start: svgContexts[i].search(/<style>/),
        end: svgContexts[i].search(/<\/style>/) + 8
      };
      const styleOuter = svgContexts[i].substring(stylePos.start, stylePos.end);
      styleSheets.push(styleOuter);
      //svgContexts[i] = svgContexts[i].substring(0, stylePos.start) + svgContexts[i].substring(stylePos.end);
    }

    const htmlInner = svgContexts.map(context => {
      return `
        <div class="page">
          ` + context + `
        </div>
      `;
    }).join("");

    const htmlInnerAlt = dataUrls.map(url => {
      return `
        <div class="page">
          <img src="` + url + `"/>
        </div>
      `;
    }).join("");

    const htmlDataUrl = 'data:text/html;base64,' + Buffer.from(`
      <html>
        <head>
          <style>
            body {
              margin: 0;
              padding: 0;
            }
            .page {

            }
          </style>
          `
          +
          /*styleSheets.join("")
          +*/
          `
        </head>
        <body>
          <h1>Hallo Welt!</h1>
        </body>
      </html>
      `).toString("base64");

    await page.goto(htmlDataUrl);

    const res = await page.evaluate(htmlInner => {
      document.body.innerHTML = htmlInner;
      return document.body.innerHTML;
    }, htmlInnerAlt);


    console.log("!");

    const pdfBuffer = await page.pdf({
      format: 'A4'
    });

    await page.close();

    return {
      contentType: "application/pdf",
      buffer: pdfBuffer
    };
  }
};

router.post('/:format', async function(req, res) {
  const format = req.params.format;

  const result = await formatHandlers[format](req.body);



  // Send 'Content-Length' header
  res.header('Content-Length', result.buffer.length);
  res.header('Content-Type', result.contentType);
  // Send buffer back
  res.write(result.buffer, 'binary');
  // End request
  res.end(null, 'binary');


});


module.exports = router;
