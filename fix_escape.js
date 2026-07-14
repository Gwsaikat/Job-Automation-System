const fs = require('fs');
let code = fs.readFileSync('src/lib/cv/template.ts', 'utf8');

const searchStr = 'export const MASTER_CV_LATEX = String.raw`';
let startIdx = code.indexOf(searchStr);

if (startIdx !== -1) {
  let before = code.substring(0, startIdx);
  let latexPart = code.substring(startIdx + searchStr.length);
  let closingIdx = latexPart.lastIndexOf('`');
  latexPart = latexPart.substring(0, closingIdx);
  
  // Replace single backslash with double
  let escaped = latexPart.replace(/\\/g, '\\\\');
  
  let newCode = before + 'export const MASTER_CV_LATEX = `\n' + escaped + '\n`;\n';
  fs.writeFileSync('src/lib/cv/template.ts', newCode);
  console.log('Fixed latex escaping!');
} else {
  console.log('Could not find search string');
}
