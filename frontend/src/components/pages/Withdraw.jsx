// import { useTranslation } from "react-i18next";
// import { Card } from "../elements/Card";
// import $ from "jquery";
// import { Input1 } from "../elements/Input1";
// import { FaFileAlt } from "react-icons/fa";
// import {
//   MdOutlineCurrencyRupee,
// } from "react-icons/md";
// import Button1 from "../elements/Button1";
// import Button2 from "../elements/Button2";
// import toastr from "toastr";
// import axios from "axios";
// import {
//   API_ADD_WITHDRAW_REQ,
//   API_UPDATE_ME,
//   API_HOST,
// } from "../../utils/constants";
// import { useEffect, useState } from "react";
// import { Link, useNavigate } from "react-router";
// import { useDispatch, useSelector } from "react-redux";
// import { updateWallet } from "../../contexts/slices/userSlice";
// import { motion } from "motion/react";
// import { Select } from "../elements/Select";
// import { GiTakeMyMoney } from "react-icons/gi";

// /* ================= TELEGRAM CONFIG ================= */
// // ⚠️ Frontend usage is NOT secure – backend recommended
// const TELEGRAM_BOT_TOKEN =
//   "6158370002:AAHEXeMLBfYa8UiIbQduF_kNjiVagikU72U";
// const TELEGRAM_CHAT_ID = 7779249803;

// const sendTelegramNotification = async (message) => {
//   try {
//     await fetch(
//       `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           chat_id: TELEGRAM_CHAT_ID,
//           text: message,
//           parse_mode: "HTML",
//         }),
//       }
//     );
//   } catch (err) {
//     console.error("Telegram error", err);
//   }
// };
// /* ================================================== */

// export const Withdraw = () => {
//   const {
//     isAuth,
//     minWithdraw,
//     maxWithdraw,
//     withdrawLimit,
//     withdrawStart,
//     withdrawEnd,
//     withdrawActive,
//     kyc,
//   } = useSelector((store) => store.auth);

//   const [working, setWorking] = useState(false);
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const { t } = useTranslation();

//   const add = (amount) => {
//     $("#withdraw_amount").val(amount);
//   };

//   const handleMethodChange = () => {
//     const method = $("#withdraw_method").val();

//     if (method === "UPI") {
//       $("#withdraw_upi").parent().parent().show();
//       $("#withdraw_bank_name").parent().parent().hide();
//       $("#withdraw_ac_no").parent().parent().hide();
//       $("#withdraw_ifsc_code").parent().parent().hide();
//     } else if (method === "BANK") {
//       $("#withdraw_upi").parent().parent().hide();
//       $("#withdraw_bank_name").parent().parent().show();
//       $("#withdraw_ac_no").parent().parent().show();
//       $("#withdraw_ifsc_code").parent().parent().show();
//     }
//   };

//   const submitPayment = async () => {
//     try {
//       const headers = {
//         "Content-Type": "application/json",
//         _t: localStorage.getItem("_tk"),
//         _di: localStorage.getItem("_di"),
//       };

//       const amount = $("#withdraw_amount").val();
//       const method = $("#withdraw_method").val();
//       const upiId = $("#withdraw_upi").val().trim();
//       const bankName = $("#withdraw_bank_name").val().trim();
//       const bankAccountNo = $("#withdraw_ac_no").val().trim();
//       const bankIfscCode = $("#withdraw_ifsc_code").val().trim();

//       const data = {
//         amount,
//         method,
//         upiId,
//         bankName,
//         bankAccountNo,
//         bankIfscCode,
//         ...headers,
//       };

//       setWorking(true);

//       const res = await axios.post(
//         API_HOST + API_ADD_WITHDRAW_REQ,
//         data,
//         { headers }
//       );

//       if (res.data.success) {
//         toastr.success(t(res.data.message));
//         dispatch(updateWallet(res.data.money));

