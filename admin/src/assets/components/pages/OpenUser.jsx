import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { singleFetcher } from "../../../utils/api.manager";
import { UserInfo } from "../elements/UserInfo";
import { FaRegArrowAltCircleLeft } from "react-icons/fa";
import { DashButton } from "../elements/DashButton";
import { UserDashboard } from "../elements/UserDashboard";
import { UserKyc } from "../elements/UserKyc";
import { UserTransaction } from "../elements/UserTransaction";
import { UserManualMatches } from "../elements/UserManualMatches";
import { useSelector } from "react-redux";
import { UserOnlineMatches } from "../elements/UserOnlineMatches";
import { UserSpeedMatches } from "../elements/UserSpeedMatches";
import { UserQuickMatches } from "../elements/UserQuickMatches";
import { UserOnlineMatches2 } from "../elements/UserOnlineMatches2";

export const OpenUser = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [menu, setMenu] = useState("Dashboard");
  const walletRef = useRef();
  const txntypeRef = useRef();
  const amountRef = useRef();

  const handleFail = () => {
    navigate("/manage-users");
  };

  const handleRefresh = () => {
    setUser(null);
    singleFetcher("/fetchUser", { _id: userId }, setUser, handleFail);
  };

  const handleMenu = (menu) => {
    setMenu(menu);
  };
  const [user, setUser] = useState(null);

  const addTxn = () => {
    singleFetcher(
      "/addTxn",
      {
        _id: userId,
        wallet: walletRef.current.value,
        txnType: txntypeRef.current.value,
        amount: amountRef.current.value,
      },
      handleRefresh,
      () => { }
    );
  };

  const { _access, _isSuperadmin } = useSelector((store) => store.auth);
  useEffect(() => {
    console.log(_access, _access.includes("ADD TRANSACTION"));
    if (!_access.includes("MANAGE USER") && !_isSuperadmin) navigate("/");

    singleFetcher("/fetchUser", { _id: userId }, setUser, handleFail);
  }, [userId]);
  return (
    <>
      <div className="d-flex align-items-center justify-content-between">
        <div className="fw-bold">User Information</div>
        <button
          onClick={() => history.back()}
          className="btn btn-sm py-1 btn-outline-dark "
        >
          <FaRegArrowAltCircleLeft /> Go Back
        </button>
      </div>
      {user && (
        <div>
          {/* <UserInfo user={user} refresh={handleRefresh} /> */}
          <UserInfo
            user={user}
            refresh={handleRefresh}
            isSuperadmin={_isSuperadmin}
          />

          <div className="p-2 my-2 d-flex gap-2 flex-wrap">
            <DashButton current={menu} action={handleMenu} text="Dashboard" />
            <DashButton
              current={menu}
              action={handleMenu}
              text="Transactions"
            />
            <DashButton
              current={menu}
              action={handleMenu}
              text="Manual Matches"
            />
            <DashButton
              current={menu}
              action={handleMenu}
              text="Online Matches"
            />

            <DashButton
              current={menu}
              action={handleMenu}
              text="1 Token Matches"
            />

            <DashButton
              current={menu}
              action={handleMenu}
              text="Speed Matches"
            />
            <DashButton
              current={menu}
              action={handleMenu}
              text="Quick Matches"
            />
            <DashButton current={menu} action={handleMenu} text="KYC" />
            {(_access.includes("ADD TRANSACTION") || _isSuperadmin) && (
              <DashButton
                current={menu}
                action={handleMenu}
                text="Add Transaction"
              />
            )}
          </div>

          {menu == "Dashboard" && <UserDashboard user={user} />}
          {menu == "Transactions" && <UserTransaction user={user} />}
          {menu == "Manual Matches" && <UserManualMatches user={user} />}
          {menu == "Online Matches" && <UserOnlineMatches user={user} />}
          {menu == "1 Token Matches" && <UserOnlineMatches2 user={user} />}
          {menu == "Speed Matches" && <UserSpeedMatches user={user} />}
          {menu == "Quick Matches" && <UserQuickMatches user={user} />}

          {menu == "KYC" && <UserKyc user={user} />}
          {menu == "Add Transaction" && (
            <div className="border bg-shadow-sm rounded p-3 mx-2 bg-white">
              <div className="small fw-bold text-dark">Add Transaction</div>

              <div className="d-flex flex-wrap">
                <div className="col-12 col-md-4 p-1">
                  <div className="small fw-bold">Wallet</div>
                  <select
                    ref={walletRef}
                    className="form-control form-control-sm"
                  >
                    <option value="cash">Cash</option>
                    <option value="bonus">Bonus</option>
                    <option value="reward">Reward</option>
                  </select>
                </div>

                <div className="col-12 col-md-4 p-1">
                  <div className="small fw-bold">Transaction Type</div>
                  <select
                    ref={txntypeRef}
                    className="form-control form-control-sm"
                  >
                    <option value="credit">Credit</option>
                    <option value="debit">Debit</option>
                  </select>
                </div>

                <div className="col-12 col-md-4 p-1">
                  <div className="small fw-bold">Amount</div>
                  <input
                    ref={amountRef}
                    type="number"
                    className="form-control form-control-sm"
                  />
                </div>
              </div>

              <button
                onClick={addTxn}
                className="btn btn-sm btn-success w-100 mt-2"
              >
                ADD TRANSACTION
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};
