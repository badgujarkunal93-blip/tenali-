const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const PASSWORD = 'demo123';
const JOURNEY_DB_FILE = path.join(__dirname, 'lil', 'learning_journey', 'in_memory_journey_progress.json');

// We load the curriculum to build fallback questions if needed
const { JOURNEY_CURRICULUM } = require('./lil/learning_journey/journeyData');

// 1. Generate/find template questions
function getTemplateQuestions() {
  // Try loading from the in-memory JSON file
  if (fs.existsSync(JOURNEY_DB_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(JOURNEY_DB_FILE, 'utf8'));
      // Find a user who has activePlacementTest questions
      for (const userVal of Object.values(data)) {
        if (userVal.activePlacementTest && userVal.activePlacementTest.questions && userVal.activePlacementTest.questions.length === 100) {
          console.log(`Found 100 template questions from user progress of: ${userVal.userId}`);
          return userVal.activePlacementTest.questions.map(q => ({
            id: q.id,
            prompt: q.prompt,
            correctAnswer: q.correctAnswer || "1",
            conceptKey: q.conceptKey,
            topicId: q.topicId
          }));
        }
      }
    } catch (e) {
      console.warn("Could not read template questions from file:", e.message);
    }
  }

  // Fallback: Generate generic template questions
  console.log("Generating fallback template questions from curriculum...");
  const questions = [];
  let counter = 1;
  for (const topic of JOURNEY_CURRICULUM) {
    const concepts = topic.concepts;
    for (let i = 0; i < 10; i++) {
      const concept = concepts[i % concepts.length];
      questions.push({
        id: `q-${counter++}`,
        prompt: `Solve the problem for ${concept.name}`,
        correctAnswer: "1",
        conceptKey: concept.key,
        topicId: topic.id
      });
    }
  }
  return questions;
}

// 2. Helper to generate realistic correct/wrong answers
function getAnswersForQuestions(questions, limit = 100) {
  const answers = {};
  for (let idx = 0; idx < Math.min(questions.length, limit); idx++) {
    const q = questions[idx];
    const topicIndex = Math.floor(idx / 10); // topic 0 to 9
    const questionInTopic = idx % 10; // 0 to 9
    
    let makeCorrect = false;
    if (topicIndex < 3) {
      // Topics 1-3 (arithmetic_basics, advanced_arithmetic, algebra_foundations): 100% correct (10/10) -> Pass
      makeCorrect = true;
    } else if (topicIndex === 3) {
      // Topic 4 (algebra_intermediate): 40% correct (4/10) -> Fail and break the chain!
      makeCorrect = (questionInTopic < 4);
    } else {
      // Topics 5-10: 50% correct (5/10) -> Fail
      makeCorrect = (questionInTopic < 5);
    }

    if (makeCorrect) {
      answers[q.id] = q.correctAnswer || "1";
    } else {
      // Generate a wrong answer
      const correctVal = q.correctAnswer || "1";
      if (/^\d+$/.test(correctVal)) {
        answers[q.id] = String(Number(correctVal) + 5);
      } else {
        answers[q.id] = correctVal + "_wrong";
      }
    }
  }
  return answers;
}

// 2b. Helper to generate random correct/wrong answers (for demo3 and demo4)
function getRandomAnswersForQuestions(questions, limit = 90) {
  const answers = {};
  for (let idx = 0; idx < Math.min(questions.length, limit); idx++) {
    const q = questions[idx];
    const makeCorrect = Math.random() > 0.4; // ~60% correct rate, randomly distributed
    if (makeCorrect) {
      answers[q.id] = q.correctAnswer || "1";
    } else {
      // Generate a wrong answer
      const correctVal = q.correctAnswer || "1";
      if (/^\d+$/.test(correctVal)) {
        answers[q.id] = String(Number(correctVal) + 5);
      } else {
        answers[q.id] = correctVal + "_wrong";
      }
    }
  }
  return answers;
}

