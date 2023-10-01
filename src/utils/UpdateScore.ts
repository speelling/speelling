import { User } from "firebase/auth";
import { ref, serverTimestamp, update } from "firebase/database";
import { db } from "../../firebase";

const UpdateScore = async (user: User | null, score: number, Data: any) => {
  if (!user) {
    return;
  } else {
    const prevScore = Data?.score ?? 0;
    const userRef = ref(db, `users/${user.uid}`);

    if (score > prevScore) {
      await update(userRef, {
        score: score,
        time: serverTimestamp(),
      });
    }
  }
};

export default UpdateScore;
