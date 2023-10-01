import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import "../css/Register.css";
import { NavbarProps } from "../types/NavbarProps";

export default function Register({ user }: NavbarProps) {
  const navigate = useNavigate();

  // REGISTER USER

  if (user) {
    navigate("/");
  }

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const Register = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      setPassword("");
      setConfirmPassword("");
      return;
    }
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        navigate("/");
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        alert(errorMessage);

        // ..
      });
  };

  // LOG IN USER

  const [semail, setsEmail] = useState<string>("");
  const [spassword, setsPassword] = useState<string>("");

  const Signin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    signInWithEmailAndPassword(auth, semail, spassword)
      .then((userCredential) => {
        navigate("/");
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        alert(errorMessage);
      });
  };

  return (
    <>
      <div className="register-container">
        <form className="register-form" onSubmit={Register}>
          <h2>Register</h2>

          <label>
            Email:
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label>
            Password:
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <label>
            Confirm Password:
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </label>
          <div style={{ paddingTop: "10px" }}>
            <button type="submit">Submit</button>
          </div>
        </form>
        <form className="login-form" onSubmit={Signin}>
          <h2>Login</h2>
          <label>
            Email:
            <input
              type="email"
              value={semail}
              onChange={(event) => setsEmail(event.target.value)}
            />
          </label>
          <label>
            Password:
            <input
              type="password"
              value={spassword}
              onChange={(event) => setsPassword(event.target.value)}
            />
          </label>
          <div style={{ paddingTop: "10px" }}>
            <button type="submit">Submit</button>
          </div>
        </form>
      </div>
    </>
  );
}
