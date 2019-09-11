(async function() {
  var start = Date.now();

  const endpoint = 'https://render.fridaysforfuture.de:65324/emulate';
  //const endpoint = 'http://localhost:65324/emulate'

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      template: {
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
      },
      doc: 0,
      data: {
        "pic": {
          "value": 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj4KICA8Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI1MCIgc3R5bGU9ImZpbGw6ICNmMDA7IiAvPgo8L3N2Zz4='
        },
        "scale": 0.5,
        "hashtag": 'Hello World'
      }
    })
  });



  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);

  var end = Date.now();

  console.log(end - start);

  console.log(blobUrl);

  document.body.innerHTML = `
    <img src="${ blobUrl }"/>
  `;

})();
