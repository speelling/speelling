import { User } from "firebase/auth";
import { FirebaseData } from "./FirebaseData";

export interface CompleteProps {
  user: User | null;
  correct: number;
  score: number;
  Data: string | undefined;
  name: string;
  handleRestart: () => Promise<void>;
  setName: (name: string) => void;
  setOrUpdate: () => Promise<void>;
}
