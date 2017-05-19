const csv = require('csvtojson')
const fs = require('fs')
const mountains = './csv/mountains.csv';

let mountainJson = []

const writeToFile = (jsonObj) => {
  fs.writeFileSync('../json/mountains.json', jsonObj, (err) => {
    if (err) throw err;
    console.log('The file has been saved!');
  })
};

csv().fromFile(mountains)
     .on('json', (jsonObj) => {
       var jsonPretty = JSON.stringify(jsonObj, null, ',');
       mountainJson.push(jsonPretty)
      })
      .on('done',(error)=>{
        writeToFile(mountainJson)
        console.log(error)
      })
