import React from "react";
import { useEffect, useState } from "react";

import { Link } from "react-router-dom";
import { CompleteProps } from "../types/CompletePage";
import getfile from "../utils/GetFile";
import UpdateScore from "../utils/UpdateScore";
import setOrUpdate from "../utils/SetOrUpdate";

const Complete: React.FC<CompleteProps> = ({
  user,
  correct,
  score,
  name,
  handleRestart,
  setName,
}) => {
  const [Data, setData] = useState();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getfile(user)
      .then((dataFromGetFile) => {
        setData(dataFromGetFile);
        UpdateScore(user, score, dataFromGetFile);
        setIsLoading(false);
      })
      .catch((error) => {});
  }, []);

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

        {user && !Data && !isLoading && (
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
              <button
                className=""
                onClick={() => {
                  setOrUpdate(user, name, setName, score, handleRestart, Data)
                    .then(() => {})
                    .catch((error) => {});
                }}
              >
                save score
              </button>
            </div>
          </div>
        )}

        {user && Data && (
          <div className="subbut">
            <div>{`you got ${correct}/10 correct`}</div>
            <div>{`you scored ${score} points`}</div>

            <button className="" onClick={handleRestart}>
              play again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Complete;
