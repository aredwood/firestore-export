const fs = require("fs");
const token = process.env["NPM_TOKEN"];

fs.writeFileSync(".npmrc",`//registry.npmjs.org/:_authToken=${token}`,{
    encoding:"utf8"
})