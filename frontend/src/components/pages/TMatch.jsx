import { useEffect, useState } from "react";
import axios from "axios";
import toastr from "toastr";
import $ from "jquery";
import {
  API_ACCEPT_CANCEL_MATCH,
  API_FETCH_MATCH,
  API_FETCH_TOURNAMENT,
  API_HOST,
  API_JOIN_TOURNAMENT,
  API_UPDATE_ROOM_CODE,
} from "../../utils/constants";
import { Link, useNavigate, useParams } from "react-router";
import { RMatch } from "../elements/RMatch";
import { EnterRoomCard } from "../elements/EnterRoomCard";
import Button1 from "../elements/Button1";
import Button2 from "../elements/Button2";
import Button3 from "../elements/Button3";
import { Button4 } from "../elements/Button4";
import {
  FaHandHoldingHeart,
  FaMedal,
  FaRegArrowAltCircleLeft,
  FaRegPlayCircle,
} from "react-icons/fa";
import { useTranslation } from "react-i18next";
import CopyToClipboard from "react-copy-to-clipboard";
import { MdOutlineContentCopy } from "react-icons/md";
import { WaitingRoomCard } from "../elements/WaitingRoomCard";
import { FaRegThumbsDown, FaRegThumbsUp } from "react-icons/fa6";
import { ReqCancel } from "../elements/ReqCancel";
import { IWon } from "../elements/IWon";
import { ILost } from "../elements/ILost";
import { useSelector } from "react-redux";
import { motion } from "motion/react";
import { GrTrophy } from "react-icons/gr";
import { AiFillLike } from "react-icons/ai";
import { IoArrowBackSharp } from "react-icons/io5";

