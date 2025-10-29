import express from "express";
import {
  autoLogin,
  fetchLeaderboard,
  fetchMe,
  fetchMyReferrals,
  fetchTextData,
  fetchTransactions,
  getBalance,
  logout,
  paymentQr,
  sendOtp,
  submitKyc,
  updateMe,
  verifyKyc,
  verifyOtp,
} from "../controllers/user.controller.js";
import auth from "../middlewares/auth.middleware.js";
import {
  cancelPayment,
  paymentQrStatus,
  submitPayment,
  submitWithdrawReq,
} from "../controllers/payment.controller.js";
import {
  acceptCancelRequest,
  cancelClassicOnline,
  cancelClassicOnline2,
  cancelMatch,
  cancelQuickLudo,
  cancelSpeedLudo,
  createMatch,
  fetchClassicOnline,
  fetchClassicOnline2,
  fetchGames,
  fetchMatch,
  fetchMatchData,
  fetchMatchHistory,
  fetchQuickLudo,
  fetchSpeedLudo,
  iLost,
  iWon,
  joinMatch,
  joinMatchCancel,
  joinMatchReq,
  playClassicOnline,
  playClassicOnline2,
  playQuickLudo,
  playSpeedLudo,
  submitCancelRequest,
  updateRoomCode,
} from "../controllers/match.controller.js";
import fs from "fs";
import multer from "multer";
import sharp from "sharp";
import mime from "mime-types";
import path from "path";
import { fetchMessages, sendMessage } from "../controllers/chat.controller.js";
import { uploadChatData } from "../index.js";
const router = express.Router();

const storage = multer.memoryStorage(); // Store file in memory
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
  fileFilter: (req, file, cb) => {
    // Check file type
    const mimeType = file.mimetype;
    if (!mimeType.startsWith("image/")) {
      return cb(new Error("Only image files are allowed!"));
    }
    cb(null, true);
  },
});

router.route("/sendOtp").post(sendOtp);
router.route("/verifyOtp").post(verifyOtp);
router.route("/logout").post(auth, logout);
router.route("/autologin").post(autoLogin);
router.route("/fetchGames").post(fetchGames);

//auth needed routes
router.route("/balance").post(auth, getBalance);
router.route("/paymentQr").post(auth, paymentQr);
router.route("/paymentQrStatus").post(auth, paymentQrStatus);
router.route("/submitPayment").post(auth, submitPayment);
router.route("/cancelPayment").post(auth, cancelPayment);
router.route("/fetchTransactions").post(auth, fetchTransactions);
router.route("/addWithdrawReq").post(auth, submitWithdrawReq);
router.route("/fetchLeaderboard").post(auth, fetchLeaderboard);
router.route("/updateMe").post(auth, updateMe);
router.route("/fetchMe").post(auth, fetchMe);
router.route("/fetchMyReferrals").post(auth, fetchMyReferrals);

//auth manual match routes
router.route("/createMatch").post(auth, createMatch);
router.route("/fetchMatchData").post(auth, fetchMatchData);
router.route("/fetchClassicOnline").post(auth, fetchClassicOnline);
router.route("/fetchClassic1Token").post(auth, fetchClassicOnline2);

router.route("/fetchSpeedLudo").post(auth, fetchSpeedLudo);
router.route("/fetchQuickLudo").post(auth, fetchQuickLudo);

router.route("/fetchMatch").post(auth, fetchMatch);
router.route("/cancelMatch").post(auth, cancelMatch);
router.route("/joinMatch").post(auth, joinMatch);
router.route("/joinMatchReq").post(auth, joinMatchReq);
router.route("/joinMatchCancel").post(auth, joinMatchCancel);

router.route("/updateRoomCode").post(auth, updateRoomCode);
router.route("/fetchMatchHistory").post(auth, fetchMatchHistory);
router.route("/submitCancelRequest").post(auth, submitCancelRequest);
router.route("/acceptCancelRequest").post(auth, acceptCancelRequest);

router.route("/iWon").post(upload.single("image"), auth, iWon);
router.route("/iLost").post(auth, iLost);
router.route("/playClassicOnline").post(auth, playClassicOnline);
router.route("/playClassic1Token").post(auth, playClassicOnline2);

router.route("/playSpeedLudo").post(auth, playSpeedLudo);
router.route("/playQuickLudo").post(auth, playQuickLudo);

router.route("/cancelClassicOnline").post(auth, cancelClassicOnline);
router.route("/cancelClassic1Token").post(auth, cancelClassicOnline2);

router.route("/cancelSpeedLudo").post(auth, cancelSpeedLudo);
router.route("/cancelQuickLudo").post(auth, cancelQuickLudo);

//kyc

router.route("/submitKyc").post(auth, submitKyc);
router.route("/verifyKyc").post(auth, verifyKyc);

//chat
router.route("/fetchMessages").post(auth, fetchMessages);

const createUserFolder = (mobileNumber) => {
  let dirname = uploadChatData + "/ADMIN_" + mobileNumber + "/";
  console.log("createUserFolder triggered", dirname);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true }); // Create folder if it doesn't exist
  }
  return dirname;
};

const storage2 = multer.diskStorage({
  destination: (req, file, cb) => {
    const mobileNumber = req.body.mobileNumber; // Get userId from request body
    if (!mobileNumber) {
      return cb(new Error("user data not found"), null);
    }

    const userFolder = createUserFolder(mobileNumber);
    console.log("destination called", userFolder);
    cb(null, userFolder); // Save in user-specific folder
  },
  filename: (req, file, cb) => {
    console.log("filename called", file);
    cb(null, `audio_${Date.now()}${path.extname(file.originalname)}`);
  },
});

export const upload2 = multer({
  storage: storage2,
  limits: {
    fieldSize: 25 * 1024 * 1024, // 25MB field size limit
    fileSize: 10 * 1024 * 1024,
  },
});

router.route("/sendMessage").post(upload2.single("audio"), auth, sendMessage);
router.route("/fetchTextData").post(fetchTextData);
export default router;
