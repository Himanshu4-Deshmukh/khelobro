import { useState } from "react";
import {
  API_QUICK_LUDO_PLAY,
  API_HOST
} from "../../utils/constants";

import { AiFillLike } from "react-icons/ai";
import axios from "axios";
import toastr from "toastr";
import { useTranslation } from "react-i18next";
import { FaMedal } from "react-icons/fa6";
import { GrTrophy } from "react-icons/gr";
import { useNavigate } from "react-router";

export const TournamentItem = ({ data }) => {
  const [working, setWorking] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const progress =
    (data.totalJoined / data.totalAllowedEntries) * 100;

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

      if (res.data.success) {
        setWorking(false);
      } else {
        toastr.error(t(res.data.message));
        setWorking(false);
      }
    } catch (error) {
      toastr.error(error.response ? error.response.data : error.message);
      setWorking(false);
    }
  };

  return (
    <div
      className="animate__animated animate__fadeInUp"
      style={{
        maxWidth: "460px",
        margin: "12px auto",
        borderRadius: "14px",
        overflow: "hidden",
        background: "#0f172a",
        color: "#fff",
        boxShadow: "0 8px 20px rgba(0,0,0,0.4)"
      }}
    >
      <div className="row g-0">

        {/* LEFT SIDE */}
        <div
          className="col-7"
          style={{
            padding: "14px",
            borderRight: "1px solid rgba(255,255,255,0.1)"
          }}
        >
          <div
            className="fw-bold mb-2"
            style={{ fontSize: "13px", color: "#00FFFF" }}
          >
            {data.name}
          </div>

          {/* FIRST PRIZE */}
          <div className="d-flex align-items-center mb-2">
            <FaMedal size={18} color="#00FFFF" />
            <div className="ms-2">
              <div style={{ fontSize: "10px", opacity: 0.7 }}>
                FIRST PRIZE
              </div>
              <div className="fw-bold">₹{data.firstPrize}</div>
            </div>
          </div>

          {/* Pool Prize */}
          <div className="d-flex align-items-center mb-2">
            <GrTrophy size={18} color="#00FFFF" />
            <div className="ms-2">
              <div style={{ fontSize: "10px", opacity: 0.7 }}>
                Pool Prize
              </div>
              <div className="fw-bold">₹{data.prizePool}</div>
            </div>
          </div>

          {/* WINNERS */}
          <div className="d-flex align-items-center">
            <AiFillLike size={18} color="#00FFFF" />
            <div className="ms-2">
              <div style={{ fontSize: "10px", opacity: 0.7 }}>
                ASSURED WINNERS
              </div>
              <div className="fw-bold">{data.assuredWinners}</div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div
          className="col-5 text-center"
          style={{
            padding: "14px",
            background: "#003b3b"
          }}
        >
          <div style={{ fontSize: "10px", opacity: 0.8 }}>
            ENTRIES
          </div>

          {/* PROGRESS */}
          <div className="mt-2">
            <div
              className="progress"
              style={{
                height: "6px",
                background: "#0f172a",
                borderRadius: "10px"
              }}
            >
              <div
                className="progress-bar"
                style={{
                  width: `${progress}%`,
                  background:
                    "linear-gradient(90deg,#00FFFF,#00bfbf)"
                }}
              />
            </div>
          </div>

          <div
            style={{
              fontSize: "10px",
              marginTop: "4px",
              opacity: 0.8
            }}
          >
            {data.totalJoined}/{data.totalAllowedEntries}
          </div>

          {/* ENTRY */}
          <div
            className="mt-3"
            style={{ fontSize: "10px", opacity: 0.8 }}
          >
            ENTRY
          </div>

          {data.status === "completed" && (
            <button
              className="btn w-100 mt-1"
              style={{
                borderRadius: "20px",
                fontWeight: "600",
                fontSize: "13px",
                background: "#00d9d9",
                color: "#000"
              }}
              onClick={() =>
                navigate("/open-tournament/" + data._id)
              }
            >
              OPEN
            </button>
          )}

          {data.status === "running" &&
            (data.isUserPlaying ? (
              <button
                className="btn w-100 mt-1"
                style={{
                  borderRadius: "20px",
                  fontWeight: "600",
                  fontSize: "13px",
                  background: "#00FFFF",
                  color: "#000"
                }}
                onClick={() =>
                  navigate("/open-tournament/" + data._id)
                }
              >
                RESUME GAME
              </button>
            ) : (
              <button
                className="btn w-100 mt-1"
                style={{
                  borderRadius: "20px",
                  fontWeight: "600",
                  fontSize: "13px",
                  background: "#00FFFF",
                  color: "#000"
                }}
                onClick={() =>
                  navigate("/open-tournament/" + data._id)
                }
              >
                ₹{data.entryFee}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
};