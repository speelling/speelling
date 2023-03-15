import React, { useEffect, useMemo, useState } from "react";
import {
  ref,
  onValue,
  query,
  orderByChild,
  limitToLast,
} from "firebase/database";
import { db } from "../../firebase";
import Navbar from "../components/Navbar";
import "../css/Leaderboard.css";
import { User } from "firebase/auth";
import { Link } from "react-router-dom";

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
        console.log(users);

        setUsersData(users.reverse());
      });
      return () => {
        // Unsubscribe from the listener when the component unmounts
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
              <th>NAME</th>
              <th>HS</th>
              <th>DATE</th>
            </tr>
          </thead>
          <tbody>
            {usersData.map((user, index) => (
              <tr key={index}>
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
