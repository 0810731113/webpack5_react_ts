const path = require('path');
// const os = require('os');
const fs = require('fs');
console.log(process.cwd());
const srcArr = [];
const srcFiles = fs.readdirSync(path.resolve(process.cwd(), './src'),{ withFileTypes :true});
// console.log(srcFiles);
srcFiles.map((item) => {
 //console.log(item.name,item.isDirectory());
  if(item.isDirectory()){
    srcArr.push(item.name);
  }
  return item;
});

// console.log(srcArr);

module.exports = {
  srcArr,
};


