import React, { useState, useEffect } from 'react';
import './LcmHcfApp.css';

// ==========================================================================
// CONFIGURATION & REWARDS DEFINITION
// ==========================================================================

const COLLECTIBLE_THEMES = {
  1: {
    name: 'Cute Animals',
    items: [
      { id: 'c1', name: 'Lion Cub', emoji: '🦁', desc: 'Roars with curiosity!' },
      { id: 'c2', name: 'Koala Bear', emoji: '🐨', desc: 'LOVES logic and leaves.' },
      { id: 'c3', name: 'Playful Dolphin', emoji: '🐬', desc: 'Jumps over multiples!' },
      { id: 'c4', name: 'Wise Owl', emoji: '🦉', desc: 'Hoot! HCF is a breeze.' },
      { id: 'c5', name: 'Golden Retriever', emoji: '🐶', desc: 'Always fetches the right answer!' }
    ]
  },
  2: {
    name: 'Space Tokens',
    items: [
      { id: 'c1', name: 'Cosmic Star', emoji: '⭐', desc: 'Shining prime energy!' },
      { id: 'c2', name: 'Mars Explorer', emoji: '🚀', desc: 'Mapping factors in orbit.' },
      { id: 'c3', name: 'Saturn Ring', emoji: '🪐', desc: 'Loops around multiples infinitely.' },
      { id: 'c4', name: 'Meteor Stone', emoji: '☄️', desc: 'Blasts through prime factorization!' },
      { id: 'c5', name: 'Orion Nebula', emoji: '🌌', desc: 'The birthplace of cosmic math.' }
    ]
  },
  3: {
    name: 'Magic Gems',
    items: [
      { id: 'c1', name: 'Ruby of Wisdom', emoji: '❤️', desc: 'Glows with the truth of primes.' },
      { id: 'c2', name: 'Sapphire of Logic', emoji: '💙', desc: 'Arranges factors in perfect harmony.' },
      { id: 'c3', name: 'Emerald of Curiosity', emoji: '💚', desc: 'Expands your mathematical mind.' },
      { id: 'c4', name: 'Amethyst of Reason', emoji: '💜', desc: 'Perfect alignment of LCM and HCF.' },
      { id: 'c5', name: 'Diamond of Mastery', emoji: '💎', desc: 'The ultimate symbol of math excellence.' }
    ]
  }
};

// Order of steps:
// 0: Age select
// 1: Prime Numbers
// 2: Factors
// 3: Prime Factors
// 4: LCM
// 5: HCF
// 6: How to Find LCM
// 7: How to Find HCF
// 8: Solving Methods
// 9: Confidence Meter
// 10: Quiz
// 11: Collectibles Reward Bank
const STEPS_META = [
  { id: 'start', label: 'Start' },
  { id: 'prime', label: 'Prime Numbers' },
  { id: 'factors', label: 'Factors' },
  { id: 'pfactors', label: 'Prime Factors' },
  { id: 'lcm', label: 'LCM' },
  { id: 'hcf', label: 'HCF' },
  { id: 'find_lcm', label: 'Find LCM' },
  { id: 'find_hcf', label: 'Find HCF' },
  { id: 'methods', label: 'Methods' },
  { id: 'confidence', label: 'Confidence' },
  { id: 'quiz', label: 'Quiz' },
  { id: 'bank', label: 'Rewards' }
];

