import { User } from "firebase/auth";
import {
  limitToLast,
  onValue,
  orderByChild,
  query,
  ref,
} from "firebase/database";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../../firebase";
import "../css/Leaderboard.css";

type Userinfo = {
  name: string;
  score: number;
  time: string;
};

type UserTableProps = {
  usersData: Userinfo[];
};

interface NavbarProps {
  user: User | null;
}

export default function Leaderboard({ user }: NavbarProps) {
  const [usersData, setUsersData] = useState<Userinfo[]>([]);

  useEffect(() => {
    if (user) {
      const usersRef = ref(db, "users");
      const usersQuery = query(
        usersRef,
        orderByChild("score"),
        limitToLast(10)
      );
      const unsubscribe = onValue(usersQuery, (snapshot) => {
        const users: Userinfo[] = [];
        snapshot.forEach((childSnapshot) => {
          const user = childSnapshot.val();
          users.push({
            name: user.displayName,
            score: user.score,
            time: new Date(user.time).toLocaleDateString(),
          });
        });

        setUsersData(users.reverse());
        console.log(users);
      });
      return () => {
        unsubscribe();
      };
    }
  }, []);

  const memoizedUsersData = useMemo(() => usersData, [usersData]);

  function UserTable({ usersData }: UserTableProps) {
    return (
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>NAME</th>
              <th>HS</th>
              <th>DATE</th>
            </tr>
          </thead>
          <tbody>
            {usersData.map((user, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{user.name}</td>
                <td>{user.score}</td>
                <td>{user.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div>
      <div>
        {user && <UserTable usersData={memoizedUsersData} />}
        {!user && (
          <div>
            <div className="centered-text">
              <Link className="leadlink" to={"/register"}>
                SIGN IN TO VIEW LEADERBOARDS
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
