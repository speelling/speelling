import { faVolumeUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { AnswerProps } from "../types/AnswerProps";

const Answer: React.FC<AnswerProps> = ({
  round,
  time,
  score,
  showSoundButton,
  playSound,
  buttonDisabled,
  value,
  spell,
  setValue,
  answerStatus,
  nextTurn,
  inputRef,
  buttonText,
}) => {
  return (
    <div>
      <div className="homt">{`Round  ${round}/10`}</div>

      <div>
        <div>00:{time.toString().padStart(2, "0")}</div>
        {score}
      </div>

      <div className="playsound">
        {showSoundButton && (
          <button className="" onClick={playSound} disabled={buttonDisabled}>
            <FontAwesomeIcon icon={faVolumeUp} />
          </button>
        )}
      </div>
      <input
        className="homeinputs"
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        ref={inputRef}
        readOnly={true}
        maxLength={spell.length}
      />
      <div>{spell}</div>

      <button className="" onClick={nextTurn}>
        {buttonText}
      </button>

      <div className={answerStatus === "correct" ? "correct" : "incorrect"}>
        {answerStatus}
      </div>
    </div>
  );
};

export default Answer;
