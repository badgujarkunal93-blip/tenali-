const fs = require('fs');

const appJsx = fs.readFileSync('/Users/ghost/phase 2 ten/tenali/client/src/App.jsx', 'utf8');

const vocabStartIndex = appJsx.indexOf('function VocabApp({ onBack }) {');
const vocabEndIndex = appJsx.indexOf('\n}\n\n', vocabStartIndex) + 2;

const vocabAppStr = appJsx.substring(vocabStartIndex, vocabEndIndex);

// Replace specific parts to create ConceptApp
let conceptAppStr = vocabAppStr
  .replace(/function VocabApp/g, 'function ConceptApp')
  .replace(/VOCAB_SEEN_KEY/g, 'CONCEPT_SEEN_KEY')
  .replace(/tenali_vocab_seen/g, 'tenali_concept_seen')
  .replace(/loadVocabSeen/g, 'loadConceptSeen')
  .replace(/saveVocabSeen/g, 'saveConceptSeen')
  .replace(/\/vocab-api\//g, '/concept-api/')
  .replace(/submitVocab/g, 'submitConcept')
  .replace(/<h2>Vocabulary Builder<\/h2>/g, '<h2>Concept Matching</h2>');

// Insert it right after VocabApp
const newAppJsx = appJsx.slice(0, vocabEndIndex) + '\n\n' + conceptAppStr + appJsx.slice(vocabEndIndex);

fs.writeFileSync('/Users/ghost/phase 2 ten/tenali/client/src/App.jsx', newAppJsx);
console.log('App.jsx updated with ConceptApp!');
