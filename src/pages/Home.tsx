import { faVolumeUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import BadWords from "bad-words";
import { get, ref, serverTimestamp, set, update } from "firebase/database";
import { Howl } from "howler";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { myList } from "../assets/words";
import "../css/Home.css";
import { FirebaseData } from "../types/FirebaseData";
import { NavbarProps } from "../types/NavbarProps";


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

  const memoizedGetRandomWord = useMemo(() => {
    const usedIndices = new Set<number>();

    return (words: string[]) => {
      let randomIndex = Math.floor(Math.random() * words.length);

      while (usedIndices.has(randomIndex)) {
        randomIndex = Math.floor(Math.random() * words.length);
      }

      usedIndices.add(randomIndex);
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
      setCorrect(correct + 1);
      setScore(score + spell.length * 5 * time);
      setAnswerStatus("correct");
    } else if (isCorrect == false) {
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
    memoizedGetRandomWord(myList);
    setRound(round + 1);
    setButtonText("Submit");
    setAnswerStatus("");
    setShowSoundButton(true);
    setTimeIsUp(false);
  }

  // GO TO ANSWERS PAGE IF TIME RUN OUT

  const specialChars = /^[a-zA-Z0-9]*$/;
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

  //// DATABASE WRITES SECTION

  const setOrUpdate = async () => {
    if (!user) {
      return;
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

  useEffect(() => {
    if (round > 10) {
      getfile();
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
  }

  /// MAIN VIEW
  return (
    <div>
      <div className="Home">
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

            <button className="" onClick={nextTurn}>
              {buttonText}
            </button>
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
