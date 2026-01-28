import expres from "express";
import {
  _fetchChatList,
  addCommissionParam,
  addTxn,
  autologin,
  deleteParam,
  fetchAdmins,
  fetchChatList,
  fetchChats,
  fetchCommissionParams,
  fetchDeposits,
  fetchGameJson,
  fetchGamesList,
  fetchInfos,
  fetchLogs,
  fetchMatch,
  fetchMatches,
  fetchOnlineMatch,
  fetchOnlineMatch2,
  fetchOnlineMatches,
  fetchOnlineMatches2,
  fetchQuickMatch,
  fetchQuickMatches,
  fetchSpeedMatch,
  fetchSpeedMatches,
  fetchUser,
  fetchUserMatches,
  fetchUserOnlineMatches,
  fetchUserOnlineMatches2,
  fetchUserQuickMatches,
  fetchUsersList,
  fetchUserSpeedMatches,
  fetchUserTransactions,
  fetchWithdraws,
  sendMsg,
  submitResultApi,
  updateDepositStatus,
  updateGame,
  updateInfo,
  updateResult,
  updateUserStatus,
  updateWithdrawStatus,
  verifyLogin,
  addTournament,
  cloneTournament,
  endTournament,
  fetchTournament,
  fetchTournaments,
} from "../controllers/admin/account.controller.js";
import auth from "../middlewares/adminauth.middleware.js";
import { fetchGames } from "../controllers/match.controller.js";
import {
  addNewAdmin,
  deleteAdmin,
  fetchAdmin,
  fetchConfig,
  fetchReports,
  updateAdmin,
} from "../controllers/config.controller.js";
import { updateConfig } from "../controllers/chat.controller.js";
const router = expres.Router();
import fs from "fs";
import multer from "multer";
import { upload2 } from "./user.route.js";
import { getPaymentStatus } from "../controllers/user.controller.js";
router.route("/verifyLogin").post(verifyLogin);
router.route("/autologin").post(autologin);
router.route("/fetchUsersList").post(auth, fetchUsersList);
router.route("/fetchUserTransactions").post(auth, fetchUserTransactions);
router.route("/fetchUserMatches").post(auth, fetchUserMatches);
router.route("/fetchUserOnlineMatches").post(auth, fetchUserOnlineMatches);
router.route("/fetchUserOnlineMatches2").post(auth, fetchUserOnlineMatches2);
router.route("/fetchUserSpeedMatches").post(auth, fetchUserSpeedMatches);
router.route("/fetchUserQuickMatches").post(auth, fetchUserQuickMatches);

router.route("/fetchMatches").post(auth, fetchMatches);
router.route("/fetchOnlineMatches").post(auth, fetchOnlineMatches);
router.route("/fetchOnlineMatches2").post(auth, fetchOnlineMatches2);

router.route("/fetchSpeedMatches").post(auth, fetchSpeedMatches);
router.route("/fetchQuickMatches").post(auth, fetchQuickMatches);

router.route("/fetchWithdraws").post(auth, fetchWithdraws);
router.route("/fetchDeposits").post(auth, fetchDeposits);
router.route("/fetchUser").post(auth, fetchUser);
router.route("/fetchMatch").post(auth, fetchMatch);
router.route("/fetchOnlineMatch").post(auth, fetchOnlineMatch);
router.route("/fetchOnlineMatch2").post(auth, fetchOnlineMatch2);

router.route("/fetchSpeedMatch").post(auth, fetchSpeedMatch);
router.route("/fetchQuickMatch").post(auth, fetchQuickMatch);

router.route("/updateUserStatus").post(auth, updateUserStatus);
router.route("/updateResultApi").post(auth, submitResultApi);
router.route("/updateResult").post(auth, updateResult);
router.route("/updateWithdrawStatus").post(auth, updateWithdrawStatus);
router.route("/updateDepositStatus").post(auth, updateDepositStatus);
router.route("/getPaymentStatus").post(auth, getPaymentStatus);

router.route("/fetchLogs").post(auth, fetchLogs);
router.route("/fetchChats").post(auth, fetchChats);
router.route("/fetchInfos").post(auth, fetchInfos);
router.route("/fetchGames").post(auth, fetchGamesList);

router.route("/sendMsg").post(upload2.single("audio"), auth, sendMsg);

router.route("/updateInfo").post(auth, updateInfo);
router.route("/updateGame").post(auth, updateGame);
router.route("/updateConfig").post(auth, updateConfig);
router.route("/fetchConfig").post(auth, fetchConfig);
router.route("/fetchReports").post(auth, fetchReports);
router.route("/addTxn").post(auth, addTxn);

router.route("/fetchAdmin").post(auth, fetchAdmin);
router.route("/updateAdmin").post(auth, updateAdmin);

router.route("/addNewAdmin").post(auth, addNewAdmin);
router.route("/addCommisionParam").post(auth, addCommissionParam);
router.route("/fetchCommissionParams").post(auth, fetchCommissionParams);
router.route("/fetchAdmins").post(auth, fetchAdmins);
router.route("/fetchGameJson").post(auth, fetchGameJson);
router.route("/deleteAdmin").post(auth, deleteAdmin);
router.route("/deleteParam").post(auth, deleteParam);
router.route("/fetchUserList").post(auth, _fetchChatList);



router.route("/addNewTournament").post(auth, addTournament);
router.route("/fetchTournaments").post(auth, fetchTournaments);
router.route("/fetchTournament").post(auth, fetchTournament);
router.route("/endTournament").post(auth, endTournament);
router.route("/cloneTournament").post(auth, cloneTournament);

export default router;