export default function InteractiveLcmHcfApp({ onBack }) {
  // --- Core State ---
  const [level, setLevel] = useState(null); // 1, 2, or 3
  const [currentStep, setCurrentStep] = useState(0); // 0 to 11
  const [currentSlide, setCurrentSlide] = useState(0); // 0: Flashcard, 1: Animation, 2: Activity, 3: Explanation/Why

  // --- Left Drawer (Why Panel) State ---
  const [whyOpen, setWhyOpen] = useState(false);
  const [whyAnswer, setWhyAnswer] = useState('');
  const [whyFeedback, setWhyFeedback] = useState(null); // { correct: bool, text: string }
  const [unlockedCollectibles, setUnlockedCollectibles] = useState({}); // { level_stepIndex: bool }

  // --- Confidence State ---
  const [, setConfidence] = useState(null); // 'very', 'mod', 'not'
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionOption, setRevisionOption] = useState(null); // 'not' or 'mod'

  // --- Quiz State ---
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState('');
  const [quizFeedback, setQuizFeedback] = useState(null); // { correct: bool, display: string }
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizHistory, setQuizHistory] = useState([]);

  // --- Activity State Helpers ---
  const [activityState, setActivityState] = useState({});

  // Reset slide index when step changes
  useEffect(() => {
    setCurrentSlide(0);
    setWhyOpen(false);
    setWhyAnswer('');
    setWhyFeedback(null);
    setActivityState({});
  }, [currentStep]);

  // Save/Load progress to localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('tenali-lcmhcf-progress');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.unlockedCollectibles) setUnlockedCollectibles(parsed.unlockedCollectibles);
      }
    } catch (e) {
      console.error('Failed to load HCF/LCM progress:', e);
    }
  }, []);

  const saveProgress = (updatedCollectibles) => {
    try {
      localStorage.setItem('tenali-lcmhcf-progress', JSON.stringify({
        unlockedCollectibles: updatedCollectibles
      }));
    } catch (e) {
      console.error('Failed to save HCF/LCM progress:', e);
    }
  };

  // Check if current concept's collectible is unlocked
  const isCurrentCollectibleUnlocked = () => {
    if (currentStep < 1 || currentStep > 8) return false;
    return !!unlockedCollectibles[`${level}_${currentStep}`];
  };

  // Helper: GCD and LCM
  const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
  const lcm = (a, b) => Math.abs(a * b) / gcd(a, b);

  // Dynamic numbers based on age level
  const getAdaptiveNumber = (type) => {
    if (level === 1) {
      if (type === 'prime_factors') return 12;
      if (type === 'lcm_pair') return [3, 4];
      if (type === 'hcf_pair') return [6, 8];
    } else if (level === 2) {
      if (type === 'prime_factors') return 48;
      if (type === 'lcm_pair') return [12, 18];
      if (type === 'hcf_pair') return [12, 18];
    } else {
      if (type === 'prime_factors') return 180;
      if (type === 'lcm_pair') return [15, 20];
      if (type === 'hcf_pair') return [45, 60];
    }
    return null;
  };

  // ==========================================================================
  // EXPLANATION & TRY-IT-OUT QUESTIONS DATA
  // ==========================================================================
  const getWhyData = (stepIndex) => {
    switch (stepIndex) {
      case 1:
        return {
          title: 'Why Prime Numbers?',
          explanation: 'Prime numbers are like the "atoms" of mathematics. Just like every molecule is made of atoms, every whole number greater than 1 is either a prime itself or can be built by multiplying prime numbers together. This is called the Fundamental Theorem of Arithmetic!',
          example: 'Take 30. It is not prime, but we can write it as 2 × 3 × 5. These are all prime numbers! You cannot break 2, 3, or 5 down any further. They are the building blocks.',
          question: 'Which of the following is a prime number?',
          options: ['9', '15', '29', '33'],
          answer: '29',
          hint: 'A prime number can only be divided by 1 and itself. 9 is 3×3, 15 is 3×5, and 33 is 3×11.'
        };
      case 2:
        return {
          title: 'Why Factors?',
          explanation: 'Factors tell us how we can split things up into equal, whole groups without any leftovers. If a number divides another number perfectly, it is a factor. Knowing factors helps you share things equally or arrange things in perfect rows.',
          example: 'If you have 12 cookies, the factors of 12 (1, 2, 3, 4, 6, 12) tell you all the ways you can share them. You can give 3 cookies to 4 friends, or 6 cookies to 2 friends, without breaking any cookies!',
          question: 'What is the sum of all factors of 6?',
          inputPlaceholder: 'e.g. 12',
          answer: '12',
          hint: 'The factors of 6 are 1, 2, 3, and 6. Add them together: 1 + 2 + 3 + 6.'
        };
      case 3:
        return {
          title: 'Why Prime Factors?',
          explanation: 'Every composite number has exactly ONE unique set of prime factors. It is like the number\'s unique biological DNA or barcode. No two numbers have the same prime factors. This makes analyzing large numbers much easier!',
          example: 'The prime factorization of 12 is 2 × 2 × 3 (or 2² × 3). No other number in the universe has this exact combination of prime numbers!',
          question: 'What is the largest prime factor of 20?',
          options: ['2', '4', '5', '10'],
          answer: '5',
          hint: 'Break 20 down: 20 = 2 × 10 = 2 × 2 × 5. The prime factors are 2 and 5. Which is larger?'
        };
      case 4:
        return {
          title: 'Why LCM?',
          explanation: 'LCM stands for Lowest Common Multiple. It helps us find when two repeating events will happen at the same time. If something happens every 3 days and another every 4 days, they line up at their multiples. The first place they align is the LCM!',
          example: 'If Bus A leaves every 6 minutes and Bus B every 8 minutes, they will leave together at the LCM of 6 and 8, which is 24 minutes.',
          question: 'Find the LCM of 4 and 10.',
          inputPlaceholder: 'e.g. 20',
          answer: '20',
          hint: 'List multiples of 4: 4, 8, 12, 16, 20, 24... List multiples of 10: 10, 20, 30... What is the first number they share?'
        };
      case 5:
        return {
          title: 'Why HCF?',
          explanation: 'HCF (Highest Common Factor) is the largest size you can divide different groups of items into so that every group has the same amount and there are no leftovers. It represents the greatest shared division.',
          example: 'If you have 12 red pens and 18 blue pens, and you want to pack them into identical sets, the HCF of 12 and 18 is 6. You can make 6 sets, each containing 2 red pens and 3 blue pens.',
          question: 'Find the HCF of 15 and 25.',
          inputPlaceholder: 'e.g. 5',
          answer: '5',
          hint: 'Factors of 15 are 1, 3, 5, 15. Factors of 25 are 1, 5, 25. The common factors are 1 and 5. Which is the highest?'
        };
      case 6:
        return {
          title: 'Why listing multiples is not enough?',
          explanation: 'Listing multiples works well for small numbers, but as numbers get larger, listing multiples becomes very tedious and you might miss the match. That is why we learn structured methods like Prime Factorization to calculate it directly.',
          example: 'To find the LCM of 48 and 72, listing multiples (48, 96, 144... and 72, 144) is okay, but for 120 and 150, listing is very slow.',
          question: 'What is the LCM of 9 and 12?',
          inputPlaceholder: 'e.g. 36',
          answer: '36',
          hint: 'Multiples of 12: 12, 24, 36, 48. Multiples of 9: 9, 18, 27, 36. 36 is the first common multiple.'
        };
      case 7:
        return {
          title: 'Why listing factors is not enough?',
          explanation: 'Similar to LCM, finding factors of very large numbers by listing is extremely slow and easy to mess up. Structured division and prime factorization are guaranteed to give you the highest common factor without having to list dozens of numbers.',
          example: 'Finding the factors of 144 and 240 by hand takes a long time. Using prime factors, we can extract the HCF (48) in seconds.',
          question: 'What is the HCF of 24 and 40?',
          inputPlaceholder: 'e.g. 8',
          answer: '8',
          hint: 'Factors of 24: 1, 2, 3, 4, 6, 8, 12, 24. Factors of 40: 1, 2, 4, 5, 8, 10, 20, 40. The largest common factor is 8.'
        };
      case 8:
        return {
          title: level === 3 ? 'Why use Long Division for HCF?' : 'Why use Prime Factorization?',
          explanation: level === 3 
            ? 'Long division (also known as the Euclidean Algorithm) is the fastest way in the world to find the HCF of extremely large numbers. Instead of breaking them down into primes, you divide the larger by the smaller. The remainder is guaranteed to share the same HCF. You repeat until the remainder is 0!'
            : 'Prime factorization breaks numbers down into their base mathematical elements. Once you have the prime factors, finding HCF is just taking the lowest powers of shared primes, and LCM is taking the highest powers of all primes. It is clean and systematic!',
          example: level === 3
            ? 'For 45 and 60: 60 ÷ 45 = 1 remainder 15. Then divide the old divisor by the remainder: 45 ÷ 15 = 3 remainder 0. The last divisor, 15, is the HCF!'
            : 'For 12 = 2² × 3 and 18 = 2 × 3². Common prime factors: 2 and 3. HCF = 2¹ × 3¹ = 6. LCM = 2² × 3² = 36.',
          question: 'Find the HCF of 36 and 90 using your level method.',
          inputPlaceholder: 'e.g. 18',
          answer: '18',
          hint: 'For HCF, find the largest number that divides both 36 and 90. 18 × 2 = 36, 18 × 5 = 90.'
        };
      default:
        return null;
    }
  };

  // ==========================================================================
  // INTERACTIVE ACTIVITIES IMPLEMENTATION
  // ==========================================================================

  // Submit handler for Why Panel (Try-It-Out)
  const handleWhySubmit = (e) => {
    if (e) e.preventDefault();
    const data = getWhyData(currentStep);
    if (!data) return;

    const isCorrect = whyAnswer.trim().toLowerCase() === data.answer.toLowerCase();
    if (isCorrect) {
      setWhyFeedback({ correct: true, text: 'Awesome! That is correct. You unlocked a collectible!' });
      const newCollectibles = { ...unlockedCollectibles, [`${level}_${currentStep}`]: true };
      setUnlockedCollectibles(newCollectibles);
      saveProgress(newCollectibles);
    } else {
      setWhyFeedback({ correct: false, text: `Not quite! Hint: ${data.hint}` });
    }
  };

  // 1. Prime Numbers Activity: Click the primes
  const renderPrimeActivity = () => {
    const numbers = [2, 4, 5, 8, 9, 11, 12, 13, 15, 17, 18, 19, 21, 23, 25, 27, 29, 30, 31, 33];
    const primes = [2, 5, 11, 13, 17, 19, 23, 29, 31];
    
    const clicked = activityState.clickedPrimes || [];
    const wrong = activityState.wrongPrimes || [];
    const done = clicked.length === primes.length;

    const handleSelect = (n) => {
      if (done) return;
      if (primes.includes(n)) {
        if (!clicked.includes(n)) {
          const next = [...clicked, n];
          setActivityState({ ...activityState, clickedPrimes: next });
        }
      } else {
        if (!wrong.includes(n)) {
          const next = [...wrong, n];
          setActivityState({ ...activityState, wrongPrimes: next });
          setTimeout(() => {
            setActivityState(prev => ({
              ...prev,
              wrongPrimes: prev.wrongPrimes.filter(x => x !== n)
            }));
          }, 800);
        }
      }
    };

    return (
      <div className="activity-box">
        <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>
          {done ? '🎉 Congratulations! You found all the Prime Numbers!' : `Click on all the Prime Numbers (${clicked.length}/${primes.length})`}
        </p>
        <div className="prime-hunter-grid">
          {numbers.map(n => {
            let className = 'prime-hunter-cell';
            if (clicked.includes(n)) className += ' prime-correct';
            else if (wrong.includes(n)) className += ' composite-wrong';
            else if (done && !primes.includes(n)) className += ' composite-missed';
            return (
              <div key={n} className={className} onClick={() => handleSelect(n)}>
                {n}
              </div>
            );
          })}
        </div>
        {done && <p style={{ color: 'var(--clr-correct)', fontWeight: 'bold' }}>Click "Next" to continue!</p>}
      </div>
    );
  };

  // 2. Factors Activity: Find factors of 12
  const renderFactorsActivity = () => {
    const target = 12;
    const allOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12];
    const correctFactors = [1, 2, 3, 4, 6, 12];
    
    const selected = activityState.selectedFactors || [];
    const done = correctFactors.every(f => selected.includes(f)) && selected.every(f => correctFactors.includes(f));

    const toggleFactor = (n) => {
      let next;
      if (selected.includes(n)) {
        next = selected.filter(x => x !== n);
      } else {
        next = [...selected, n];
      }
      setActivityState({ ...activityState, selectedFactors: next });
    };

    return (
      <div className="activity-box">
        <p style={{ fontWeight: 'bold', marginBottom: '12px' }}>
          Select all the factors of <span style={{ color: 'var(--clr-accent)', fontSize: '1.2rem' }}>{target}</span>:
        </p>
        <div className="factor-rainbow-grid">
          {allOptions.map(n => {
            const isSel = selected.includes(n);
            const isFact = correctFactors.includes(n);
            let className = 'factor-bubble';
            if (done && isFact) className += ' paired';
            else if (isSel) className += ' selected';
            return (
              <div key={n} className={className} onClick={() => toggleFactor(n)}>
                {n}
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: '20px' }}>
          {done ? (
            <p style={{ color: 'var(--clr-correct)', fontWeight: 'bold' }}>
              🎉 Perfect! {correctFactors.join(', ')} are all the factors of 12! Click "Next".
            </p>
          ) : (
            <p style={{ color: 'var(--clr-text-soft)', fontSize: '0.85rem' }}>
              Select factors: {selected.join(', ')}
            </p>
          )}
        </div>
      </div>
    );
  };

  // 3. Prime Factors Activity: Factor Tree builder for 18
  const renderPrimeFactorsActivity = () => {
    // 18 splits into 2 and 9, 9 splits into 3 and 3
    const step = activityState.treeStep || 0; // 0: start, 1: split 18, 2: split 9, 3: completed
    
    return (
      <div className="activity-box" style={{ minHeight: '260px' }}>
        <p style={{ fontWeight: 'bold', marginBottom: '12px' }}>
          Let's build a Factor Tree to find the prime factors of <span style={{ color: 'var(--clr-accent)' }}>18</span>:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Root node */}
          <div className="tree-node-circle">18</div>

          {step >= 1 && (
            <div className="tree-branches">
              <div className="tree-node-wrapper">
                <div className="tree-node-circle prime">2</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--clr-accent)', marginTop: '4px' }}>Prime!</div>
              </div>
              <div className="tree-node-wrapper">
                <div className="tree-node-circle" style={step >= 2 ? { background: 'var(--clr-badge)' } : { borderStyle: 'dashed' }}>
                  {step >= 2 ? '9' : '?'}
                </div>
                {step < 2 && (
                  <button 
                    onClick={() => setActivityState({ ...activityState, treeStep: 2 })}
                    style={{ marginTop: '6px', padding: '4px 8px', fontSize: '0.75rem', cursor: 'pointer' }}
                  >
                    18 = 2 × ?
                  </button>
                )}
              </div>
            </div>
          )}

          {step >= 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '12px' }}>
              <div className="tree-branches">
                <div className="tree-node-wrapper">
                  <div className="tree-node-circle prime">{step >= 3 ? '3' : '?'}</div>
                  {step === 2 && (
                    <button 
                      onClick={() => setActivityState({ ...activityState, treeStep: 3 })}
                      style={{ marginTop: '6px', padding: '4px 8px', fontSize: '0.75rem', cursor: 'pointer' }}
                    >
                      9 = 3 × ?
                    </button>
                  )}
                  {step >= 3 && <div style={{ fontSize: '0.75rem', color: 'var(--clr-accent)', marginTop: '4px' }}>Prime!</div>}
                </div>
                <div className="tree-node-wrapper">
                  <div className="tree-node-circle prime">{step >= 3 ? '3' : '?'}</div>
                  {step >= 3 && <div style={{ fontSize: '0.75rem', color: 'var(--clr-accent)', marginTop: '4px' }}>Prime!</div>}
                </div>
              </div>
            </div>
          )}

          {step === 0 && (
            <button 
              onClick={() => setActivityState({ ...activityState, treeStep: 1 })}
              style={{ marginTop: '16px', padding: '8px 16px', cursor: 'pointer' }}
            >
              Start Splitting 18
            </button>
          )}

          {step === 3 && (
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <p style={{ color: 'var(--clr-correct)', fontWeight: 'bold' }}>
                🎉 Completed! The Prime Factors of 18 are 2 and 3.
              </p>
              <p style={{ fontSize: '0.9rem', color: 'var(--clr-text-soft)' }}>
                18 = 2 × 3 × 3 (or 2 × 3²)
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 4. LCM Activity: Jumps on number line to find LCM of 3 and 4
  const renderLcmActivity = () => {
    const jumps3 = activityState.jumps3 || 0;
    const jumps4 = activityState.jumps4 || 0;
    
    const pos3 = jumps3 * 3;
    const pos4 = jumps4 * 4;

    const maxVal = 16;
    
    // Check if they matched at LCM
    const matched = pos3 > 0 && pos3 === pos4;
    const isLcm = matched && pos3 === 12;

    const jump = (val) => {
      if (val === 3 && pos3 < maxVal) {
        setActivityState({ ...activityState, jumps3: jumps3 + 1 });
      } else if (val === 4 && pos4 < maxVal) {
        setActivityState({ ...activityState, jumps4: jumps4 + 1 });
      }
    };

    const reset = () => {
      setActivityState({ ...activityState, jumps3: 0, jumps4: 0 });
    };

    // Calculate SVG coordinates
    const getX = (val) => 20 + (val / maxVal) * (610 - 40);

    return (
      <div className="activity-box">
        <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>
          Find where jumps of <span style={{ color: '#4facfe' }}>3</span> and <span style={{ color: '#e29ffb' }}>4</span> meet!
        </p>

        <svg className="jump-chart-svg" viewBox="0 0 610 120">
          {/* Main line */}
          <line x1="20" y1="90" x2="590" y2="90" stroke="var(--clr-text)" strokeWidth="2" />
          
          {/* Ticks and Labels */}
          {Array.from({ length: maxVal + 1 }).map((_, i) => (
            <g key={i}>
              <line x1={getX(i)} y1="85" x2={getX(i)} y2="95" className="jump-tick" />
              <text x={getX(i)} y="110" className="jump-label">{i}</text>
            </g>
          ))}

          {/* Arcs for 3 */}
          {Array.from({ length: jumps3 }).map((_, i) => {
            const start = i * 3;
            const end = start + 3;
            const x1 = getX(start);
            const x2 = getX(end);
            const r = (x2 - x1) / 2;
            const path = `M ${x1} 90 A ${r} ${r} 0 0 1 ${x2} 90`;
            return <path key={`3_${i}`} d={path} className="jump-arc" stroke="#4facfe" />;
          })}

          {/* Arcs for 4 */}
          {Array.from({ length: jumps4 }).map((_, i) => {
            const start = i * 4;
            const end = start + 4;
            const x1 = getX(start);
            const x2 = getX(end);
            const r = (x2 - x1) / 2;
            const path = `M ${x1} 90 A ${r} ${r} 0 0 1 ${x2} 90`;
            return <path key={`4_${i}`} d={path} className="jump-arc" stroke="#e29ffb" style={{ strokeDasharray: '4,4' }} />;
          })}
        </svg>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '12px' }}>
          <button 
            onClick={() => jump(3)} 
            disabled={pos3 >= maxVal || isLcm}
            style={{ background: '#4facfe', color: '#fff', opacity: pos3 >= maxVal ? 0.5 : 1 }}
          >
            Jump 3 (+3) = {pos3 + 3}
          </button>
          <button 
            onClick={() => jump(4)} 
            disabled={pos4 >= maxVal || isLcm}
            style={{ background: '#e29ffb', color: '#1a1614', opacity: pos4 >= maxVal ? 0.5 : 1 }}
          >
            Jump 4 (+4) = {pos4 + 4}
          </button>
          <button onClick={reset} style={{ background: 'transparent', borderColor: 'var(--clr-border)' }}>
            Reset
          </button>
        </div>

        {matched && (
          <div style={{ marginTop: '12px' }}>
            {isLcm ? (
              <p style={{ color: 'var(--clr-correct)', fontWeight: 'bold' }}>
                🎉 Yes! They meet at 12. This is the Lowest Common Multiple (LCM)! Click "Next".
              </p>
            ) : (
              <p style={{ color: 'var(--clr-wrong)', fontWeight: 'bold' }}>
                They met at {pos3}, but is that the smallest? Keep going or reset!
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  // 5. HCF Activity: Venn Diagram sorting of factors of 12 and 18
  const renderHcfActivity = () => {
    // Factors of 12: 1, 2, 3, 4, 6, 12
    // Factors of 18: 1, 2, 3, 6, 9, 18
    // Intersection: 1, 2, 3, 6 -> HCF is 6
    const leftOnly = [4, 12];
    const rightOnly = [9, 18];
    const both = [1, 2, 3, 6];

    const currentPlacements = activityState.placements || {}; // { num: 'pool' | 'left' | 'right' | 'both' }
    
    // Initialize placements if not set
    const allNums = [1, 2, 3, 4, 6, 9, 12, 18];
    if (Object.keys(currentPlacements).length === 0) {
      const initial = {};
      allNums.forEach(n => { initial[n] = 'pool'; });
      setActivityState({ ...activityState, placements: initial });
      return null;
    }

    const setPlacement = (num, place) => {
      const next = { ...currentPlacements, [num]: place };
      setActivityState({ ...activityState, placements: next });
    };

    // Check if sorted correctly
    const isCorrect = allNums.every(n => {
      const p = currentPlacements[n];
      if (leftOnly.includes(n)) return p === 'left';
      if (rightOnly.includes(n)) return p === 'right';
      if (both.includes(n)) return p === 'both';
      return false;
    });

    const getItems = (place) => allNums.filter(n => currentPlacements[n] === place);

    return (
      <div className="activity-box" style={{ minHeight: '380px' }}>
        <p style={{ fontWeight: 'bold', marginBottom: '4px' }}>
          Sort factors into the Venn Diagram:
        </p>
        <p style={{ fontSize: '0.82rem', color: 'var(--clr-text-soft)', marginBottom: '12px' }}>
          Left: Factors of 12 only. Right: Factors of 18 only. Middle: Shared factors of both.
        </p>

        <div className="venn-container">
          <div className="venn-circle left">
            <div className="venn-title">Factors of 12</div>
            {getItems('left').map(n => (
              <span key={n} style={{ cursor: 'pointer', margin: '2px', fontWeight: 'bold' }} onClick={() => setPlacement(n, 'pool')}>{n}</span>
            ))}
          </div>

          <div className="venn-circle right">
            <div className="venn-title">Factors of 18</div>
            {getItems('right').map(n => (
              <span key={n} style={{ cursor: 'pointer', margin: '2px', fontWeight: 'bold' }} onClick={() => setPlacement(n, 'pool')}>{n}</span>
            ))}
          </div>

          <div className="venn-overlap">
            <div className="venn-title" style={{ top: '-16px', color: 'var(--clr-accent)' }}>Both</div>
            {getItems('both').map(n => (
              <span key={n} style={{ cursor: 'pointer', margin: '2px', fontWeight: 'bold', color: 'var(--clr-accent)' }} onClick={() => setPlacement(n, 'pool')}>{n}</span>
            ))}
          </div>
        </div>

        {/* Pool of items */}
        <div className="venn-factors-pool">
          {getItems('pool').map(n => (
            <div key={n} style={{ display: 'flex', flexDirection: 'column', gap: '4px', border: '1px solid var(--clr-border)', padding: '6px', borderRadius: '6px' }}>
              <span style={{ fontWeight: 'bold', textAlign: 'center' }}>{n}</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button style={{ padding: '2px 4px', fontSize: '0.7rem' }} onClick={() => setPlacement(n, 'left')}>12</button>
                <button style={{ padding: '2px 4px', fontSize: '0.7rem' }} onClick={() => setPlacement(n, 'both')}>Both</button>
                <button style={{ padding: '2px 4px', fontSize: '0.7rem' }} onClick={() => setPlacement(n, 'right')}>18</button>
              </div>
            </div>
          ))}
        </div>

        {isCorrect && (
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <p style={{ color: 'var(--clr-correct)', fontWeight: 'bold' }}>
              🎉 Excellent! You sorted them perfectly. The HCF is 6 (the largest shared factor). Click "Next".
            </p>
          </div>
        )}
      </div>
    );
  };

  // 6. How to Find LCM Activity: Click common multiples
  const renderHowToFindLcmActivity = () => {
    const listA = [3, 6, 9, 12, 15, 18, 21, 24];
    const listB = [4, 8, 12, 16, 20, 24];
    const common = [12, 24];

    const selected = activityState.selectedLcmMults || [];
    const done = common.every(c => selected.includes(c)) && selected.length === common.length;

    const select = (val) => {
      if (done) return;
      if (common.includes(val)) {
        if (!selected.includes(val)) {
          setActivityState({ ...activityState, selectedLcmMults: [...selected, val] });
        }
      } else {
        // wrong selection
        alert(`Oops! ${val} is not a multiple of BOTH 3 and 4.`);
      }
    };

    return (
      <div className="activity-box">
        <p style={{ fontWeight: 'bold', marginBottom: '12px' }}>
          Select the common multiples in these two lists:
        </p>
        <div style={{ textAlign: 'left', background: 'var(--clr-input)', padding: '12px', borderRadius: '8px' }}>
          <div style={{ marginBottom: '8px' }}>
            <strong>Multiples of 3:</strong>{' '}
            {listA.map(n => (
              <span 
                key={n} 
                onClick={() => select(n)}
                style={{ 
                  margin: '0 4px', 
                  padding: '2px 6px', 
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  background: selected.includes(n) ? 'var(--clr-correct-bg)' : 'transparent',
                  border: selected.includes(n) ? '1px solid var(--clr-correct)' : 'none'
                }}
              >
                {n}
              </span>
            ))}
          </div>
          <div>
            <strong>Multiples of 4:</strong>{' '}
            {listB.map(n => (
              <span 
                key={n} 
                onClick={() => select(n)}
                style={{ 
                  margin: '0 4px', 
                  padding: '2px 6px', 
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  background: selected.includes(n) ? 'var(--clr-correct-bg)' : 'transparent',
                  border: selected.includes(n) ? '1px solid var(--clr-correct)' : 'none'
                }}
              >
                {n}
              </span>
            ))}
          </div>
        </div>
        {done && (
          <p style={{ color: 'var(--clr-correct)', fontWeight: 'bold', marginTop: '16px' }}>
            🎉 Yes! The shared multiples are 12 and 24. The Lowest Common Multiple is 12. Click "Next".
          </p>
        )}
      </div>
    );
  };

  // 7. How to Find HCF Activity: Find HCF of 8 and 20 by selecting factors
  const renderHowToFindHcfActivity = () => {
    const factors8 = [1, 2, 4, 8];
    const factors20 = [1, 2, 4, 5, 10, 20];
    const common = [1, 2, 4];

    const selected = activityState.selectedHcfFacts || [];
    const done = common.every(c => selected.includes(c)) && selected.length === common.length;

    const select = (val) => {
      if (done) return;
      if (common.includes(val)) {
        if (!selected.includes(val)) {
          setActivityState({ ...activityState, selectedHcfFacts: [...selected, val] });
        }
      } else {
        alert(`Oops! ${val} is not a factor of BOTH 8 and 20.`);
      }
    };

    return (
      <div className="activity-box">
        <p style={{ fontWeight: 'bold', marginBottom: '12px' }}>
          Select the common factors in these two lists:
        </p>
        <div style={{ textAlign: 'left', background: 'var(--clr-input)', padding: '12px', borderRadius: '8px' }}>
          <div style={{ marginBottom: '8px' }}>
            <strong>Factors of 8:</strong>{' '}
            {factors8.map(n => (
              <span 
                key={n} 
                onClick={() => select(n)}
                style={{ 
                  margin: '0 4px', 
                  padding: '2px 6px', 
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  background: selected.includes(n) ? 'var(--clr-correct-bg)' : 'transparent',
                  border: selected.includes(n) ? '1px solid var(--clr-correct)' : 'none'
                }}
              >
                {n}
              </span>
            ))}
          </div>
          <div>
            <strong>Factors of 20:</strong>{' '}
            {factors20.map(n => (
              <span 
                key={n} 
                onClick={() => select(n)}
                style={{ 
                  margin: '0 4px', 
                  padding: '2px 6px', 
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  background: selected.includes(n) ? 'var(--clr-correct-bg)' : 'transparent',
                  border: selected.includes(n) ? '1px solid var(--clr-correct)' : 'none'
                }}
              >
                {n}
              </span>
            ))}
          </div>
        </div>
        {done && (
          <p style={{ color: 'var(--clr-correct)', fontWeight: 'bold', marginTop: '16px' }}>
            🎉 Great! The common factors are 1, 2, and 4. The Highest Common Factor is 4. Click "Next".
          </p>
        )}
      </div>
    );
  };

  // 8. Solving Methods Activity (Dependent on Level)
  const renderSolvingMethodsActivity = () => {
    if (level === 1) {
      return (
        <div className="activity-box">
          <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--clr-accent)', marginBottom: '8px' }}>
            Level 1 Concept Recap
          </p>
          <p style={{ lineHeight: '1.5', color: 'var(--clr-text-soft)' }}>
            You've learned all the core definitions and visual methods. In Level 1, we learn HCF and LCM by listing factors and multiples. You're now ready for the Confidence Meter and Quiz!
          </p>
          <p style={{ color: 'var(--clr-correct)', fontWeight: 'bold', marginTop: '12px' }}>
            Click "Next" to rate your confidence.
          </p>
        </div>
      );
    }

    if (level === 2) {
      // Prime Factorization method simulation
      // Find HCF of 12 and 18.
      // 12 = 2 × 2 × 3
      // 18 = 2 × 3 × 3
      // Intersecting: 2, 3 -> HCF = 2 × 3 = 6
      const currentSelection = activityState.primePairs || []; // items: index of selected pairs
      const isDone = currentSelection.includes('2') && currentSelection.includes('3');

      const selectPair = (p) => {
        if (isDone) return;
        if (currentSelection.includes(p)) {
          setActivityState({ ...activityState, primePairs: currentSelection.filter(x => x !== p) });
        } else {
          setActivityState({ ...activityState, primePairs: [...currentSelection, p] });
        }
      };

      return (
        <div className="activity-box">
          <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>
            Find the HCF of 12 and 18 using their Prime Factor DNA:
          </p>
          <div style={{ textAlign: 'left', background: 'var(--clr-input)', padding: '12px', borderRadius: '8px' }}>
            <div style={{ marginBottom: '8px' }}>
              <strong>12 DNA:</strong> <span style={{ color: '#4facfe' }}>2</span> × 2 × <span style={{ color: '#e29ffb' }}>3</span>
            </div>
            <div>
              <strong>18 DNA:</strong> <span style={{ color: '#4facfe' }}>2</span> × <span style={{ color: '#e29ffb' }}>3</span> × 3
            </div>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)', marginTop: '8px', marginBottom: '12px' }}>
            Click the matching prime factors that BOTH numbers share:
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button 
              onClick={() => selectPair('2')}
              className={currentSelection.includes('2') ? 'btn-try-submit' : 'btn-back'}
            >
              Share '2' {currentSelection.includes('2') ? '✓' : ''}
            </button>
            <button 
              onClick={() => selectPair('3')}
              className={currentSelection.includes('3') ? 'btn-try-submit' : 'btn-back'}
            >
              Share '3' {currentSelection.includes('3') ? '✓' : ''}
            </button>
          </div>
          {isDone && (
            <p style={{ color: 'var(--clr-correct)', fontWeight: 'bold', marginTop: '16px' }}>
              🎉 Perfect! They share 2 and 3. HCF = 2 × 3 = 6. Click "Next".
            </p>
          )}
        </div>
      );
    }

    if (level === 3) {
      // Long division steps simulation
      // Find HCF of 45 and 60.
      // 60 ÷ 45 = 1 rem 15
      // 45 ÷ 15 = 3 rem 0 -> HCF = 15
      const divisionStep = activityState.divStep || 0;

      return (
        <div className="activity-box">
          <p style={{ fontWeight: 'bold', marginBottom: '12px' }}>
            Find the HCF of 45 and 60 using Long Division (Euclidean Method):
          </p>
          <div style={{ background: 'var(--clr-input)', padding: '16px', borderRadius: '8px', textAlign: 'left', fontFamily: 'monospace' }}>
            <div>Step 1: Divide 60 by 45</div>
            <div style={{ color: 'var(--clr-accent)' }}>60 = 45 × 1 + Remainder 15</div>
            
            {divisionStep >= 1 && (
              <div style={{ marginTop: '10px' }}>
                <div>Step 2: Divide old divisor (45) by new remainder (15)</div>
                <div style={{ color: 'var(--clr-correct)' }}>45 = 15 × 3 + Remainder 0!</div>
              </div>
            )}
          </div>

          {divisionStep === 0 && (
            <button 
              onClick={() => setActivityState({ ...activityState, divStep: 1 })}
              style={{ marginTop: '16px', padding: '8px 16px', cursor: 'pointer' }}
            >
              Divide Divisor by Remainder
            </button>
          )}

          {divisionStep === 1 && (
            <p style={{ color: 'var(--clr-correct)', fontWeight: 'bold', marginTop: '16px' }}>
              🎉 Complete! Since the remainder is now 0, the last divisor, 15, is the HCF! Click "Next".
            </p>
          )}
        </div>
      );
    }

    return null;
  };

  // Render current activity based on step
  const renderActivity = () => {
    switch (currentStep) {
      case 1: return renderPrimeActivity();
      case 2: return renderFactorsActivity();
      case 3: return renderPrimeFactorsActivity();
      case 4: return renderLcmActivity();
      case 5: return renderHcfActivity();
      case 6: return renderHowToFindLcmActivity();
      case 7: return renderHowToFindHcfActivity();
      case 8: return renderSolvingMethodsActivity();
      default: return null;
    }
  };

  // ==========================================================================
  // ADAPTIVE QUIZ GENERATION & HANDLERS
  // ==========================================================================

  const startQuiz = () => {
    // Generate 5 questions based on selected level
    let questions = [];
    if (level === 1) {
      questions = [
        { q: 'Find the HCF of 4 and 6.', a: '2', explanation: 'Factors of 4: 1, 2, 4. Factors of 6: 1, 2, 3, 6. Common: 1, 2. Highest is 2.' },
        { q: 'Find the LCM of 3 and 5.', a: '15', explanation: 'Multiples of 3: 3, 6, 9, 12, 15... Multiples of 5: 5, 10, 15... Smallest they share is 15.' },
        { q: 'Which is a prime number: 9, 11, 15, 21?', a: '11', explanation: '11 has only two factors (1 and 11), making it a prime number.' },
        { q: 'How many factors does the number 10 have?', a: '4', explanation: 'The factors of 10 are 1, 2, 5, and 10. Total of 4 factors.' },
        { q: 'Find the HCF of 8 and 12.', a: '4', explanation: 'Factors of 8: 1, 2, 4, 8. Factors of 12: 1, 2, 3, 4, 6, 12. Largest shared divisor is 4.' }
      ];
    } else if (level === 2) {
      questions = [
        { q: 'Find the prime factors of 30 (comma separated).', a: '2,3,5', explanation: '30 = 2 × 3 × 5. These are all prime numbers.' },
        { q: 'Find the LCM of 12 and 18.', a: '36', explanation: '12 = 2² × 3, 18 = 2 × 3². LCM = 2² × 3² = 4 × 9 = 36.' },
        { q: 'Find the HCF of 24 and 36.', a: '12', explanation: '24 = 2³ × 3, 36 = 2² × 3². HCF = 2² × 3¹ = 12.' },
        { q: 'Find the LCM of 6 and 9.', a: '18', explanation: 'Multiples of 6: 6, 12, 18, 24... Multiples of 9: 9, 18, 27... LCM is 18.' },
        { q: 'Bus A departs every 8 minutes and Bus B every 12 minutes. They both leave at 9:00. After how many minutes will they next depart together?', a: '24', explanation: 'The buses depart together at multiples of their intervals. LCM of 8 and 12 is 24.' }
      ];
    } else {
      questions = [
        { q: 'Find the HCF of 48 and 72 using prime factorization.', a: '24', explanation: '48 = 2⁴ × 3, 72 = 2³ × 3². HCF = 2³ × 3 = 24.' },
        { q: 'Find the HCF of 180 and 240.', a: '60', explanation: '180 = 2² × 3² × 5, 240 = 2⁴ × 3 × 5. HCF = 2² × 3 × 5 = 60.' },
        { q: 'Find the LCM of 15, 20, and 30.', a: '60', explanation: 'LCM of 15 and 30 is 30. LCM of 30 and 20 is 60.' },
        { q: 'Find the HCF of 84 and 126.', a: '42', explanation: '84 = 2² × 3 × 7, 126 = 2 × 3² × 7. HCF = 2 × 3 × 7 = 42.' },
        { q: 'A bell rings every 12 minutes, another every 18 minutes, and a third every 30 minutes. They ring together at 12:00 PM. How many minutes before they ring together again?', a: '180', explanation: 'Find LCM(12, 18, 30). LCM(12, 18) = 36. LCM(36, 30) = 180.' }
      ];
    }

    setQuizQuestions(questions);
    setQuizIndex(0);
    setQuizAnswer('');
    setQuizFeedback(null);
    setQuizScore(0);
    setQuizFinished(false);
    setQuizHistory([]);
    setCurrentStep(10);
  };

  const handleQuizSubmit = (e) => {
    if (e) e.preventDefault();
    if (quizFeedback) return;

    const currentQ = quizQuestions[quizIndex];
    // Clean and normalize answers (remove spaces, normalize case)
    const cleanUser = quizAnswer.trim().replace(/\s+/g, '').toLowerCase();
    const cleanCorrect = currentQ.a.replace(/\s+/g, '').toLowerCase();
    
    const correct = cleanUser === cleanCorrect;

    if (correct) {
      setQuizScore(s => s + 1);
      setQuizFeedback({ correct: true, display: `Correct! ${currentQ.explanation}` });
    } else {
      setQuizFeedback({ correct: false, display: `Incorrect. The correct answer is: ${currentQ.a}. ${currentQ.explanation}` });
    }

    setQuizHistory(prev => [...prev, {
      question: currentQ.q,
      userAnswer: quizAnswer,
      correctAnswer: currentQ.a,
      correct
    }]);
  };

  const nextQuizQuestion = () => {
    setQuizAnswer('');
    setQuizFeedback(null);
    if (quizIndex < quizQuestions.length - 1) {
      setQuizIndex(idx => idx + 1);
    } else {
      setQuizFinished(true);
    }
  };

  // ==========================================================================
  // CONFIDENCE METER & MODAL LOGIC
  // ==========================================================================

  const handleConfidenceSelect = (rating) => {
    setConfidence(rating);
    if (rating === 'very') {
      startQuiz();
    } else {
      setShowRevisionModal(true);
      setRevisionOption(rating);
    }
  };

  // ==========================================================================
  // VIEW RENDERING
  // ==========================================================================

  // Step 0: Welcome and Age Group Selection
  const renderAgeSelect = () => {
    return (
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '8px' }}>
          LCM & HCF Learning Quest
        </h2>
        <p style={{ color: 'var(--clr-text-soft)', marginBottom: '24px' }}>
          Embark on an age-adaptive mathematics journey. Select your level to begin!
        </p>

        <div className="age-select-grid">
          <div className="age-card level-1" onClick={() => { setLevel(1); setCurrentStep(1); }}>
            <span className="age-emoji">🦁</span>
            <span className="age-title">Age 10–12 Years</span>
            <p className="age-desc">
              Visual flashcards, drag-and-drop games, and easy questions. Very basic illustrations.
            </p>
            <span className="age-badge">Level 1</span>
          </div>

          <div className="age-card level-2" onClick={() => { setLevel(2); setCurrentStep(1); }}>
            <span className="age-emoji">🚀</span>
            <span className="age-title">Age 12–14 Years</span>
            <p className="age-desc">
              Moderate detail, visual concepts, and introduction to the Prime Factorization Method.
            </p>
            <span className="age-badge">Level 2</span>
          </div>

          <div className="age-card level-3" onClick={() => { setLevel(3); setCurrentStep(1); }}>
            <span className="age-emoji">💎</span>
            <span className="age-title">Age 14–16+ Years</span>
            <p className="age-desc">
              Deep reasoning, visual proofs, Prime Factorization, and the Long Division Method.
            </p>
            <span className="age-badge">Level 3</span>
          </div>
        </div>

        <button 
          onClick={onBack}
          style={{ 
            background: 'transparent', 
            borderColor: 'var(--clr-border)', 
            color: 'var(--clr-text)', 
            padding: '10px 20px', 
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          Back to Main Menu
        </button>
      </div>
    );
  };

  // Step 1 to 8: Core Concept Slides
  const renderConceptSlide = () => {
    // Concept meta mappings
    const conceptTitles = [
      '', // 0 is start
      'Prime Numbers',
      'Factors',
      'Prime Factors',
      'LCM (Lowest Common Multiple)',
      'HCF (Highest Common Factor)',
      'How to Find LCM',
      'How to Find HCF',
      'Solving Methods'
    ];

    const slideMeta = [
      { tag: 'Flashcard', label: 'Definition' },
      { tag: 'Animation', label: 'Demonstration' },
      { tag: 'Activity', label: 'Try It Yourself' },
      { tag: 'Explanation', label: 'Summary & Curiosity Check' }
    ];

    const title = conceptTitles[currentStep];

    // Helper slides definitions
    const getSlideContent = () => {
      if (currentSlide === 0) {
        // Slide 0: Flashcard
        switch (currentStep) {
          case 1:
            return (
              <div className="flashcard">
                <div className="flashcard-main-word">Prime Numbers</div>
                <p className="flashcard-desc">
                  A **Prime Number** is a special number greater than 1 that can **only** be divided by 1 and itself!
                </p>
                <div className="flashcard-example-box">
                  Examples: 2, 3, 5, 7, 11, 13, 17...
                </div>
              </div>
            );
          case 2:
            return (
              <div className="flashcard">
                <div className="flashcard-main-word">Factors</div>
                <p className="flashcard-desc">
                  A **Factor** is a number that divides another number completely, leaving **zero remainder**!
                </p>
                <div className="flashcard-example-box">
                  Factors of 6: 1, 2, 3, and 6 (since 1×6 = 6, 2×3 = 6)
                </div>
              </div>
            );
          case 3:
            return (
              <div className="flashcard">
                <div className="flashcard-main-word">Prime Factors</div>
                <p className="flashcard-desc">
                  **Prime Factors** are the factors of a number that are also **prime numbers**. They are the building block DNA of that number!
                </p>
                <div className="flashcard-example-box">
                  Factors of 12: 1, 2, 3, 4, 6, 12.<br/>
                  Prime Factors of 12: 2 and 3!
                </div>
              </div>
            );
          case 4:
            return (
              <div className="flashcard">
                <div className="flashcard-main-word">LCM</div>
                <p className="flashcard-desc">
                  **Lowest Common Multiple (LCM)** is the smallest multiple shared by two or more numbers. It's their first common landing point!
                </p>
                <div className="flashcard-example-box">
                  Multiples of 3: 3, 6, 9, 12, 15...<br/>
                  Multiples of 4: 4, 8, 12, 16...<br/>
                  LCM of 3 and 4 = 12!
                </div>
              </div>
            );
          case 5:
            return (
              <div className="flashcard">
                <div className="flashcard-main-word">HCF</div>
                <p className="flashcard-desc">
                  **Highest Common Factor (HCF)** is the largest factor shared by two or more numbers. It is the biggest equal group size you can divide things into!
                </p>
                <div className="flashcard-example-box">
                  Factors of 8: 1, 2, 4, 8.<br/>
                  Factors of 12: 1, 2, 3, 4, 6, 12.<br/>
                  HCF of 8 and 12 = 4!
                </div>
              </div>
            );
          case 6:
            return (
              <div className="flashcard">
                <div className="flashcard-main-word">How to Find LCM</div>
                <p className="flashcard-desc">
                  To find the LCM, you list the multiples of each number until you find the first one they both share.
                </p>
                <div className="flashcard-example-box">
                  LCM of 2 and 3:<br/>
                  2: 2, 4, 6, 8, 10...<br/>
                  3: 3, 6, 9, 12...<br/>
                  They both share 6!
                </div>
              </div>
            );
          case 7:
            return (
              <div className="flashcard">
                <div className="flashcard-main-word">How to Find HCF</div>
                <p className="flashcard-desc">
                  To find the HCF, you list all factors of both numbers, identify the ones they share, and select the highest one.
                </p>
                <div className="flashcard-example-box">
                  HCF of 9 and 15:<br/>
                  9: 1, 3, 9<br/>
                  15: 1, 3, 5, 15<br/>
                  Shared factors: 1 and 3. Highest is 3!
                </div>
              </div>
            );
          case 8:
            return (
              <div className="flashcard">
                <div className="flashcard-main-word">
                  {level === 1 ? 'Concept Summary' : level === 2 ? 'Prime Factorization' : 'Long Division & Primes'}
                </div>
                <p className="flashcard-desc">
                  {level === 1 
                    ? 'Great! You have mastered the fundamentals of HCF and LCM. Ready to test your confidence?'
                    : level === 2 
                      ? 'The **Prime Factorization Method** uses the prime DNA of numbers to find HCF (common powers) and LCM (highest powers) systematically!'
                      : 'The **Long Division Method** divides the larger number by the smaller recursively. The final non-zero remainder is the HCF!'}
                </p>
                <div className="flashcard-example-box">
                  {level === 1 
                    ? 'Prime Numbers, Factors, Prime Factors, LCM, HCF.'
                    : level === 2
                      ? '12 = 2² × 3, 18 = 2 × 3² → HCF = 2 × 3 = 6.'
                      : 'HCF of 45 and 60: 60 ÷ 45 = 1 rem 15. 45 ÷ 15 = 3 rem 0. HCF = 15.'}
                </div>
              </div>
            );
          default:
            return null;
        }
      }

      if (currentSlide === 1) {
        // Slide 1: Animation / Visual Demonstration
        switch (currentStep) {
          case 1:
            return (
              <div>
                <p style={{ fontWeight: '600', marginBottom: '12px' }}>Divisibility Animation</p>
                <p style={{ color: 'var(--clr-text-soft)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  A Prime number is like a solid block that can't be sliced into equal rows. 
                  For example, 7 blocks cannot be grouped into equal smaller blocks (e.g. groups of 2 leaves 1 left over).
                  But 6 blocks can be arranged in a perfect grid of 2 × 3!
                </p>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', margin: '20px 0' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 24px)', gap: '4px' }}>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} style={{ width: '24px', height: '24px', background: 'var(--clr-accent)', borderRadius: '4px' }} />
                    ))}
                  </div>
                  <div style={{ borderLeft: '2px dashed var(--clr-border)', paddingLeft: '20px', marginLeft: '20px' }}>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', width: '100px' }}>
                      {Array.from({ length: 7 }).map((_, i) => (
                        <div key={i} style={{ width: '24px', height: '24px', background: 'var(--clr-text-soft)', borderRadius: '4px' }} />
                      ))}
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)' }}>
                  Left: 6 (Composite, splits into 2x3 rows). Right: 7 (Prime, irregular, can't be split equally!)
                </p>
              </div>
            );
          case 2:
            return (
              <div>
                <p style={{ fontWeight: '600', marginBottom: '12px' }}>Factor Pairs Alignment</p>
                <p style={{ color: 'var(--clr-text-soft)', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '16px' }}>
                  Think of factors as matching pairs. Multiplying a pair of factors gives the target number.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span className="age-badge">1 × 12 = 12</span>
                    <span className="age-badge">2 × 6 = 12</span>
                    <span className="age-badge">3 × 4 = 12</span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', marginTop: '10px' }}>
                    {[1, 2, 3, 4, 6, 12].map(n => (
                      <div key={n} style={{ width: '32px', height: '32px', border: '1px solid var(--clr-border)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {n}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          case 3:
            return (
              <div>
                <p style={{ fontWeight: '600', marginBottom: '12px' }}>Prime Factor DNA tree</p>
                <p style={{ color: 'var(--clr-text-soft)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  We break composite numbers down step-by-step. If a node is a composite, it splits. If it is prime, it stops!
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '20px 0' }}>
                  <div className="tree-node-circle">{getAdaptiveNumber('prime_factors')}</div>
                  <div style={{ display: 'flex', gap: '20px', marginTop: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div className="tree-node-circle prime">2</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div className="tree-node-circle">{getAdaptiveNumber('prime_factors') / 2}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          case 4:
            return (
              <div>
                <p style={{ fontWeight: '600', marginBottom: '12px' }}>LCM Cycle Alignment</p>
                <p style={{ color: 'var(--clr-text-soft)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  Two gears of size {getAdaptiveNumber('lcm_pair')[0]} and {getAdaptiveNumber('lcm_pair')[1]} teeth rotate. They align again when they have rotated a distance equal to the LCM!
                </p>
                <div style={{ margin: '20px 0', fontSize: '2.5rem' }}>
                  ⚙️ ⚙️
                </div>
                <p style={{ fontWeight: 'bold', color: 'var(--clr-accent)' }}>
                  LCM({getAdaptiveNumber('lcm_pair')[0]}, {getAdaptiveNumber('lcm_pair')[1]}) = {lcm(getAdaptiveNumber('lcm_pair')[0], getAdaptiveNumber('lcm_pair')[1])}
                </p>
              </div>
            );
          case 5:
            return (
              <div>
                <p style={{ fontWeight: '600', marginBottom: '12px' }}>HCF Tile Division</p>
                <p style={{ color: 'var(--clr-text-soft)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  If you have a grid of size {getAdaptiveNumber('hcf_pair')[0]} × {getAdaptiveNumber('hcf_pair')[1]} blocks, what is the largest square tile size that can cover the grid perfectly?
                </p>
                <p style={{ fontWeight: 'bold', color: 'var(--clr-accent)', margin: '16px 0', fontSize: '1.1rem' }}>
                  HCF({getAdaptiveNumber('hcf_pair')[0]}, {getAdaptiveNumber('hcf_pair')[1]}) = {gcd(getAdaptiveNumber('hcf_pair')[0], getAdaptiveNumber('hcf_pair')[1])}
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)' }}>
                  Tiles of size {gcd(getAdaptiveNumber('hcf_pair')[0], getAdaptiveNumber('hcf_pair')[1])} fit perfectly across both sides!
                </p>
              </div>
            );
          case 6:
            return (
              <div>
                <p style={{ fontWeight: '600', marginBottom: '12px' }}>Listing Multiples Method</p>
                <p style={{ color: 'var(--clr-text-soft)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  Simply multiply the number by 1, 2, 3, 4, 5... and write them down. 
                </p>
                <div style={{ background: 'var(--clr-input)', padding: '12px', borderRadius: '8px', margin: '16px 0', textAlign: 'left', fontFamily: 'monospace' }}>
                  <div>Multiples of 5: 5, 10, 15, <strong>20</strong>, 25, 30...</div>
                  <div>Multiples of 4: 4, 8, 12, 16, <strong>20</strong>, 24...</div>
                </div>
                <p style={{ fontSize: '0.9rem' }}>LCM(5, 4) = 20</p>
              </div>
            );
          case 7:
            return (
              <div>
                <p style={{ fontWeight: '600', marginBottom: '12px' }}>Listing Factors Method</p>
                <p style={{ color: 'var(--clr-text-soft)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  Write down all factors of each number. Circle the ones that appear in both lists.
                </p>
                <div style={{ background: 'var(--clr-input)', padding: '12px', borderRadius: '8px', margin: '16px 0', textAlign: 'left', fontFamily: 'monospace' }}>
                  <div>Factors of 12: <strong>1</strong>, <strong>2</strong>, 3, <strong>4</strong>, 6, 12</div>
                  <div>Factors of 16: <strong>1</strong>, <strong>2</strong>, <strong>4</strong>, 8, 16</div>
                </div>
                <p style={{ fontSize: '0.9rem' }}>Common Factors: 1, 2, 4. HCF(12, 16) = 4</p>
              </div>
            );
          case 8:
            return (
              <div>
                <p style={{ fontWeight: '600', marginBottom: '12px' }}>Method Demonstration</p>
                <p style={{ color: 'var(--clr-text-soft)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  {level === 1 
                    ? 'In Level 1, we focus on listing. It is simple, concrete, and perfect for getting started!'
                    : level === 2
                      ? 'Prime factorization lets you align prime bases and find common elements instantly!'
                      : 'Division method: divide larger by smaller, then divide divisor by remainder, repeating until remainder is zero.'}
                </p>
                <div style={{ margin: '16px 0', padding: '12px', background: 'var(--clr-input)', borderRadius: '8px', fontFamily: 'monospace' }}>
                  {level === 1 
                    ? 'Listing: 2, 4, 6, 8 vs 3, 6, 9'
                    : level === 2
                      ? '24 = 2³ × 3\n36 = 2² × 3²\nHCF = 2² × 3 = 12'
                      : 'HCF(54, 96):\n96 = 54 × 1 + 42\n54 = 42 × 1 + 12\n42 = 12 × 3 + 6\n12 = 6 × 2 + 0\nHCF = 6'}
                </div>
              </div>
            );
          default:
            return null;
        }
      }

      if (currentSlide === 2) {
        // Slide 2: Interactive Activity
        return renderActivity();
      }

      if (currentSlide === 3) {
        // Slide 3: Summary + Glowing Why Button
        return (
          <div style={{ width: '100%' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '1.15rem' }}>
              Concept Checkpoint
            </p>
            <p style={{ color: 'var(--clr-text-soft)', lineHeight: '1.5', marginBottom: '24px' }}>
              You've read the definition, watched the demonstration, and completed the activity! 
              Before moving to the next concept, check your curiosity. Click the glowing bulb below to explore "Why?" this concept is structured the way it is and complete a small challenge to earn a collectible!
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
              <button className="why-bulb-btn" onClick={() => setWhyOpen(true)}>
                <span className="why-bulb-icon">💡</span>
                <span>Why?</span>
              </button>
            </div>

            {isCurrentCollectibleUnlocked() ? (
              <p style={{ color: 'var(--clr-correct)', fontWeight: 'bold', fontSize: '0.95rem' }}>
                ⭐ You have unlocked the collectible for this concept!
              </p>
            ) : (
              <p style={{ color: 'var(--clr-accent)', fontWeight: '500', fontSize: '0.85rem' }}>
                Bulb is glowing! Click "Why?" to unlock your level collectible.
              </p>
            )}
          </div>
        );
      }

      return null;
    };

    return (
      <div className="concept-viewport">
        <div className="slide-wrapper">
          <div className="slide-header">
            <span className="concept-title">{title}</span>
            <span className="slide-tag">{slideMeta[currentSlide].tag}</span>
          </div>

          <div className="slide-content">
            {getSlideContent()}
          </div>
        </div>

        {/* Navigation buttons inside concepts */}
        <div className="nav-row">
          <button 
            className="btn-back"
            onClick={() => {
              if (currentSlide > 0) {
                setCurrentSlide(currentSlide - 1);
              } else {
                setCurrentStep(currentStep - 1);
              }
            }}
          >
            ⬅ Previous
          </button>
          
          <button 
            className="btn-next"
            onClick={() => {
              if (currentSlide < 3) {
                setCurrentSlide(currentSlide + 1);
              } else {
                // If Level 1, we skip step 8 (Solving Methods). So from 7 we go to 9
                if (level === 1 && currentStep === 7) {
                  setCurrentStep(9); // go to confidence
                } else {
                  setCurrentStep(currentStep + 1);
                }
              }
            }}
          >
            ➡ Next
          </button>
        </div>
      </div>
    );
  };

  // Step 9: Confidence Meter
  const renderConfidenceMeter = () => {
    const handleRevisionConfirm = () => {
      setShowRevisionModal(false);
      setCurrentStep(1); // Go back to start of concepts
    };

    const handleRevisionSkip = () => {
      setShowRevisionModal(false);
      startQuiz();
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <h2 className="confidence-prompt">How confident are you with this topic?</h2>
        <p style={{ color: 'var(--clr-text-soft)', marginBottom: '24px' }}>
          Evaluate your understanding before you begin the quiz.
        </p>

        <div className="confidence-row">
          <div className="confidence-card" onClick={() => handleConfidenceSelect('very')}>
            <span className="confidence-emoji">😊</span>
            <span className="confidence-label">Very Confident</span>
          </div>
          <div className="confidence-card" onClick={() => handleConfidenceSelect('mod')}>
            <span className="confidence-emoji">😐</span>
            <span className="confidence-label">Moderately Confident</span>
          </div>
          <div className="confidence-card" onClick={() => handleConfidenceSelect('not')}>
            <span className="confidence-emoji">😟</span>
            <span className="confidence-label">Not Confident</span>
          </div>
        </div>

        {showRevisionModal && (
          <div className="revision-modal-overlay">
            <div className="revision-modal">
              {revisionOption === 'mod' ? (
                <>
                  <h3>Revision Recommendation</h3>
                  <p>You seem fairly comfortable. Would you like to revise once before attempting the quiz?</p>
                  <div className="revision-modal-buttons">
                    <button className="btn-revise-go" onClick={handleRevisionConfirm}>Revise</button>
                    <button className="btn-revise-skip" onClick={handleRevisionSkip}>Continue to Quiz</button>
                  </div>
                </>
              ) : (
                <>
                  <h3>Let's review!</h3>
                  <p>It looks like you'd benefit from another quick revision. Let's go through the concepts once more!</p>
                  <div className="revision-modal-buttons">
                    <button className="btn-revise-go" onClick={handleRevisionConfirm}>Go Back to Module</button>
                    <button className="btn-revise-skip" onClick={handleRevisionSkip}>Continue to Quiz Anyway</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <button 
          className="btn-back"
          onClick={() => {
            // Level 1 skips step 8 (Solving Methods), so goes back to 7
            setCurrentStep(level === 1 ? 7 : 8);
          }}
          style={{ marginTop: '24px' }}
        >
          ⬅ Back to Explanations
        </button>
      </div>
    );
  };

  // Step 10: Quiz Screen
  const renderQuiz = () => {
    if (quizFinished) {
      return (
        <div className="quiz-results-summary">
          <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '16px' }}>Quiz Completed!</h2>
          
          <div className="quiz-score-circle">
            <span className="score-num">{quizScore}</span>
            <span className="score-total">/ 5 correct</span>
          </div>

          <p style={{ color: 'var(--clr-text-soft)', marginBottom: '20px' }}>
            {quizScore === 5 ? '🏆 Perfect score! Fantastic job!' : quizScore >= 3 ? '🎉 Good job! You understand HCF & LCM well!' : '📚 Review the concepts once more and try again!'}
          </p>

          <div className="results-list">
            {quizHistory.map((item, i) => (
              <div key={i} className={`result-item ${item.correct ? 'correct' : 'incorrect'}`}>
                <div className="result-prompt">
                  <strong>Q{i+1}:</strong> {item.question}
                </div>
                <div className="result-details">
                  Your answer: <strong>{item.userAnswer}</strong><br/>
                  Correct: <strong>{item.correctAnswer}</strong>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button className="btn-back" onClick={startQuiz}>Retry Quiz</button>
            <button className="btn-next" onClick={() => setCurrentStep(11)}>View Rewards Bank ➡</button>
          </div>
        </div>
      );
    }

    const currentQ = quizQuestions[quizIndex];
    if (!currentQ) return <p>Loading quiz questions...</p>;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="quiz-main-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--clr-text-soft)' }}>
            <span>HCF & LCM Quiz</span>
            <span>Question {quizIndex + 1} of 5</span>
          </div>

          <div className="quiz-progress-bar">
            <div className="quiz-progress-fill" style={{ width: `${((quizIndex) / 5) * 100}%` }}></div>
          </div>

          <p className="quiz-question-text">{currentQ.q}</p>

          <form onSubmit={handleQuizSubmit} className="quiz-input-row">
            <input 
              type="text" 
              className="quiz-input"
              value={quizAnswer}
              onChange={e => { if (!quizFeedback) setQuizAnswer(e.target.value); }}
              placeholder="Type your numeric answer..."
              disabled={!!quizFeedback}
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter' && !quizFeedback) handleQuizSubmit(); }}
            />
            
            {!quizFeedback ? (
              <button type="submit" className="quiz-btn-submit">Submit Answer</button>
            ) : (
              <div style={{ width: '100%' }}>
                <div className={`quiz-feedback-box ${quizFeedback.correct ? 'correct' : 'incorrect'}`}>
                  {quizFeedback.display}
                </div>
                <button type="button" className="quiz-btn-next" onClick={nextQuizQuestion}>
                  {quizIndex < 4 ? 'Next Question ➡' : 'Show Summary ➡'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    );
  };

  // Step 11: Collectibles Reward Bank
  const renderCollectiblesBank = () => {
    const theme = COLLECTIBLE_THEMES[level];
    
    // Count unlocked in current level (steps 1 to 8)
    let unlockedCount = 0;
    const collectiblesList = theme.items.map((item, idx) => {
      // Collectible 1 corresponds to step 1 (prime)
      // Collectible 2 corresponds to step 2 (factors)
      // Collectible 3 corresponds to step 3 (pfactors)
      // Collectible 4 corresponds to step 4 (lcm)
      // Collectible 5 corresponds to step 5 (hcf)
      const stepMapping = idx + 1; 
      const isUnlocked = !!unlockedCollectibles[`${level}_${stepMapping}`];
      if (isUnlocked) unlockedCount++;

      return {
        ...item,
        isUnlocked
      };
    });

    const completionPercent = Math.round((unlockedCount / 5) * 100);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="collectibles-bank">
          <div className="bank-header">
            <h2 className="bank-title">{theme.name} Reward Bank</h2>
            <div className="bank-progress-info">
              <span>Progress: {unlockedCount} / 5 unlocked</span>
              <span>{completionPercent}% Complete</span>
            </div>
            <div className="quiz-progress-bar" style={{ marginTop: '8px' }}>
              <div className="quiz-progress-fill" style={{ width: `${completionPercent}%`, background: 'var(--clr-correct)' }}></div>
            </div>
          </div>

          <p style={{ fontSize: '0.9rem', color: 'var(--clr-text-soft)', marginBottom: '16px', textAlign: 'center' }}>
            Unlock collectibles by clicking the glowing bulb "Why?" and completing the Try-It-Out questions during lessons!
          </p>

          <div className="collectibles-grid">
            {collectiblesList.map(item => (
              <div key={item.id} className={`collectible-slot ${item.isUnlocked ? 'unlocked' : 'locked'}`} title={item.isUnlocked ? item.desc : 'Locked'}>
                <span className="collectible-emoji">{item.emoji}</span>
                <span className="collectible-name">{item.name}</span>
                {!item.isUnlocked && <span className="collectible-lock">🔒</span>}
              </div>
            ))}
          </div>

          {unlockedCount === 5 && (
            <div style={{ background: 'var(--clr-correct-bg)', border: '1px solid var(--clr-correct)', borderRadius: '8px', padding: '12px', margin: '16px 0', textAlign: 'center' }}>
              <p style={{ color: 'var(--clr-correct)', fontWeight: 'bold' }}>
                🏆 Golden Badge Unlocked! You have collected all {theme.name}!
              </p>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '24px' }}>
            <button className="btn-back" onClick={() => { setLevel(null); setCurrentStep(0); }}>
              Select Another Age Group
            </button>
            <button className="btn-next" onClick={onBack}>
              Finish Module
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render navigation header
  const renderHeader = () => {
    if (currentStep === 0) return null;

    return (
      <div>
        <div className="lcmhcf-header">
          <div className="level-indicator">
            <span>Level {level}:</span>
            <span className="age-badge">
              {level === 1 ? 'Age 10–12' : level === 2 ? 'Age 12–14' : 'Age 14–16+'}
            </span>
          </div>
          <button 
            onClick={() => { setLevel(null); setCurrentStep(0); }}
            style={{ padding: '6px 12px', background: 'transparent', borderColor: 'var(--clr-border)', color: 'var(--clr-text)', cursor: 'pointer', borderRadius: '6px' }}
          >
            Change Level
          </button>
        </div>

        {/* Stepper circles */}
        <div className="stepper-container">
          {STEPS_META.slice(1, 11).map((step, idx) => {
            const stepNum = idx + 1;
            // Level 1 skips step 8 (Solving Methods), hide it
            if (level === 1 && step.id === 'methods') return null;

            let className = 'step-node';
            if (currentStep === stepNum) className += ' active';
            else if (currentStep > stepNum) className += ' completed';

            return (
              <React.Fragment key={step.id}>
                <div className={className} onClick={() => setCurrentStep(stepNum)} title={step.label}>
                  {stepNum}
                </div>
                {idx < 9 && !(level === 1 && stepNum === 7) && (
                  <div className={`step-line ${currentStep > stepNum ? 'completed' : ''}`}></div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  };

  // Render Sliding Why panel
  const renderWhyPanel = () => {
    const data = getWhyData(currentStep);
    if (!data) return null;

    const isUnlocked = isCurrentCollectibleUnlocked();

    return (
      <>
        <div className={`why-overlay ${whyOpen ? 'open' : ''}`} onClick={() => setWhyOpen(false)}></div>
        <div className={`why-drawer ${whyOpen ? 'open' : ''}`}>
          <div className="why-drawer-header">
            <h3 className="why-drawer-title">{data.title}</h3>
            <button className="why-drawer-close" onClick={() => setWhyOpen(false)}>×</button>
          </div>

          <div className="why-section">
            <h4 className="why-section-title">The "Why" Behind the Concept</h4>
            <p className="why-section-content">{data.explanation}</p>
          </div>

          <div className="why-section" style={{ background: 'var(--clr-input)', padding: '12px', borderRadius: '8px' }}>
            <h4 className="why-section-title" style={{ fontSize: '0.9rem', color: 'var(--clr-accent)' }}>Real-World Example</h4>
            <p className="why-section-content" style={{ color: 'var(--clr-text)' }}>{data.example}</p>
          </div>

          <div className="why-section try-it-out-box">
            <h4 className="why-section-title" style={{ color: 'var(--clr-accent)' }}>🎯 Try-It-Out Challenge</h4>
            <p className="try-question">{data.question}</p>

            {data.options ? (
              // Multiple choice
              <div className="try-options-grid">
                {data.options.map(opt => (
                  <button 
                    key={opt}
                    type="button"
                    className={`try-option-btn ${whyAnswer === opt ? 'selected' : ''}`}
                    onClick={() => { if (!isUnlocked) setWhyAnswer(opt); }}
                    disabled={isUnlocked}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              // Number/Text Input
              <input 
                type="text"
                className="try-input"
                value={whyAnswer}
                onChange={e => { if (!isUnlocked) setWhyAnswer(e.target.value); }}
                placeholder={data.inputPlaceholder || 'Type answer...'}
                disabled={isUnlocked}
              />
            )}

            {!isUnlocked ? (
              <div className="try-actions">
                <button className="btn-try-submit" onClick={handleWhySubmit}>Submit Answer</button>
              </div>
            ) : (
              <div className="try-feedback correct">
                ⭐ Solved! You collected the Reward for this lesson! Check it out in the Rewards tab at the end of the module.
              </div>
            )}

            {whyFeedback && !isUnlocked && (
              <div className={`try-feedback ${whyFeedback.correct ? 'correct' : 'incorrect'}`}>
                {whyFeedback.text}
              </div>
            )}
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="lcmhcf-container">
      {renderHeader()}

      <div style={{ flexGrow: 1, marginTop: '20px' }}>
        {currentStep === 0 && renderAgeSelect()}
        {currentStep >= 1 && currentStep <= 8 && renderConceptSlide()}
        {currentStep === 9 && renderConfidenceMeter()}
        {currentStep === 10 && renderQuiz()}
        {currentStep === 11 && renderCollectiblesBank()}
      </div>

      {renderWhyPanel()}
    </div>
  );
}
