import { get, ref } from "firebase/database";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import "../css/Account.css";
import { NavbarProps } from "../types/NavbarProps";

function Account({ user }: NavbarProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true)
  const [Score, setScore] = useState("");
  const [Name, setName] = useState("");

  const getfile = async () => {
    if (!user) {
      navigate("/register");
      window.location.href = "/register";
    } else {
      const userRef = ref(db, `users/${user.uid}`);
      const userSnap = await get(userRef);
      const userData = userSnap.val();
      setScore(userData.score);
      setName(userData.displayName);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getfile();
  }, []);

  return (
    <>
      {isLoading ? (
        <div></div>
      ) : (
        <>
          <div className="ht">Well done {Name}</div>
          <div className="hs">Your High Score is {Score}</div>
        </>
      )}
    </>
  );
}

export default Account;
