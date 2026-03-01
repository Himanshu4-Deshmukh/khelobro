// import { useTranslation } from "react-i18next";
// import Button1 from "../elements/Button1";
// import { WalletInfo } from "../elements/WalletInfo";
// import { useEffect, useMemo, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { Link, useNavigate } from "react-router";
// import toastr from "toastr";
// import axios from "axios";
// import { API_FETCH_BALANCE, API_HOST } from "../../utils/constants";
// import { updateWallet } from "../../contexts/slices/userSlice";
// import { motion } from "motion/react";
// export const Deposit = () => {
//   const { t } = useTranslation();

//   const { isAuth, token, deviceId } = useSelector((store) => store.auth);
//   const { cash, bonus, reward } = useSelector((store) => store.user);
//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   const fetchBalance = async () => {
//     try {
//       const headers = {
//         "Content-Type": "application/json",
//         _t: localStorage.getItem("_tk"),
//         _di: localStorage.getItem("_di"),
//       };
//       const res = await axios.post(
//         API_HOST + API_FETCH_BALANCE,
//         { ...headers },
//         { headers }
//       );
//       //console.log(res.data);
//       if (res.data.success) {
//         dispatch(updateWallet(res.data));
//       } else {
//         toastr.error(t(res.data.message));
//       }
//     } catch (error) {
//       //console.log(error);
//       toastr.error(error.response ? error.response.data : error.message);
//     }
//   };

//   useEffect(() => {
//     if (!isAuth) navigate("/login");
//     fetchBalance();
//   }, []);
//   return (
//     <>
//       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
//         <div className="fw-bold fs-5 mt-3 text-center  mb-2">DEPOSIT MONEY</div>
//         <Link to="/add-money" className="text-decoration-none text-dark">
//           <div
//             className="border p-2 mb-3 rounded-2 d-flex shadow-sm align-items-center gap-2 animate__animated animate__bounceIn animate__fast"
//             style={{ backgroundColor: "rgb(241, 248, 253)" }}
//           >
//             <div>
//               <img src="/assets/paytm.png" alt="paytm" height="60px" />
//             </div>
//             <div className="">
//               <div className="fw-bold fs-5">PAY BY PAYTM UPI</div>
//               <div className="small">pay directly using paytm app</div>
//             </div>
//           </div>
//         </Link>
//         <Link to="/add-money2" className="text-decoration-none text-dark">
//           <div
//             className="border p-2 my-3 rounded-2 d-flex shadow-sm align-items-center gap-2 animate__animated animate__bounceIn animate__fast"
//             style={{ backgroundColor: "rgb(241, 248, 253)" }}
//           >
//             <div>
//               <img src="/assets/qr.png" alt="paytm" height="60px" />
//             </div>
//             <div className="">
//               <div className="fw-bold fs-5">PAY BY QR CODE</div>
//               <div className="small">
//                 pay by scanning qr code by any upi app
//               </div>
//             </div>
//           </div>
//         </Link>
//         <Link to="/add-money3" className="text-decoration-none text-dark">
//           <div
//             className="border p-2 my-3 rounded-2 d-flex shadow-sm align-items-center gap-2 animate__animated animate__bounceIn animate__fast"
//             style={{ backgroundColor: "rgb(241, 248, 253)" }}
//           >
//             <div>
//               <img src="/assets/upi.png" alt="paytm" height="60px" />
//             </div>
//             <div className="">
//               <div className="fw-bold fs-5">PAY ON UPI ID</div>
//               <div className="small">pay on upi id, manual deposit</div>
//             </div>
//           </div>
//         </Link>
//       </motion.div>
//     </>
//   );
// };


import { useTranslation } from "react-i18next";
import Button1 from "../elements/Button1";
import { WalletInfo } from "../elements/WalletInfo";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router";
import toastr from "toastr";
import axios from "axios";
import { API_FETCH_BALANCE, API_HOST } from "../../utils/constants";
import { updateWallet } from "../../contexts/slices/userSlice";
import { motion } from "motion/react";
export const Deposit = () => {
  const { t } = useTranslation();

  const { isAuth, token, deviceId, showPaytmDeposit, showQrDeposit, showUpiDeposit } = useSelector((store) => store.auth);
  const { cash, bonus, reward } = useSelector((store) => store.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fetchBalance = async () => {
    try {
      const headers = {
        "Content-Type": "application/json",
        _t: localStorage.getItem("_tk"),
        _di: localStorage.getItem("_di"),
      };
      const res = await axios.post(
        API_HOST + API_FETCH_BALANCE,
        { ...headers },
        { headers }
      );
      if (res.data.success) {
        dispatch(updateWallet(res.data));
      } else {
        toastr.error(t(res.data.message));
      }
    } catch (error) {
      toastr.error(error.response ? error.response.data : error.message);
    }
  };

  useEffect(() => {
    if (!isAuth) navigate("/login");
    fetchBalance();
  }, []);

  const noOptions = showPaytmDeposit === false && showQrDeposit === false && showUpiDeposit === false;

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="fw-bold fs-5 mt-3 text-center  mb-2">DEPOSIT MONEY</div>

        {noOptions && (
          <div className="alert alert-warning text-center my-4">
            No deposit methods are currently available. Please try again later.
          </div>
        )}

        {showPaytmDeposit !== false && (
          <Link to="/add-money" className="text-decoration-none text-dark">
            <div
              className="border p-2 mb-3 rounded-2 d-flex shadow-sm align-items-center gap-2 animate__animated animate__bounceIn animate__fast"
              style={{ backgroundColor: "rgb(241, 248, 253)" }}
            >
              <div>
                <img src="/assets/paytm.png" alt="paytm" height="60px" />
              </div>
              <div className="">
                <div className="fw-bold fs-5">PAY BY PAYTM UPI</div>
                <div className="small">pay directly using paytm app</div>
              </div>
            </div>
          </Link>
        )}

        {showQrDeposit !== false && (
          <Link to="/add-money2" className="text-decoration-none text-dark">
            <div
              className="border p-2 my-3 rounded-2 d-flex shadow-sm align-items-center gap-2 animate__animated animate__bounceIn animate__fast"
              style={{ backgroundColor: "rgb(241, 248, 253)" }}
            >
              <div>
                <img src="/assets/qr.png" alt="paytm" height="60px" />
              </div>
              <div className="">
                <div className="fw-bold fs-5">PAY BY QR CODE</div>
                <div className="small">
                  pay by scanning qr code by any upi app
                </div>
              </div>
            </div>
          </Link>
        )}

        {showUpiDeposit !== false && (
          <Link to="/add-money3" className="text-decoration-none text-dark">
            <div
              className="border p-2 my-3 rounded-2 d-flex shadow-sm align-items-center gap-2 animate__animated animate__bounceIn animate__fast"
              style={{ backgroundColor: "rgb(241, 248, 253)" }}
            >
              <div>
                <img src="/assets/upi.png" alt="paytm" height="60px" />
              </div>
              <div className="">
                <div className="fw-bold fs-5">PAY ON UPI ID</div>
                <div className="small">pay on upi id, manual deposit</div>
              </div>
            </div>
          </Link>
        )}
      </motion.div>
    </>
  );
};
