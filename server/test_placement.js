const { getPlacementTestQuiz } = require('./lil/learning_journey/controllers');

async function test() {
  try {
    console.log("Generating placement test quiz...");
    const quiz = await getPlacementTestQuiz('test-user');
    console.log("SUCCESS!");
    console.log("Quiz structure:", quiz);
    console.log("Number of questions:", quiz.questions.length);
  } catch (err) {
    console.error("ERROR GENERATING QUIZ:", err);
  }
}

test();
