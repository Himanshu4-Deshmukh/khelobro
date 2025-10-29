import { Link } from "react-router-dom";
import { formatTimestamp, maskMobile } from "../../../utils/api.manager";

export const TransactionListItem = ({ txn }) => {
  return (
    <>
      <div
        style={{
          opacity: txn.status == "cancelled" ? 0.5 : 1,
          backgroundColor: txn.txnType == "credit" ? "#eafaf1" : "#fdedec",
        }}
        className="text-dark p-2 border rounded my-2 d-flex justify-content-between flex-wrap"
      >
        {txn.user && (
          <div
            className={`col-12 ${
              txn.txnType == "credit" ? "bg-success" : "bg-danger"
            } rounded text-white px-2 py-1 d-flex gap-2 align-items-center`}
          >
            <img
              src={`/assets/avatars/${txn.user.profilePic}`}
              height="20px"
              className="rounded border"
            />

            <div className="small">
              {txn.txnType == "credit" ? "Credited to" : "Debited from"}{" "}
              {txn.user.fullName} ({maskMobile(txn.user.mobileNumber)})
            </div>
          </div>
        )}
        <div>
          <div className="small">{txn.remark}</div>
          <div className="small fw-bold">{txn.txnId}</div>
          <div className="xs-small">{formatTimestamp(txn.createdAt)}</div>
          <div>
            {txn.match && (
              <Link
                to={`/${txn.match.type == "manual" ? "match" : ""}${
                  txn.match.type == "speedludo" ? "speed-match" : ""
                }${txn.match.type == "quickludo" ? "quick-match" : ""}${
                  txn.match.type == "online" ? "online-match" : ""
                }${txn.match.type == "online2" ? "online-match2" : ""}/${
                  txn.match._id
                }`}
                className="btn btn-dark m-0 p-0 text-white small px-2 mx-1 rounded"
              >
                {txn.match.matchId}
              </Link>
            )}

            <span
              className={`${
                txn.txnType == "credit" ? "bg-success" : "bg-danger"
              } text-white small px-2 mx-1 rounded`}
            >
              {txn.txnType}
            </span>

            <span className="bg-primary text-white small px-2 mx-1 rounded">
              {txn.txnCtg}
            </span>
          </div>
        </div>

        <div className="text-end">
          <div>
            {txn.txnType == "credit" ? "+" : "-"} ₹{txn.amount}
          </div>
          <div className="xs-small">
            ( Cash : {txn.cash > 0 ? (txn.txnType == "credit" ? "+" : "-") : ""}
            {""}
            {txn.cash} | Reward:{""}
            {txn.reward > 0 ? (txn.txnType == "credit" ? "+" : "-") : ""}{" "}
            {txn.reward} | Bonus:{" "}
            {txn.bonus > 0 ? (txn.txnType == "credit" ? "+" : "-") : ""}
            {""}
            {txn.bonus} )
          </div>
          <div>
            <span
              className={`small ${
                txn.status == "cancelled" || txn.status == "failed"
                  ? "bg-danger text-white px-2 rounded"
                  : ""
              } ${
                txn.status == "completed"
                  ? "bg-success text-white px-2 rounded"
                  : ""
              }
              ${
                txn.status == "pending" ? "bg-info text-white px-2 rounded" : ""
              }
              `}
            >
              {txn.status}
            </span>

            {txn.txnCtg == "deposit" ? (
              <span className="bg-info small px-2 rounded text-white mx-1">
                {txn.isManual ? "manual" : "auto"}
              </span>
            ) : (
              ""
            )}
          </div>
        </div>
      </div>
    </>
  );
};
