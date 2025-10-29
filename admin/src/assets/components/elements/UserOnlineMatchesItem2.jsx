import { MdVerified } from "react-icons/md";
import { formatTimestamp } from "../../../utils/api.manager";
import { WalletButton2 } from "./WalletButton2";
import { Link } from "react-router-dom";

export const UserOnlineMatchesItem2 = ({ match }) => {
  return (
    <>
      <div
        className={`col-6 p-2`}
        style={{ opacity: match.status == "cancelled" ? 0.5 : 1 }}
      >
        <div className="border bg-white shadow rounded opacity-75">
          <div className="bg-dark fw-bold d-flex justify-content-between rounded-top px-2 py-1 small  text-white">
            <div>ENTRY FEE ₹{match.entryFee}</div>
            <div>PRIZE ₹{match.prize}</div>
          </div>
          <div className="d-flex justify-content-between p-2">
            <div className="d-flex align-items-start  gap-2">
              <img
                src={`/assets/avatars/${match.hostData.profilePic}`}
                height="40px"
                width="40px"
                className="rounded border"
              />
              <div style={{ lineHeight: "18px" }}>
                <div className="fw-bold small text-dark d-flex align-items-center gap-1">
                  <span>{match.hostData.fullName}</span>{" "}
                  {match.hostData.kyc ? (
                    <MdVerified
                      className="text-success"
                      title="KYC Completed"
                    />
                  ) : (
                    ""
                  )}
                </div>
                <div>
                  {match.blue.result == "winner" ? (
                    <span className="bg-success text-white xs-small fw-bold px-1 rounded p-0">
                      Winner
                    </span>
                  ) : (
                    ""
                  )}

                  {match.blue.result == "looser" ? (
                    <span className="bg-danger text-white xs-small fw-bold px-1 rounded p-0">
                      Looser
                    </span>
                  ) : (
                    ""
                  )}
                </div>
              </div>
            </div>
            <div>
              <img src="/assets/vv.png" height="40px" />
            </div>
            {!match.green.userId && (
              <div className="d-flex align-items-center">no joiner</div>
            )}
            {match.green.userId && (
              <div className="d-flex align-items-start  gap-2">
                <div style={{ lineHeight: "18px" }}>
                  <div className="fw-bold small text-dark d-flex justify-content-end align-items-center gap-1">
                    <span>{match.joinerData.fullName}</span>{" "}
                    {match.joinerData.kyc ? (
                      <MdVerified
                        className="text-success"
                        title="KYC Completed"
                      />
                    ) : (
                      ""
                    )}
                  </div>
                  <div className="text-end">
                    {" "}
                    {match.green.result == "winner" ? (
                      <span className="bg-success text-white xs-small fw-bold px-1 rounded p-0">
                        Winner
                      </span>
                    ) : (
                      ""
                    )}
                    {match.green.result == "looser" ? (
                      <span className="bg-danger text-white xs-small fw-bold px-1 rounded p-0">
                        Looser
                      </span>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
                <img
                  src={`/assets/avatars/${match.joinerData.profilePic}`}
                  height="40px"
                  width="40px"
                  className="rounded border"
                />
              </div>
            )}
          </div>

          <div className="d-flex justify-content-between flex-wrap gap-1 border-top p-2">
            <div className="d-flex gap-1 flex-wrap">
              <button className="btn btn-sm btn-dark p-0 p-1 px-2 m-0 xs-small ">
                {match.matchId}
              </button>

              {match.roomCode && (
                <button className="btn btn-sm btn-primary p-0 p-1 px-2 m-0 xs-small ">
                  Room Code : {match.roomCode}
                </button>
              )}
              <button
                className={`btn btn-sm p-0 p-1 px-2 m-0 xs-small ${
                  match.status == "waiting" ? "btn-info" : ""
                } ${match.status == "cancelled" ? "btn-danger" : ""} 
              ${match.status == "completed" ? "btn-success" : ""}
              ${match.status == "running" ? "btn-warning" : ""}
              `}
              >
                {match.status}
              </button>
            </div>
            <div className="d-flex gap-1">
              <button className="btn btn-sm btn-info p-0 p-1 px-2 m-0 xs-small ">
                {formatTimestamp(match.createdAt)}
              </button>
              <Link
                to={`/online-match2/${match._id}`}
                className="btn m-0 btn-sm p-0 px-2 text-white  xs-small py-1 alert-success"
              >
                OPEN MATCH
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
