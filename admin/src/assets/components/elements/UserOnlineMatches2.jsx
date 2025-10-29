import { useEffect, useState } from "react";
import { fetcher } from "../../../utils/api.manager";
import { TransactionListItem } from "./TransactionListItem";
import { DashButton } from "./DashButton";
import { UserManualMatchesItem } from "./UserManualMatchesItem";
import { UserOnlineMatchesItem2 } from "./UserOnlineMatchesItem2";

export const UserOnlineMatches2 = ({ user }) => {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [menu, setMenu] = useState("all");
  const [status, setStatus] = useState("");

  const [matches, setMatches] = useState([]);
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setMatches([]);
  };

  const handleMenu = (menu) => {
    setMenu(menu);
    setPage(1);
    setMatches([]);
    setStatus("");
  };

  const handleResult = (result) => {
    setStatus(result);
    setMenu("");
    setPage(1);
    setMatches([]);
  };

  useEffect(() => {
    fetcher(
      "/fetchUserOnlineMatches2",
      { userId: user._id, status: menu, keyword: keyword, result: status },
      page,
      setPage,
      setMatches
    );
  }, [page, matches]);

  return (
    <>
      <div className="p-2 rounded shadow-sm bg-white mx-2">
        <div className="p-2 bg-white rounded mb-3">
          <div className="d-flex gap-1 flex-wrap">
            <DashButton current={menu} action={handleMenu} text="all" />
            <DashButton current={menu} action={handleMenu} text="waiting" />
            <DashButton current={menu} action={handleMenu} text="running" />
            <DashButton current={menu} action={handleMenu} text="completed" />
            <DashButton current={status} action={handleResult} text="won" />
            <DashButton current={status} action={handleResult} text="lost" />
          </div>
          <form onSubmit={handleSearch}>
            <div className="d-flex gap-2 mt-2">
              <input
                type="text"
                className="form-control"
                placeholder="enter match id or room code,"
                onChange={(e) => setKeyword(e.target.value)}
              />
              <button className="btn btn-outline-primary mb-0" type="submit">
                FIND
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="">
        {matches.length > 0 && (
          <div className="d-flex flex-wrap">
            {matches.map((match) => (
              <UserOnlineMatchesItem2 key={match._id} match={match} />
            ))}
          </div>
        )}

        {matches.length < 1 && (
          <div className="text-center py-2">no matches found</div>
        )}
      </div>
    </>
  );
};