// 3. Helper to simulate the verifyPlacementTest logic locally for the JSON file
function simulateVerifyPlacementTest(questions, answers) {
  const completedConcepts = [];
  const completedTopics = [];
  const latestCheckpointScore = {};
  const checkpointAttempts = [];
  let chainBroken = false;

  const topicStats = {};
  for (const topic of JOURNEY_CURRICULUM) {
    topicStats[topic.id] = { correctCount: 0, totalCount: 0 };
  }

  for (const q of questions) {
    const userAnswer = String(answers[q.id] || "").trim();
    const isCorrect = userAnswer.toLowerCase() === q.correctAnswer.toLowerCase();
    if (topicStats[q.topicId]) {
      topicStats[q.topicId].totalCount++;
      if (isCorrect) {
        topicStats[q.topicId].correctCount++;
      }
    }
  }

  for (const topic of JOURNEY_CURRICULUM) {
    const stats = topicStats[topic.id] || { correctCount: 0, totalCount: 10 };
    const scorePercent = stats.totalCount > 0 ? Math.round((stats.correctCount / stats.totalCount) * 100) : 0;
    const passed = scorePercent >= 75; // PASS THRESHOLD

    if (!chainBroken) {
      if (passed) {
        // Unlocked and completed!
        for (const concept of topic.concepts) {
          completedConcepts.push(concept.key);
        }
        completedTopics.push(topic.id);
        latestCheckpointScore[topic.id] = scorePercent;
      } else {
        // Failed: break the chain here
        chainBroken = true;
      }
    }

    checkpointAttempts.push({
      topicId: topic.id,
      scorePercent,
      passed,
      attemptedAt: new Date().toISOString(),
      type: 'placement'
    });
  }

  return {
    completedConcepts,
    completedTopics,
    conceptsNeedingRevision: [],
    checkpointAttempts,
    latestCheckpointScore,
    activeCheckpoint: null,
    activePlacementTest: null
  };
}

