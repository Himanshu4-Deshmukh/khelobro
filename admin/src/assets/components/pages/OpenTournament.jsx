import { useEffect, useState } from "react";
import { formatTimestamp, singleFetcher } from "../../../utils/api.manager";
import { useNavigate, useParams } from "react-router-dom";
import { MatchInfo } from "../elements/MatchInfo";
import { FaRegArrowAltCircleLeft } from "react-icons/fa";
import { useSelector } from "react-redux";

export const OpenTournament = () => {
  const navigate = useNavigate();
  const { matchId } = useParams();
  const handleFailure = () => {
    navigate("/manage-tournaments");
  };
  const [match, setMatch] = useState(null);

  const fetchMatch = () => {
    setMatch(null);
    singleFetcher(
      "/fetchTournament",
      { _id: matchId },
      setMatch,
      handleFailure
    );
  };

  const { _access, _isSuperadmin } = useSelector((store) => store.auth);

  useEffect(() => {
    if (!_access.includes("MANAGE MATCH") && !_isSuperadmin) navigate("/");

    singleFetcher(
      "/fetchTournament",
      { _id: matchId },
      setMatch,
      handleFailure
    );
  }, []);

  return (
    <>
      <div className="d-flex px-2 mt-3 align-items-center justify-content-between">
        <div className="fw-bold">Tournament Information</div>
        <button
          onClick={() => history.back()}
          className="btn btn-sm py-1 btn-outline-dark "
        >
          <FaRegArrowAltCircleLeft /> Go Back
        </button>
      </div>
      {match && (
        <div>
          <div className={`p-2`}>
            <div className="border bg-white shadow rounded opacity-75">
              <div className="bg-dark fw-bold d-flex justify-content-between rounded-top px-2 py-1 small  text-white">
                <div>ENTRY FEE : ₹{match.entryFee}</div>
                <div>PRIZE POOL : ₹{match.prizePool}</div>
              </div>

              <div className="d-flex justify-content-between flex-wrap gap-1 border-top p-2">
                <div className="d-flex gap-1 flex-wrap">
                  <button className="btn btn-sm btn-dark p-0 p-1 px-2 m-0 xs-small ">
                    Name: {match.name}
                  </button>

                  <button className="btn btn-sm btn-dark p-0 p-1 px-2 m-0 xs-small ">
                    1st Prize : {match.firstPrize}
                  </button>

                  <button className="btn btn-sm btn-dark p-0 p-1 px-2 m-0 xs-small ">
                    Assured Winners : {match.assuredWinners}
                  </button>

                  <button className="btn btn-sm btn-success p-0 p-1 px-2 m-0 xs-small ">
                    Joined : {match.totalJoined} / {match.totalAllowedEntries}
                  </button>

                  <button
                    className={`btn btn-sm p-0 p-1 px-2 m-0 xs-small ${
                      match.status == "open" ? "btn-info" : ""
                    } ${match.status == "cancelled" ? "btn-danger" : ""} 
              ${match.status == "completed" ? "btn-success" : ""}
              ${match.status == "running" ? "btn-warning" : ""}
              `}
                  >
                    {match.status}
                  </button>

                  <button
                    onClick={() => {
                      fetchMatch();
                    }}
                    className="btn btn-sm btn-outline-dark p-0 p-1 px-2 m-0 xs-small "
                  >
                    Refresh Data
                  </button>
                </div>

                <div>
                  {match && match.status == "running" && (
                    <button
                      onClick={() => {
                        singleFetcher(
                          "/endTournament",
                          { _id: matchId },
                          () => {
                            fetchMatch();
                          },
                          () => {}
                        );
                      }}
                      className="btn  btn-outline-success p-0 p-1 px-2 m-0 xs-small "
                    >
                      End Tournament
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-between flex-wrap my-2">
              <button className="btn btn-sm btn-dark p-0 p-1 px-2 m-0 xs-small ">
                Created at {formatTimestamp(match.createdAt)}
              </button>

              {match.completedAt && (
                <button className="btn btn-sm btn-success p-0 p-1 px-2 m-0 xs-small ">
                  Completed at {formatTimestamp(match.completedAt)}
                </button>
              )}
            </div>

            <div
              className="rounded rounded-4 shadow-sm p-3 my-3 border"
              style={{
                background: "linear-gradient(145deg, #ffffff, #f6f6f6)",
              }}
            >
              <div className="fw-bold mb-2">Prize Distribution</div>
              <table className="table mb-0">
                <tbody>
                  {match.scoring.map((score) => {
                    return (
                      <tr key={score._id}>
                        <td className="bg-transparent">
                          Rank{" "}
                          {score.fromRank === score.toRank
                            ? score.fromRank
                            : `${score.fromRank}-${score.toRank}`}
                        </td>
                        <td className="text-end bg-transparent fw-bold">
                          ₹{score.reward}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div
              className="rounded rounded-4 shadow-sm p-3 my-3 border"
              style={{
                background: "linear-gradient(145deg, #ffffff, #f6f6f6)",
              }}
            >
              <div className="fw-bold mb-2">Entries</div>
              <table className="table mb-0 table-striped">
                <thead>
                  <tr>
                    <td>#</td>
                    <td>User</td>
                    <td>Total Entries</td>
                    <td>Total Bets</td>
                    <td>High Score</td>
                    <td>Reward Given</td>
                  </tr>
                </thead>
                <tbody>
                  {match.leaderboard.map((score, index) => {
                    return (
                      <tr key={score.userId}>
                        <td className="">{index + 1}</td>
                        <td className="">
                          <div>{score.fullName}</div>
                          <div className="small">{score.mobileNumber}</div>
                        </td>
                        <td>{score.totalPlayed}</td>
                        <td>₹ {score.totalPlayed * match.entryFee}</td>
                        <td>{score.highestScore}</td>
                        <td>₹ {score?.rewardGiven}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
