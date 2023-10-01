export interface QuestionProps {
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
  inputRef: any;
  buttonText: any;
  newTurn: (name: string) => void;
}
