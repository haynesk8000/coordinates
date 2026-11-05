type QuestionWithChoices = {
  prompt: string;
  choices?: string[];
  answer?: string | string[];
};

const shuffle = <T>(items: readonly T[], random: () => number): T[] => {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
};

/** Prepare once per attempt so feedback and ordinary renders keep the same order. */
export function prepareQuizQuestions<T extends QuestionWithChoices>(
  questions: readonly T[],
  random: () => number = Math.random,
): T[] {
  const isFourChoice = (question: T) =>
    question.choices?.length === 4 && typeof question.answer === 'string';
  const count = questions.filter(isFourChoice).length;
  // Randomize which positions receive a remainder, then shuffle the whole schedule
  // so balance does not produce a repeating A/B/C/D pattern.
  const positions = shuffle([0, 1, 2, 3], random);
  const slots = shuffle(Array.from({ length: count }, (_, index) => positions[index % 4]), random);
  let slotIndex = 0;

  return shuffle(questions, random).map((question) => {
    if (!question.choices) return question;
    if (!isFourChoice(question)) {
      return { ...question, choices: shuffle(question.choices, random) };
    }
    const choices = shuffle(question.choices.filter((choice) => choice !== question.answer), random);
    choices.splice(slots[slotIndex++], 0, question.answer as string);
    return { ...question, choices };
  });
}
