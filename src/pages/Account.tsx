import { User } from "firebase/auth";
import { get, ref } from "firebase/database";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import "../css/Account.css";

interface NavbarProps {
  user: User | null;
}

function Account({ user }: NavbarProps) {
  const navigate = useNavigate();
  const [Score, setScore] = useState("");

  const getfile = async () => {
    if (!user) {
      navigate("/register");
      window.location.href = "/register";
    } else {
      const userRef = ref(db, `users/${user.uid}`);
      const userSnap = await get(userRef);
      const userData = userSnap.val();
      setScore(userData.score);
    }
  };
  useEffect(() => {
    getfile();
  }, []); // Empty dependency array ensures the effect runs only once when mounted

  return (
    <>
      <div className="ht">Well done.........</div>
      <div className="hs">Your High Score is {Score}</div>;
    </>
  );
}

export default Account;
