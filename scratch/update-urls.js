const fs = require('fs');
const path = require('path');

function replaceInFiles(dir, search, replace) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      replaceInFiles(filePath, search, replace);
    } else if (filePath.endsWith('.ts')) {
      let content = fs.readFileSync(filePath, 'utf8');
      if (content.includes(search)) {
        content = content.replace(new RegExp(search, 'g'), replace);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
      }
    }
  }
}

replaceInFiles(
  path.join(__dirname, '../angular-client/src'), 
  'http://localhost:5000', 
  'https://wall-painter.onrender.com'
);