import { CiMedal } from "react-icons/ci";
import { GiMedal } from "react-icons/gi";
export const TMatch = () => {
  const { isAuth } = useSelector((store) => store.auth);
  const [busy, setBusy] = useState(false);
  const [match, setMatch] = useState(null);
  const [userType, setUserType] = useState(null);
  const [working, setWorking] = useState(false);

  const [mode, setMode] = useState(1);

  const [time, setTime] = useState(180);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mobileNumber } = useSelector((store) => store.auth);
  const params = useParams("gameUid");
  const fetchMatch = async () => {
    try {
      setBusy(true);
      const headers = {
        "Content-Type": "application/json",
        _t: localStorage.getItem("_tk"),
        _di: localStorage.getItem("_di"),
        tournamentId: params.gameUid,
      };
      const res = await axios.post(
        API_HOST + API_FETCH_TOURNAMENT,
        { ...headers },
        { headers }
      );

      if (!res.data.match) {
        navigate("/tournament");
        return;
      }
      if (res.data.success) {
        setMatch(res.data.match);
      } else {
        toastr.error(t(res.data.message));
      }
      setBusy(false);
    } catch (error) {
      //console.log(error);
      toastr.error(error.response ? error.response.data : error.message);
    }
  };

  const jointournament = async () => {
    try {
      setWorking(true);
      const headers = {
        "Content-Type": "application/json",
        _t: localStorage.getItem("_tk"),
        _di: localStorage.getItem("_di"),
      };
      const res = await axios.post(
        API_HOST + API_JOIN_TOURNAMENT,
        {
          tournamentId: match._id,
          ...headers,
        },
        { headers }
      );
      //console.log(res.data);
      if (res.data.success) {
        navigate("/play-tournament/" + res.data.data._id);
        setWorking(false);
      } else {
        toastr.error(t(res.data.message));
        setWorking(false);
      }
    } catch (error) {
      ////console.log(error);
      toastr.error(error.response ? error.response.data : error.message);
      setWorking(false);
    }
  };

  useEffect(() => {
    if (!isAuth) navigate("/login");
    fetchMatch();
    const intervalId = setInterval(() => {
      if (!busy) fetchMatch();
    }, 2000); // Runs every 1 second

    // Clean up the interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(
      2,
      "0"
    )}`;
  };
  return (
    <>
      {match && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="d-flex justify-content-between align-items-center my-3">
            <div className="fw-bold">{match.name}</div>
            <Link
              to="/tournament"
              className="btn btn-sm btn-outline-primary d-flex gap-2 align-items-center"
            >
              <IoArrowBackSharp />
              Back
            </Link>
          </div>

          <div className="d-flex gap-2">
            <button
              className={`btn btn-outline-dark ${
                mode == 1 && "btn-dark text-white fw-bold"
              } rounded-4 w-100`}
              onClick={() => setMode(1)}
            >
              Tournament
            </button>
            <button
              className={`btn btn-outline-dark ${
                mode == 2 && "btn-dark text-white fw-bold"
              } rounded-4 w-100`}
              onClick={() => setMode(2)}
            >
              {match.status == "running" && "Leaderboard"}
              {match.status == "completed" && "See Results"}
            </button>
          </div>
          {mode == 1 && (
            <div>
              {/* ALLOWED ENTRIES PER USER */}

              {match.status == "running" && (
                <div
                  className="rounded small rounded-4 py-2 px-3 text-center my-3 border fw-bold shadow-sm"
                  style={{
                    background: "linear-gradient(145deg, #fff, #f1f1f1)",
                    fontSize: "13px",
                  }}
                >
                  <FaHandHoldingHeart className="me-1" />
                  You can enter this tournament up to{" "}
                  {match.totalAllowedEntriesPerUser} times
                </div>
              )}

              {/* MAIN INFO CARD */}
              <div
                className="rounded rounded-4 shadow-sm p-3 my-3 border"
                style={{
                  background: "linear-gradient(145deg, #ffffff, #f6f6f6)",
                }}
              >
                <div className="d-flex flex-column gap-3">
                  {/* PRIZE POOL */}
                  <div className="d-flex align-items-center gap-3">
                    <div>
                      <div style={{ fontSize: "11px", opacity: 0.6 }}>
                        PRIZE POOL
                      </div>
                      <div className="fw-bold" style={{ fontSize: "24px" }}>
                        ₹{match.firstPrize}
                      </div>
                    </div>
                  </div>

                  {/* PROGRESS BAR */}
                  <div className="">
                    <div className="my-1 w-100">
                      <div
                        className="progress bg-secondary shadow-sm"
                        style={{ height: "10px" }}
                      >
                        <div
                          className="progress-bar bg-warning"
                          style={{
                            width: `${
                              (match.totalJoined / match.totalAllowedEntries) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div style={{ fontSize: "11px", opacity: 0.8 }}>
                      {match.totalJoined} / {match.totalAllowedEntries} filled
                    </div>
                  </div>

                  {/* ENTRY FEE */}
                  <div className="d-flex align-items-center gap-3">
                    <div className="text-dark">
                      <FaRegPlayCircle size={22} />
                    </div>
                    <div>
                      <div style={{ fontSize: "10px", opacity: 0.6 }}>
                        FEE PER ENTRY
                      </div>
                      <div className="fw-bold" style={{ fontSize: "15px" }}>
                        ₹{match.entryFee}
                      </div>
                    </div>
                  </div>

                  {/* FIRST PRIZE */}
                  <div className="d-flex align-items-center gap-3">
                    <div className="text-dark">
                      <FaMedal size={22} />
                    </div>
                    <div>
                      <div style={{ fontSize: "10px", opacity: 0.6 }}>
                        FIRST PRIZE
                      </div>
                      <div className="fw-bold" style={{ fontSize: "15px" }}>
                        ₹{match.firstPrize}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* PLAY BUTTON */}
              <div>
                {match.status === "running" &&
                  (match.isUserPlaying ? (
                    <button
                      className="btn btn-warning rounded-pill w-100 fw-bold py-2 fs-5"
                      onClick={() =>
                        navigate("/play-tournament/" + match.activeMatch._id)
                      }
                    >
                      RESUME GAME
                    </button>
                  ) : (
                    <Button1
                      text={t("PLAY NOW")}
                      working={working}
                      action={jointournament}
                      class="btn-success fw-bold py-2 fs-5 rounded-5 w-100"
                    />
                  ))}
              </div>

              {/* PRIZE DISTRIBUTION */}
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
            </div>
          )}

          {mode == 2 && (
            <div>
              <div
                className="rounded rounded-4 shadow-sm p-3 my-3 border"
                style={{
                  background: "linear-gradient(145deg, #ffffff, #f6f6f6)",
                }}
              >
                <div className="fw-bold mb-2 text-center">Top Scores</div>
                {match.leaderboard.length < 1 && (
                  <div className="small text-center opacity-75 my-2 p-2">
                    Join the tournament to see leaderboard
                  </div>
                )}
                <table className="table mb-0">
                  {match.status == "completed" && (
                    <thead className="">
                      <tr>
                        <td className="bg-dark fw-bold text-white">Rank</td>
                        <td className="bg-dark fw-bold text-white">Score</td>

                        <td className="text-end bg-dark fw-bold text-white">
                          Reward
                        </td>
                      </tr>
                    </thead>
                  )}
                  <tbody>
                    {match.status == "completed" &&
                      match.leaderboard.map((score, index) => {
                        if (mobileNumber == score.mobileNumber) {
                          return (
                            <tr key={score.userId} className="">
                              <td className="text-white bg-dark rounded-start fw-bold">
                                {index + 1}. You
                              </td>
                              <td className=" bg-dark text-white fw-bold">
                                {score.highestScore}
                              </td>
                              <td className="text-end bg-dark text-white fw-bold rounded-end">
                                ₹ {score.rewardAmount}
                              </td>
                            </tr>
                          );
                        }

                        return (
                          <tr key={score.userId}>
                            <td className="bg-transparent ">
                              {index + 1}. {score.fullName}
                            </td>
                            <td className="text-end bg-transparent fw-bold">
                              {score.highestScore}
                            </td>
                            <td className="text-end bg-transparent">
                              ₹ {score.rewardAmount}
                            </td>
                          </tr>
                        );
                      })}

                    {match.status == "running" &&
                      match.leaderboard.map((score, index) => {
                        if (mobileNumber == score.mobileNumber) {
                          return (
                            <tr key={score.userId} className="">
                              <td className="text-white bg-dark rounded-start fw-bold">
                                {index + 1}. You
                              </td>
                              <td className="text-end bg-dark text-white rounded-end fw-bold">
                                {score.highestScore}
                              </td>
                            </tr>
                          );
                        }

                        return (
                          <tr key={score.userId}>
                            <td className="bg-transparent ">
                              {index + 1}. {score.fullName}
                            </td>
                            <td className="text-end bg-transparent fw-bold">
                              {score.highestScore}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </>
  );
};
