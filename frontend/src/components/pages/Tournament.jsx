import { useEffect, useState } from "react";

import $ from "jquery";
import { useTranslation } from "react-i18next";

import { useDispatch, useSelector } from "react-redux";

import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { OnlineClassicHead } from "../elements/OnlineClassicHead";
import { OnlineMatchItem } from "../elements/OnlineMatchItem";
import {
  API_FETCH_CLASSIC_ONLINE,
  API_FETCH_QUICK_LUDO,
  API_FETCH_SPEED_LUDO,
  API_FETCH_TOURNAMENTS,
  API_HOST,
} from "../../utils/constants";
import axios from "axios";
import toastr from "toastr";
import { updateWallet } from "../../contexts/slices/userSlice";
import { PMatchOnline } from "../elements/PMatchOnline";
import { SpeedLudoHead } from "../elements/SpeedLudoHead";
import { SpeedLudoItem } from "../elements/SpeedLudoItem";
import { PMatchSpeed } from "../elements/PMatchSpeed";
import { QuickLudoHead } from "../elements/QuickLudoHead";
import { PMatchQuick } from "../elements/PMatchQuick";
import { QuickLudoItem } from "../elements/QuickLudoItem";
import { TournamentItem } from "../elements/TournamentItem";
import { FaDice } from "react-icons/fa6";

export const Tournament = () => {
  const { isAuth } = useSelector((store) => store.auth);

  const [currentOption, setCurrentOption] = useState(1);
  const [omatches, setOmatches] = useState([]);
  const [thistory, setThistory] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [busy, setBusy] = useState(false);

  const fetchMatchData = async () => {
    if (busy) return;
    try {
      setBusy(true);
      const headers = {
        "Content-Type": "application/json",
        _t: localStorage.getItem("_tk"),
        _di: localStorage.getItem("_di"),
      };
      const res = await axios.post(
        API_HOST + API_FETCH_TOURNAMENTS,
        { ...headers },
        { headers }
      );

      // ////console.log(res.data);

      if (res.data.success) {
        setOmatches(res.data.matches.omatch);
        setThistory(res.data.matches.thistory);

        dispatch(updateWallet(res.data.balance));
      } else {
        toastr.error(t(res.data.message));
      }

      setBusy(false);
    } catch (error) {
      ////console.log(error);
      toastr.error(error.response ? error.response.data : error.message);
      setWorking(false);
      setBusy(false);
    }
  };
  useEffect(() => {
    if (!isAuth) navigate("/login");
    fetchMatchData();
    const fmd = setInterval(() => {
      if (!busy) fetchMatchData();
    }, 2000);

    return () => {
      clearInterval(fmd);
    };
  }, []);

  return (
    <>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
        <div className="fs-5 fw-bold text-center my-2">LUDO LEAGUE</div>
      </motion.div>

      <div className="d-flex gap-2">
        <button
          className={`btn btn-outline-dark ${
            currentOption == 1 && "btn-dark text-white"
          } btn-sm fw-bold w-100`}
          onClick={() => {
            setCurrentOption(1);
          }}
        >
          Tournaments
        </button>
        <button
          className={`btn btn-outline-dark ${
            currentOption == 2 && "btn-dark text-white"
          } btn-sm fw-bold w-100`}
          onClick={() => {
            setCurrentOption(2);
          }}
        >
          History
        </button>
      </div>
      {currentOption == 1 && (
        <div>
          {omatches &&
            omatches.length > 0 &&
            omatches.map((match, index) => (
              <TournamentItem key={match._id} data={match} />
            ))}

          {omatches.length < 1 && (
            <div className="text-center opacity-75 px-5 py-3  shadow-sm rounded border ">
              <div>
                <FaDice className="fs-1" />
              </div>
              No Tournaments Running
            </div>
          )}
        </div>
      )}

      {currentOption == 2 && (
        <div>
          <div>
            {thistory &&
              thistory.length > 0 &&
              thistory.map((match, index) => (
                <TournamentItem key={match._id} data={match} />
              ))}

            {thistory.length < 1 && (
              <div className="text-center opacity-75 px-5 py-3  shadow-sm rounded border ">
                <div>
                  <FaDice className="fs-1" />
                </div>
                No Tournment joined from last 2 days
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
