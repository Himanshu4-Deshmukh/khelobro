import { useEffect, useState } from "react";
import { fetcher } from "../../../utils/api.manager";
import { DashButton } from "../elements/DashButton";
import { UserManualMatchesItem } from "../elements/UserManualMatchesItem";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { UserOnlineMatchesItem } from "../elements/UserOnlineMatchesItem";
import { UserOnlineMatchesItem2 } from "../elements/UserOnlineMatchesItem2";

export const ManageOnlineMatches2 = () => {
  const auth = "MANAGE MATCH";
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [menu, setMenu] = useState("running");

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
  };

  const navigate = useNavigate();
  const { _access, _isSuperadmin } = useSelector((store) => store.auth);
  useEffect(() => {
    if (!_access.includes(auth) && !_isSuperadmin) navigate("/");

    fetcher(
      "/fetchOnlineMatches2",
      { status: menu, keyword: keyword },
      page,
      setPage,
      setMatches
    );
  }, [page, matches]);

  return (
    <>
      <div className="p-2 rounded shadow-sm bg-white mx-2">
        <div className="p-2 bg-white rounded mb-3">
          <div className="mb-1">Manage Classic 1 Token Matches</div>
          <div className="d-flex gap-1 flex-wrap">
            <DashButton current={menu} action={handleMenu} text="all" />
            <DashButton current={menu} action={handleMenu} text="waiting" />
            <DashButton current={menu} action={handleMenu} text="running" />
            <DashButton current={menu} action={handleMenu} text="completed" />
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
