const fs = require('fs');
const text = fs.readFileSync('server/index.js', 'utf8');
const lines = text.split('\n');

const start = 127; // 0-indexed line 128
const end = 1007; // 0-indexed line 1007

const explanationFunc = lines.slice(start, end).join('\n');
const gcdFunc = `
function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
}
`;

fs.writeFileSync('server/explanations.js', 'module.exports = { generateExplanation };\n' + gcdFunc + '\n' + explanationFunc + '\n');

lines.splice(start, end - start, "const { generateExplanation } = require('./explanations');");
fs.writeFileSync('server/index.js', lines.join('\n'));
console.log('Done extraction');
