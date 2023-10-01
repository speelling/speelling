export interface AnswerProps {
  round: number;
  time: number;
  score: number;
  showSoundButton: boolean;
  playSound: () => Promise<void>;
  buttonDisabled: boolean;
  value: string;
  spell: string;
  setValue: any;
  answerStatus: string;
  nextTurn: any;
  inputRef: any;
  buttonText: any;
}
