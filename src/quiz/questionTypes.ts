export type QuizSkill =
  | 'origin placement'
  | 'axis orientation'
  | 'velocity components'
  | 'acceleration components'
  | 'equation construction'
  | 'swapped axes';

export type QuizQuestion =
  | {
      id: string;
      type: 'choice' | 'equation' | 'sign' | 'origin' | 'swap';
      prompt: string;
      choices: string[];
      answer: string;
      explanation: string;
      skill: QuizSkill;
    }
  | {
      id: string;
      type: 'components';
      prompt: string;
      blanks: string[];
      choices: string[];
      answer: string[];
      explanation: string;
      skill: QuizSkill;
    }
  | {
      id: string;
      type: 'short';
      prompt: string;
      keyIdeas: string[];
      sample: string;
      explanation: string;
      skill: QuizSkill;
    };
