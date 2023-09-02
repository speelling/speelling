import {
  limitToLast,
  onValue,
  orderByChild,
  query,
  ref,
} from "firebase/database";
import { useEffect, useMemo, useState } from "react";
import { db } from "../../firebase";
import "../css/Leaderboard.css";
import { NavbarProps } from "../types/NavbarProps";
import { UserTableProps } from "../types/UserTable";

export interface Userinfo {
  name: string;
  score: number;
  time: string;
}

export default function Leaderboard({ user }: NavbarProps) {
  const [usersData, setUsersData] = useState<Userinfo[]>([]);

  const leaderboardget = () => {
    const usersRef = ref(db, "users");
    const usersQuery = query(usersRef, orderByChild("score"), limitToLast(10));
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
    });
    return () => {
      unsubscribe();
    };
  };
  useEffect(() => {
    leaderboardget();
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
      <div>{<UserTable usersData={memoizedUsersData} />}</div>
    </div>
  );
}
