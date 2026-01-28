import { useState } from "react";
import Button1 from "./Button1";
import {
  API_CANCEL_MATCH,
  API_CLASSIC_ONLINE_CANCEL,
  API_CLASSIC_ONLINE_PLAY,
  API_HOST,
  API_QUICK_LUDO_CANCEL,
  API_QUICK_LUDO_PLAY,
  API_SPEED_LUDO_CANCEL,
  API_SPEED_LUDO_PLAY,
} from "../../utils/constants";
import { AiFillLike } from "react-icons/ai";

import axios from "axios";
import toastr from "toastr";
import { useTranslation } from "react-i18next";
import { MdVerified } from "react-icons/md";
import { FcRating } from "react-icons/fc";
import { HiUsers } from "react-icons/hi";
import { FaMedal } from "react-icons/fa6";
import { GrTrophy } from "react-icons/gr";
import { useNavigate } from "react-router";

export const TournamentItem = ({ data }) => {
  const [working, setWorking] = useState(false);
  const { t } = useTranslation();

  const playmatch = async () => {
    try {
      setWorking(true);
      const headers = {
        "Content-Type": "application/json",
        _t: localStorage.getItem("_tk"),
        _di: localStorage.getItem("_di"),
      };
      const res = await axios.post(
        API_HOST + API_QUICK_LUDO_PLAY,
        {
          amount: data.amount,
          ...headers,
        },
        { headers }
      );
      //console.log(res.data);
      if (res.data.success) {
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

  const navigate = useNavigate();

  return (
    <>
      <div
        className="t-card my-3 animate__animated animate__fadeInUp"
        style={{ maxWidth: "440px", margin: "auto" }}
      >
        <div className="d-flex">
          {/* LEFT */}
          <div className="col-6 t-left">
            <div className="t-item">
              <div className="t-icon">
                <FaMedal size={15} />
              </div>
              <div>
                <div className="t-label">FIRST PRIZE</div>
                <div className="t-value">₹{data.firstPrize}</div>
              </div>
            </div>

            <div className="t-item">
              <div className="t-icon">
                <GrTrophy size={15} />
              </div>
              <div>
                <div className="t-label">PRIZE POOL</div>
                <div className="t-value">₹{data.prizePool}</div>
              </div>
            </div>

            <div className="t-item">
              <div className="t-icon">
                <AiFillLike size={15} />
              </div>
              <div>
                <div className="t-label">ASSURED WINNERS</div>
                <div className="t-value">{data.assuredWinners}</div>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="col-6 t-right">
            <div>
              <div
                className="text-center fw-bold"
                style={{ fontSize: "11px", opacity: 0.9 }}
              >
                {data.name}
              </div>
              <div
                className="text-center"
                style={{ fontSize: "10px", opacity: 0.7 }}
              >
                ENTRIES
              </div>

              <div className="mt-2">
                <div className="progress bg-dark">
                  <div
                    className="progress-bar bg-warning"
                    style={{
                      width: `${
                        (data.totalJoined / data.totalAllowedEntries) * 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="mt-1" style={{ fontSize: "10px", opacity: 0.7 }}>
                {data.totalJoined} / {data.totalAllowedEntries} filled
              </div>
            </div>

            {/* BUTTONS */}
            <div>
              <div
                className="text-center"
                style={{ fontSize: "10px", opacity: 0.7 }}
              >
                ENTRY
              </div>

              {data.status === "completed" && (
                <button
                  className="btn btn-secondary rounded-pill w-100 fw-bold py-1 mt-1"
                  style={{ fontSize: "13px" }}
                  onClick={() => navigate("/open-tournament/" + data._id)}
                >
                  OPEN
                </button>
              )}
              {data.status === "running" &&
                (data.isUserPlaying ? (
                  <button
                    className="btn btn-warning rounded-pill w-100 fw-bold py-1 mt-1"
                    style={{ fontSize: "13px" }}
                    onClick={() => navigate("/open-tournament/" + data._id)}
                  >
                    RESUME GAME
                  </button>
                ) : (
                  <button
                    className="btn btn-success rounded-pill w-100 fw-bold py-1 mt-1"
                    style={{ fontSize: "13px" }}
                    onClick={() => navigate("/open-tournament/" + data._id)}
                  >
                    ₹{data.entryFee}
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
