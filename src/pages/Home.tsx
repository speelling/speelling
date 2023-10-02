import { Howl } from "howler";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { myList } from "../assets/words";
import Answer from "../components/Answer";
import Complete from "../components/Complete";
import Question from "../components/Question";
import "../css/Home.css";
import { NavbarProps } from "../types/NavbarProps";
import memoizedGetRandomWord from "../utils/GetWord";
import { getmp3 } from "../utils/mp3";

function Home({ user }: NavbarProps) {
  // USE STATES AND OTHER EFFECTS
  const [spell, setSpell] = useState("");
  const [value, setValue] = useState("");
  const [round, setRound] = useState(1);
  const [correct, setCorrect] = useState(0);
  const [score, setScore] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const [answerStatus, setAnswerStatus] = useState("");
  const [buttonText, setButtonText] = useState("Submit");
  const [showSoundButton, setShowSoundButton] = useState(true);
  const [timeIsUp, setTimeIsUp] = useState(false);
  const navigate = useNavigate();
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [name, setName] = useState<string>("");

  //TIMER

  const [time, setTime] = useState<number>(10);
  const [isActive, setIsActive] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && time > 0) {
      timerRef.current = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (time === 0 && !timeIsUp) {
      clearInterval(timerRef.current!);
      setTimeIsUp(true);
      newTurn("");
    }
    return () => clearInterval(timerRef.current!);
  }, [isActive, time, timeIsUp]);
  const handleStart = () => {
    if (!isActive) {
      setIsActive(true);
    }
  };

  //GET RANDOM WORDS

  useEffect(() => {
    memoizedGetRandomWord(setSpell, myList);
  }, [memoizedGetRandomWord]);

  // CHECK ANSWER IS CORRECT

  const checkAnswer = (userinput: string): boolean => {
    const isCorrect = userinput.toLowerCase() === spell.toLowerCase();
    if (isCorrect) {
      setCorrect(correct + 1);
      setScore(score + spell.length * 5 * time);
      setAnswerStatus("correct");
    } else if (isCorrect == false) {
      setAnswerStatus("incorrect");
    }
    return isCorrect;
  };

  // PLAY MP3
  const playSound = async () => {
    try {
      const result = await getmp3(spell);
      const sound = new Howl({
        volume: 0.6,
        src: [result],
        onend: () => {
          setButtonDisabled(false);
        },
      });

      if (!buttonDisabled) {
        setButtonDisabled(true);
        sound.play();
      }

      handleStart();

      if (inputRef.current !== null) {
        inputRef.current.removeAttribute("readOnly");
        inputRef.current.focus();
      }
    } catch (error) {}
  };

  // SHOW ANSWERS PAGE FOR EACH SPELL / CORRECT/INCORRECT

  const newTurn = (userinput: string) => {
    const isCorrect = checkAnswer(userinput);
    setIsActive(false);
    setButtonText("Next");
    setShowSoundButton(false);

    if (isCorrect) {
      setAnswerStatus("correct");
    } else {
      setAnswerStatus("incorrect");
    }
  };

  // GO TO THE NEXT  QUESTION

  const nextTurn = () => {
    setValue("");

    setTime(10);
    memoizedGetRandomWord(setSpell, myList);
    setRound(round + 1);
    setButtonText("Submit");
    setAnswerStatus("");
    setShowSoundButton(true);
    setTimeIsUp(false);
  };

  // RESTART GAME

  const handleRestart = async () => {
    setRound(0);
    setScore(0);
    setCorrect(0);
  };

  // END OF GAME PAGE

  if (round > 10) {
    return (
      <Complete
        user={user}
        correct={correct}
        score={score}
        name={name}
        handleRestart={handleRestart}
        setName={setName}
      />
    );
  }

  /// MAIN VIEW
  return (
    <div>
      <div className="Home">
        {buttonText === "Submit" ? (
          <Question
            round={round}
            time={time}
            score={score}
            showSoundButton={showSoundButton}
            playSound={playSound}
            buttonDisabled={buttonDisabled}
            value={value}
            spell={spell}
            setValue={setValue}
            answerStatus={answerStatus}
            newTurn={newTurn}
            inputRef={inputRef}
            buttonText={buttonText}
          />
        ) : (
          <Answer
            round={round}
            time={time}
            score={score}
            showSoundButton={showSoundButton}
            playSound={playSound}
            buttonDisabled={buttonDisabled}
            value={value}
            spell={spell}
            setValue={setValue}
            answerStatus={answerStatus}
            nextTurn={nextTurn}
            inputRef={inputRef}
            buttonText={buttonText}
          />
        )}
      </div>
    </div>
  );
}

export default Home;