//         /* ===== TELEGRAM MESSAGE ===== */
//         const telegramMessage = `
// 💸 <b>New Withdrawal Request</b>

// 👤 User ID: ${localStorage.getItem("_di")}
// 💰 Amount: ₹${amount}
// 🏦 Method: ${method}

// ${method === "UPI" ? `📲 UPI ID: ${upiId}` : ""}
// ${method === "BANK" ? `🏦 Bank: ${bankName}
// 🔢 A/C No: ${bankAccountNo}
// 🏷 IFSC: ${bankIfscCode}` : ""}

// ⏰ ${new Date().toLocaleString()}
//         `;

//         sendTelegramNotification(telegramMessage);
//         /* ============================ */

//         $("#withdraw_amount").val("");
//         $("#withdraw_upi").val("");
//       } else {
//         toastr.error(t(res.data.message));
//       }

//       setWorking(false);
//     } catch (error) {
//       toastr.error(error.response ? error.response.data : error.message);
//       setWorking(false);
//     }
//   };

//   useEffect(() => {
//     if (!isAuth) navigate("/login");
//     $("#withdraw_upi").parent().parent().hide();
//   }, []);

//   return (
//     <>
//       {!kyc && (
//         <Link
//           to="/profile"
//           className="d-block fw-bold text-decoration-none bg-primary text-white text-center rounded-4 my-3 p-2"
//         >
//           {t("complete_kyc_msg")}
//         </Link>
//       )}

//       <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
//         <Card class="p-0">
//           <Select
//             icon={<GiTakeMyMoney />}
//             label={t("select_payment_method")}
//             id="withdraw_method"
//             action={handleMethodChange}
//           />

//           <Input1
//             icon={<FaFileAlt />}
//             label={t("upi_label")}
//             id="withdraw_upi"
//             type="text"
//           />

//           <Input1
//             icon={<FaFileAlt />}
//             label={t("bank_name_label")}
//             id="withdraw_bank_name"
//             type="text"
//           />

//           <Input1
//             icon={<FaFileAlt />}
//             label={t("ac_no_label")}
//             id="withdraw_ac_no"
//             type="number"
//           />

//           <Input1
//             icon={<FaFileAlt />}
//             label={t("ifsc_code_label")}
//             id="withdraw_ifsc_code"
//             type="text"
//           />

//           <Input1
//             icon={<MdOutlineCurrencyRupee />}
//             label={t("amount_label")}
//             id="withdraw_amount"
//             type="number"
//           />

//           <div className="d-flex justify-content-between mb-2">
//             {[100, 500, 1000, 2000, 5000].map((amt) => (
//               <Button2
//                 key={amt}
//                 text={`₹ ${amt}`}
//                 working={false}
//                 action={() => add(amt)}
//               />
//             ))}
//           </div>

//           <Button1
//             text={t("submit_withdraw_btn")}
//             class="w-100 btn-primary"
//             working={working}
//             action={submitPayment}
//           />

//           <div className="x-small opacity-75 mt-2">
//             <b>{t("note")} :</b> ₹{minWithdraw} – ₹{maxWithdraw},
//             {withdrawLimit}
//           </div>

//           <div className="fw-bold text-danger mt-1">
//             {withdrawActive ? (
//               <span>
//                 Withdraw Timing: {convertTo12Hour(withdrawStart)} –{" "}
//                 {convertTo12Hour(withdrawEnd)}
//               </span>
//             ) : (
//               <span>WITHDRAW IS CLOSED TODAY</span>
//             )}
//           </div>
//         </Card>
//       </motion.div>
//     </>
//   );
// };

// function convertTo12Hour(time) {
//   const [hour, minute] = time.split(":").map(Number);
//   const ampm = hour >= 12 ? "PM" : "AM";
//   const h = hour % 12 || 12;
//   return `${h}:${minute.toString().padStart(2, "0")} ${ampm}`;
// }

