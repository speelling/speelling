import { get, ref } from "firebase/database";
import { db } from "../../firebase";
import { User } from "firebase/auth";

const getfile = async (user: User | null) => {
  if (!user) {
    return;
  } else {
    const userRef = ref(db, `users/${user.uid}`);
    const userSnap = await get(userRef);
    const userData = userSnap.val();
    console.log(userData);
    return userData;
  }
};

export default getfile;
