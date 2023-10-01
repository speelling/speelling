export interface AnswerProps {
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
  nextTurn: any;
  inputRef: any;
  buttonText: string;
}
