const express = require("express");
const path = require("path");
const app = express();
const child = require('child_process')

const javaClassPath = process.argv[2];

var xssEscape = require('xss-escape');
var http = require("http");
var formidable = require("formidable");
var fs = require("fs");

if (!fs.existsSync("public/encImg")){
    fs.mkdirSync("public/encImg");
}

app.get("/",function (request,response){
    response.send(`
        <DOCTYPE!>
        <html>
            <body>
                <form action="/stegEnc" method="post" enctype="multipart/form-data">
                    <label for="image">Select an image file:</label>
                    <input type="file" name="image" id="image" accept=".png">
                    <label for="message">Enter your message</label>
                    <input type="text" name="message" id="message">
                    <input type="submit">
                </form>
            </body>
        </html>
    `);
});

app.post("/stegEnc",function(request,response){
    var form = new formidable.IncomingForm();
    form.parse(request, async function (err, fields, files) {
        try {
            var nameTokens = files.image.path.split(path.sep);
            var newName = nameTokens[nameTokens.length - 1];
            var newPath = `public/encImg/${newName}.png`;
            var stegPath = `public/encImg/z${newName}.png`;
            console.log(`Created file: ${newPath}`);
            await fs.rename(files.image.path, newPath);
    
            var stegOutput = await child.spawn('java', ['-cp', javaClassPath, 'AddMsg', newPath, "LSBPerChannel", fields.message]);
            console.log(stegOutput.stdout.toString());
            console.log(stegOutput.stderr.toString());
    
            var message = xssEscape(fields.message);
            var page = `
                <html>
                    <body>
                        <p>Image uploaded!<p>
                        <p>message is: <b>${message}</b></p>
                        <img src="encImg/z${newName}.png" style="width: 50%; margin: 10px;"/>
                    </body>
                </html>
            `;
            response.send(page);
            
            fs.unlink(
                newPath,
                (err) => {
                    if (err) {
                        console.log(err);
                        throw err;
                    }
                    console.log(`Deleted file: ${stegPath}`);
                }
            );
            console.log(`Deleted file: ${newPath}`);
    
            setTimeout(() => fs.unlink(
                stegPath,
                (err) => {
                    if (err) {
                        console.log(err);
                        throw err;
                    }
                    console.log(`Deleted file: ${stegPath}`);
                }
            ), 600000);
        } catch (e) {};
    });
});

app.use(express.static(path.join(__dirname,"public")));

app.listen(2562);
console.log("Listening on http://localhost:2562");



