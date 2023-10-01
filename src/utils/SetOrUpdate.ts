import BadWords from "bad-words";
import { User } from "firebase/auth";
import { get, ref, serverTimestamp, set, update } from "firebase/database";
import { db } from "../../firebase";

const specialChars = /^[a-zA-Z0-9]*$/;

const setOrUpdate = async (
  user: User | null,
  name: string,
  setName: (name: string) => void,
  score: number,
  handleRestart: () => Promise<void>,
  Data: any
) => {
  if (!user) {
    return;
  } else {
    const filter = new BadWords();
    const isProfane = filter.isProfane(name);

    if (isProfane) {
      alert("Display name contains profanity.");
      setName("");
      return;
    }

    if (!specialChars.test(name)) {
      alert(
        "Error: Name can only contain letters and numbers (no spaces or special characters)"
      );
      return;
    }

    const prevScore = Data?.score ?? 0;
    const userRef = ref(db, `users/${user.uid}`);
    const displayNameRef = ref(db, `displayNames/${name}`);

    if (!Data?.displayName) {
      const displayNameSnapshot = await get(displayNameRef);
      if (displayNameSnapshot.exists()) {
        setName("");
        alert("display name already exists");

        return;
      }

      if (name.length < 3) {
        alert("name must be 3 characters or more");
        return;
      }

      if (name.length > 10) {
        alert("name must be 10 characters or less");
        return;
      }

      try {
        await set(userRef, {
          displayName: name,
          score: score,
          time: serverTimestamp(),
        });
        await set(displayNameRef, true);
        console.log("Both database writes were successful");
      } catch (error) {
        console.error(
          "An error occurred while writing to the database:",
          error
        );
      }
    } else if (score > prevScore) {
      await update(userRef, {
        score: score,
        time: serverTimestamp(),
      });
      console.log("updated");
    } else {
      console.log("Current score is not higher than the previous one");
    }
    handleRestart();
  }
};

export default setOrUpdate;
