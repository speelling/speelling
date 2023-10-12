import { faVolumeUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { QuestionProps } from "../types/QuestionProps";

const Question: React.FC<QuestionProps> = ({
  round,
  time,
  score,
  showSoundButton,
  playSound,
  buttonDisabled,
  value,
  spell,
  setValue,
  inputRef,
  buttonText,
  newTurn,
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
      <form
        onSubmit={(event) => {
          event.preventDefault();
          newTurn(value);
        }}
      >
        <input
          className="homeinputs"
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          ref={inputRef}
          readOnly={true}
          autoComplete="off"
          spellCheck="false"
          autoCapitalize="off"
          autoCorrect={"false"}
        />

        <div className="subbut">
          <button className="" type="submit">
            {buttonText}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Question;
