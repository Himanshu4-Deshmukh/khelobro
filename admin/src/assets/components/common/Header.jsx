import { useState } from "react";
import { TiThMenu } from "react-icons/ti";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { resetAuth } from "../../../contexts/slices/authSlice";

export const Header = () => {
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(resetAuth());
  };
  const {
    _name,
    conflict,
    cancelReq,
    pendingResult,
    withdraw,
    deposit,
    message,
    runningMatch,
    onlineMatch,
    onlineMatch2,
    speedMatch,
    quickMatch,

    _isSuperadmin,
    _access,
  } = useSelector((store) => store.auth);
  const [sidebar, setSidebar] = useState(false);
  const handleSidebar = () => {
    if (sidebar) {
      document.body.classList.remove("g-sidenav-pinned");
    } else {
      document.body.classList.add("g-sidenav-pinned");
    }
    setSidebar((s) => !s);
  };
  return (
    <>
      <nav
        className="navbar navbar-main navbar-expand-lg px-0 mx-2 shadow-none navbar-sticky  sticky-top  bg-gray-100 mt-2"
        id="navbarBlur"
        navbar-scroll="true"
      >
        <div className="container-fluid d-flex justify-content-between align-items-center flex-wrap w-100">
          <div className="d-flex gap-1 flex-wrap align-items-center">
            {_access &&
              (_access.includes("MANAGE CONFLICT") || _isSuperadmin) && (
                <Link to="/conflicts">
                  <div
                    className={`text-nowrap btn btn-sm animate__headShake animate__infinite ${
                      conflict > 0
                        ? "btn-primary animate__animated"
                        : "btn-outline-primary"
                    } p-0 px-2 py-1`}
                  >
                    Conflicts : {conflict}
                  </div>
                </Link>
              )}
            {_access &&
              (_access.includes("CANCEL REQUEST") || _isSuperadmin) && (
                <Link to="/cancel-requests">
                  <div
                    className={`text-nowrap btn btn-sm animate__headShake animate__infinite ${
                      cancelReq > 0
                        ? "btn-primary animate__animated"
                        : "btn-outline-primary"
                    } p-0 px-2 py-1`}
                  >
                    Cancels : {cancelReq}
                  </div>
                </Link>
              )}
            {_access &&
              (_access.includes("MANAGE WITHDRAW") || _isSuperadmin) && (
                <Link to="/manage-withdraws">
                  <div
                    className={`text-nowrap btn btn-sm animate__headShake animate__infinite ${
                      withdraw > 0
                        ? "btn-primary animate__animated"
                        : "btn-outline-primary"
                    } p-0 px-2 py-1`}
                  >
                    Withdraws : {withdraw}
                  </div>
                </Link>
              )}
            {_access &&
              (_access.includes("MANAGE DEPOSIT") || _isSuperadmin) && (
                <Link to="/manage-deposits">
                  <div
                    className={`text-nowrap btn btn-sm animate__headShake animate__infinite ${
                      deposit > 0
                        ? "btn-primary animate__animated"
                        : "btn-outline-primary"
                    } p-0 px-2 py-1`}
                  >
                    Deposits : {deposit}
                  </div>
                </Link>
              )}
            {_access && (_access.includes("MANAGE MATCH") || _isSuperadmin) && (
              <>
                <Link to="/manage-matches">
                  <div
                    className={`text-nowrap btn btn-sm animate__headShake animate__infinite ${
                      runningMatch > 0 ? "btn-primary" : "btn-outline-primary"
                    } p-0 px-2 py-1`}
                  >
                    Manual : {runningMatch}
                  </div>
                </Link>

                <Link to="/manage-online-matches">
                  <div
                    className={`text-nowrap btn btn-sm animate__headShake animate__infinite ${
                      onlineMatch > 0 ? "btn-primary" : "btn-outline-primary"
                    } p-0 px-2 py-1`}
                  >
                    Online : {onlineMatch}
                  </div>
                </Link>
                <Link to="/manage-1token-matches">
                  <div
                    className={`text-nowrap btn btn-sm animate__headShake animate__infinite ${
                      onlineMatch2 > 0 ? "btn-primary" : "btn-outline-primary"
                    } p-0 px-2 py-1`}
                  >
                    1 Token : {onlineMatch2}
                  </div>
                </Link>

                <Link to="/manage-speed-matches">
                  <div
                    className={`text-nowrap btn btn-sm animate__headShake animate__infinite ${
                      speedMatch > 0 ? "btn-primary" : "btn-outline-primary"
                    } p-0 px-2 py-1`}
                  >
                    Speed : {speedMatch}
                  </div>
                </Link>

                <Link to="/manage-quick-matches">
                  <div
                    className={`text-nowrap btn btn-sm animate__headShake animate__infinite ${
                      quickMatch > 0 ? "btn-primary" : "btn-outline-primary"
                    } p-0 px-2 py-1`}
                  >
                    Quick : {quickMatch}
                  </div>
                </Link>
              </>
            )}
            {_access &&
              (_access.includes("PENDING RESULT") || _isSuperadmin) && (
                <Link to="/pending-results">
                  <div
                    className={`text-nowrap btn btn-sm animate__headShake animate__infinite ${
                      pendingResult > 0 ? "btn-primary" : "btn-outline-primary"
                    } p-0 px-2 py-1`}
                  >
                    Pending Results : {pendingResult}
                  </div>
                </Link>
              )}
            {_access && (_access.includes("CHAT SUPPORT") || _isSuperadmin) && (
              <Link to="/chat-support">
                <div
                  className={`text-nowrap btn btn-sm  animate__headShake animate__infinite ${
                    message > 0
                      ? "btn-primary animate__animated"
                      : "btn-outline-primary"
                  } p-0 px-2 py-1`}
                >
                  Chats : {message}
                </div>
              </Link>
            )}
          </div>
          <ul className="navbar-nav  justify-content-end align-items-center">
            <li className="nav-item">
              <button onClick={handleLogout} className="btn btn-danger btn-sm">
                Logout
              </button>
            </li>
            <li className="nav-item d-xl-none ps-3 d-flex align-items-center">
              <button
                onClick={handleSidebar}
                className={`btn btn-sm fs-5 px-2 p-0 ${
                  sidebar ? "btn-primary" : "btn-outline-primary"
                }`}
                id="iconNavbarSidenav"
              >
                <TiThMenu />
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
};
