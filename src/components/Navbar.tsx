import { User, signOut } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import "../css/Navbar.css";

interface NavbarProps {
  user: User | null;
}

function Navbar({ user }: NavbarProps) {
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        navigate("/");
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
            <div className="lddis">Leaderboard</div>
          </Link>
        </div>
      </div>

      <div className="navbar__right">
        {user ? (
          <div className="user">
            <div className="usericon">
              <Link to={"/Account"}>
                <div className="emdis">Account</div>
              </Link>
            </div>
            <div className="logout">
              <button className="navbut" onClick={handleSignOut}>
                Logout
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="user">
              <Link to={"/register"} className="register-login">
                <div className="usericon">
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
