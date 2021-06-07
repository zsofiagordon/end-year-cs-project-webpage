const express = require("express");
const path = require("path");
const app = express();
var http = require("http");
var formidable = require("formidable");
var fs = require("fs");

app.get("/",function (request,response){
    response.send(`
        <DOCTYPE!>
        <html>
        <body>
        <form action="/steg" method="post" enctype="multipart/form-data">
            <label for="image">Select an image file:</label>
            <input type="file" name="image" id="image">
            <label for="message">Enter your message</label>
            <input type="text" name="message" id="message">
            <input type="submit">
        </form>
        </body>
        </html>
    `);
});

app.post("/steg",function(request,response){
    var form = new formidable.IncomingForm();
    form.parse(request, function (err, fields, files) {
      var tmpLocation = files.image.path;
      var newpath = 'public/img/src.png';
      fs.rename(tmpLocation, newpath, function (err) {
        if (err) throw err;
        response.write('File uploaded and moved!');
        response.end();
      });
      var message = fields.message;
        var page = `
            <html>
            <body>
            <p>Image uploaded!<p>
            <p>message is ${message}</p>
            <img src="img/src.png" style="width: 50%; margin: 10px;"/>
            </body>
            </html>
        `;
        response.send(page);
    });
});

app.use(express.static(path.join(__dirname,"public")));

app.listen(2562);
console.log("Listening on http://localhost:2562");