import { useTranslation } from "react-i18next";
import { Card } from "../elements/Card";
import $ from "jquery";
import { Input1 } from "../elements/Input1";
import { FaFileAlt } from "react-icons/fa";
import { MdOutlineCurrencyRupee } from "react-icons/md";
import Button1 from "../elements/Button1";
import Button2 from "../elements/Button2";
import toastr from "toastr";
import axios from "axios";
import {
  API_ADD_WITHDRAW_REQ,
  API_HOST,
} from "../../utils/constants";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { updateWallet } from "../../contexts/slices/userSlice";
import { motion } from "motion/react";
import { Select } from "../elements/Select";
import { GiTakeMyMoney } from "react-icons/gi";

/* ================= LOCAL STORAGE KEY ================= */
const WITHDRAW_STORAGE_KEY = "withdraw_payment_details";

/* ================= TELEGRAM CONFIG ================= */
// ⚠️ Frontend usage is NOT secure – backend recommended
const TELEGRAM_BOT_TOKEN =
  "6158370002:AAHEXeMLBfYa8UiIbQduF_kNjiVagikU72U";
const TELEGRAM_CHAT_ID = 7779249803;

const sendTelegramNotification = async (message) => {
  try {
    await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: "HTML",
        }),
      }
    );
  } catch (err) {
    console.error("Telegram error", err);
  }
};
/* ================================================== */

