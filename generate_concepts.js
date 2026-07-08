const fs = require('fs');
const path = require('path');

const questions = [
  // EASY
  {
    id: 10001,
    concept: "Object-Oriented Programming (OOP)",
    options: [
      "A paradigm based on functions calling other functions",
      "A programming paradigm based on the concept of 'objects', which can contain data and code",
      "A hardware architecture for parallel processing",
      "A type of database design for unstructured data"
    ],
    answerOption: "B",
    answerText: "A programming paradigm based on the concept of 'objects', which can contain data and code",
    difficulty: "easy"
  },
  {
    id: 10002,
    concept: "Photosynthesis",
    options: [
      "The process used by plants to convert light energy into chemical energy",
      "The method by which cells divide into two identical cells",
      "A chemical reaction that absorbs heat from the environment",
      "The breakdown of glucose to produce cellular energy"
    ],
    answerOption: "A",
    answerText: "The process used by plants to convert light energy into chemical energy",
    difficulty: "easy"
  },
  {
    id: 10003,
    concept: "Prime Number",
    options: [
      "A number that can be divided evenly by 2",
      "A number that has exactly two distinct positive divisors: 1 and itself",
      "A number that is the square of another integer",
      "Any number greater than zero"
    ],
    answerOption: "B",
    answerText: "A number that has exactly two distinct positive divisors: 1 and itself",
    difficulty: "easy"
  },
  {
    id: 10004,
    concept: "Gravity",
    options: [
      "A force that repels objects with mass",
      "An invisible force that pulls objects toward each other",
      "A type of electromagnetic radiation",
      "The friction caused by moving through air"
    ],
    answerOption: "B",
    answerText: "An invisible force that pulls objects toward each other",
    difficulty: "easy"
  },
  {
    id: 10005,
    concept: "Variable",
    options: [
      "A fixed value that never changes during program execution",
      "A named storage location in memory that holds a value",
      "A function that returns a boolean value",
      "A type of computer hardware component"
    ],
    answerOption: "B",
    answerText: "A named storage location in memory that holds a value",
    difficulty: "easy"
  },

  // MEDIUM
  {
    id: 10006,
    concept: "Polymorphism (Computer Science)",
    options: [
      "The ability of different objects to respond to the same method call in their own way",
      "The process of hiding internal implementation details",
      "A security mechanism to prevent unauthorized access",
      "A technique for optimizing database queries"
    ],
    answerOption: "A",
    answerText: "The ability of different objects to respond to the same method call in their own way",
    difficulty: "medium"
  },
  {
    id: 10007,
    concept: "Thermodynamics (Second Law)",
    options: [
      "Energy cannot be created or destroyed, only transformed",
      "The total entropy of an isolated system can never decrease over time",
      "For every action, there is an equal and opposite reaction",
      "The acceleration of an object depends on its mass and the force applied"
    ],
    answerOption: "B",
    answerText: "The total entropy of an isolated system can never decrease over time",
    difficulty: "medium"
  },
  {
    id: 10008,
    concept: "Derivative (Calculus)",
    options: [
      "The area under a given curve",
      "The instantaneous rate of change of a function with respect to a variable",
      "A sequence of numbers where each term is the sum of the previous two",
      "The geometric center of a two-dimensional shape"
    ],
    answerOption: "B",
    answerText: "The instantaneous rate of change of a function with respect to a variable",
    difficulty: "medium"
  },
  {
    id: 10009,
    concept: "API (Application Programming Interface)",
    options: [
      "A physical cable used to connect servers",
      "A set of rules and protocols that allows different software applications to communicate",
      "A type of malware that steals personal data",
      "A graphical user interface for non-technical users"
    ],
    answerOption: "B",
    answerText: "A set of rules and protocols that allows different software applications to communicate",
    difficulty: "medium"
  },
  {
    id: 10010,
    concept: "Mitosis",
    options: [
      "A type of cell division that results in two genetically identical daughter cells",
      "A cell division process that produces four genetically diverse reproductive cells",
      "The process of a cell consuming a smaller cell or particle",
      "The spontaneous death of a cell due to damage"
    ],
    answerOption: "A",
    answerText: "A type of cell division that results in two genetically identical daughter cells",
    difficulty: "medium"
  },

  // HARD
  {
    id: 10011,
    concept: "NP-Completeness",
    options: [
      "A class of decision problems for which no efficient solution exists",
      "A class of problems where a proposed solution can be verified quickly, and any NP problem can be reduced to it",
      "A programming paradigm used to design quantum algorithms",
      "A type of network protocol used for secure data transmission"
    ],
    answerOption: "B",
    answerText: "A class of problems where a proposed solution can be verified quickly, and any NP problem can be reduced to it",
    difficulty: "hard"
  },
  {
    id: 10012,
    concept: "Heisenberg's Uncertainty Principle",
    options: [
      "The universe is constantly expanding at an accelerating rate",
      "It is impossible to simultaneously know both the exact position and momentum of a particle",
      "Time passes slower for an observer moving at high speeds relative to a stationary observer",
      "Energy is emitted in discrete packets called quanta"
    ],
    answerOption: "B",
    answerText: "It is impossible to simultaneously know both the exact position and momentum of a particle",
    difficulty: "hard"
  },
  {
    id: 10013,
    concept: "Eigenvector",
    options: [
      "A non-zero vector that changes at most by a scalar factor when a linear transformation is applied",
      "A vector whose magnitude is exactly one",
      "A vector that is perpendicular to a given plane in 3D space",
      "The resultant vector when two matrices are cross-multiplied"
    ],
    answerOption: "A",
    answerText: "A non-zero vector that changes at most by a scalar factor when a linear transformation is applied",
    difficulty: "hard"
  },
  {
    id: 10014,
    concept: "Closure (JavaScript)",
    options: [
      "A function that automatically terminates a program when an error is thrown",
      "A function bundled together with references to its surrounding lexical environment",
      "A method to close an open file stream in memory",
      "A keyword used to prevent a class from being inherited"
    ],
    answerOption: "B",
    answerText: "A function bundled together with references to its surrounding lexical environment",
    difficulty: "hard"
  },
  {
    id: 10015,
    concept: "Nash Equilibrium",
    options: [
      "A state in economics where supply exactly matches demand",
      "A solution concept in game theory where no player can benefit by changing strategies while others keep theirs unchanged",
      "A biological state where an ecosystem's population remains constant over time",
      "The point at which a chemical reaction runs equally fast in both directions"
    ],
    answerOption: "B",
    answerText: "A solution concept in game theory where no player can benefit by changing strategies while others keep theirs unchanged",
    difficulty: "hard"
  }
];

const dir = path.join(__dirname, 'concept', 'questions');

questions.forEach((q) => {
  const qFormat = {
    id: q.id,
    word: q.concept,
    question: q.concept,
    options: q.options,
    answerOption: q.answerOption,
    answerText: q.answerText,
    difficulty: q.difficulty,
    sourceFile: `c${q.id}.json`
  };
  fs.writeFileSync(path.join(dir, `c${q.id}.json`), JSON.stringify(qFormat, null, 2));
});

console.log("Successfully generated concept matching questions.");
