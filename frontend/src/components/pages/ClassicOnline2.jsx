import { useEffect, useState } from "react";

import $ from "jquery";
import { useTranslation } from "react-i18next";

import { useDispatch, useSelector } from "react-redux";

import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { OnlineClassicHead } from "../elements/OnlineClassicHead";
import { OnlineMatchItem } from "../elements/OnlineMatchItem";
import {
  API_FETCH_CLASSIC_1TOKEN,
  API_FETCH_CLASSIC_ONLINE,
  API_HOST,
} from "../../utils/constants";
import axios from "axios";
import toastr from "toastr";
import { updateWallet } from "../../contexts/slices/userSlice";
import { PMatchOnline } from "../elements/PMatchOnline";
import { Online1TokenHead } from "../elements/Online1TokenHead";
import { OnlineMatchItem2 } from "../elements/OnlineMatchItem2";
import { PMatchOnline2 } from "../elements/PMatchOnline2";

export const ClassicOnline2 = () => {
  const { isAuth } = useSelector((store) => store.auth);

  const [omatches, setOmatches] = useState([]);
  const [pmatch, setPmatch] = useState(null);
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
        API_HOST + API_FETCH_CLASSIC_1TOKEN,
        { ...headers },
        { headers }
      );

      // //console.log(res.data);

      if (res.data.success) {
        setOmatches(res.data.matches.omatch);
        setPmatch(res.data.matches.pmatch);

        if (res.data.matches.pmatch) {
          let gameid = localStorage.getItem("gameUid");
          if (res.data.matches.pmatch._id != gameid) {
            navigate("/classic-1token-game/" + res.data.matches.pmatch._id);
          }
        }

        dispatch(updateWallet(res.data.balance));
      } else {
        toastr.error(t(res.data.message));
      }

      setBusy(false);
    } catch (error) {
      //console.log(error);
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
    }, 800);

    return () => {
      clearInterval(fmd);
    };
  }, []);

  return (
    <>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
        <Online1TokenHead />
      </motion.div>
      {pmatch && <PMatchOnline2 match={pmatch} />}

      {omatches &&
        omatches.length > 0 &&
        omatches.map((match, index) => (
          <OnlineMatchItem2 key={match.key} data={match} />
        ))}
    </>
  );
};
