import {
  faCrown,
  faSignOutAlt,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { signOut, User } from "firebase/auth";
import { Link } from "react-router-dom";
import { auth } from "../../firebase";
import "../css/Navbar.css";

interface NavbarProps {
  user: User | null;
}

function Navbar({ user }: NavbarProps) {
  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        console.log("signed out");
      })
      .catch((error) => console.log(error));
  };

  return (
    <nav className="navbar">
      <div className="navbar__left">
        <div className="Title">
          <Link to={"/"}>
            <h1 className="title">Speelling</h1>
          </Link>
        </div>

        <div className="leaderboards">
          <Link to={"/leaderboard"}>
            <div className="crown">
              <FontAwesomeIcon icon={faCrown} />
            </div>
            <div className="lddis">Leaderboard</div>
          </Link>
        </div>
      </div>

      <div className="navbar__right">
        {user ? (
          <div className="user">
            <div className="usericon">
              <FontAwesomeIcon icon={faUser} />

              <div className="emdis"> {user?.email}</div>
            </div>
            <div className="logout">
              <button className="signout" onClick={handleSignOut}>
                <FontAwesomeIcon icon={faSignOutAlt} />
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="user">
              <Link to={"/register"} className="register-login">
                <div className="usericon">
                  <FontAwesomeIcon icon={faUser} />
                  <div className="usdis"> Register/Login</div>
                </div>
              </Link>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
