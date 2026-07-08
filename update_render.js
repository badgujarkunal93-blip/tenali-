const fs = require('fs');

const appJsx = fs.readFileSync('/Users/ghost/phase 2 ten/tenali/client/src/App.jsx', 'utf8');

// 1. Add to regularApps
const regularAppsString = "const regularApps = [\n";
const conceptAppDef = "    { key: 'concept', name: 'Concept Matching', subtitle: 'Match unique concepts to definitions', color: 'purple' },\n";
let newAppJsx = appJsx.replace(regularAppsString, regularAppsString + conceptAppDef);

// 2. Add to switch statement / render condition
// We look for: `if (selectedApp === 'vocab') return <VocabApp onBack={() => setSelectedApp(null)} />`
const vocabRender = "if (selectedApp === 'vocab') return <VocabApp onBack={() => setSelectedApp(null)} />";
const conceptRender = "if (selectedApp === 'concept') return <ConceptApp onBack={() => setSelectedApp(null)} />\n  ";
newAppJsx = newAppJsx.replace(vocabRender, vocabRender + "\n  " + conceptRender);

fs.writeFileSync('/Users/ghost/phase 2 ten/tenali/client/src/App.jsx', newAppJsx);
console.log('App.jsx updated with ConceptApp rendering logic!');
