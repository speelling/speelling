import { User } from "firebase/auth";
import { get, ref } from "firebase/database";
import React from "react";
import { db } from "../../firebase";
import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";

interface NavbarProps {
  user: User | null;
}

function Account({ user }: NavbarProps) {
  const navigate = useNavigate();

  const getfile = async () => {
    if (!user) {
      navigate("/register");
      window.location.href = "/register";
    } else {
      const userRef = ref(db, `users/${user.uid}`);
      const userSnap = await get(userRef);
      const userData = userSnap.val();
      console.log(userData);
    }
  };
  useEffect(() => {
    getfile();
  }, []); // Empty dependency array ensures the effect runs only once when mounted

  return <div>{user?.email}</div>;
}

export default Account;