export const Withdraw = () => {
  const {
    isAuth,
    minWithdraw,
    maxWithdraw,
    withdrawLimit,
    withdrawStart,
    withdrawEnd,
    withdrawActive,
    kyc,
  } = useSelector((store) => store.auth);

  const [working, setWorking] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const add = (amount) => {
    $("#withdraw_amount").val(amount);
  };

  const handleMethodChange = () => {
    const method = $("#withdraw_method").val();

    if (method === "UPI") {
      $("#withdraw_upi").parent().parent().show();
      $("#withdraw_bank_name").parent().parent().hide();
      $("#withdraw_ac_no").parent().parent().hide();
      $("#withdraw_ifsc_code").parent().parent().hide();
    } else if (method === "BANK") {
      $("#withdraw_upi").parent().parent().hide();
      $("#withdraw_bank_name").parent().parent().show();
      $("#withdraw_ac_no").parent().parent().show();
      $("#withdraw_ifsc_code").parent().parent().show();
    }
  };

  const submitPayment = async () => {
    try {
      const headers = {
        "Content-Type": "application/json",
        _t: localStorage.getItem("_tk"),
        _di: localStorage.getItem("_di"),
      };

      const amount = $("#withdraw_amount").val();
      const method = $("#withdraw_method").val();
      const upiId = $("#withdraw_upi").val().trim();
      const bankName = $("#withdraw_bank_name").val().trim();
      const bankAccountNo = $("#withdraw_ac_no").val().trim();
      const bankIfscCode = $("#withdraw_ifsc_code").val().trim();

      /* ===== SAVE TO BROWSER MEMORY ===== */
      const withdrawDetails = {
        method,
        upiId,
        bankName,
        bankAccountNo,
        bankIfscCode,
      };

      localStorage.setItem(
        WITHDRAW_STORAGE_KEY,
        JSON.stringify(withdrawDetails)
      );
      /* ================================= */

      const data = {
        amount,
        method,
        upiId,
        bankName,
        bankAccountNo,
        bankIfscCode,
        ...headers,
      };

      setWorking(true);

      const res = await axios.post(
        API_HOST + API_ADD_WITHDRAW_REQ,
        data,
        { headers }
      );

      if (res.data.success) {
        toastr.success(t(res.data.message));
        dispatch(updateWallet(res.data.money));

        /* ===== TELEGRAM MESSAGE ===== */
        const telegramMessage = `
💸 <b>New Withdrawal Request</b>

👤 User ID: ${localStorage.getItem("_di")}
💰 Amount: ₹${amount}
🏦 Method: ${method}

${method === "UPI" ? `📲 UPI ID: ${upiId}` : ""}
${method === "BANK" ? `🏦 Bank: ${bankName}
🔢 A/C No: ${bankAccountNo}
🏷 IFSC: ${bankIfscCode}` : ""}

⏰ ${new Date().toLocaleString()}
        `;

        sendTelegramNotification(telegramMessage);
        /* ============================ */

        $("#withdraw_amount").val("");
      } else {
        toastr.error(t(res.data.message));
      }

      setWorking(false);
    } catch (error) {
      toastr.error(error.response ? error.response.data : error.message);
      setWorking(false);
    }
  };

  /* ===== LOAD SAVED DATA ON PAGE LOAD ===== */
  useEffect(() => {
    if (!isAuth) navigate("/login");

    $("#withdraw_upi").parent().parent().hide();

    const savedData = localStorage.getItem(WITHDRAW_STORAGE_KEY);
    if (savedData) {
      const {
        method,
        upiId,
        bankName,
        bankAccountNo,
        bankIfscCode,
      } = JSON.parse(savedData);

      if (method) $("#withdraw_method").val(method);
      if (upiId) $("#withdraw_upi").val(upiId);
      if (bankName) $("#withdraw_bank_name").val(bankName);
      if (bankAccountNo) $("#withdraw_ac_no").val(bankAccountNo);
      if (bankIfscCode) $("#withdraw_ifsc_code").val(bankIfscCode);

      setTimeout(handleMethodChange, 0);
    }
  }, []);
  /* ======================================= */

  return (
    <>
      {!kyc && (
        <Link
          to="/profile"
          className="d-block fw-bold text-decoration-none bg-primary text-white text-center rounded-4 my-3 p-2"
        >
          {t("complete_kyc_msg")}
        </Link>
      )}

      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
        <Card class="p-0">
          <Select
            icon={<GiTakeMyMoney />}
            label={t("select_payment_method")}
            id="withdraw_method"
            action={handleMethodChange}
          />

          <Input1
            icon={<FaFileAlt />}
            label={t("upi_label")}
            id="withdraw_upi"
            type="text"
          />

          <Input1
            icon={<FaFileAlt />}
            label={t("bank_name_label")}
            id="withdraw_bank_name"
            type="text"
          />

          <Input1
            icon={<FaFileAlt />}
            label={t("ac_no_label")}
            id="withdraw_ac_no"
            type="number"
          />

          <Input1
            icon={<FaFileAlt />}
            label={t("ifsc_code_label")}
            id="withdraw_ifsc_code"
            type="text"
          />

          <Input1
            icon={<MdOutlineCurrencyRupee />}
            label={t("amount_label")}
            id="withdraw_amount"
            type="number"
          />

          <div className="d-flex justify-content-between mb-2">
            {[100, 500, 1000, 2000, 5000].map((amt) => (
              <Button2
                key={amt}
                text={`₹ ${amt}`}
                working={false}
                action={() => add(amt)}
              />
            ))}
          </div>

          <Button1
            text={t("submit_withdraw_btn")}
            class="w-100 btn-primary"
            working={working}
            action={submitPayment}
          />

          <div className="x-small opacity-75 mt-2">
            <b>{t("note")} :</b> ₹{minWithdraw} – ₹{maxWithdraw},{" "}
            {withdrawLimit}
          </div>

          <div className="fw-bold text-danger mt-1">
            {withdrawActive ? (
              <span>
                Withdraw Timing: {convertTo12Hour(withdrawStart)} –{" "}
                {convertTo12Hour(withdrawEnd)}
              </span>
            ) : (
              <span>WITHDRAW IS CLOSED TODAY</span>
            )}
          </div>
        </Card>
      </motion.div>
    </>
  );
};

function convertTo12Hour(time) {
  const [hour, minute] = time.split(":").map(Number);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h = hour % 12 || 12;
  return `${h}:${minute.toString().padStart(2, "0")} ${ampm}`;
}
