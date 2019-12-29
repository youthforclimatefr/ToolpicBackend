# Toolpic API

## Emulate

```bash
$ POST https://api.fridaysforfuture.de/emulate/png
```

There exist **3** supported output formats: `png` (default), `jpg` & `svg`.

### Body

To render a template, you have to pass 4 properties:

1. `template`: A *template description object* that describes the template completely
2. `doc`: The *document format index* that points to the specific document of the given template you want to render (e.g. *Twitter* or *Instagram, Facebook*)
3. `data`: Object containing the raw data you want to pass to the template
4. `renderings`: (not recommended) Amount how many times you want to update the data to ensure that everything is loaded

### Example

**Note**: This example saves the rendered image to `test.jpg` of your current working directory!

```bash
curl 'https://api.fridaysforfuture.de:65324/emulate/jpg' \
-XPOST \
-H 'Content-Type: application/json' \
-H 'Content-Length: 1869' \
-H 'Connection: keep-alive' \
--data-binary '{"template":{"name":"Pride","root":"https://toolpic.fridaysforfuture.de/sharepic/templates/pride/template.json","preview":"data/templates/pride/preview.jpg","type":"jpg","documents":[{"width":1200,"height":1200,"src":"data/templates/pride/1200x1200.svg","alias":"Facebook, Instagram"},{"width":1200,"height":675,"src":"data/templates/pride/1200x675.svg","alias":"Twitter"}],"fonts":[{"name":"Jost-300","src":"fonts/Jost/Jost-300-Light.ttf","mime":"font/truetype"},{"name":"Jost-700","src":"fonts/Jost/Jost-700-Bold.ttf","mime":"font/truetype"}],"fields":[{"type":"Selection","description":"Background","key":"backgroundImage","default":{"data":"data/templates/pride/bg.jpg"},"properties":{"items":[{"type":"file"}]}},{"type":"Checklist","description":"Effekte","key":"effects","default":[true],"properties":{"fields":["Verdunkelt"]}},{"type":"Number","description":"Position","key":"pos","default":0,"properties":{"value":0,"max":1,"min":-1,"step":0.05,"kind":"slider"}},{"type":"Line","description":"Subtitle","key":"subtitle","default":"Fridays For Future Germany","properties":{}},{"type":"Text","description":"Text","key":"text","default":["CELEBRATES","PRIDE MONTH"],"properties":{}},{"type":"Text","description":"Links & Hashtags","key":"links","default":["www.fridaysforfuture.de","#fridaysforfuture"],"properties":{}},{"type":"Selection","description":"Logo","key":"logo","default":"data/resources/logo.svg","properties":{"mime":"image/png","width":200,"height":200,"items":[{"type":"value","value":"data/resources/logo-2.svg"},{"type":"value","value":"data/resources/logo.svg"},{"type":"file"}]}}]},"doc":0,"data":{"backgroundImage":{"data":"data/templates/pride/bg.jpg"},"effects":[true],"pos":0,"subtitle":"API works great!","text":["RENDER","TEST"],"links":["api.fridaysforfuture.de","#developersforfuture"],"logo":"data/resources/logo.svg"},"renderings":1}' -o test.jpg
```
## Install

### Setup for development 

First, download the scripts and install dependencies

```bash
git clone https://github.com/youthforclimatefr/ToolpicBackend.git
cd ToolpicBackend
npm install
```

Then you can run ToolpicBackend

```bash
node .
```

### Compile with pkg

```bash
pkg -t linux --out-path bin server.js
cp -R node_modules/puppeteer/.local-chromium bin/puppeteer
```

It creates a binary file for Linux in the ``bin`` directory. Make sure to have the puppeteer folder next to the binary file.