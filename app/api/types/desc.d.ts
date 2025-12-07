// Type untuk Model 3D (infoar table)
export interface Idesc {
  id: number;
  name: string;
  description: string;
}

// Type untuk Quiz table
export interface IQuiz {
  id: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  answer: string;
}