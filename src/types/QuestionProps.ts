export interface QuestionProps {
  round: number;
  time: number;
  score: number;
  showSoundButton: boolean;
  playSound: () => Promise<void>;
  buttonDisabled: boolean;
  value: string;
  spell: string;
  setValue: (value: string) => void;
  answerStatus: string;
  inputRef: any;
  buttonText: string;
  newTurn: (name: string) => void;
}
