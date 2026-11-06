export function buildIfsResult(resultData) {
  const quizQuestions = resultData.quizQuestions ?? [];
  const quizAnswers = resultData.quizAnswers ?? [];

  const answers = quizQuestions.map((question, index) => {
    const answerEntry = quizAnswers[index];
    const selectedAnswer =
      answerEntry && typeof answerEntry === "object"
        ? answerEntry.selectedAnswer ?? answerEntry.answer ?? null
        : answerEntry ?? null;
    const correctAnswer = question.correct ?? question.correctAnswer ?? null;
    const options = question.options ?? [];
    const isCorrect =
      selectedAnswer !== null &&
      selectedAnswer !== undefined &&
      String(selectedAnswer).trim().toLowerCase() ===
        String(correctAnswer).trim().toLowerCase();

    return {
      questionNo: index + 1,
      questionText:
        question.q ?? question.questionText ?? question.question ?? "",
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
    ...resultData,
    subjectCode: "IFS",
    quizScore: correctCount,
    quizTotal: quizQuestions.length,
    correctCount,
    incorrectCount: quizQuestions.length - correctCount,
    answers,
    resultSchemaVersion: 1,
  };
}