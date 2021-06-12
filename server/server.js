const express = require("express");
const path = require("path");
const app = express();
const spawn = require('await-spawn')

const javaClassPath = process.argv[2];
const encImgDir = "public/encImg";


var xssEscape = require('xss-escape');
var http = require("http");
var formidable = require("formidable");
var fs = require("fs");

if (!fs.existsSync(encImgDir)) fs.mkdirSync(encImgDir);
else for (let file of fs.readdirSync(encImgDir)) fs.unlinkSync(path.join(encImgDir, file));

app.get("/",function (request,response){
    response.send(`
        <DOCTYPE!>
        <html>
            <head>
                <link rel="stylesheet" href="/index.scss">
                <script src="index.js"></script>
            </head>
            <body onload="doOnLoad()">
                <div id="form-wrapper">
                    <form action="/stegEnc" method="post" enctype="multipart/form-data">
                        <label for="image">Select an image file:</label>
                        <div id="drop-area">
                            <input type="file" id="image" name="image" accept=".png" onchange="loadFile(event)">
                            <label class="button" for="image">Select file</label>
                            <br>
                            <img id="output"/>
                        </div>
                        
                        <label for="message">Enter your message</label>
                        <input type="text" name="message" id="message">
                        <input type="submit" id="submit">
                    </form>
                </div>
                <script src="index.js"></script>
            </body>
        </html>
    `);
});

app.post("/stegEnc",function(request,response){
    var form = new formidable.IncomingForm();
    form.parse(request, async function (err, fields, files) {
        try {
            console.log("Request recieved!");
            var nameTokens = files.image.path.split(path.sep);
            var newName = nameTokens[nameTokens.length - 1];
            var newPath =  `${encImgDir}/${newName}.png`;
            var stegPath = `${encImgDir}/z${newName}.png`;
            console.log(`Created file: ${newPath}`);
            await fs.promises.rename(files.image.path, newPath);
    
            try {
                await spawn('java', ['-cp', javaClassPath, 'AddMsg', newPath, "LSBPerChannel", fields.message], {stdio: "inherit"});
            } catch (e) {
                console.error(e);
            }
    
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
                        return;
                    }
                    console.log(`Deleted file: ${newPath}`);
                }
            );
    
            setTimeout(() => fs.unlink(
                stegPath,
                (err) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    console.log(`Deleted file: ${stegPath}`);
                }
            ), 600000);
        } catch (e) {
            console.log(e);
        };
    });
});

app.use(express.static(path.join(__dirname,"public")));

app.listen(2562);
console.log("Listening on http://localhost:2562");