async function seed() {
  try {
    const templateQs = getTemplateQuestions();
    console.log(`Using ${templateQs.length} questions for placement test seeding.`);

    const demo1Answers = getAnswersForQuestions(templateQs, 100);
    const demo1Progress = {
      completedConcepts: [],
      completedTopics: [],
      conceptsNeedingRevision: [],
      checkpointAttempts: [],
      latestCheckpointScore: {},
      activeCheckpoint: null,
      activePlacementTest: {
        topicId: 'combined',
        questions: templateQs,
        savedAnswers: demo1Answers,
        lastQuestionIndex: 99,
        startedAt: new Date().toISOString()
      }
    };

    const demo2Answers = getAnswersForQuestions(templateQs, 90);
    const demo2Progress = {
      completedConcepts: [],
      completedTopics: [],
      conceptsNeedingRevision: [],
      checkpointAttempts: [],
      latestCheckpointScore: {},
      activeCheckpoint: null,
      activePlacementTest: {
        topicId: 'combined',
        questions: templateQs,
        savedAnswers: demo2Answers,
        lastQuestionIndex: 90,
        startedAt: new Date().toISOString()
      }
    };

    const demo3Answers = getRandomAnswersForQuestions(templateQs, 90);
    const demo3Progress = {
      completedConcepts: [],
      completedTopics: [],
      conceptsNeedingRevision: [],
      checkpointAttempts: [],
      latestCheckpointScore: {},
      activeCheckpoint: null,
      activePlacementTest: {
        topicId: 'combined',
        questions: templateQs,
        savedAnswers: demo3Answers,
        lastQuestionIndex: 90,
        startedAt: new Date().toISOString()
      }
    };

    const demo4Answers = getRandomAnswersForQuestions(templateQs, 90);
    const demo4Progress = {
      completedConcepts: [],
      completedTopics: [],
      conceptsNeedingRevision: [],
      checkpointAttempts: [],
      latestCheckpointScore: {},
      activeCheckpoint: null,
      activePlacementTest: {
        topicId: 'combined',
        questions: templateQs,
        savedAnswers: demo4Answers,
        lastQuestionIndex: 90,
        startedAt: new Date().toISOString()
      }
    };

    // democompleteProgress is generated using the verify test simulation
    const democompleteAnswers = getAnswersForQuestions(templateQs, 100);
    const democompleteProgress = simulateVerifyPlacementTest(templateQs, democompleteAnswers);

    // =========================================================================
    // SECTION A: In-Memory JSON File Seeding
    // =========================================================================
    console.log(`\n--- Seeding in-memory progress JSON file... ---`);
    let fileProgressDb = {};
    if (fs.existsSync(JOURNEY_DB_FILE)) {
      try {
        fileProgressDb = JSON.parse(fs.readFileSync(JOURNEY_DB_FILE, 'utf8'));
      } catch (err) {
        console.warn("Failed to parse progress file, starting fresh:", err.message);
      }
    }

    fileProgressDb['demo1'] = { userId: 'demo1', ...demo1Progress };
    fileProgressDb['demo2'] = { userId: 'demo2', ...demo2Progress };
    fileProgressDb['demo3'] = { userId: 'demo3', ...demo3Progress };
    fileProgressDb['demo4'] = { userId: 'demo4', ...demo4Progress };
    fileProgressDb['democomplete'] = { userId: 'democomplete', ...democompleteProgress };

    fs.writeFileSync(JOURNEY_DB_FILE, JSON.stringify(fileProgressDb, null, 2), 'utf8');
    console.log(`Successfully updated: ${JOURNEY_DB_FILE}`);

    // =========================================================================
    // SECTION B: MongoDB Seeding (If MongoDB is available)
    // =========================================================================
    console.log(`\n--- Attempting to seed MongoDB... ---`);
    try {
      const { connectMongo, User } = require('./auth');
      const { LearningJourneyProgress } = require('./lil/learning_journey/models');

      await connectMongo();
      console.log("Connected to MongoDB successfully!");

      const usersToSeed = [
        { username: 'demo1', progress: demo1Progress },
        { username: 'demo2', progress: demo2Progress },
        { username: 'demo3', progress: demo3Progress },
        { username: 'demo4', progress: demo4Progress },
        { username: 'democomplete', progress: democompleteProgress }
      ];

      for (const spec of usersToSeed) {
        // Remove existing user if any
        const existing = await User.findOne({ username: spec.username });
        if (existing) {
          console.log(`Found existing DB user ${spec.username}, removing...`);
          await User.deleteOne({ _id: existing._id });
          await LearningJourneyProgress.deleteOne({ userId: existing._id });
        }

        // Create user
        const passwordHash = await bcrypt.hash(PASSWORD, 10);
        const user = await User.create({
          username: spec.username,
          passwordHash
        });
        console.log(`Created DB user: ${spec.username} (ID: ${user._id})`);

        // Create journey progress
        await LearningJourneyProgress.create({
          userId: user._id,
          completedConcepts: spec.progress.completedConcepts,
          completedTopics: spec.progress.completedTopics,
          conceptsNeedingRevision: spec.progress.conceptsNeedingRevision,
          checkpointAttempts: spec.progress.checkpointAttempts,
          latestCheckpointScore: spec.progress.latestCheckpointScore,
          activeCheckpoint: spec.progress.activeCheckpoint,
          activePlacementTest: spec.progress.activePlacementTest
        });
        console.log(`Created DB journey progress for: ${spec.username}`);
      }

      await mongoose.disconnect();
      console.log("Disconnected from MongoDB.");

    } catch (dbErr) {
      console.log(`MongoDB is not running or connection failed: ${dbErr.message}`);
      console.log(`Note: Login/Progress will fallback to in-memory JSON data correctly.`);
    }

    console.log(`\n==================================================`);
    console.log(`SEEDING PROCESS COMPLETE!`);
    console.log(`Credentials for demo:`);
    console.log(`1. Username: demo1       | Password: ${PASSWORD} | State: 100 questions answered (some wrong), ready to submit`);
    console.log(`2. Username: demo2       | Password: ${PASSWORD} | State: 90 questions answered (some wrong), 10 questions remaining`);
    console.log(`3. Username: demo3       | Password: ${PASSWORD} | State: 90 questions answered randomly (60% correct), 10 questions remaining`);
    console.log(`4. Username: demo4       | Password: ${PASSWORD} | State: 90 questions answered randomly (60% correct), 10 questions remaining`);
    console.log(`5. Username: democomplete| Password: ${PASSWORD} | State: Partially completed dashboard (Topics 1-3 unlocked, Topic 4 locked)`);
    console.log(`==================================================`);

  } catch (err) {
    console.error("Seeding failed:", err);
  }
}

seed();
