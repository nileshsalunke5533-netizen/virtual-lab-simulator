export function buildDstResult({
  experimentNo,
  experimentName,
  questionList = [],
  selectedAnswers = {},
  ...metadata
}) {
  const answers = questionList.map((question, index) => {
    const selectedAnswer = selectedAnswers[index] ?? null;
    const correctAnswer =
      question.correct ?? question.answer ?? question.correctAnswer ?? null;
    const options = question.options ?? [];
    const isCorrect =
      selectedAnswer !== null &&
      selectedAnswer !== undefined &&
      String(selectedAnswer).trim().toLowerCase() ===
        String(correctAnswer).trim().toLowerCase();

    return {
      questionNo: index + 1,
      questionText:
        question.q ??
        question.questionText ??
        question.question ??
        question.prompt ??
        "",
      options,
      selectedAnswer,
      selectedAnswerText:
        typeof selectedAnswer === "number"
          ? options[selectedAnswer] ?? null
          : selectedAnswer,
      correctAnswer,
      correctAnswerText:
        typeof correctAnswer === "number"
          ? options[correctAnswer] ?? null
          : correctAnswer,
      isCorrect,
    };
  });

  const correctCount = answers.filter((answer) => answer.isCorrect).length;

  return {
    ...metadata,
    subjectCode: "DST",
    experimentNo,
    experimentName,
    experimentRoute: `/dst-experiment-${experimentNo}`,
    quizScore: correctCount,
    quizTotal: questionList.length,
    correctCount,
    incorrectCount: questionList.length - correctCount,
    quizQuestions: questionList,
    quizAnswers: questionList.map((_, index) => selectedAnswers[index] ?? null),
    answers,
    completed: true,
    date: new Date().toISOString(),
    resultSchemaVersion: 1,
  };
}