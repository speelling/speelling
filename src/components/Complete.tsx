import React from "react";

import { Link } from "react-router-dom";
import { CompleteProps } from "../types/CompletePage";

const Complete: React.FC<CompleteProps> = ({
  user,
  correct,
  score,
  Data,
  name,
  handleRestart,
  setName,
  setOrUpdate,
}) => {
  return (
    <div>
      <div className="Home">
        {!user && (
          <div className="subbut">
            <div>{`you got ${correct}/10 correct`}</div>
            <div>{`you scored ${score} points`}</div>
            <div className="playagain">
              <Link to={"register"}>
                Register here to keep track of your score!
              </Link>
            </div>
            <div>
              <button className="" onClick={handleRestart}>
                play again
              </button>
            </div>
          </div>
        )}

        {!Data && user && (
          <div>
            <div>{`you got ${correct}/10 correct`}</div>
            <div>{`you scored ${score} points`}</div>

            <label>
              Enter your name:
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <div>
              <button className="" onClick={setOrUpdate}>
                save score
              </button>
            </div>
          </div>
        )}

        {user && Data && (
          <div className="subbut">
            <div>{`you got ${correct}/10 correct`}</div>
            <div>{`you scored ${score} points`}</div>

            <button className="" onClick={setOrUpdate}>
              save score
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Complete;
