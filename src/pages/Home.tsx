import { get, ref, serverTimestamp, set, update } from "firebase/database";
import { Howl } from "howler";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { myList } from "../assets/words";
import Answer from "../components/Answer";
import Complete from "../components/Complete";
import Question from "../components/Question";
import "../css/Home.css";
import { FirebaseData } from "../types/FirebaseData";
import { NavbarProps } from "../types/NavbarProps";
import memoizedGetRandomWord from "../utils/GetWord";
import { getmp3 } from "../utils/mp3";
import BadWords from "bad-words";

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

  /////// MP3 FILE SECTION
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
    } catch (error) {
      console.error(error);
    }
  };

  // SHOW ANSWERS PAGE FOR EACH SPELL / CORRECT/INCORRECT

  function newTurn(userinput: string) {
    const isCorrect = checkAnswer(userinput);
    setIsActive(false);
    setButtonText("Next");
    setShowSoundButton(false);

    if (isCorrect) {
      setAnswerStatus("correct");
    } else {
      setAnswerStatus("incorrect");
    }
  }

  // GO TO THE NEXT SPELLING QUESTION

  function nextTurn() {
    setValue("");

    setTime(10);
    memoizedGetRandomWord(setSpell, myList);
    setRound(round + 1);
    setButtonText("Submit");
    setAnswerStatus("");
    setShowSoundButton(true);
    setTimeIsUp(false);
  }

  // GO TO ANSWERS PAGE IF TIME RUN OUT

  // FIREBASE STUFF
  const [name, setName] = useState<string>("");
  const [Data, setUserData] = useState<FirebaseData>(); // add userData to component state

  const getfile = async () => {
    if (!user) {
      return;
    } else {
      const userRef = ref(db, `users/${user.uid}`);
      const userSnap = await get(userRef);
      const userData = userSnap.val();
      setUserData(userData);
    }
  };
  //////

  const specialChars = /^[a-zA-Z0-9]*$/;

  const setOrUpdate = async () => {
    if (!user) {
      return;
    } else {
      const filter = new BadWords();
      const isProfane = filter.isProfane(name);
      console.log(name);

      if (isProfane) {
        alert("Display name contains profanity.");
        setName("");
        return;
      }

      if (!specialChars.test(name)) {
        alert(
          "Error: Name can only contain letters and numbers (no spaces or special characters)"
        );
        return;
      }

      const prevScore = Data?.score ?? 0;
      const userRef = ref(db, `users/${user.uid}`);
      const displayNameRef = ref(db, `displayNames/${name}`);

      if (!Data?.displayName) {
        const displayNameSnapshot = await get(displayNameRef);
        if (displayNameSnapshot.exists()) {
          setName("");
          console.log("display name already exists");

          return;
        }

        if (name.length < 3) {
          alert("name must be 3 characters or more");
          return;
        }

        if (name.length > 10) {
          alert("name must be 10 characters or less");
          return;
        }

        try {
          await set(userRef, {
            displayName: name,
            score: score,
            time: serverTimestamp(),
          });
          await set(displayNameRef, true);
          console.log("Both database writes were successful");
        } catch (error) {
          console.error(
            "An error occurred while writing to the database:",
            error
          );
        }
      } else if (score > prevScore) {
        await update(userRef, {
          score: score,
          time: serverTimestamp(),
        });
        console.log("updated");
      } else {
        console.log("Current score is not higher than the previous one");
      }
      handleRestart();
    }
  };

  //// DATABASE WRITES SECTION

  useEffect(() => {
    if (round > 10) {
      const Data = getfile();
      setOrUpdate();
    }
  }, [round]);

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
        Data={Data}
        name={name}
        handleRestart={handleRestart}
        setName={setName}
        setOrUpdate={() => setOrUpdate()}
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
