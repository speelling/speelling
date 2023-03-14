import { User } from "firebase/auth";
import {
  equalTo,
  get,
  orderByChild,
  query,
  ref,
  serverTimestamp,
  set,
  update,
} from "firebase/database";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { myList } from "../assets/words";
import "../css/Home.css";
import Register from "./Register";
import BadWords from "bad-words";
import {
  faCrown,
  faFileAudio,
  faSpaceShuttle,
  faVolumeUp,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface NavbarProps {
  user: User | null;
}

interface FirebaseData {
  displayName: string;
  score: number;
  time: object;
}

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

  const memoizedGetRandomWord = useMemo(() => {
    return (words: string[]) => {
      const randomIndex = Math.floor(Math.random() * words.length);
      setSpell(words[randomIndex]);
    };
  }, []);

  /// USE EFFECT GET WORD EVERY LOAD

  useEffect(() => {
    memoizedGetRandomWord(myList);
  }, [memoizedGetRandomWord, myList]);

  // CHECK ANSWER IS CORRECT

  const checkAnswer = (userinput: string): boolean => {
    const isCorrect = userinput.toLowerCase() === spell.toLowerCase();
    if (isCorrect) {
      console.log("correct");
      setCorrect(correct + 1);
      setScore(score + spell.length * 1 * time);
      setAnswerStatus("correct");
    } else if (isCorrect == false) {
      console.log("wrong");
      setAnswerStatus("incorrect");
    }
    return isCorrect;
  };

  /////// MP3 FILE SECTION

  // GET MP3 FILE FROM API

  const getmp3 = async (): Promise<string> => {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${spell}`
    );
    const data = await response.json();

    for (const phonetic of data[0].phonetics) {
      if (phonetic.audio) {
        return phonetic.audio;
      }
    }

    // Throw an error if no audio property is found in any phonetics
    throw new Error("No audio found in phonetics");
  };

  // PLAY MP3
  const playSound = async () => {
    try {
      const result = await getmp3();
      const mp3 = new Audio(result);
      mp3.addEventListener("canplay", () => {
        mp3.play();
      });
      alert(result);
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
    memoizedGetRandomWord(myList);
    setRound(round + 1);
    setButtonText("Submit");
    setAnswerStatus("");
    setShowSoundButton(true);
    setTimeIsUp(false);

    console.log(correct);
  }

  // GO TO ANSWERS PAGE IF TIME RUN OUT

  const specialChars = /^[a-zA-Z0-9]*$/;
  // FIREBASE STUFF
  const [name, setName] = useState<string>("");
  const [Data, setUserData] = useState<FirebaseData>(); // add userData to component state

  const getfile = async () => {
    if (!user) {
      console.log("well done!");
    } else {
      const userRef = ref(db, `users/${user.uid}`);
      const userSnap = await get(userRef);
      const userData = userSnap.val();
      setUserData(userData);
    }
  };

  const setOrUpdate = async () => {
    if (!user) {
      console.log("error");
      handleRestart();
    } else {
      const filter = new BadWords();
      const isProfane = filter.isProfane(name);

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
          alert("display name already exists");
          setName("");

          return;
        }

        if (name.length < 3) {
          alert("name must be 3 characters or more");
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

  useEffect(() => {
    if (round > 10) {
      getfile();
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
      <div>
        <div className="Home">
          {!user && (
            <div>
              <div>{`you got ${correct}/10 correct`}</div>
              <div>{`you scored ${score} points`}</div>
              <Link to={"register"}>
                Register here to save your score in the leaderboard!
              </Link>
              <button onClick={handleRestart}>play again</button>
            </div>
          )}

          {!Data && user && (
            <div>
              <div>{`you got ${correct}/10 correct`}</div>
              <div>{`you scored ${score} points`}</div>
              <button onClick={setOrUpdate}>save score</button>
              <label>
                Enter your name:
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
            </div>
          )}

          {user && Data && (
            <div>
              <div>{`you got ${correct}/10 correct`}</div>
              <div>{`you scored ${score} points`}</div>

              <button onClick={setOrUpdate}>save score</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  /// MAIN VIEW
  return (
    <div>
      <div className="Home">
        <div style={{ display: "" }}>
          <h1>{`Round  ${round}/10`}</h1>

          <div>
            <div>00:{time.toString().padStart(2, "0")}</div>
            {score}
          </div>
        </div>

        <div>
          {showSoundButton && (
            <button onClick={playSound}>
              <FontAwesomeIcon icon={faVolumeUp} />
            </button>
          )}
        </div>
        {buttonText === "Submit" ? (
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
              maxLength={spell.length}
              autoComplete="off"
            />

            <div>
              <button type="submit">{buttonText}</button>
            </div>
          </form>
        ) : (
          <div>
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

            <button onClick={nextTurn}>{buttonText}</button>
          </div>
        )}
        <div className={answerStatus === "correct" ? "correct" : "incorrect"}>
          {answerStatus}
        </div>
      </div>
    </div>
  );
}

export default Home;
