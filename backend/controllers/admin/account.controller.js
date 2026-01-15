// import { Admin, checkPassword } from "../../models/admin.model.js";
// import jwt from "jsonwebtoken";
// import User from "../../models/user.model.js";
// import { newTxnId, ubalance } from "../user.controller.js";
// import { Transaction } from "../../models/transaction.models.js";
// import { ManualMatch } from "../../models/manualmatch.model.js";
// import {
//   cancelMatchAndRefund,
//   cancelMatchAndRefund2,
//   checkGameStatus,
//   getFakeRunningMatches,
//   refBonusManager,
// } from "../match.controller.js";
// import Log from "../../models/log.model.js";
// import uniqueString from "unique-string";
// import { io, uploadChatData } from "../../index.js";
// import { Message } from "../../models/message.model.js";
// import fs from "fs";
// import { isMobileOnline } from "../socket.controller.js";
// import { Info } from "../../models/info.model.js";
// import { Game } from "../../models/game.model.js";
// import { _config, convertISTtoUTC } from "../config.controller.js";
// import { validAmount } from "../payment.controller.js";
// import Commission from "../../models/commission.model.js";
// import { OnlineGame } from "../../models/onlinegame.js";
// import { SpeedLudo } from "../../models/speedludo.js";
// import { QuickLudo } from "../../models/quickludo.js";
// import { OnlineGame2 } from "../../models/onlinegame2.js";
// export const _log = async (log) => {
//   await Log.create(log);
// };
// export const isValidEmail = (email) => {
//   const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
//   return emailRegex.test(email);
// };
// export const isEmptyOrSpaces = (str) => {
//   return str.trim().length === 0;
// };
// export const verifyLogin = async (req, res) => {
//   try {
//     const emailId = req.body.emailId;
//     const password = req.body.password;

//     if (isEmptyOrSpaces(emailId)) {
//       return res.json({
//         success: false,
//         message: "please enter valid email id",
//       });
//     }

//     if (isEmptyOrSpaces(password)) {
//       return res.json({
//         success: false,
//         message: "please enter a valid password",
//       });
//     }
//     if (!isValidEmail(emailId)) {
//       return res.json({
//         success: false,
//         message: "please enter a valid email id",
//       });
//     }

//     // const admin = await Admin.create({
//     //   name: "Monu Giri",
//     //   emailId: req.body.emailId,
//     //   password: req.body.password,
//     //   isSuperadmin: true,
//     // });

//     const admin = await Admin.findOne({
//       emailId,
//     });

//     if (!admin) {
//       return res.json({
//         success: false,
//         message: "email id is not registered",
//       });
//     }

//     if (admin.status != "active") {
//       return res.json({
//         success: false,
//         message: "your account is not active",
//       });
//     }

//     const checkAdmin = await checkPassword(password, admin);
//     if (checkAdmin) {
//       const deviceId = uniqueString();

//       await Admin.updateOne(
//         { _id: admin._id },
//         { $set: { deviceId: deviceId } }
//       );

//       const tokenData = { adminId: admin._id };
//       const token = await jwt.sign(tokenData, process.env.JWT_SECRET_KEY);
//       await _log({ message: admin.emailId + " is logged in successfully" });
//       return res.json({
//         success: true,
//         message: "account verified !",
//         auth: {
//           _token: token,
//           _name: admin.name,
//           _status: admin.status,
//           _access: admin.access,
//           _isSuperadmin: admin.isSuperadmin,
//           isAuth: true,
//           _deviceId: deviceId,
//         },
//       });
//     } else {
//       return res.json({
//         success: false,
//         message: "your password is incorrect",
//       });
//     }
//   } catch (error) {
//     return res.json({
//       success: false,
//       message: error.response ? error.response.data.message : error.message,
//     });
//   }
// };

// export const autologin = async (req, res) => {
//   try {
//     const token = req.body.token;
//     const deviceId = req.body.deviceId;

//     if (!token || !deviceId) {
//       return res.json({
//         success: false,
//         message: "invalid token and device id",
//       });
//     }

//     const decode = await jwt.verify(token, process.env.JWT_SECRET_KEY);

//     if (!decode) {
//       return res.json({
//         status: false,
//         message: "you are not authorized, to perform that action",
//       });
//     }

//     const admin = await Admin.findOne({
//       _id: decode.adminId,
//       deviceId: deviceId,
//     });

//     if (admin) {
//       if (admin.status != "active") {
//         return res.json({
//           status: false,
//           message: "you are account is not active",
//         });
//       }

//       const deviceId = uniqueString();

//       await Admin.updateOne(
//         { _id: admin._id },
//         { $set: { deviceId: deviceId } }
//       );

//       const tokenData = { adminId: admin._id };
//       const token = await jwt.sign(tokenData, process.env.JWT_SECRET_KEY);
//       // await _log({
//       //   message:
//       //     admin.emailId +
//       //     " auto logged in & all previous logins cleared out, new device id also given to admin",
//       // });
//       return res.json({
//         success: true,
//         data: {
//           _token: token,
//           _name: admin.name,
//           _status: admin.status,
//           _access: admin.access,
//           _isSuperadmin: admin.isSuperadmin,
//           isAuth: true,
//           _deviceId: deviceId,
//         },
//       });
//     } else {
//       return res.json({
//         success: false,
//         message: "admin not found , please login again",
//       });
//     }
//   } catch (error) {
//     return res.json({
//       success: false,
//       message: error.response ? error.response.data.message : error.message,
//     });
//   }
// };

// export const fetchUsersList = async (req, res) => {
//   try {
//     const limit = 20;
//     const skip = (req.body.page - 1) * limit;
//     let cond = req.body.cond;

//     const users = await User.find({
//       $or: [
//         { fullName: { $regex: cond.keyword, $options: "i" } }, // Case-insensitive name search
//         { mobileNumber: { $regex: cond.keyword, $options: "i" } }, // Search mobile number
//         { username: { $regex: cond.keyword, $options: "i" } }, // Search player ID
//       ],
//     })
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit)
//       .lean();

//     const _users = await Promise.all(
//       users.map(async (user) => {
//         user.balance = await ubalance(user);
//         user.mobileNumber = maskMobile(user.mobileNumber);
//         return user;
//       })
//     );

//     return res.json({
//       success: true,
//       data: _users,
//     });
//   } catch (error) {
//     return res.json({
//       success: false,
//       message: error.response ? error.response.data.message : error.message,
//     });
//   }
// };

// export const updateUserStatus = async (req, res) => {
//   try {
//     const { userId, status, _y, _su } = req.body;

//     // Normalize values
//     const normalizedStatus = status === "active" ? "active" : "inactive";
//     const normalizedY = Boolean(_y);
//     const normalizedSU = Boolean(_su);

//     const updatedUser = await User.updateOne(
//       { _id: userId }, // Filter
//       {
//         $set: {
//           status: normalizedStatus,
//           _y: normalizedY,
//           _su: normalizedSU,
//           updatedAt: new Date(),
//         },
//       }
//     );

//     if (!updatedUser.modifiedCount) {
//       return res.json({
//         success: false,
//         message: "user not found or no changes made",
//       });
//     }

//     const u = await User.findById(userId);

//     _log({
//       message: `${req.admin.emailId} updated status of ${u.fullName} (${u.mobileNumber}) 
//         → status: ${normalizedStatus}, _y: ${normalizedY}, _su: ${normalizedSU}`,
//     });

//     return res.json({
//       success: true,
//       message: "user status updated",
//     });
//   } catch (error) {
//     return res.json({
//       success: false,
//       message: error?.response?.data?.message || error.message,
//     });
//   }
// };

// export const fetchUser = async (req, res) => {
//   try {
//     let cond = req.body.cond;
//     if (!cond) {
//       return res.json({
//         success: false,
//         data: "invalid user page",
//       });
//     }

//     const user = await User.findOne(cond).lean();
//     if (!user) {
//       return res.json({
//         success: false,
//         data: "invalid user page",
//       });
//     }
//     // Fetch user balance asynchronously
//     user.balance = await ubalance(user);
//     user.stat = {};

//     // Batch multiple queries using Promise.all() for better performance
//     const [
//       totalRef,
//       refBy,
//       totalPlayedMatches,
//       totalPlayedMatches2,
//       totalPlayedMatches3,
//       totalPlayedMatches4,
//       totalPlayedMatches5,

//       totalWonMatches,
//       totalWonMatches2,
//       totalWonMatches3,
//       totalWonMatches4,
//       totalWonMatches5,

//       totalLostMatches,
//       totalLostMatches2,
//       totalLostMatches3,
//       totalLostMatches4,
//       totalLostMatches5,

//       depositStats,
//       withdrawalStats,
//       winningsStats,
//       referralStats,
//     ] = await Promise.all([
//       // Count total played matches
//       User.countDocuments({ referBy: user.referralCode }),
//       User.findOne({ referralCode: user.referBy }),
//       ManualMatch.countDocuments({
//         status: "completed",
//         $or: [{ "host.userId": user._id }, { "joiner.userId": user._id }],
//       }),
//       OnlineGame.countDocuments({
//         status: "completed",
//         $or: [{ "blue.userId": user._id }, { "green.userId": user._id }],
//       }),
//       SpeedLudo.countDocuments({
//         status: "completed",
//         $or: [{ "blue.userId": user._id }, { "green.userId": user._id }],
//       }),
//       QuickLudo.countDocuments({
//         status: "completed",
//         $or: [{ "blue.userId": user._id }, { "green.userId": user._id }],
//       }),
//       OnlineGame2.countDocuments({
//         status: "completed",
//         $or: [{ "blue.userId": user._id }, { "green.userId": user._id }],
//       }),

//       // Count total won matches
//       ManualMatch.countDocuments({
//         status: "completed",
//         "winner.userId": user._id,
//       }),
//       OnlineGame.countDocuments({
//         status: "completed",
//         $or: [
//           { "blue.userId": user._id, "blue.result": "winner" },
//           { "green.userId": user._id, "green.result": "winner" },
//         ],
//       }),

//       SpeedLudo.countDocuments({
//         status: "completed",
//         $or: [
//           { "blue.userId": user._id, "blue.result": "winner" },
//           { "green.userId": user._id, "green.result": "winner" },
//         ],
//       }),
//       QuickLudo.countDocuments({
//         status: "completed",
//         $or: [
//           { "blue.userId": user._id, "blue.result": "winner" },
//           { "green.userId": user._id, "green.result": "winner" },
//         ],
//       }),
//       OnlineGame2.countDocuments({
//         status: "completed",
//         $or: [
//           { "blue.userId": user._id, "blue.result": "winner" },
//           { "green.userId": user._id, "green.result": "winner" },
//         ],
//       }),

//       // Count total lost matches
//       ManualMatch.countDocuments({
//         status: "completed",
//         "looser.userId": user._id,
//       }),
//       OnlineGame.countDocuments({
//         status: "completed",
//         $or: [
//           { "blue.userId": user._id, "blue.result": "looser" },
//           { "green.userId": user._id, "green.result": "looser" },
//         ],
//       }),
//       SpeedLudo.countDocuments({
//         status: "completed",
//         $or: [
//           { "blue.userId": user._id, "blue.result": "looser" },
//           { "green.userId": user._id, "green.result": "looser" },
//         ],
//       }),

//       QuickLudo.countDocuments({
//         status: "completed",
//         $or: [
//           { "blue.userId": user._id, "blue.result": "looser" },
//           { "green.userId": user._id, "green.result": "looser" },
//         ],
//       }),
//       OnlineGame2.countDocuments({
//         status: "completed",
//         $or: [
//           { "blue.userId": user._id, "blue.result": "looser" },
//           { "green.userId": user._id, "green.result": "looser" },
//         ],
//       }),
//       // Sum deposit amounts & count deposit transactions
//       Transaction.aggregate([
//         {
//           $match: {
//             status: "completed",
//             txnCtg: "deposit",
//             txnType: "credit",
//             userId: user._id,
//           },
//         },
//         {
//           $group: {
//             _id: null,
//             totalAmount: { $sum: "$amount" },
//             count: { $sum: 1 },
//           },
//         },
//       ]),

//       // Sum withdrawal amounts & count withdrawal transactions
//       Transaction.aggregate([
//         {
//           $match: {
//             status: "completed",
//             txnCtg: "withdrawal",
//             txnType: "debit",
//             userId: user._id,
//           },
//         },
//         {
//           $group: {
//             _id: null,
//             totalAmount: { $sum: "$amount" },
//             count: { $sum: 1 },
//           },
//         },
//       ]),

//       // Sum total winnings
//       Transaction.aggregate([
//         {
//           $match: {
//             status: "completed",
//             txnCtg: "reward",
//             txnType: "credit",
//             userId: user._id,
//           },
//         },
//         { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
//       ]),

//       // Sum total referral earnings & count referrals
//       Transaction.aggregate([
//         {
//           $match: {
//             status: "completed",
//             txnCtg: "referral",
//             txnType: "credit",
//             userId: user._id,
//           },
//         },
//         {
//           $group: {
//             _id: null,
//             totalAmount: { $sum: "$amount" },
//             count: { $sum: 1 },
//           },
//         },
//       ]),
//     ]);

//     // Assign results
//     user.stat.totalPlayedMatches = totalPlayedMatches;
//     user.stat.totalPlayedMatches += totalPlayedMatches2;
//     user.stat.totalPlayedMatches += totalPlayedMatches3;
//     user.stat.totalPlayedMatches += totalPlayedMatches4;
//     user.stat.totalPlayedMatches += totalPlayedMatches5;

//     user.stat.totalWonMatches = totalWonMatches;
//     user.stat.totalWonMatches += totalWonMatches2;
//     user.stat.totalWonMatches += totalWonMatches3;
//     user.stat.totalWonMatches += totalWonMatches4;
//     user.stat.totalWonMatches += totalWonMatches5;

//     user.stat.totalLostMatches = totalLostMatches;
//     user.stat.totalLostMatches += totalLostMatches2;
//     user.stat.totalLostMatches += totalLostMatches3;
//     user.stat.totalLostMatches += totalLostMatches4;
//     user.stat.totalLostMatches += totalLostMatches5;

//     user.stat.totalRef = totalRef;

//     // Assign deposit stats safely
//     user.stat.totalDeposit =
//       depositStats.length > 0 ? depositStats[0].totalAmount.toFixed(2) : 0;
//     user.stat.totalDepositCount =
//       depositStats.length > 0 ? depositStats[0].count : 0;

//     // Assign withdrawal stats safely
//     user.stat.totalWithdrawal =
//       withdrawalStats.length > 0
//         ? withdrawalStats[0].totalAmount.toFixed(2)
//         : 0;
//     user.stat.totalWithdrawalCount =
//       withdrawalStats.length > 0 ? withdrawalStats[0].count : 0;

//     // Assign winnings stats safely
//     user.stat.totalWinnings =
//       winningsStats.length > 0 ? winningsStats[0].totalAmount : 0;

//     // Assign referral stats safely
//     user.stat.totalReferralEarnings =
//       referralStats.length > 0 ? referralStats[0].totalAmount : 0;
//     user.stat.totalReferralCount =
//       referralStats.length > 0 ? referralStats[0].count : 0;
//     user.refBy = refBy;

//     const _user = user;

//     return res.json({
//       success: true,
//       data: _user,
//     });
//   } catch (error) {
//     return res.json({
//       success: false,
//       message: error.response ? error.response.data.message : error.message,
//     });
//   }
// };

// export const fetchUserTransactions = async (req, res) => {
//   try {
//     const limit = 20;
//     const skip = (req.body.page - 1) * limit;
//     let cond = req.body.cond;

//     const filter = { userId: cond.userId };

//     if (cond.txnCtg != "all") filter.txnCtg = cond.txnCtg;

//     if (cond.keyword) {
//       filter.$or = [
//         { txnId: { $regex: cond.keyword.toString(), $options: "i" } }, // Case-insensitive txnId search
//       ];
//     }

//     const transactions = await Transaction.find(filter)
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit)
//       .lean();

//     const _txns = await Promise.all(
//       transactions.map(async (txn) => {
//         txn.match = await ManualMatch.findOne({ _id: txn.matchId });

//         if (!txn.match) {
//           txn.match = await OnlineGame.findOne({ _id: txn.matchId });
//         }

//         if (!txn.match) {
//           txn.match = await SpeedLudo.findOne({ _id: txn.matchId });
//         }

//         if (!txn.match) {
//           txn.match = await QuickLudo.findOne({ _id: txn.matchId });
//         }

//         if (!txn.match) {
//           txn.match = await OnlineGame2.findOne({ _id: txn.matchId }).lean();

//           if (txn.match) txn.match.type = "online2";
//         }
//         return txn;
//       })
//     );

//     return res.json({
//       success: true,
//       data: _txns,
//     });
//   } catch (error) {
//     return res.json({
//       success: false,
//       message: error.response ? error.response.data.message : error.message,
//     });
//   }
// };

// export const fetchUserMatches = async (req, res) => {
//   try {
//     const limit = 20;
//     const skip = (req.body.page - 1) * limit;
//     let cond = req.body.cond;

//     const filter = {};

//     if (cond.status && cond.status != "all") {
//       filter.status = cond.status;
//     } else if (cond.result && cond.result == "won") {
//       filter["winner.userId"] = cond.userId;
//     } else if (cond.result && cond.result == "lost") {
//       filter["looser.userId"] = cond.userId;
//     }

//     filter.$and = [
//       {
//         $or: [{ "host.userId": cond.userId }, { "joiner.userId": cond.userId }],
//       },
//     ];

//     if (cond.keyword) {
//       filter.$or = [
//         { matchId: { $regex: cond.keyword.toString(), $options: "i" } }, // Case-insensitive txnId search
//         { roomCode: { $regex: cond.keyword.toString(), $options: "i" } }, // Case-insensitive txnId search
//       ];
//     }

//     const matches = await ManualMatch.find(filter)
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit)
//       .lean();

//     const _matches = await Promise.all(
//       matches.map(async (match) => {
//         match.hostData = await User.findOne({ _id: match.host.userId });
//         match.joinerData = await User.findOne({ _id: match.joiner.userId });

//         return match;
//       })
//     );

//     return res.json({
//       success: true,
//       data: _matches,
//     });
//   } catch (error) {
//     return res.json({
//       success: false,
//       message: error.response ? error.response.data.message : error.message,
//     });
//   }
// };

// export const fetchUserOnlineMatches = async (req, res) => {
//   try {
//     const limit = 20;
//     const skip = (req.body.page - 1) * limit;
//     let cond = req.body.cond;

//     const filter = { $and: [] };

//     // Filter by status if provided
//     if (cond.status && cond.status !== "all") {
//       filter.$and.push({ status: cond.status });
//     }

//     // Filter by win/loss conditions
//     if (cond.result === "won") {
//       filter.$and.push({
//         $or: [
//           { "blue.userId": cond.userId, "blue.result": "winner" },
//           { "green.userId": cond.userId, "green.result": "winner" },
//         ],
//       });
//     } else if (cond.result === "lost") {
//       filter.$and.push({
//         $or: [
//           { "blue.userId": cond.userId, "blue.result": "looser" },
//           { "green.userId": cond.userId, "green.result": "looser" },
//         ],
//       });
//     }

//     // Always filter by userId in blue or green
//     filter.$and.push({
//       $or: [{ "blue.userId": cond.userId }, { "green.userId": cond.userId }],
//     });

//     // Apply keyword search if provided
//     if (cond.keyword) {
//       filter.$and.push({
//         $or: [
//           { matchId: { $regex: cond.keyword.toString(), $options: "i" } }, // Case-insensitive search
//           { roomCode: { $regex: cond.keyword.toString(), $options: "i" } },
//         ],
//       });
//     }

//     // Execute the query with pagination
//     const matches = await OnlineGame.find(filter.$and.length ? filter : {})
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit)
//       .lean();

//     const _matches = await Promise.all(
//       matches.map(async (match) => {
//         match.hostData = await User.findOne({ _id: match.blue.userId });
//         match.joinerData = await User.findOne({ _id: match.green.userId });

//         return match;
//       })
//     );

//     return res.json({
//       success: true,
//       data: _matches,
//     });
//   } catch (error) {
//     return res.json({
//       success: false,
//       message: error.response ? error.response.data.message : error.message,
//     });
//   }
// };

// export const fetchUserOnlineMatches2 = async (req, res) => {
//   try {
//     const limit = 20;
//     const skip = (req.body.page - 1) * limit;
//     let cond = req.body.cond;

//     const filter = { $and: [] };

//     // Filter by status if provided
//     if (cond.status && cond.status !== "all") {
//       filter.$and.push({ status: cond.status });
//     }

//     // Filter by win/loss conditions
//     if (cond.result === "won") {
//       filter.$and.push({
//         $or: [
//           { "blue.userId": cond.userId, "blue.result": "winner" },
//           { "green.userId": cond.userId, "green.result": "winner" },
//         ],
//       });
//     } else if (cond.result === "lost") {
//       filter.$and.push({
//         $or: [
//           { "blue.userId": cond.userId, "blue.result": "looser" },
//           { "green.userId": cond.userId, "green.result": "looser" },
//         ],
//       });
//     }

//     // Always filter by userId in blue or green
//     filter.$and.push({
//       $or: [{ "blue.userId": cond.userId }, { "green.userId": cond.userId }],
//     });

//     // Apply keyword search if provided
//     if (cond.keyword) {
//       filter.$and.push({
//         $or: [
//           { matchId: { $regex: cond.keyword.toString(), $options: "i" } }, // Case-insensitive search
//           { roomCode: { $regex: cond.keyword.toString(), $options: "i" } },
//         ],
//       });
//     }

//     // Execute the query with pagination
//     const matches = await OnlineGame2.find(filter.$and.length ? filter : {})
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit)
//       .lean();

//     const _matches = await Promise.all(
//       matches.map(async (match) => {
//         match.hostData = await User.findOne({ _id: match.blue.userId });
//         match.joinerData = await User.findOne({ _id: match.green.userId });

//         return match;
//       })
//     );

//     return res.json({
//       success: true,
//       data: _matches,
//     });
//   } catch (error) {
//     return res.json({
//       success: false,
//       message: error.response ? error.response.data.message : error.message,
//     });
//   }
// };

// export const fetchUserSpeedMatches = async (req, res) => {
//   try {
//     const limit = 20;
//     const skip = (req.body.page - 1) * limit;
//     let cond = req.body.cond;

//     const filter = { $and: [] };

//     // Filter by status if provided
//     if (cond.status && cond.status !== "all") {
//       filter.$and.push({ status: cond.status });
//     }

//     // Filter by win/loss conditions
//     if (cond.result === "won") {
//       filter.$and.push({
//         $or: [
//           { "blue.userId": cond.userId, "blue.result": "winner" },
//           { "green.userId": cond.userId, "green.result": "winner" },
//         ],
//       });
//     } else if (cond.result === "lost") {
//       filter.$and.push({
//         $or: [
//           { "blue.userId": cond.userId, "blue.result": "looser" },
//           { "green.userId": cond.userId, "green.result": "looser" },
//         ],
//       });
//     }

//     // Always filter by userId in blue or green
//     filter.$and.push({
//       $or: [{ "blue.userId": cond.userId }, { "green.userId": cond.userId }],
//     });

//     // Apply keyword search if provided
//     if (cond.keyword) {
//       filter.$and.push({
//         $or: [
//           { matchId: { $regex: cond.keyword.toString(), $options: "i" } }, // Case-insensitive search
//           { roomCode: { $regex: cond.keyword.toString(), $options: "i" } },
//         ],
//       });
//     }

//     // Execute the query with pagination
//     const matches = await SpeedLudo.find(filter.$and.length ? filter : {})
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit)
//       .lean();

//     const _matches = await Promise.all(
//       matches.map(async (match) => {
//         match.hostData = await User.findOne({ _id: match.blue.userId });
//         match.joinerData = await User.findOne({ _id: match.green.userId });

//         return match;
//       })
//     );

//     return res.json({
//       success: true,
//       data: _matches,
//     });
//   } catch (error) {
//     return res.json({
//       success: false,
//       message: error.response ? error.response.data.message : error.message,
//     });
//   }
// };

// export const fetchUserQuickMatches = async (req, res) => {
//   try {
//     const limit = 20;
//     const skip = (req.body.page - 1) * limit;
//     let cond = req.body.cond;

//     const filter = { $and: [] };

//     // Filter by status if provided
//     if (cond.status && cond.status !== "all") {
//       filter.$and.push({ status: cond.status });
//     }

//     // Filter by win/loss conditions
//     if (cond.result === "won") {
//       filter.$and.push({
//         $or: [
//           { "blue.userId": cond.userId, "blue.result": "winner" },
//           { "green.userId": cond.userId, "green.result": "winner" },
//         ],
//       });
//     } else if (cond.result === "lost") {
//       filter.$and.push({
//         $or: [
//           { "blue.userId": cond.userId, "blue.result": "looser" },
//           { "green.userId": cond.userId, "green.result": "looser" },
//         ],
//       });
//     }

//     // Always filter by userId in blue or green
//     filter.$and.push({
//       $or: [{ "blue.userId": cond.userId }, { "green.userId": cond.userId }],
//     });

//     // Apply keyword search if provided
//     if (cond.keyword) {
//       filter.$and.push({
//         $or: [
//           { matchId: { $regex: cond.keyword.toString(), $options: "i" } }, // Case-insensitive search
//           { roomCode: { $regex: cond.keyword.toString(), $options: "i" } },
//         ],
//       });
//     }

//     // Execute the query with pagination
//     const matches = await QuickLudo.find(filter.$and.length ? filter : {})
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit)
//       .lean();

//     const _matches = await Promise.all(
//       matches.map(async (match) => {
//         match.hostData = await User.findOne({ _id: match.blue.userId });
//         match.joinerData = await User.findOne({ _id: match.green.userId });

//         return match;
//       })
//     );

//     return res.json({
//       success: true,
//       data: _matches,
//     });
//   } catch (error) {
//     return res.json({
//       success: false,
//       message: error.response ? error.response.data.message : error.message,
//     });
//   }
// };

// export const fetchMatches = async (req, res) => {
//   try {
//     const limit = 20;
//     const skip = (req.body.page - 1) * limit;
//     let cond = req.body.cond;

//     const filter = {};

//     if (cond.onlyConflict) {
//       filter.conflict = true;
//     }

//     if (cond.onlyCancel) {
//       filter["cancellationRequested.req"] = true;
//     }

//     if (cond.status && cond.status == "conflicted") {
//       filter.conflict = true;
//     } else if (cond.status && cond.status != "all") {
//       filter.status = cond.status;
//     }

//     if (cond.keyword) {
//       filter.$or = [
//         { matchId: { $regex: cond.keyword.toString(), $options: "i" } }, // Case-insensitive txnId search
//         { roomCode: { $regex: cond.keyword.toString(), $options: "i" } }, // Case-insensitive txnId search
//       ];
//     }

//     if (cond.onlyPending) {
//       filter.$or = (filter.$or || []).concat([
//         { "host.result": null, "joiner.result": { $ne: null } },
//         { "joiner.result": null, "host.result": { $ne: null } },
//       ]);
//     }

//     const matches = await ManualMatch.find(filter)
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit)
//       .lean();

//     const _matches = await Promise.all(
//       matches.map(async (match) => {
//         match.hostData = await User.findOne({ _id: match.host.userId });
//         match.joinerData = await User.findOne({ _id: match.joiner.userId });

//         return match;
//       })
//     );

//     return res.json({
//       success: true,
//       data: _matches,
//     });
//   } catch (error) {
//     return res.json({
//       success: false,
//       message: error.response ? error.response.data.message : error.message,
//     });
//   }
// };

// export const fetchOnlineMatches = async (req, res) => {
//   try {
//     const limit = 20;
//     const skip = (req.body.page - 1) * limit;
//     let cond = req.body.cond;

//     const filter = {};

//     if (cond.status && cond.status != "all") {
//       filter.status = cond.status;
//     }

//     if (cond.keyword) {
//       filter.$or = [
//         { matchId: { $regex: cond.keyword.toString(), $options: "i" } }, // Case-insensitive txnId search
//         { roomCode: { $regex: cond.keyword.toString(), $options: "i" } }, // Case-insensitive txnId search
//       ];
//     }

//     const matches = await OnlineGame.find(filter)
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit)
//       .lean();

//     const _matches = await Promise.all(
//       matches.map(async (match) => {
//         match.hostData = await User.findOne({ _id: match.blue.userId });
//         match.joinerData = await User.findOne({ _id: match.green.userId });

//         return match;
//       })
//     );

//     return res.json({
//       success: true,
//       data: _matches,
//     });
//   } catch (error) {
//     return res.json({
//       success: false,
//       message: error.response ? error.response.data.message : error.message,
//     });
//   }
// };

// export const fetchOnlineMatches2 = async (req, res) => {
//   try {
//     const limit = 20;
//     const skip = (req.body.page - 1) * limit;
//     let cond = req.body.cond;

//     const filter = {};

//     if (cond.status && cond.status != "all") {
//       filter.status = cond.status;
//     }

//     if (cond.keyword) {
//       filter.$or = [
//         { matchId: { $regex: cond.keyword.toString(), $options: "i" } }, // Case-insensitive txnId search
//         { roomCode: { $regex: cond.keyword.toString(), $options: "i" } }, // Case-insensitive txnId search
//       ];
//     }

//     const matches = await OnlineGame2.find(filter)
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit)
//       .lean();

//     const _matches = await Promise.all(
//       matches.map(async (match) => {
//         match.hostData = await User.findOne({ _id: match.blue.userId });
//         match.joinerData = await User.findOne({ _id: match.green.userId });

//         return match;
//       })
//     );

//     return res.json({
//       success: true,
//       data: _matches,
//     });
//   } catch (error) {
//     return res.json({
//       success: false,
//       message: error.response ? error.response.data.message : error.message,
//     });
//   }
// };

// export const fetchSpeedMatches = async (req, res) => {
//   try {
//     const limit = 20;
//     const skip = (req.body.page - 1) * limit;
//     let cond = req.body.cond;

//     const filter = {};

//     if (cond.status && cond.status != "all") {
//       filter.status = cond.status;
//     }

//     if (cond.keyword) {
//       filter.$or = [
//         { matchId: { $regex: cond.keyword.toString(), $options: "i" } }, // Case-insensitive txnId search
//         { roomCode: { $regex: cond.keyword.toString(), $options: "i" } }, // Case-insensitive txnId search
//       ];
//     }

//     const matches = await SpeedLudo.find(filter)
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit)
//       .lean();

//     const _matches = await Promise.all(
//       matches.map(async (match) => {
//         match.hostData = await User.findOne({ _id: match.blue.userId });
//         match.joinerData = await User.findOne({ _id: match.green.userId });

//         return match;
//       })
//     );

//     return res.json({
//       success: true,
//       data: _matches,
//     });
//   } catch (error) {
//     return res.json({
//       success: false,
//       message: error.response ? error.response.data.message : error.message,
//     });
//   }
// };

// export const fetchQuickMatches = async (req, res) => {
//   try {
//     const limit = 20;
//     const skip = (req.body.page - 1) * limit;
//     let cond = req.body.cond;

//     const filter = {};

//     if (cond.status && cond.status != "all") {
//       filter.status = cond.status;
//     }

//     if (cond.keyword) {
//       filter.$or = [
//         { matchId: { $regex: cond.keyword.toString(), $options: "i" } }, // Case-insensitive txnId search
//         { roomCode: { $regex: cond.keyword.toString(), $options: "i" } }, // Case-insensitive txnId search
//       ];
//     }

//     const matches = await QuickLudo.find(filter)
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit)
//       .lean();

//     const _matches = await Promise.all(
//       matches.map(async (match) => {
//         match.hostData = await User.findOne({ _id: match.blue.userId });
//         match.joinerData = await User.findOne({ _id: match.green.userId });

//         return match;
//       })
//     );

//     return res.json({
//       success: true,
//       data: _matches,
//     });
//   } catch (error) {
//     return res.json({
//       success: false,
//       message: error.response ? error.response.data.message : error.message,
//     });
//   }
// };
// // export const fetchSpeedMatches = async (req, res) => {
// //   try {
// //     const limit = 20;
// //     const skip = (req.body.page - 1) * limit;
// //     let cond = req.body.cond;

// //     const filter = {};

// //     if (cond.status && cond.status != "all") {
// //       filter.status = cond.status;
// //     }

// //     if (cond.keyword) {
// //       filter.$or = [
// //         { matchId: { $regex: cond.keyword.toString(), $options: "i" } }, // Case-insensitive txnId search
// //         { roomCode: { $regex: cond.keyword.toString(), $options: "i" } }, // Case-insensitive txnId search
// //       ];
// //     }

// //     const matches = await SpeedLudo.find(filter)
// //       .sort({ createdAt: -1 })
// //       .skip(skip)
// //       .limit(limit)
// //       .lean();

// //     const _matches = await Promise.all(
// //       matches.map(async (match) => {
// //         match.blueu = await User.findOne({ _id: match.blue.userId });
// //         match.redu = await User.findOne({ _id: match.red.userId });
// //         match.greenu = await User.findOne({ _id: match.green.userId });
// //         match.yellowu = await User.findOne({ _id: match.yellow.userId });
// //         return match;
// //       })
// //     );

// //     return res.json({
// //       success: true,
// //       data: _matches,
// //     });
// //   } catch (error) {
// //     return res.json({
// //       success: false,
// //       message: error.response ? error.response.data.message : error.message,
// //     });
// //   }
// // };

// export const fetchMatch = async (req, res) => {
//   try {
//     let cond = req.body.cond;
//     if (!cond) {
//       return res.json({
//         success: false,
//         data: "invalid user page",
//       });
//     }

//     const mo = await ManualMatch.findOne({ _id: cond._id });

//     if (cond && cond.reset) {
//       if (mo.status == "open") {
//       } else {
//         const reset = await ManualMatch.updateOne(
//           {
//             $and: [
//               { _id: cond._id }, // Status must be "running"
//             ],
//           },
//           {
//             $set: {
//               status: "running",
//               "winner.userId": null,
//               "looser.userId": null,
//               "host.result": null,
//               "host.resultAt": null,
//               "joiner.result": null,
//               "joiner.resultAt": null,
//             },
//           }
//         );
//       }

//       await Transaction.deleteMany({
//         matchId: cond._id,
//         txnType: "credit",
//         txnCtg: "reward",
//       });

//       await Transaction.deleteMany({
//         matchId: cond._id,
//         txnType: "credit",
//         txnCtg: "referral",
//       });

//       await Transaction.deleteMany({
//         matchId: cond._id,
//         txnType: "credit",
//         txnCtg: "bet",
//       });

//       await _log({
//         matchId: cond._id,
//         message:
//           req.admin.emailId +
//           " (admin) " +
//           " reseted result of match and all the rewards and referral related to match removed from users wallets ",
//       });
//     }

//     const match = await ManualMatch.findOne({ _id: cond._id }).lean();

//     if (!match) {
//       return res.json({
//         success: false,
//         data: "invalid match page",
//       });
//     }

//     match.stat = {};

//     // Batch multiple queries using Promise.all() for better performance
//     const [hostData, joinerData, transactions, logs] = await Promise.all([
//       // Count total played matches
//       User.findOne({
//         _id: match.host.userId,
//       }),
//       User.findOne({
//         _id: match.joiner.userId,
//       }),
//       Transaction.aggregate([
//         {
//           $match: {
//             $or: [
//               { matchId: match._id },
//               { txnId: match.host.txnId },
//               { txnId: match.joiner.txnId },
//             ],
//           },
//         },
//         {
//           $lookup: {
//             from: "users", // The collection to join with
//             localField: "userId", // The field in Transaction
//             foreignField: "_id", // The field in User
//             as: "user", // The output field (array of users)
//           },
//         },
//         {
//           $unwind: {
//             path: "$user",
//             preserveNullAndEmptyArrays: true, // If no user is found, still include the transaction
//           },
//         },
//       ]),
//       Log.find({ matchId: match._id }),
//     ]);

//     match.hostData = hostData;
//     match.joinerData = joinerData;
//     match.transactions = transactions;
//     match.logs = logs;

//     const _match = match;

//     return res.json({
//       success: true,
//       data: _match,
//     });
//   } catch (error) {
//     return res.json({
//       success: false,
//       message: error.response ? error.response.data.message : error.message,
//     });
//   }
// };

// export const fetchOnlineMatch = async (req, res) => {
//   try {
//     let cond = req.body.cond;
//     if (!cond) {
//       return res.json({
//         success: false,
//         data: "invalid user page",
//       });
//     }

//     const match = await OnlineGame.findOne(cond).lean();
//     if (!match) {
//       return res.json({
//         success: false,
//         data: "invalid match page",
//       });
//     }

//     match.stat = {};

//     // Batch multiple queries using Promise.all() for better performance
//     const [hostData, joinerData, transactions, logs] = await Promise.all([
//       // Count total played matches
//       User.findOne({
//         _id: match.blue.userId,
//       }),
//       User.findOne({
//         _id: match.green.userId,
//       }),
//       Transaction.aggregate([
//         {
//           $match: {
//             $or: [{ matchId: match._id }],
//           },
//         },
//         {
//           $lookup: {
//             from: "users", // The collection to join with
//             localField: "userId", // The field in Transaction
//             foreignField: "_id", // The field in User
//             as: "user", // The output field (array of users)
//           },
//         },
//         {
//           $unwind: {
//             path: "$user",
//             preserveNullAndEmptyArrays: true, // If no user is found, still include the transaction
//           },
//         },
//       ]),
//       Log.find({ matchId: match._id }),
//     ]);

//     match.hostData = hostData;
//     match.joinerData = joinerData;
//     match.transactions = transactions;
//     match.logs = logs;

//     const _match = match;

//     return res.json({
//       success: true,
//       data: _match,
//     });
//   } catch (error) {
//     return res.json({
//       success: false,
//       message: error.response ? error.response.data.message : error.message,
//     });
//   }
// };

// export const fetchOnlineMatch2 = async (req, res) => {
//   try {
//     let cond = req.body.cond;
//     if (!cond) {
//       return res.json({
//         success: false,
//         data: "invalid user page",
//       });
//     }

//     const match = await OnlineGame2.findOne(cond).lean();
//     if (!match) {
//       return res.json({
//         success: false,
//         data: "invalid match page",
//       });
//     }

//     match.stat = {};

//     // Batch multiple queries using Promise.all() for better performance
//     const [hostData, joinerData, transactions, logs] = await Promise.all([
//       // Count total played matches
//       User.findOne({
//         _id: match.blue.userId,
//       }),
//       User.findOne({
//         _id: match.green.userId,
//       }),
//       Transaction.aggregate([
//         {
//           $match: {
//             $or: [{ matchId: match._id }],
//           },
//         },
//         {
//           $lookup: {
//             from: "users", // The collection to join with
//             localField: "userId", // The field in Transaction
//             foreignField: "_id", // The field in User
//             as: "user", // The output field (array of users)
//           },
//         },
//         {
//           $unwind: {
//             path: "$user",
//             preserveNullAndEmptyArrays: true, // If no user is found, still include the transaction
//           },
//         },
//       ]),
//       Log.find({ matchId: match._id }),
//     ]);

//     match.hostData = hostData;
//     match.joinerData = joinerData;
//     match.transactions = transactions;
//     match.logs = logs;

//     const _match = match;

//     return res.json({
//       success: true,
//       data: _match,
//     });
//   } catch (error) {
//     return res.json({
//       success: false,
//       message: error.response ? error.response.data.message : error.message,
//     });
//   }
// };

// export const fetchSpeedMatch = async (req, res) => {
//   try {
//     let cond = req.body.cond;
//     if (!cond) {
//       return res.json({
//         success: false,
//         data: "invalid user page",
//       });
//     }

//     const match = await SpeedLudo.findOne(cond).lean();
//     if (!match) {
//       return res.json({
//         success: false,
//         data: "invalid match page",
//       });
//     }

//     match.stat = {};

//     // Batch multiple queries using Promise.all() for better performance
//     const [hostData, joinerData, transactions, logs] = await Promise.all([
//       // Count total played matches
//       User.findOne({
//         _id: match.blue.userId,
//       }),
//       User.findOne({
//         _id: match.green.userId,
//       }),
//       Transaction.aggregate([
//         {
//           $match: {
//             $or: [{ matchId: match._id }],
//           },
//         },
//         {
//           $lookup: {
//             from: "users", // The collection to join with
//             localField: "userId", // The field in Transaction
//             foreignField: "_id", // The field in User
//             as: "user", // The output field (array of users)
//           },
//         },
//         {
//           $unwind: {
//             path: "$user",
//             preserveNullAndEmptyArrays: true, // If no user is found, still include the transaction
//           },
//         },
//       ]),
//       Log.find({ matchId: match._id }),
//     ]);

//     match.hostData = hostData;
//     match.joinerData = joinerData;
//     match.transactions = transactions;
//     match.logs = logs;

//     const _match = match;

//     return res.json({
//       success: true,
//       data: _match,
//     });
//   } catch (error) {
//     return res.json({
//       success: false,
//       message: error.response ? error.response.data.message : error.message,
//     });
//   }
// };

// export const fetchQuickMatch = async (req, res) => {
//   try {
//     let cond = req.body.cond;
//     if (!cond) {
//       return res.json({
//         success: false,
//         data: "invalid user page",
//       });
//     }

//     const match = await QuickLudo.findOne(cond).lean();
//     if (!match) {
//       return res.json({
//         success: false,
//         data: "invalid match page",
//       });
//     }

//     match.stat = {};

//     // Batch multiple queries using Promise.all() for better performance
//     const [hostData, joinerData, transactions, logs] = await Promise.all([
//       // Count total played matches
//       User.findOne({
//         _id: match.blue.userId,
//       }),
//       User.findOne({
//         _id: match.green.userId,
//       }),
//       Transaction.aggregate([
//         {
//           $match: {
//             $or: [{ matchId: match._id }],
//           },
//         },
//         {
//           $lookup: {
//             from: "users", // The collection to join with
//             localField: "userId", // The field in Transaction
//             foreignField: "_id", // The field in User
//             as: "user", // The output field (array of users)
//           },
//         },
//         {
//           $unwind: {
//             path: "$user",
//             preserveNullAndEmptyArrays: true, // If no user is found, still include the transaction
//           },
//         },
//       ]),
//       Log.find({ matchId: match._id }),
//     ]);

//     match.hostData = hostData;
//     match.joinerData = joinerData;
//     match.transactions = transactions;
//     match.logs = logs;

//     const _match = match;

//     return res.json({
//       success: true,
//       data: _match,
//     });
//   } catch (error) {
//     return res.json({
//       success: false,
//       message: error.response ? error.response.data.message : error.message,
//     });
//   }
// };

// // export const fetchSpeedMatch = async (req, res) => {
// //   try {
// //     let cond = req.body.cond;
// //     if (!cond) {
// //       return res.json({
// //         success: false,
// //         data: "invalid user page",
// //       });
// //     }

// //     const match = await SpeedLudo.findOne(cond).lean();
// //     if (!match) {
// //       return res.json({
// //         success: false,
// //         data: "invalid match page",
// //       });
// //     }

// //     match.stat = {};

// //     // Batch multiple queries using Promise.all() for better performance
// //     const [blue, red, green, yellow, transactions, logs] = await Promise.all([
// //       // Count total played matches
// //       User.findOne({
// //         _id: match.blue.userId,
// //       }),
// //       User.findOne({
// //         _id: match.red.userId,
// //       }),
// //       User.findOne({
// //         _id: match.green.userId,
// //       }),
// //       User.findOne({
// //         _id: match.yellow.userId,
// //       }),
// //       Transaction.aggregate([
// //         {
// //           $match: {
// //             $or: [{ matchId: match._id }],
// //           },
// //         },
// //         {
// //           $lookup: {
// //             from: "users", // The collection to join with
// //             localField: "userId", // The field in Transaction
// //             foreignField: "_id", // The field in User
// //             as: "user", // The output field (array of users)
// //           },
// //         },
// //         {
// //           $unwind: {
// //             path: "$user",
// //             preserveNullAndEmptyArrays: true, // If no user is found, still include the transaction
// //           },
// //         },
// //       ]),
// //       Log.find({ matchId: match._id }),
// //     ]);

// //     match.blueu = blue;
// //     match.redu = red;
// //     match.greenu = green;
// //     match.yellowu = yellow;

// //     match.transactions = transactions;
// //     match.logs = logs;

// //     const _match = match;

// //     return res.json({
// //       success: true,
// //       data: _match,
// //     });
// //   } catch (error) {
// //     return res.json({
// //       success: false,
// //       message: error.response ? error.response.data.message : error.message,
// //     });
// //   }
// // };

// export const updateResult = async (req, res) => {
//   try {
//     const cond = req.body.cond;
//     const matchId = cond.matchId;
//     const match = await ManualMatch.findOne({
//       _id: matchId,
//     });

//     if (match.status != "running" && match.host.result != match.joiner.result) {
//       return res.json({
//         success: false,
//         message: "match is not running or no result update possible now",
//       });
//     }

//     if (match.winner.userId) {
//       return res.json({
//         success: false,
//         message: "winner already updated",
//       });
//     }

//     const result = {};
//     if (cond.result) {
//       if (cond.result == "host") {
//         result["winner.userId"] = match.host.userId;
//         result["looser.userId"] = match.joiner.userId;
//         result.status = "completed";
//         result.completedAt = Date.now();
//       } else if (cond.result == "joiner") {
//         result["winner.userId"] = match.joiner.userId;
//         result["looser.userId"] = match.host.userId;
//         result.status = "completed";
//         result.completedAt = Date.now();
//       } else if (cond.result == "refund" || cond.result == "cancel") {
//         result.status = "cancelled";
//         result.updatedAt = Date.now();
//       }
//     }

//     if (cond.req && cond.action) {
//       if (cond.action == "accept") {
//         result["cancellationRequested.accepted"] = true;
//         result["cancellationRequested.acceptedBy"] = req.admin._id;
//         result["cancellationRequested.acceptedAt"] = Date.now();
//         result.status = "cancelled";
//         result.updatedAt = Date.now();
//       } else if (cond.action == "reject") {
//         result["cancellationRequested.req"] = false;
//         result["cancellationRequested.userId"] = null;
//         result["cancellationRequested.by"] = null;
//         result["cancellationRequested.reqAt"] = null;
//         result["cancellationRequested.reason"] = null;
//         result.updatedAt = Date.now();
//       }
//     }

//     const checkMatch = await ManualMatch.updateOne(
//       {
//         $and: [
//           { _id: match._id }, // Status must be "running"
//         ],
//       },
//       {
//         $set: result,
//       }
//     );

//     if (checkMatch.modifiedCount > 0) {
//       if (cond.req && cond.action) {
//         const m = await ManualMatch.findOne({ _id: match._id });
//         const w = await User.findOne({
//           _id: match.cancellationRequested.userId,
//         });

//         await _log({
//           matchId: m._id,
//           message:
//             req.admin.emailId +
//             " (admin) " +
//             cond.action +
//             "ed cancellation request  of " +
//             w.fullName +
//             "(" +
//             w.mobileNumber,
//         });

//         if (cond.action == "accept") {
//           await cancelMatchAndRefund2(m);
//           await _log({
//             matchId: m._id,
//             message:
//               "match is cancelled and entry fee is refunded to both players wallet",
//           });
//         }

//         return res.json({
//           success: true,
//           message: "result updated",
//           data: m,
//         });
//       } else if (cond.result == "cancel" || cond.result == "refund") {
//         const m = await ManualMatch.findOne({ _id: match._id });

//         if (cond.result == "refund") {
//           await cancelMatchAndRefund2(m);
//           await _log({
//             matchId: m._id,
//             message:
//               req.admin.emailId +
//               " (admin) cancelled the match and refunded the entry fee to both players wallet",
//           });
//         } else if (cond.result == "cancel") {
//           await _log({
//             matchId: m._id,
//             message:
//               req.admin.emailId +
//               " (admin) cancelled the match without refund the entry fee",
//           });
//         }

//         return res.json({
//           success: true,
//           message: "result updated",
//           data: m,
//         });
//       } else {
//         const m = await ManualMatch.findOne({ _id: match._id });
//         const bet = await Transaction.findOne({
//           matchId: m._id,
//           userId: m.winner.userId,
//           txnCtg: "bet",
//           txnType: "debit",
//         });

//         const txnid = await newTxnId();
//         const NewTxn = {
//           txnId: txnid,
//           userId: m.winner.userId,
//           amount: m.prize,
//           cash: bet.cash,
//           reward: m.prize - m.entryFee + Number(bet.reward),
//           bonus: bet.bonus,
//           remark: "Match Won",
//           status: "completed",
//           txnType: "credit",
//           txnCtg: "reward",
//           matchId: m._id,
//         };

//         await Transaction.create(NewTxn);
//         const w = await User.findOne({ _id: m.winner.userId });

//         await _log({
//           matchId: m._id,
//           message:
//             req.admin.emailId +
//             " (admin) updated result & " +
//             w.fullName +
//             "(" +
//             w.mobileNumber +
//             ") marked as winner and got a reward of ₹" +
//             m.prize,
//         });

//         await refBonusManager(m.winner.userId, m);

//         return res.json({
//           success: true,
//           message: "result updated",
//           data: m,
//         });
//       }
//     } else {
//       return res.json({
//         success: false,
//         message: "something is wrong, please refersh the page and try again",
//       });
//     }
//   } catch (error) {
//     ////console.log("createMatch", error);
//     return res.json({
//       success: false,
//       message: error.response ? error.response.data.message : error.message,
//     });
//   }
// };

// export const submitResultApi = async (req, res) => {
//   try {
//     const match = await ManualMatch.findOne({
//       $and: [
//         { _id: req.body.cond.matchId, status: "running" }, // Exclude the current matchId
//       ],
//     });

//     if (!match) {
//       return res.json({
//         success: false,
//         message: "something is wrong please refresh the page and try again",
//       });
//     }

//     const checkMS = await checkGameStatus(match.gameId);
//     if (checkMS.apiWorking) {
//       if (checkMS.data.game_status == "Running") {
//         return res.json({
//           success: false,
//           message: "game is running",
//         });
//       }

//       if (checkMS.data.game_status == "Waiting") {
//         return res.json({
//           success: false,
//           message: "game is running",
//         });
//       }

//       if (!checkMS.data.isAutoExit && !checkMS.data.isExit) {
//         // if (true) {
//         if (
//           checkMS.data.creator_id != null &&
//           checkMS.data.winner_id != null &&
//           checkMS.data.creator_id == checkMS.data.winner_id
//         ) {
//           //host is winner
//           const cm = await ManualMatch.updateOne(
//             {
//               $and: [
//                 { status: "running", _id: match._id }, // Status must be "running"
//               ],
//             },
//             {
//               $set: {
//                 status: "completed",
//                 completedAt: Date.now(),
//                 "winner.userId": match.host.userId,
//                 "looser.userId": match.joiner.userId,
//                 apiData: checkMS.data,
//               },
//             }
//           );

//           if (cm.modifiedCount > 0) {
//             const txnid = await newTxnId();
//             const NewTxn = {
//               txnId: txnid,
//               userId: match.host.userId,
//               amount: match.prize,
//               cash: 0,
//               reward: match.prize,
//               bonus: 0,
//               remark: "Match Won",
//               status: "completed",
//               txnType: "credit",
//               txnCtg: "reward",
//               matchId: match._id,
//             };

//             await Transaction.create(NewTxn);

//             const h = await User.findOne({ _id: match.host.userId });

//             await _log({
//               matchId: match._id,
//               message:
//                 req.admin.emailId +
//                 " (admin) fetched result from api & " +
//                 h.fullName +
//                 "(" +
//                 h.mobileNumber +
//                 ") marked as winner and game result is verified by api and results are updated automatically for both players",
//             });

//             await _log({
//               matchId: match._id,
//               message:
//                 h.fullName +
//                 " (" +
//                 h.mobileNumber +
//                 ") get reward of ₹" +
//                 match.prize +
//                 " as winner (verified by api)",
//             });

//             await refBonusManager(match.host.userId, match);
//             return res.json({
//               success: true,
//               message: "match_finished",
//             });
//           }
//         } else if (
//           checkMS.data.player_id != null &&
//           checkMS.data.winner_id != null &&
//           checkMS.data.player_id == checkMS.data.winner_id
//         ) {
//           //joiner is winner
//           const cm = await ManualMatch.updateOne(
//             {
//               $and: [
//                 { status: "running", _id: match._id }, // Status must be "running"
//                 {
//                   $or: [
//                     { "host.userId": req.user._id }, // Host userId matches
//                     { "joiner.userId": req.user._id }, // Joiner userId matches
//                   ],
//                 },
//               ],
//             },
//             {
//               $set: {
//                 status: "completed",
//                 completedAt: Date.now(),
//                 "winner.userId": match.joiner.userId,
//                 "looser.userId": match.host.userId,
//                 apiData: checkMS.data,
//               },
//             }
//           );

//           if (cm.modifiedCount > 0) {
//             const txnid = await newTxnId();
//             const NewTxn = {
//               txnId: txnid,
//               userId: match.joiner.userId,
//               amount: match.prize,
//               cash: 0,
//               reward: match.prize,
//               bonus: 0,
//               remark: "Match Won",
//               status: "completed",
//               txnType: "credit",
//               txnCtg: "reward",
//               matchId: match._id,
//             };

//             await Transaction.create(NewTxn);

//             const j = await User.findOne({ _id: match.joiner.userId });

//             await _log({
//               matchId: match._id,
//               message:
//                 req.admin.emailId +
//                 " (admin) fetched result from api & " +
//                 j.fullName +
//                 "(" +
//                 j.mobileNumber +
//                 ") marked as winner and game result is verified by api and results are updated automatically for both players",
//             });

//             await _log({
//               matchId: match._id,
//               message:
//                 j.fullName +
//                 " (" +
//                 j.mobileNumber +
//                 ") get reward of ₹" +
//                 match.prize +
//                 " as winner (verified by api)",
//             });

//             await refBonusManager(match.joiner.userId, match);
//             return res.json({
//               success: true,
//               message: "match_finished",
//             });
//           }
//         }
//       } else {
//         return res.json({
//           success: false,
//           message:
//             "autoexit or exit detected in this game, update result manually",
//         });
//       }
//     } else {
//       return res.json({
//         success: false,
//         message: "api is not responding",
//       });
//     }
//   } catch (error) {
//     ////console.log("createMatch", error);
//     return res.json({
//       success: false,
//       message: error.response ? error.response.data.message : error.message,
//     });
//   }
// };

// export const fetchWithdraws = async (req, res) => {
//   try {
//     const limit = 20;
//     const skip = (req.body.page - 1) * limit;
//     let cond = req.body.cond;

//     const filter = {};
//     filter.txnCtg = "withdrawal";
//     if (cond.status && cond.status != "all") {
//       filter.status = cond.status;
//     }

//     if (cond.keyword) {
//       filter.$or = [
//         { txnId: { $regex: cond.keyword.toString(), $options: "i" } }, // Case-insensitive txnId search
//       ];
//     }

//     const withdraws = await Transaction.find(filter)
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit)
//       .lean();

//     const _withdraws = await Promise.all(
//       withdraws.map(async (w) => {
//         w.user = await User.findOne({ _id: w.userId });
//         w.balance = await ubalance(w.user);
//         return w;
//       })
//     );

//     return res.json({
//       success: true,
//       data: _withdraws,
//     });
//   } catch (error) {
//     return res.json({
//       success: false,
//       message: error.response ? error.response.data.message : error.message,
//     });
//   }
// };

// export const updateWithdrawStatus = async (req, res) => {
//   try {
//     const data = req.body.cond;

//     const withdraw = await Transaction.findOne({ _id: data.withdrawId });

//     if (!withdraw) {
//       return res.json({
//         success: false,
//         message: "withdraw request not found",
//       });
//     }

//     if (withdraw.status != "pending") {
//       return res.json({
//         success: false,
//         message: "withdraw status already updated, please refresh the page",
//       });
//     }

//     const updatedWithdraw = await Transaction.updateOne(
//       {
//         _id: data.withdrawId,
//         status: "pending",
//       }, // Filter by user ID
//       {
//         $set: {
//           status: data.status,
//           txnData: data.txnData,
//           updatedAt: new Date(),
//         },
//       } // Update the fullName field
//     );

//     const _withdraw = await Transaction.findOne({ _id: withdraw._id }).lean();
//     const u = await User.findOne({ _id: _withdraw.userId });
//     _withdraw.user = u;
//     _withdraw.balance = await ubalance(u);
//     _log({
//       message:
//         req.admin.emailId +
//         " updated withdraw request of " +
//         u.fullName +
//         " (" +
//         u.mobileNumber +
//         ") with txn id '" +
//         _withdraw.txnId +
//         "' & amount ₹ " +
//         _withdraw.amount +
//         " to " +
//         data.status,
//     });

//     return res.json({
//       success: true,
//       message: "withdraw status updated",
//       data: _withdraw,
//     });
//   } catch (error) {
//     return res.json({
//       success: false,
//       message: error.response ? error.response.data.message : error.message,
//     });
//   }
// };

// export const fetchDeposits = async (req, res) => {
//   try {
//     const limit = 20;
//     const skip = (req.body.page - 1) * limit;
//     let cond = req.body.cond;

//     const filter = {};
//     filter.txnCtg = "deposit";
//     filter.isManual = true;
//     if (cond.auto) {
//       filter.isManual = false;
//     }

//     if (cond.status && cond.status != "all") {
//       filter.status = cond.status;
//     }

//     if (cond.keyword) {
//       filter.$or = [
//         { txnId: { $regex: cond.keyword.toString(), $options: "i" } }, // Case-insensitive txnId search
//         { txnData: { $regex: cond.keyword.toString(), $options: "i" } }, // Case-insensitive txnId search
//       ];
//     }

//     const deposits = await Transaction.find(filter)
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit)
//       .lean();

//     const _deposits = await Promise.all(
//       deposits.map(async (d) => {
//         d.user = await User.findOne({ _id: d.userId });
//         return d;
//       })
//     );

//     return res.json({
//       success: true,
//       data: _deposits,
//     });
//   } catch (error) {
//     return res.json({
//       success: false,
//       message: error.response ? error.response.data.message : error.message,
//     });
//   }
// };

// export const updateDepositStatus = async (req, res) => {
//   try {
//     const data = req.body.cond;

//     const deposit = await Transaction.findOne({ _id: data.depositId });

//     if (!deposit) {
//       return res.json({
//         success: false,
//         message: "deposit request not found",
//       });
//     }

//     if (deposit.status != "pending") {
//       return res.json({
//         success: false,
//         message: "deposit status already updated, please refresh the page",
//       });
//     }

//     const updatedDeposit = await Transaction.updateOne(
//       {
//         _id: data.depositId,
//         status: "pending",
//       }, // Filter by user ID
//       {
//         $set: {
//           status: data.status,
//           method: data.txnData,
//           updatedAt: new Date(),
//         },
//       } // Update the fullName field
//     );

//     const _deposit = await Transaction.findOne({ _id: deposit._id }).lean();
//     const u = await User.findOne({ _id: _deposit.userId });
//     _deposit.user = u;

//     _log({
//       message:
//         req.admin.emailId +
//         " updated deposit request of " +
//         u.fullName +
//         " (" +
//         u.mobileNumber +
//         ") with txn id '" +
//         _deposit.txnId +
//         "' & amount ₹" +
//         _deposit.amount +
//         " to " +
//         data.status,
//     });

//     return res.json({
//       success: true,
//       message: "deposit status updated",
//       data: _deposit,
//     });
//   } catch (error) {
//     return res.json({
//       success: false,
//       message: error.response ? error.response.data.message : error.message,
//     });
//   }
// };

// export const sendStat = async () => {
//   const stat = {};
//   stat.conflict = await ManualMatch.countDocuments({
//     status: "running",
//     conflict: true,
//   });
//   stat.cancelReq = await ManualMatch.countDocuments({
//     status: "running",
//     "cancellationRequested.req": true,
//   });
//   stat.withdraw = await Transaction.countDocuments({
//     status: "pending",
//     txnCtg: "withdrawal",
//   });

//   stat.message = await Message.countDocuments({
//     isAdmin: false,
//     isRead: false,
//   });

//   stat.deposit = await Transaction.countDocuments({
//     status: "pending",
//     isManual: true,
//     txnCtg: "deposit",
//   });

//   stat.pendingResult = await ManualMatch.countDocuments({
//     status: "running",
//     $or: [
//       { "host.result": null, "joiner.result": { $ne: null } },
//       { "joiner.result": null, "host.result": { $ne: null } },
//     ],
//   });

//   stat.runningMatch = await ManualMatch.countDocuments({
//     status: "running",
//     conflict: false,
//   });

//   stat.onlineMatch = await OnlineGame.countDocuments({
//     status: "running",
//   });

//   stat.onlineMatch2 = await OnlineGame2.countDocuments({
//     status: "running",
//   });

//   stat.speedMatch = await SpeedLudo.countDocuments({
//     status: "running",
//   });

//   stat.quickMatch = await QuickLudo.countDocuments({
//     status: "running",
//   });

//   io.to("admin").emit("stat", stat);
// };

// export const fetchLogs = async (req, res) => {
//   try {
//     const limit = 20;
//     const skip = (req.body.page - 1) * limit;
//     let cond = req.body.cond;
//     let start, end;

//     if (cond.startDate && cond.endDate) {
//       // If both dates are the same, fetch full-day data
//       if (cond.startDate === cond.endDate) {
//         start = new Date(cond.startDate);
//         end = new Date(cond.startDate);
//         end.setHours(23, 59, 59, 999); // End of the same day
//       } else {
//         // Fetch data between the given range
//         start = new Date(cond.startDate);
//         end = new Date(cond.endDate);
//         end.setHours(23, 59, 59, 999); // Include the full end date
//       }
//       start = convertISTtoUTC(cond.startDate, false);
//       end = convertISTtoUTC(cond.endDate, true);
//     } else {
//       // If no date is provided, use today's date
//       const today = new Date();
//       start = new Date(today.setHours(0, 0, 0, 0));
//       end = new Date(today.setHours(23, 59, 59, 999)); // Include full day
//       const today2 = new Date();
//       start = convertISTtoUTC(today2.toISOString().split("T")[0], false);
//       end = convertISTtoUTC(today2.toISOString().split("T")[0], true);
//     }

//     // Construct the filter object
//     let filter = {
//       createdAt: { $gte: start, $lte: end },
//       matchId: null,
//     };

//     // Add keyword search if provided
//     if (cond.keyword) {
//       filter.$or = [
//         { message: { $regex: cond.keyword.toString(), $options: "i" } }, // Case-insensitive keyword search
//       ];
//     }

//     const logs = await Log.find(filter)
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit);

//     return res.json({
//       success: true,
//       data: logs,
//     });
//   } catch (error) {
//     return res.json({
//       success: false,
//       message: error.response ? error.response.data.message : error.message,
//     });
//   }
// };

// export const fetchAdmins = async (req, res) => {
//   try {
//     const limit = 20;
//     const skip = (req.body.page - 1) * limit;

//     const admins = await Admin.find({ isSuperadmin: false })
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit);

//     return res.json({
//       success: true,
//       data: admins,
//     });
//   } catch (error) {
//     return res.json({
//       success: false,
//       message: error.response ? error.response.data.message : error.message,
//     });
//   }
// };

// export function maskMobile(text) {
//   return text;
//   return text.replace(/\b\d{5}(\d{5})\b/g, "*****$1");
// }
// export const fetchChatList = async () => {
//   try {
//     // const limit = 20;
//     // const skip = (req.body.page - 1) * limit;
//     // const page = req.body.page;
//     const messages = await Message.aggregate([
//       {
//         $group: {
//           _id: {
//             sender: {
//               $cond: {
//                 if: { $lt: ["$senderId", "$receiverId"] },
//                 then: "$senderId",
//                 else: "$receiverId",
//               },
//             },
//             receiver: {
//               $cond: {
//                 if: { $lt: ["$senderId", "$receiverId"] },
//                 then: "$receiverId",
//                 else: "$senderId",
//               },
//             },
//           },
//           latestMessage: { $last: "$$ROOT" },
//         },
//       },
//       { $replaceRoot: { newRoot: "$latestMessage" } },
//       { $sort: { createdAt: -1 } },
//       { $limit: 60 },
//     ]);

//     const _messages = await Promise.all(
//       messages.map(async (msg) => {
//         msg.user = await User.findOne({
//           _id: msg.isAdmin ? msg.receiverId : msg.senderId,
//         });
//         msg.count = await Message.countDocuments({
//           isAdmin: false,
//           isRead: false,
//           $or: [{ receiverId: msg.user._id }, { senderId: msg.user._id }],
//         });
//         return msg;
//       })
//     );

//     return _messages;
//   } catch (error) {
//     ////console.log("createMatch", error);
//     return res.json({
//       success: false,
//       message: error.response ? error.response.data.message : error.message,
//     });
//   }
// };

// export const _fetchChatList = async (req, res) => {
//   try {
//     const messages = await Message.aggregate([
//       {
//         $group: {
//           _id: {
//             sender: {
//               $cond: {
//                 if: { $lt: ["$senderId", "$receiverId"] },
//                 then: "$senderId",
//                 else: "$receiverId",
//               },
//             },
//             receiver: {
//               $cond: {
//                 if: { $lt: ["$senderId", "$receiverId"] },
//                 then: "$receiverId",
//                 else: "$senderId",
//               },
//             },
//           },
//           latestMessage: { $last: "$$ROOT" },
//         },
//       },
//       { $replaceRoot: { newRoot: "$latestMessage" } },
//       { $sort: { createdAt: -1 } },
//       { $limit: 30 },
//     ]);
//     const _messages = await Promise.all(
//       messages.map(async (msg) => {
//         msg.user = await User.findOne({
//           _id: msg.isAdmin ? msg.receiverId : msg.senderId,
//         });
//         msg.count = await Message.countDocuments({
//           isAdmin: false,
//           isRead: false,
//           $or: [{ receiverId: msg.user._id }, { senderId: msg.user._id }],
//         });
//         return msg;
//       })
//     );

//     return res.json({
//       success: true,
//       data: _messages,
//     });
//   } catch (error) {
//     ////console.log("createMatch", error);
//     return res.json({
//       success: false,
//       message: error.response ? error.response.data.message : error.message,
//     });
//   }
// };

// export const fetchChats = async (req, res) => {
//   try {
//     const limit = 20;
//     const skip = (req.body.page - 1) * limit;
//     const userId = req.body.userId;
//     const messages = await Message.find({
//       $or: [{ senderId: userId }, { receiverId: userId }],
//     })
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit);

//     await Message.updateMany({ senderId: userId }, { $set: { isRead: true } });

//     return res.json({
//       success: true,
//       data: messages.reverse(),
//     });
//   } catch (error) {
//     ////console.log("createMatch", error);
//     return res.json({
//       success: false,
//       message: error.response ? error.response.data.message : error.message,
//     });
//   }
// };

// export const sendMsg = async (req, res) => {
//   try {
//     if (!req.body.text.trim() && !req.body.image && !req.file)
//       return res.json({ success: true });

//     const text = req.body.text.trim();
//     const image = req.body.image;
//     const audio = req.file;
//     const newMsg = {
//       adminId: req.admin._id,
//       senderId: req.body.userId,
//       isAdmin: true,
//       receiverId: req.body.userId,
//       text: text,
//     };
//     const user = await User.findOne({ _id: req.body.userId });

//     _log({
//       message:
//         req.admin.emailId +
//         " sended message to " +
//         user.fullName +
//         " (" +
//         user.mobileNumber +
//         ")",
//     });

//     if (isMobileOnline(user.mobileNumber)) {
//       newMsg.isRead = true;
//     }
//     await Message.updateMany(
//       { senderId: req.body.userId },
//       { $set: { isRead: true } }
//     );

//     if (audio && audio.filename) {
//       newMsg.audio = audio.filename;
//     }

//     if (image && image != "null") {
//       let base64String = image;
//       let base64Image = base64String.split(";base64,").pop();
//       let filename = "image_" + Date.now() + ".png";
//       let dirname = uploadChatData + "/ADMIN_" + req.body.mobileNumber + "/";
//       if (!fs.existsSync(dirname)) {
//         fs.mkdirSync(dirname);
//       }

//       var nm = null;
//       await fs.writeFile(
//         dirname + filename,
//         base64Image,
//         { encoding: "base64" },
//         async function (err) {
//           newMsg.image = filename;
//           nm = await Message.create(newMsg);
//           io.to(req.body.mobileNumber).emit("newMsg", [nm]);
//           return res.json({
//             success: true,
//             message: nm,
//           });
//         }
//       );
//     } else {
//       nm = await Message.create(newMsg);
//       io.to(req.body.mobileNumber).emit("newMsg", [nm]);
//       const list = await fetchChatList();
//       io.to("admin").emit("updatechatlist", list);

//       return res.json({
//         success: true,
//         message: nm,
//       });
//     }
//   } catch (error) {
//     ////console.log("createMatch", error);
//     return res.json({
//       success: false,
//       message: error.response ? error.response.data.message : error.message,
//     });
//   }
// };

// export const updateInfo = async (req, res) => {
//   try {
//     const config = await _config();
//     if (config.DEMO == true) {
//       return res.json({
//         success: false,
//         message: config.DEMO_MSG,
//       });
//     }

//     const updatedInfo = await Info.updateOne(
//       {
//         _id: req.body._id,
//       }, // Filter by user ID
//       {
//         $set: {
//           hindiText: req.body.hindiText,
//           englishText: req.body.englishText,
//           updatedAt: new Date(),
//         },
//       }
//     );

//     // await Info.create({
//     //   hindiText: req.body.hindiText,
//     //   englishText: req.body.englishText,
//     // });

//     _log({
//       message:
//         req.admin.emailId +
//         " updated  " +
//         req.body.title +
//         " information banner",
//     });
//     return res.json({
//       success: true,
//       message: "info updated !",
//     });
//   } catch (error) {
//     return res.json({
//       success: false,
//       message: error.response ? error.response.data.message : error.message,
//     });
//   }
// };

// export const updateGame = async (req, res) => {
//   try {
//     const config = await _config();
//     if (config.DEMO == true) {
//       return res.json({
//         success: false,
//         message: config.DEMO_MSG,
//       });
//     }
//     const updatedGame = await Game.updateOne(
//       {
//         _id: req.body._id,
//       }, // Filter by user ID
//       {
//         $set: {
//           guidehindi: req.body.hindi,
//           guideenglish: req.body.english,
//           status: req.body.status,
//           multipleOf: req.body.multipleOf ?? 0,
//           minAmount: req.body.minAmount ?? 0,
//           maxAmount: req.body.maxAmount ?? 0,
//           amounts: req.body.amounts ?? 0,
//           duration: req.body.duration ?? 0,
//           durationLite: req.body.durationLite ?? 0,

//           moves: req.body.moves ?? 0,
//           updatedAt: new Date(),
//         },
//       }
//     );

//     // await Info.create({
//     //   hindiText: req.body.hindiText,
//     //   englishText: req.body.englishText,
//     // });

//     _log({
//       message: req.admin.emailId + " updated  game data",
//     });

//     await getFakeRunningMatches();
//     return res.json({
//       success: true,
//       message: "info updated !",
//     });
//   } catch (error) {
//     return res.json({
//       success: false,
//       message: error.response ? error.response.data.message : error.message,
//     });
//   }
// };

// export const fetchInfos = async (req, res) => {
//   try {
//     const limit = 20;
//     const skip = (req.body.page - 1) * limit;

//     const infos = await Info.find().skip(skip).limit(limit);

//     return res.json({
//       success: true,
//       data: infos,
//     });
//   } catch (error) {
//     return res.json({
//       success: false,
//       message: error.response ? error.response.data.message : error.message,
//     });
//   }
// };

// export const fetchGamesList = async (req, res) => {
//   try {
//     const limit = 20;
//     const skip = (req.body.page - 1) * limit;

//     const games = await Game.find().skip(skip).limit(10);

//     return res.json({
//       success: true,
//       data: games,
//     });
//   } catch (error) {
//     return res.json({
//       success: false,
//       message: error.response ? error.response.data.message : error.message,
//     });
//   }
// };

// export const addTxn = async (req, res) => {
//   try {
//     let amount = req.body.cond.amount;
//     if (!validAmount(amount)) {
//       return res.json({
//         success: false,
//         message: "please enter a valid amount",
//       });
//     }

//     amount = Number(amount);
//     amount = amount.toFixed(2);

//     const txnid = await newTxnId();

//     //txncreation

//     const newtxn = {
//       txnId: txnid,
//       userId: req.body.cond._id,
//       amount: amount,
//       txnType: req.body.cond.txnType,
//       remark: req.body.cond.txnType + "ed by Admin ",
//       status: "completed",
//       isManual: true,
//     };

//     if (req.body.cond.wallet == "cash") {
//       newtxn.txnCtg = "deposit";
//       newtxn.cash = amount;
//     } else if (req.body.cond.wallet == "bonus") {
//       newtxn.txnCtg = "bonus";
//       newtxn.bonus = amount;
//     } else if (req.body.cond.wallet == "reward") {
//       newtxn.txnCtg = "reward";
//       newtxn.reward = amount;
//     }

//     await Transaction.create(newtxn);
//     const w = await User.findOne({
//       _id: req.body.cond._id,
//     });

//     await _log({
//       message:
//         req.admin.emailId +
//         " (admin) " +
//         req.body.cond.txnType +
//         "ed ₹" +
//         amount +
//         " in " +
//         w.fullName +
//         "(" +
//         w.mobileNumber +
//         ") " +
//         req.body.cond.wallet +
//         " wallet",
//     });
//     return res.json({
//       success: true,
//       message: "transaction added",
//       data: [1, 2, 3],
//     });
//   } catch (error) {
//     ////console.log("paymentQr", error);
//     return res.json({
//       success: false,
//       message: error.response ? error.response.data.message : error.message,
//     });
//   }
// };

// export function isValidCommission(commission) {
//   return (
//     commission !== undefined &&
//     commission !== null &&
//     commission !== "" &&
//     !isNaN(commission) &&
//     isFinite(commission)
//   );
// }

// export const addCommissionParam = async (req, res) => {
//   try {
//     let minAmount = req.body.cond.minAmount;
//     let maxAmount = req.body.cond.maxAmount;
//     let commission = req.body.cond.commission;

//     if (!validAmount(minAmount)) {
//       return res.json({
//         success: false,
//         message: "please enter a valid minimum amount",
//       });
//     }

//     if (!validAmount(maxAmount)) {
//       return res.json({
//         success: false,
//         message: "please enter a valid maximum amount",
//       });
//     }

//     if (!isValidCommission(commission)) {
//       return res.json({
//         success: false,
//         message: "please enter a valid commission",
//       });
//     }
//     minAmount = Number(minAmount);
//     minAmount = minAmount.toFixed(2);

//     maxAmount = Number(maxAmount);
//     maxAmount = maxAmount.toFixed(2);

//     commission = Number(commission);
//     commission = commission.toFixed(2);

//     await Commission.create({
//       minAmount: minAmount,
//       maxAmount: maxAmount,
//       commission: commission,

//       type: req.body.cond.type ? req.body.cond.type : null,
//     });

//     await _log({
//       message:
//         req.admin.emailId +
//         " (admin) " +
//         "added new commission parameter " +
//         (req.body.cond.type ? req.body.cond.type : "") +
//         " (min:" +
//         minAmount +
//         ", max:" +
//         maxAmount +
//         ", commission:" +
//         commission +
//         ") ",
//     });

//     const filter = {};
//     if (req.body.cond && req.body.cond.type) {
//       filter.type = req.body.cond.type;
//     } else {
//       filter.type = null;
//     }

//     const data = await Commission.find(filter).sort({ maxAmount: 1 });
//     return res.json({
//       success: true,
//       message: "new commission parameter added",
//       data: data,
//     });
//   } catch (error) {
//     ////console.log("paymentQr", error);
//     return res.json({
//       success: false,
//       message: error.response ? error.response.data.message : error.message,
//     });
//   }
// };

// export const fetchCommissionParams = async (req, res) => {
//   try {
//     const filter = {};
//     if (req.body.cond && req.body.cond.type) {
//       filter.type = req.body.cond.type;
//     } else {
//       filter.type = null;
//     }
//     const data = await Commission.find(filter).sort({ maxAmount: 1 });
//     return res.json({
//       success: true,
//       data: data,
//     });
//   } catch (error) {
//     ////console.log("paymentQr", error);
//     return res.json({
//       success: false,
//       message: error.response ? error.response.data.message : error.message,
//     });
//   }
// };

// export const deleteParam = async (req, res) => {
//   try {
//     await Commission.deleteOne({ _id: req.body.cond._id });

//     await _log({
//       message:
//         req.admin.emailId + " (admin) " + "delete a commission parameter",
//     });
//     const data = await Commission.find().sort({ maxAmount: 1 });
//     return res.json({
//       success: true,
//       data: data,
//     });
//   } catch (error) {
//     ////console.log("paymentQr", error);
//     return res.json({
//       success: false,
//       message: error.response ? error.response.data.message : error.message,
//     });
//   }
// };

// export const fetchGameJson = async (req, res) => {
//   try {
//     const data = await checkGameStatus(req.body.cond.gameId);
//     if (data.apiWorking) {
//       await ManualMatch.updateOne(
//         { _id: req.body.cond._id },
//         { $set: { apiData: data.data } }
//       );
//       return res.json({
//         success: true,
//         data: data.data,
//       });
//     } else {
//       return res.json({
//         success: false,
//         message: "api is not responding or invalid game id",
//       });
//     }
//   } catch (error) {
//     ////console.log("paymentQr", error);
//     return res.json({
//       success: false,
//       message: error.response ? error.response.data.message : error.message,
//     });
//   }
// };


import { Admin, checkPassword } from "../../models/admin.model.js";
import jwt from "jsonwebtoken";
import User from "../../models/user.model.js";
import { newTxnId, ubalance } from "../user.controller.js";
import { Transaction } from "../../models/transaction.models.js";
import { ManualMatch } from "../../models/manualmatch.model.js";
import {
  cancelMatchAndRefund,
  cancelMatchAndRefund2,
  checkGameStatus,
  getFakeRunningMatches,
  refBonusManager,
} from "../match.controller.js";
import Log from "../../models/log.model.js";
import uniqueString from "unique-string";
import { io, uploadChatData } from "../../index.js";
import { Message } from "../../models/message.model.js";
import fs from "fs";
import { isMobileOnline } from "../socket.controller.js";
import { Info } from "../../models/info.model.js";
import { Game } from "../../models/game.model.js";
import { _config, convertISTtoUTC } from "../config.controller.js";
import { validAmount } from "../payment.controller.js";
import Commission from "../../models/commission.model.js";
import { OnlineGame } from "../../models/onlinegame.js";
import { SpeedLudo } from "../../models/speedludo.js";
import { QuickLudo } from "../../models/quickludo.js";
import { OnlineGame2 } from "../../models/onlinegame2.js";

export const _log = async (log) => {
  await Log.create(log);
};

export const isValidEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

export const isEmptyOrSpaces = (str) => {
  return str.trim().length === 0;
};

export const verifyLogin = async (req, res) => {
  try {
    const emailId = req.body.emailId;
    const password = req.body.password;

    if (isEmptyOrSpaces(emailId)) {
      return res.json({
        success: false,
        message: "please enter valid email id",
      });
    }

    if (isEmptyOrSpaces(password)) {
      return res.json({
        success: false,
        message: "please enter a valid password",
      });
    }
    if (!isValidEmail(emailId)) {
      return res.json({
        success: false,
        message: "please enter a valid email id",
      });
    }

    const admin = await Admin.findOne({
      emailId,
    });

    if (!admin) {
      return res.json({
        success: false,
        message: "email id is not registered",
      });
    }

    if (admin.status != "active") {
      return res.json({
        success: false,
        message: "your account is not active",
      });
    }

    const checkAdmin = await checkPassword(password, admin);
    if (checkAdmin) {
      const deviceId = uniqueString();

      await Admin.updateOne(
        { _id: admin._id },
        { $set: { deviceId: deviceId } }
      );

      const tokenData = { adminId: admin._id };
      const token = await jwt.sign(tokenData, process.env.JWT_SECRET_KEY);
      await _log({ message: admin.emailId + " is logged in successfully" });
      return res.json({
        success: true,
        message: "account verified !",
        auth: {
          _token: token,
          _name: admin.name,
          _status: admin.status,
          _access: admin.access,
          _isSuperadmin: admin.isSuperadmin,
          isAuth: true,
          _deviceId: deviceId,
        },
      });
    } else {
      return res.json({
        success: false,
        message: "your password is incorrect",
      });
    }
  } catch (error) {
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export const autologin = async (req, res) => {
  try {
    const token = req.body.token;
    const deviceId = req.body.deviceId;

    if (!token || !deviceId) {
      return res.json({
        success: false,
        message: "invalid token and device id",
      });
    }

    const decode = await jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (!decode) {
      return res.json({
        status: false,
        message: "you are not authorized, to perform that action",
      });
    }

    const admin = await Admin.findOne({
      _id: decode.adminId,
      deviceId: deviceId,
    });

    if (admin) {
      if (admin.status != "active") {
        return res.json({
          status: false,
          message: "you are account is not active",
        });
      }

      const deviceId = uniqueString();

      await Admin.updateOne(
        { _id: admin._id },
        { $set: { deviceId: deviceId } }
      );

      const tokenData = { adminId: admin._id };
      const token = await jwt.sign(tokenData, process.env.JWT_SECRET_KEY);
      return res.json({
        success: true,
        data: {
          _token: token,
          _name: admin.name,
          _status: admin.status,
          _access: admin.access,
          _isSuperadmin: admin.isSuperadmin,
          isAuth: true,
          _deviceId: deviceId,
        },
      });
    } else {
      return res.json({
        success: false,
        message: "admin not found , please login again",
      });
    }
  } catch (error) {
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export const fetchUsersList = async (req, res) => {
  try {
    const limit = 20;
    const skip = (req.body.page - 1) * limit;
    let cond = req.body.cond;

    const users = await User.find({
      $or: [
        { fullName: { $regex: cond.keyword, $options: "i" } },
        { mobileNumber: { $regex: cond.keyword, $options: "i" } },
        { username: { $regex: cond.keyword, $options: "i" } },
      ],
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const _users = await Promise.all(
      users.map(async (user) => {
        user.balance = await ubalance(user);
        user.mobileNumber = maskMobile(user.mobileNumber);
        return user;
      })
    );

    return res.json({
      success: true,
      data: _users,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { userId, status, _y, _su } = req.body;

    const normalizedStatus = status === "active" ? "active" : "inactive";
    const normalizedY = Boolean(_y);
    const normalizedSU = Boolean(_su);

    const updatedUser = await User.updateOne(
      { _id: userId },
      {
        $set: {
          status: normalizedStatus,
          _y: normalizedY,
          _su: normalizedSU,
          updatedAt: new Date(),
        },
      }
    );

    if (!updatedUser.modifiedCount) {
      return res.json({
        success: false,
        message: "user not found or no changes made",
      });
    }

    const u = await User.findById(userId);

    _log({
      message: `${req.admin.emailId} updated status of ${u.fullName} (${u.mobileNumber}) 
        → status: ${normalizedStatus}, _y: ${normalizedY}, _su: ${normalizedSU}`,
    });

    return res.json({
      success: true,
      message: "user status updated",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error?.response?.data?.message || error.message,
    });
  }
};

export const fetchUser = async (req, res) => {
  try {
    let cond = req.body.cond;
    if (!cond) {
      return res.json({
        success: false,
        data: "invalid user page",
      });
    }

    const user = await User.findOne(cond).lean();
    if (!user) {
      return res.json({
        success: false,
        data: "invalid user page",
      });
    }
    user.balance = await ubalance(user);
    user.stat = {};

    const [
      totalRef,
      refBy,
      totalPlayedMatches,
      totalPlayedMatches2,
      totalPlayedMatches3,
      totalPlayedMatches4,
      totalPlayedMatches5,

      totalWonMatches,
      totalWonMatches2,
      totalWonMatches3,
      totalWonMatches4,
      totalWonMatches5,

      totalLostMatches,
      totalLostMatches2,
      totalLostMatches3,
      totalLostMatches4,
      totalLostMatches5,

      depositStats,
      withdrawalStats,
      winningsStats,
      referralStats,
    ] = await Promise.all([
      User.countDocuments({ referBy: user.referralCode }),
      User.findOne({ referralCode: user.referBy }),
      ManualMatch.countDocuments({
        status: "completed",
        $or: [{ "host.userId": user._id }, { "joiner.userId": user._id }],
      }),
      OnlineGame.countDocuments({
        status: "completed",
        $or: [{ "blue.userId": user._id }, { "green.userId": user._id }],
      }),
      SpeedLudo.countDocuments({
        status: "completed",
        $or: [{ "blue.userId": user._id }, { "green.userId": user._id }],
      }),
      QuickLudo.countDocuments({
        status: "completed",
        $or: [{ "blue.userId": user._id }, { "green.userId": user._id }],
      }),
      OnlineGame2.countDocuments({
        status: "completed",
        $or: [{ "blue.userId": user._id }, { "green.userId": user._id }],
      }),

      ManualMatch.countDocuments({
        status: "completed",
        "winner.userId": user._id,
      }),
      OnlineGame.countDocuments({
        status: "completed",
        $or: [
          { "blue.userId": user._id, "blue.result": "winner" },
          { "green.userId": user._id, "green.result": "winner" },
        ],
      }),
      SpeedLudo.countDocuments({
        status: "completed",
        $or: [
          { "blue.userId": user._id, "blue.result": "winner" },
          { "green.userId": user._id, "green.result": "winner" },
        ],
      }),
      QuickLudo.countDocuments({
        status: "completed",
        $or: [
          { "blue.userId": user._id, "blue.result": "winner" },
          { "green.userId": user._id, "green.result": "winner" },
        ],
      }),
      OnlineGame2.countDocuments({
        status: "completed",
        $or: [
          { "blue.userId": user._id, "blue.result": "winner" },
          { "green.userId": user._id, "green.result": "winner" },
        ],
      }),

      ManualMatch.countDocuments({
        status: "completed",
        "looser.userId": user._id,
      }),
      OnlineGame.countDocuments({
        status: "completed",
        $or: [
          { "blue.userId": user._id, "blue.result": "looser" },
          { "green.userId": user._id, "green.result": "looser" },
        ],
      }),
      SpeedLudo.countDocuments({
        status: "completed",
        $or: [
          { "blue.userId": user._id, "blue.result": "looser" },
          { "green.userId": user._id, "green.result": "looser" },
        ],
      }),
      QuickLudo.countDocuments({
        status: "completed",
        $or: [
          { "blue.userId": user._id, "blue.result": "looser" },
          { "green.userId": user._id, "green.result": "looser" },
        ],
      }),
      OnlineGame2.countDocuments({
        status: "completed",
        $or: [
          { "blue.userId": user._id, "blue.result": "looser" },
          { "green.userId": user._id, "green.result": "looser" },
        ],
      }),

      Transaction.aggregate([
        {
          $match: {
            status: "completed",
            txnCtg: "deposit",
            txnType: "credit",
            userId: user._id,
          },
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ]),

      Transaction.aggregate([
        {
          $match: {
            status: "completed",
            txnCtg: "withdrawal",
            txnType: "debit",
            userId: user._id,
          },
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ]),

      Transaction.aggregate([
        {
          $match: {
            status: "completed",
            txnCtg: "reward",
            txnType: "credit",
            userId: user._id,
          },
        },
        { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
      ]),

      Transaction.aggregate([
        {
          $match: {
            status: "completed",
            txnCtg: "referral",
            txnType: "credit",
            userId: user._id,
          },
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    user.stat.totalPlayedMatches =
      totalPlayedMatches +
      totalPlayedMatches2 +
      totalPlayedMatches3 +
      totalPlayedMatches4 +
      totalPlayedMatches5;

    user.stat.totalWonMatches =
      totalWonMatches +
      totalWonMatches2 +
      totalWonMatches3 +
      totalWonMatches4 +
      totalWonMatches5;

    user.stat.totalLostMatches =
      totalLostMatches +
      totalLostMatches2 +
      totalLostMatches3 +
      totalLostMatches4 +
      totalLostMatches5;

    user.stat.totalRef = totalRef;

    user.stat.totalDeposit =
      depositStats.length > 0 ? depositStats[0].totalAmount.toFixed(2) : 0;
    user.stat.totalDepositCount =
      depositStats.length > 0 ? depositStats[0].count : 0;

    user.stat.totalWithdrawal =
      withdrawalStats.length > 0
        ? withdrawalStats[0].totalAmount.toFixed(2)
        : 0;
    user.stat.totalWithdrawalCount =
      withdrawalStats.length > 0 ? withdrawalStats[0].count : 0;

    user.stat.totalWinnings =
      winningsStats.length > 0 ? winningsStats[0].totalAmount : 0;

    user.stat.totalReferralEarnings =
      referralStats.length > 0 ? referralStats[0].totalAmount : 0;
    user.stat.totalReferralCount =
      referralStats.length > 0 ? referralStats[0].count : 0;
    user.refBy = refBy;

    return res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export const fetchUserTransactions = async (req, res) => {
  try {
    const limit = 20;
    const skip = (req.body.page - 1) * limit;
    let cond = req.body.cond;

    const filter = { userId: cond.userId };

    if (cond.txnCtg != "all") filter.txnCtg = cond.txnCtg;

    if (cond.keyword) {
      filter.$or = [
        { txnId: { $regex: cond.keyword.toString(), $options: "i" } },
      ];
    }

    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const _txns = await Promise.all(
      transactions.map(async (txn) => {
        txn.match = await ManualMatch.findOne({ _id: txn.matchId });
        if (!txn.match) txn.match = await OnlineGame.findOne({ _id: txn.matchId });
        if (!txn.match) txn.match = await SpeedLudo.findOne({ _id: txn.matchId });
        if (!txn.match) txn.match = await QuickLudo.findOne({ _id: txn.matchId });
        if (!txn.match) {
          txn.match = await OnlineGame2.findOne({ _id: txn.matchId }).lean();
          if (txn.match) txn.match.type = "online2";
        }
        return txn;
      })
    );

    return res.json({
      success: true,
      data: _txns,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export const fetchUserMatches = async (req, res) => {
  try {
    const limit = 20;
    const skip = (req.body.page - 1) * limit;
    let cond = req.body.cond;

    const filter = {};

    if (cond.status && cond.status != "all") {
      filter.status = cond.status;
    } else if (cond.result && cond.result == "won") {
      filter["winner.userId"] = cond.userId;
    } else if (cond.result && cond.result == "lost") {
      filter["looser.userId"] = cond.userId;
    }

    filter.$and = [
      {
        $or: [{ "host.userId": cond.userId }, { "joiner.userId": cond.userId }],
      },
    ];

    if (cond.keyword) {
      filter.$or = [
        { matchId: { $regex: cond.keyword.toString(), $options: "i" } },
        { roomCode: { $regex: cond.keyword.toString(), $options: "i" } },
      ];
    }

    const matches = await ManualMatch.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const _matches = await Promise.all(
      matches.map(async (match) => {
        match.hostData = await User.findOne({ _id: match.host.userId });
        match.joinerData = await User.findOne({ _id: match.joiner.userId });
        return match;
      })
    );

    return res.json({
      success: true,
      data: _matches,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export const fetchUserOnlineMatches = async (req, res) => {
  try {
    const limit = 20;
    const skip = (req.body.page - 1) * limit;
    let cond = req.body.cond;

    const filter = { $and: [] };

    if (cond.status && cond.status !== "all") {
      filter.$and.push({ status: cond.status });
    }

    if (cond.result === "won") {
      filter.$and.push({
        $or: [
          { "blue.userId": cond.userId, "blue.result": "winner" },
          { "green.userId": cond.userId, "green.result": "winner" },
        ],
      });
    } else if (cond.result === "lost") {
      filter.$and.push({
        $or: [
          { "blue.userId": cond.userId, "blue.result": "looser" },
          { "green.userId": cond.userId, "green.result": "looser" },
        ],
      });
    }

    filter.$and.push({
      $or: [{ "blue.userId": cond.userId }, { "green.userId": cond.userId }],
    });

    if (cond.keyword) {
      filter.$and.push({
        $or: [
          { matchId: { $regex: cond.keyword.toString(), $options: "i" } },
          { roomCode: { $regex: cond.keyword.toString(), $options: "i" } },
        ],
      });
    }

    const matches = await OnlineGame.find(filter.$and.length ? filter : {})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const _matches = await Promise.all(
      matches.map(async (match) => {
        match.hostData = await User.findOne({ _id: match.blue.userId });
        match.joinerData = await User.findOne({ _id: match.green.userId });
        return match;
      })
    );

    return res.json({
      success: true,
      data: _matches,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export const fetchUserOnlineMatches2 = async (req, res) => {
  try {
    const limit = 20;
    const skip = (req.body.page - 1) * limit;
    let cond = req.body.cond;

    const filter = { $and: [] };

    if (cond.status && cond.status !== "all") {
      filter.$and.push({ status: cond.status });
    }

    if (cond.result === "won") {
      filter.$and.push({
        $or: [
          { "blue.userId": cond.userId, "blue.result": "winner" },
          { "green.userId": cond.userId, "green.result": "winner" },
        ],
      });
    } else if (cond.result === "lost") {
      filter.$and.push({
        $or: [
          { "blue.userId": cond.userId, "blue.result": "looser" },
          { "green.userId": cond.userId, "green.result": "looser" },
        ],
      });
    }

    filter.$and.push({
      $or: [{ "blue.userId": cond.userId }, { "green.userId": cond.userId }],
    });

    if (cond.keyword) {
      filter.$and.push({
        $or: [
          { matchId: { $regex: cond.keyword.toString(), $options: "i" } },
          { roomCode: { $regex: cond.keyword.toString(), $options: "i" } },
        ],
      });
    }

    const matches = await OnlineGame2.find(filter.$and.length ? filter : {})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const _matches = await Promise.all(
      matches.map(async (match) => {
        match.hostData = await User.findOne({ _id: match.blue.userId });
        match.joinerData = await User.findOne({ _id: match.green.userId });
        return match;
      })
    );

    return res.json({
      success: true,
      data: _matches,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export const fetchUserSpeedMatches = async (req, res) => {
  try {
    const limit = 20;
    const skip = (req.body.page - 1) * limit;
    let cond = req.body.cond;

    const filter = { $and: [] };

    if (cond.status && cond.status !== "all") {
      filter.$and.push({ status: cond.status });
    }

    if (cond.result === "won") {
      filter.$and.push({
        $or: [
          { "blue.userId": cond.userId, "blue.result": "winner" },
          { "green.userId": cond.userId, "green.result": "winner" },
        ],
      });
    } else if (cond.result === "lost") {
      filter.$and.push({
        $or: [
          { "blue.userId": cond.userId, "blue.result": "looser" },
          { "green.userId": cond.userId, "green.result": "looser" },
        ],
      });
    }

    filter.$and.push({
      $or: [{ "blue.userId": cond.userId }, { "green.userId": cond.userId }],
    });

    if (cond.keyword) {
      filter.$and.push({
        $or: [
          { matchId: { $regex: cond.keyword.toString(), $options: "i" } },
          { roomCode: { $regex: cond.keyword.toString(), $options: "i" } },
        ],
      });
    }

    const matches = await SpeedLudo.find(filter.$and.length ? filter : {})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const _matches = await Promise.all(
      matches.map(async (match) => {
        match.hostData = await User.findOne({ _id: match.blue.userId });
        match.joinerData = await User.findOne({ _id: match.green.userId });
        return match;
      })
    );

    return res.json({
      success: true,
      data: _matches,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export const fetchUserQuickMatches = async (req, res) => {
  try {
    const limit = 20;
    const skip = (req.body.page - 1) * limit;
    let cond = req.body.cond;

    const filter = { $and: [] };

    if (cond.status && cond.status !== "all") {
      filter.$and.push({ status: cond.status });
    }

    if (cond.result === "won") {
      filter.$and.push({
        $or: [
          { "blue.userId": cond.userId, "blue.result": "winner" },
          { "green.userId": cond.userId, "green.result": "winner" },
        ],
      });
    } else if (cond.result === "lost") {
      filter.$and.push({
        $or: [
          { "blue.userId": cond.userId, "blue.result": "looser" },
          { "green.userId": cond.userId, "green.result": "looser" },
        ],
      });
    }

    filter.$and.push({
      $or: [{ "blue.userId": cond.userId }, { "green.userId": cond.userId }],
    });

    if (cond.keyword) {
      filter.$and.push({
        $or: [
          { matchId: { $regex: cond.keyword.toString(), $options: "i" } },
          { roomCode: { $regex: cond.keyword.toString(), $options: "i" } },
        ],
      });
    }

    const matches = await QuickLudo.find(filter.$and.length ? filter : {})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const _matches = await Promise.all(
      matches.map(async (match) => {
        match.hostData = await User.findOne({ _id: match.blue.userId });
        match.joinerData = await User.findOne({ _id: match.green.userId });
        return match;
      })
    );

    return res.json({
      success: true,
      data: _matches,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export const fetchMatches = async (req, res) => {
  try {
    const limit = 20;
    const skip = (req.body.page - 1) * limit;
    let cond = req.body.cond;

    const filter = {};

    if (cond.onlyConflict) {
      filter.conflict = true;
    }

    if (cond.onlyCancel) {
      filter["cancellationRequested.req"] = true;
    }

    if (cond.status && cond.status == "conflicted") {
      filter.conflict = true;
    } else if (cond.status && cond.status != "all") {
      filter.status = cond.status;
    }

    if (cond.keyword) {
      filter.$or = [
        { matchId: { $regex: cond.keyword.toString(), $options: "i" } },
        { roomCode: { $regex: cond.keyword.toString(), $options: "i" } },
      ];
    }

    if (cond.onlyPending) {
      filter.$or = (filter.$or || []).concat([
        { "host.result": null, "joiner.result": { $ne: null } },
        { "joiner.result": null, "host.result": { $ne: null } },
      ]);
    }

    const matches = await ManualMatch.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const _matches = await Promise.all(
      matches.map(async (match) => {
        match.hostData = await User.findOne({ _id: match.host.userId });
        match.joinerData = await User.findOne({ _id: match.joiner.userId });
        return match;
      })
    );

    return res.json({
      success: true,
      data: _matches,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export const fetchOnlineMatches = async (req, res) => {
  try {
    const limit = 20;
    const skip = (req.body.page - 1) * limit;
    let cond = req.body.cond;

    const filter = {};

    if (cond.status && cond.status != "all") {
      filter.status = cond.status;
    }

    if (cond.keyword) {
      filter.$or = [
        { matchId: { $regex: cond.keyword.toString(), $options: "i" } },
        { roomCode: { $regex: cond.keyword.toString(), $options: "i" } },
      ];
    }

    const matches = await OnlineGame.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const _matches = await Promise.all(
      matches.map(async (match) => {
        match.hostData = await User.findOne({ _id: match.blue.userId });
        match.joinerData = await User.findOne({ _id: match.green.userId });
        return match;
      })
    );

    return res.json({
      success: true,
      data: _matches,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export const fetchOnlineMatches2 = async (req, res) => {
  try {
    const limit = 20;
    const skip = (req.body.page - 1) * limit;
    let cond = req.body.cond;

    const filter = {};

    if (cond.status && cond.status != "all") {
      filter.status = cond.status;
    }

    if (cond.keyword) {
      filter.$or = [
        { matchId: { $regex: cond.keyword.toString(), $options: "i" } },
        { roomCode: { $regex: cond.keyword.toString(), $options: "i" } },
      ];
    }

    const matches = await OnlineGame2.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const _matches = await Promise.all(
      matches.map(async (match) => {
        match.hostData = await User.findOne({ _id: match.blue.userId });
        match.joinerData = await User.findOne({ _id: match.green.userId });
        return match;
      })
    );

    return res.json({
      success: true,
      data: _matches,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export const fetchSpeedMatches = async (req, res) => {
  try {
    const limit = 20;
    const skip = (req.body.page - 1) * limit;
    let cond = req.body.cond;

    const filter = {};

    if (cond.status && cond.status != "all") {
      filter.status = cond.status;
    }

    if (cond.keyword) {
      filter.$or = [
        { matchId: { $regex: cond.keyword.toString(), $options: "i" } },
        { roomCode: { $regex: cond.keyword.toString(), $options: "i" } },
      ];
    }

    const matches = await SpeedLudo.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const _matches = await Promise.all(
      matches.map(async (match) => {
        match.hostData = await User.findOne({ _id: match.blue.userId });
        match.joinerData = await User.findOne({ _id: match.green.userId });
        return match;
      })
    );

    return res.json({
      success: true,
      data: _matches,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export const fetchQuickMatches = async (req, res) => {
  try {
    const limit = 20;
    const skip = (req.body.page - 1) * limit;
    let cond = req.body.cond;

    const filter = {};

    if (cond.status && cond.status != "all") {
      filter.status = cond.status;
    }

    if (cond.keyword) {
      filter.$or = [
        { matchId: { $regex: cond.keyword.toString(), $options: "i" } },
        { roomCode: { $regex: cond.keyword.toString(), $options: "i" } },
      ];
    }

    const matches = await QuickLudo.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const _matches = await Promise.all(
      matches.map(async (match) => {
        match.hostData = await User.findOne({ _id: match.blue.userId });
        match.joinerData = await User.findOne({ _id: match.green.userId });
        return match;
      })
    );

    return res.json({
      success: true,
      data: _matches,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export const fetchMatch = async (req, res) => {
  try {
    let cond = req.body.cond;
    if (!cond) {
      return res.json({
        success: false,
        data: "invalid user page",
      });
    }

    const mo = await ManualMatch.findOne({ _id: cond._id });

    if (cond && cond.reset) {
      if (mo.status !== "open") {
        await ManualMatch.updateOne(
          { _id: cond._id },
          {
            $set: {
              status: "running",
              "winner.userId": null,
              "looser.userId": null,
              "host.result": null,
              "host.resultAt": null,
              "joiner.result": null,
              "joiner.resultAt": null,
            },
          }
        );
      }

      await Transaction.deleteMany({
        matchId: cond._id,
        txnType: "credit",
        txnCtg: { $in: ["reward", "referral", "bet"] },
      });

      await _log({
        matchId: cond._id,
        message:
          req.admin.emailId +
          " (admin) reset result of match and removed rewards / referral / bet credits",
      });
    }

    const match = await ManualMatch.findOne({ _id: cond._id }).lean();
    if (!match) {
      return res.json({
        success: false,
        data: "invalid match page",
      });
    }

    match.stat = {};

    const [hostData, joinerData, transactions, logs] = await Promise.all([
      User.findOne({ _id: match.host.userId }),
      User.findOne({ _id: match.joiner.userId }),
      Transaction.aggregate([
        {
          $match: {
            $or: [
              { matchId: match._id },
              { txnId: match.host.txnId },
              { txnId: match.joiner.txnId },
            ],
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      ]),
      Log.find({ matchId: match._id }),
    ]);

    match.hostData = hostData;
    match.joinerData = joinerData;
    match.transactions = transactions;
    match.logs = logs;

    return res.json({
      success: true,
      data: match,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export const fetchOnlineMatch = async (req, res) => {
  try {
    let cond = req.body.cond;
    if (!cond) {
      return res.json({
        success: false,
        data: "invalid user page",
      });
    }

    const match = await OnlineGame.findOne(cond).lean();
    if (!match) {
      return res.json({
        success: false,
        data: "invalid match page",
      });
    }

    match.stat = {};

    const [hostData, joinerData, transactions, logs] = await Promise.all([
      User.findOne({ _id: match.blue.userId }),
      User.findOne({ _id: match.green.userId }),
      Transaction.aggregate([
        {
          $match: { $or: [{ matchId: match._id }] },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      ]),
      Log.find({ matchId: match._id }),
    ]);

    match.hostData = hostData;
    match.joinerData = joinerData;
    match.transactions = transactions;
    match.logs = logs;

    return res.json({
      success: true,
      data: match,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export const fetchOnlineMatch2 = async (req, res) => {
  try {
    let cond = req.body.cond;
    if (!cond) {
      return res.json({
        success: false,
        data: "invalid user page",
      });
    }

    const match = await OnlineGame2.findOne(cond).lean();
    if (!match) {
      return res.json({
        success: false,
        data: "invalid match page",
      });
    }

    match.stat = {};

    const [hostData, joinerData, transactions, logs] = await Promise.all([
      User.findOne({ _id: match.blue.userId }),
      User.findOne({ _id: match.green.userId }),
      Transaction.aggregate([
        {
          $match: { $or: [{ matchId: match._id }] },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      ]),
      Log.find({ matchId: match._id }),
    ]);

    match.hostData = hostData;
    match.joinerData = joinerData;
    match.transactions = transactions;
    match.logs = logs;

    return res.json({
      success: true,
      data: match,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export const fetchSpeedMatch = async (req, res) => {
  try {
    let cond = req.body.cond;
    if (!cond) {
      return res.json({
        success: false,
        data: "invalid user page",
      });
    }

    const match = await SpeedLudo.findOne(cond).lean();
    if (!match) {
      return res.json({
        success: false,
        data: "invalid match page",
      });
    }

    match.stat = {};

    const [hostData, joinerData, transactions, logs] = await Promise.all([
      User.findOne({ _id: match.blue.userId }),
      User.findOne({ _id: match.green.userId }),
      Transaction.aggregate([
        {
          $match: { $or: [{ matchId: match._id }] },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      ]),
      Log.find({ matchId: match._id }),
    ]);

    match.hostData = hostData;
    match.joinerData = joinerData;
    match.transactions = transactions;
    match.logs = logs;

    return res.json({
      success: true,
      data: match,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export const fetchQuickMatch = async (req, res) => {
  try {
    let cond = req.body.cond;
    if (!cond) {
      return res.json({
        success: false,
        data: "invalid user page",
      });
    }

    const match = await QuickLudo.findOne(cond).lean();
    if (!match) {
      return res.json({
        success: false,
        data: "invalid match page",
      });
    }

    match.stat = {};

    const [hostData, joinerData, transactions, logs] = await Promise.all([
      User.findOne({ _id: match.blue.userId }),
      User.findOne({ _id: match.green.userId }),
      Transaction.aggregate([
        {
          $match: { $or: [{ matchId: match._id }] },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      ]),
      Log.find({ matchId: match._id }),
    ]);

    match.hostData = hostData;
    match.joinerData = joinerData;
    match.transactions = transactions;
    match.logs = logs;

    return res.json({
      success: true,
      data: match,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export const updateResult = async (req, res) => {
  try {
    const cond = req.body.cond;
    const matchId = cond.matchId;
    const match = await ManualMatch.findOne({ _id: matchId });

    if (!match) {
      return res.json({
        success: false,
        message: "match not found",
      });
    }

    if (match.status !== "running" && match.host.result !== match.joiner.result) {
      return res.json({
        success: false,
        message: "match is not running or no result update possible now",
      });
    }

    if (match.winner.userId) {
      return res.json({
        success: false,
        message: "winner already updated",
      });
    }

    const result = {};
    if (cond.result) {
      if (cond.result === "host") {
        result["winner.userId"] = match.host.userId;
        result["looser.userId"] = match.joiner.userId;
        result.status = "completed";
        result.completedAt = Date.now();
      } else if (cond.result === "joiner") {
        result["winner.userId"] = match.joiner.userId;
        result["looser.userId"] = match.host.userId;
        result.status = "completed";
        result.completedAt = Date.now();
      } else if (cond.result === "refund" || cond.result === "cancel") {
        result.status = "cancelled";
        result.updatedAt = Date.now();
      }
    }

    if (cond.req && cond.action) {
      if (cond.action === "accept") {
        result["cancellationRequested.accepted"] = true;
        result["cancellationRequested.acceptedBy"] = req.admin._id;
        result["cancellationRequested.acceptedAt"] = Date.now();
        result.status = "cancelled";
        result.updatedAt = Date.now();
      } else if (cond.action === "reject") {
        result["cancellationRequested.req"] = false;
        result["cancellationRequested.userId"] = null;
        result["cancellationRequested.by"] = null;
        result["cancellationRequested.reqAt"] = null;
        result["cancellationRequested.reason"] = null;
        result.updatedAt = Date.now();
      }
    }

    const checkMatch = await ManualMatch.updateOne({ _id: match._id }, { $set: result });

    if (checkMatch.modifiedCount > 0) {
      const m = await ManualMatch.findOne({ _id: match._id });

      if (cond.req && cond.action) {
        const w = await User.findOne({ _id: m.cancellationRequested.userId });

        await _log({
          matchId: m._id,
          message:
            req.admin.emailId +
            " (admin) " +
            cond.action +
            "ed cancellation request of " +
            w.fullName +
            "(" +
            w.mobileNumber +
            ")",
        });

        if (cond.action === "accept") {
          await cancelMatchAndRefund2(m);
          await _log({
            matchId: m._id,
            message: "match cancelled and entry fee refunded to both players",
          });
        }

        return res.json({
          success: true,
          message: "result updated",
          data: m,
        });
      } else if (cond.result === "cancel" || cond.result === "refund") {
        if (cond.result === "refund") {
          await cancelMatchAndRefund2(m);
          await _log({
            matchId: m._id,
            message:
              req.admin.emailId +
              " (admin) cancelled the match and refunded entry fee",
          });
        } else if (cond.result === "cancel") {
          await _log({
            matchId: m._id,
            message:
              req.admin.emailId +
              " (admin) cancelled the match without refund",
          });
        }

        return res.json({
          success: true,
          message: "result updated",
          data: m,
        });
      } else {
        const bet = await Transaction.findOne({
          matchId: m._id,
          userId: m.winner.userId,
          txnCtg: "bet",
          txnType: "debit",
        });

        const txnid = await newTxnId();
        const NewTxn = {
          txnId: txnid,
          userId: m.winner.userId,
          amount: m.prize,
          cash: bet.cash,
          reward: m.prize - m.entryFee + Number(bet.reward),
          bonus: bet.bonus,
          remark: "Match Won",
          status: "completed",
          txnType: "credit",
          txnCtg: "reward",
          matchId: m._id,
        };

        await Transaction.create(NewTxn);
        const w = await User.findOne({ _id: m.winner.userId });

        await _log({
          matchId: m._id,
          message:
            req.admin.emailId +
            " (admin) updated result & " +
            w.fullName +
            "(" +
            w.mobileNumber +
            ") marked as winner and got reward ₹" +
            m.prize,
        });

        await refBonusManager(m.winner.userId, m);

        return res.json({
          success: true,
          message: "result updated",
          data: m,
        });
      }
    } else {
      return res.json({
        success: false,
        message: "something went wrong, please refresh and try again",
      });
    }
  } catch (error) {
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export const submitResultApi = async (req, res) => {
  try {
    const match = await ManualMatch.findOne({
      _id: req.body.cond.matchId,
      status: "running",
    });

    if (!match) {
      return res.json({
        success: false,
        message: "something went wrong, please refresh and try again",
      });
    }

    const checkMS = await checkGameStatus(match.gameId);
    if (!checkMS.apiWorking) {
      return res.json({
        success: false,
        message: "api is not responding",
      });
    }

    if (checkMS.data.game_status === "Running" || checkMS.data.game_status === "Waiting") {
      return res.json({
        success: false,
        message: "game is running",
      });
    }

    if (checkMS.data.isAutoExit || checkMS.data.isExit) {
      return res.json({
        success: false,
        message: "auto-exit or exit detected, update result manually",
      });
    }

    let winnerUserId = null;
    let looserUserId = null;

    if (
      checkMS.data.creator_id &&
      checkMS.data.winner_id &&
      checkMS.data.creator_id === checkMS.data.winner_id
    ) {
      winnerUserId = match.host.userId;
      looserUserId = match.joiner.userId;
    } else if (
      checkMS.data.player_id &&
      checkMS.data.winner_id &&
      checkMS.data.player_id === checkMS.data.winner_id
    ) {
      winnerUserId = match.joiner.userId;
      looserUserId = match.host.userId;
    }

    if (!winnerUserId) {
      return res.json({
        success: false,
        message: "winner could not be determined from api data",
      });
    }

    const cm = await ManualMatch.updateOne(
      { _id: match._id, status: "running" },
      {
        $set: {
          status: "completed",
          completedAt: Date.now(),
          "winner.userId": winnerUserId,
          "looser.userId": looserUserId,
          apiData: checkMS.data,
        },
      }
    );

    if (cm.modifiedCount === 0) {
      return res.json({
        success: false,
        message: "failed to update match result",
      });
    }

    const txnid = await newTxnId();
    const NewTxn = {
      txnId: txnid,
      userId: winnerUserId,
      amount: match.prize,
      cash: 0,
      reward: match.prize,
      bonus: 0,
      remark: "Match Won",
      status: "completed",
      txnType: "credit",
      txnCtg: "reward",
      matchId: match._id,
    };

    await Transaction.create(NewTxn);

    const w = await User.findOne({ _id: winnerUserId });

    await _log({
      matchId: match._id,
      message:
        req.admin.emailId +
        " (admin) fetched result from api & " +
        w.fullName +
        "(" +
        w.mobileNumber +
        ") marked as winner (verified by api)",
    });

    await refBonusManager(winnerUserId, match);

    return res.json({
      success: true,
      message: "match_finished",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export const fetchWithdraws = async (req, res) => {
  try {
    const limit = 20;
    const skip = (req.body.page - 1) * limit;
    let cond = req.body.cond;

    const filter = { txnCtg: "withdrawal" };

    if (cond.status && cond.status != "all") {
      filter.status = cond.status;
    }

    if (cond.keyword) {
      filter.$or = [
        { txnId: { $regex: cond.keyword.toString(), $options: "i" } },
      ];
    }

    const withdraws = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const _withdraws = await Promise.all(
      withdraws.map(async (w) => {
        w.user = await User.findOne({ _id: w.userId });
        w.balance = await ubalance(w.user);
        return w;
      })
    );

    return res.json({
      success: true,
      data: _withdraws,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export const updateWithdrawStatus = async (req, res) => {
  try {
    const data = req.body.cond;

    const withdraw = await Transaction.findOne({ _id: data.withdrawId });

    if (!withdraw) {
      return res.json({
        success: false,
        message: "withdraw request not found",
      });
    }

    if (withdraw.status !== "pending") {
      return res.json({
        success: false,
        message: "withdraw status already updated, please refresh the page",
      });
    }

    const updatedWithdraw = await Transaction.updateOne(
      { _id: data.withdrawId, status: "pending" },
      {
        $set: {
          status: data.status,
          txnData: data.txnData,
          updatedAt: new Date(),
        },
      }
    );

    const _withdraw = await Transaction.findOne({ _id: withdraw._id }).lean();
    const u = await User.findOne({ _id: _withdraw.userId });
    _withdraw.user = u;
    _withdraw.balance = await ubalance(u);

    await _log({
      message:
        req.admin.emailId +
        " updated withdraw request of " +
        u.fullName +
        " (" +
        u.mobileNumber +
        ") with txn id '" +
        _withdraw.txnId +
        "' & amount ₹ " +
        _withdraw.amount +
        " to " +
        data.status,
    });

    return res.json({
      success: true,
      message: "withdraw status updated",
      data: _withdraw,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export const fetchDeposits = async (req, res) => {
  try {
    const limit = 20;
    const skip = (req.body.page - 1) * limit;
    let cond = req.body.cond;

    const filter = { txnCtg: "deposit", isManual: true };

    if (cond.auto) {
      filter.isManual = false;
    }

    if (cond.status && cond.status != "all") {
      filter.status = cond.status;
    }

    if (cond.keyword) {
      filter.$or = [
        { txnId: { $regex: cond.keyword.toString(), $options: "i" } },
        { txnData: { $regex: cond.keyword.toString(), $options: "i" } },
      ];
    }

    const deposits = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const _deposits = await Promise.all(
      deposits.map(async (d) => {
        d.user = await User.findOne({ _id: d.userId });
        return d;
      })
    );

    return res.json({
      success: true,
      data: _deposits,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export const updateDepositStatus = async (req, res) => {
  try {
    const data = req.body.cond;

    const deposit = await Transaction.findOne({ _id: data.depositId });

    if (!deposit) {
      return res.json({
        success: false,
        message: "deposit request not found",
      });
    }

    if (deposit.status !== "pending") {
      return res.json({
        success: false,
        message: "deposit status already updated, please refresh the page",
      });
    }

    const updatedDeposit = await Transaction.updateOne(
      { _id: data.depositId, status: "pending" },
      {
        $set: {
          status: data.status,
          method: data.txnData,
          updatedAt: new Date(),
        },
      }
    );

    const _deposit = await Transaction.findOne({ _id: deposit._id }).lean();
    const u = await User.findOne({ _id: _deposit.userId });
    _deposit.user = u;

    await _log({
      message:
        req.admin.emailId +
        " updated deposit request of " +
        u.fullName +
        " (" +
        u.mobileNumber +
        ") with txn id '" +
        _deposit.txnId +
        "' & amount ₹" +
        _deposit.amount +
        " to " +
        data.status,
    });

    return res.json({
      success: true,
      message: "deposit status updated",
      data: _deposit,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export const sendStat = async () => {
  const stat = {};
  stat.conflict = await ManualMatch.countDocuments({
    status: "running",
    conflict: true,
  });
  stat.cancelReq = await ManualMatch.countDocuments({
    status: "running",
    "cancellationRequested.req": true,
  });
  stat.withdraw = await Transaction.countDocuments({
    status: "pending",
    txnCtg: "withdrawal",
  });
  stat.message = await Message.countDocuments({
    isAdmin: false,
    isRead: false,
  });
  stat.deposit = await Transaction.countDocuments({
    status: "pending",
    isManual: true,
    txnCtg: "deposit",
  });
  stat.pendingResult = await ManualMatch.countDocuments({
    status: "running",
    $or: [
      { "host.result": null, "joiner.result": { $ne: null } },
      { "joiner.result": null, "host.result": { $ne: null } },
    ],
  });
  stat.runningMatch = await ManualMatch.countDocuments({
    status: "running",
    conflict: false,
  });
  stat.onlineMatch = await OnlineGame.countDocuments({
    status: "running",
  });
  stat.onlineMatch2 = await OnlineGame2.countDocuments({
    status: "running",
  });
  stat.speedMatch = await SpeedLudo.countDocuments({
    status: "running",
  });
  stat.quickMatch = await QuickLudo.countDocuments({
    status: "running",
  });

  io.to("admin").emit("stat", stat);
};

export const fetchLogs = async (req, res) => {
  try {
    const limit = 20;
    const skip = (req.body.page - 1) * limit;
    let cond = req.body.cond;
    let start, end;

    if (cond.startDate && cond.endDate) {
      start = convertISTtoUTC(cond.startDate, false);
      end = convertISTtoUTC(cond.endDate, true);
    } else {
      const today = new Date();
      start = convertISTtoUTC(today.toISOString().split("T")[0], false);
      end = convertISTtoUTC(today.toISOString().split("T")[0], true);
    }

    let filter = {
      createdAt: { $gte: start, $lte: end },
      matchId: null,
    };

    if (cond.keyword) {
      filter.$or = [
        { message: { $regex: cond.keyword.toString(), $options: "i" } },
      ];
    }

    const logs = await Log.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.json({
      success: true,
      data: logs,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export const fetchAdmins = async (req, res) => {
  try {
    const limit = 20;
    const skip = (req.body.page - 1) * limit;

    const admins = await Admin.find({ isSuperadmin: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.json({
      success: true,
      data: admins,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export function maskMobile(text) {
  return text; // no masking implemented
}

/* ---------- helper ---------- */
export async function aggregateChatList() {
  const messages = await Message.aggregate([
    {
      $group: {
        _id: {
          sender: {
            $cond: {
              if: { $lt: ["$senderId", "$receiverId"] },
              then: "$senderId",
              else: "$receiverId",
            },
          },
          receiver: {
            $cond: {
              if: { $lt: ["$senderId", "$receiverId"] },
              then: "$receiverId",
              else: "$senderId",
            },
          },
        },
        latestMessage: { $last: "$$ROOT" },
      },
    },
    { $replaceRoot: { newRoot: "$latestMessage" } },
    { $sort: { createdAt: -1 } },
    { $limit: 60 },
  ]);

  return Promise.all(
    messages.map(async (msg) => {
      msg.user = await User.findOne({
        _id: msg.isAdmin ? msg.receiverId : msg.senderId,
      }).lean();
      msg.count = await Message.countDocuments({
        isAdmin: false,
        isRead: false,
        $or: [{ receiverId: msg.user._id }, { senderId: msg.user._id }],
      });
      return msg;
    })
  );
}

/* ---------- route handler ---------- */
export const fetchChatList = async (req, res) => {
  try {
    const data = await aggregateChatList();
    return res.json({ success: true, data });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
};

export const _fetchChatList = async (req, res) => {
  try {
    const messages = await Message.aggregate([
      {
        $group: {
          _id: {
            sender: {
              $cond: {
                if: { $lt: ["$senderId", "$receiverId"] },
                then: "$senderId",
                else: "$receiverId",
              },
            },
            receiver: {
              $cond: {
                if: { $lt: ["$senderId", "$receiverId"] },
                then: "$receiverId",
                else: "$senderId",
              },
            },
          },
          latestMessage: { $last: "$$ROOT" },
        },
      },
      { $replaceRoot: { newRoot: "$latestMessage" } },
      { $sort: { createdAt: -1 } },
      { $limit: 30 },
    ]);

    const _messages = await Promise.all(
      messages.map(async (msg) => {
        msg.user = await User.findOne({
          _id: msg.isAdmin ? msg.receiverId : msg.senderId,
        });
        msg.count = await Message.countDocuments({
          isAdmin: false,
          isRead: false,
          $or: [{ receiverId: msg.user._id }, { senderId: msg.user._id }],
        });
        return msg;
      })
    );

    return res.json({
      success: true,
      data: _messages,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export const fetchChats = async (req, res) => {
  try {
    const limit = 20;
    const skip = (req.body.page - 1) * limit;
    const userId = req.body.userId;

    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    await Message.updateMany({ senderId: userId }, { $set: { isRead: true } });

    return res.json({
      success: true,
      data: messages.reverse(),
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export const sendMsg = async (req, res) => {
  try {
    if (!req.body.text?.trim() && !req.body.image && !req.file)
      return res.json({ success: true });

    const text = req.body.text?.trim() || "";
    const image = req.body.image;
    const audio = req.file;
    const newMsg = {
      adminId: req.admin._id,
      senderId: req.admin._id,
      isAdmin: true,
      receiverId: req.body.userId,
      text: text,
    };
    const user = await User.findOne({ _id: req.body.userId });

    await _log({
      message:
        req.admin.emailId +
        " sent message to " +
        user.fullName +
        " (" +
        user.mobileNumber +
        ")",
    });

    if (isMobileOnline(user.mobileNumber)) {
      newMsg.isRead = true;
    }
    await Message.updateMany(
      { senderId: req.body.userId },
      { $set: { isRead: true } }
    );

    if (audio && audio.filename) {
      newMsg.audio = audio.filename;
      const nm = await Message.create(newMsg);
      io.to(user.mobileNumber).emit("newMsg", [nm]);
      return res.json({
        success: true,
        message: nm,
      });
    }

    if (image && image !== "null") {
      const base64String = image;
      const base64Image = base64String.split(";base64,").pop();
      const filename = "image_" + Date.now() + ".png";
      const dirname = uploadChatData + "/ADMIN_" + user.mobileNumber + "/";
      if (!fs.existsSync(dirname)) {
        fs.mkdirSync(dirname);
      }

      fs.writeFile(
        dirname + filename,
        base64Image,
        { encoding: "base64" },
        async function (err) {
          if (err) throw err;
          newMsg.image = filename;
          const nm = await Message.create(newMsg);
          io.to(user.mobileNumber).emit("newMsg", [nm]);
          return res.json({
            success: true,
            message: nm,
          });
        }
      );
    } else {
      const nm = await Message.create(newMsg);
      io.to(user.mobileNumber).emit("newMsg", [nm]);
      const list = await aggregateChatList();
      io.to("admin").emit("updatechatlist", list);
      return res.json({
        success: true,
        message: nm,
      });
    }
  } catch (error) {
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export const updateInfo = async (req, res) => {
  try {
    const config = await _config();
    if (config.DEMO === true) {
      return res.json({
        success: false,
        message: config.DEMO_MSG,
      });
    }

    await Info.updateOne(
      { _id: req.body._id },
      {
        $set: {
          hindiText: req.body.hindiText,
          englishText: req.body.englishText,
          updatedAt: new Date(),
        },
      }
    );

    await _log({
      message:
        req.admin.emailId +
        " updated information banner (" +
        req.body.title +
        ")",
    });

    return res.json({
      success: true,
      message: "info updated !",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export const updateGame = async (req, res) => {
  try {
    const config = await _config();
    if (config.DEMO === true) {
      return res.json({
        success: false,
        message: config.DEMO_MSG,
      });
    }

    await Game.updateOne(
      { _id: req.body._id },
      {
        $set: {
          guidehindi: req.body.hindi,
          guideenglish: req.body.english,
          status: req.body.status,
          multipleOf: req.body.multipleOf ?? 0,
          minAmount: req.body.minAmount ?? 0,
          maxAmount: req.body.maxAmount ?? 0,
          amounts: req.body.amounts ?? 0,
          duration: req.body.duration ?? 0,
          durationLite: req.body.durationLite ?? 0,
          moves: req.body.moves ?? 0,
          updatedAt: new Date(),
        },
      }
    );

    await _log({
      message: req.admin.emailId + " updated game data",
    });

    await getFakeRunningMatches();
    return res.json({
      success: true,
      message: "game updated !",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export const fetchInfos = async (req, res) => {
  try {
    const limit = 20;
    const skip = (req.body.page - 1) * limit;

    const infos = await Info.find().skip(skip).limit(limit);

    return res.json({
      success: true,
      data: infos,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export const fetchGamesList = async (req, res) => {
  try {
    const limit = 20;
    const skip = (req.body.page - 1) * limit;

    const games = await Game.find().skip(skip).limit(10);

    return res.json({
      success: true,
      data: games,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export const addTxn = async (req, res) => {
  try {
    let amount = req.body.cond.amount;
    if (!validAmount(amount)) {
      return res.json({
        success: false,
        message: "please enter a valid amount",
      });
    }

    amount = Number(amount).toFixed(2);

    const txnid = await newTxnId();

    const newtxn = {
      txnId: txnid,
      userId: req.body.cond._id,
      amount: amount,
      txnType: req.body.cond.txnType,
      remark: req.body.cond.txnType + "ed by Admin",
      status: "completed",
      isManual: true,
    };

    if (req.body.cond.wallet === "cash") {
      newtxn.txnCtg = "deposit";
      newtxn.cash = amount;
    } else if (req.body.cond.wallet === "bonus") {
      newtxn.txnCtg = "bonus";
      newtxn.bonus = amount;
    } else if (req.body.cond.wallet === "reward") {
      newtxn.txnCtg = "reward";
      newtxn.reward = amount;
    }

    await Transaction.create(newtxn);
    const w = await User.findOne({ _id: req.body.cond._id });

    await _log({
      message:
        req.admin.emailId +
        " (admin) " +
        req.body.cond.txnType +
        "ed ₹" +
        amount +
        " in " +
        w.fullName +
        "(" +
        w.mobileNumber +
        ") " +
        req.body.cond.wallet +
        " wallet",
    });

    return res.json({
      success: true,
      message: "transaction added",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export function isValidCommission(commission) {
  return (
    commission !== undefined &&
    commission !== null &&
    commission !== "" &&
    !isNaN(commission) &&
    isFinite(commission)
  );
}

export const addCommissionParam = async (req, res) => {
  try {
    let minAmount = req.body.cond.minAmount;
    let maxAmount = req.body.cond.maxAmount;
    let commission = req.body.cond.commission;

    if (!validAmount(minAmount)) {
      return res.json({
        success: false,
        message: "please enter a valid minimum amount",
      });
    }

    if (!validAmount(maxAmount)) {
      return res.json({
        success: false,
        message: "please enter a valid maximum amount",
      });
    }

    if (!isValidCommission(commission)) {
      return res.json({
        success: false,
        message: "please enter a valid commission",
      });
    }

    minAmount = Number(minAmount).toFixed(2);
    maxAmount = Number(maxAmount).toFixed(2);
    commission = Number(commission).toFixed(2);

    await Commission.create({
      minAmount: minAmount,
      maxAmount: maxAmount,
      commission: commission,
      type: req.body.cond.type ? req.body.cond.type : null,
    });

    await _log({
      message:
        req.admin.emailId +
        " (admin) added new commission parameter " +
        (req.body.cond.type ? req.body.cond.type : "") +
        " (min:" +
        minAmount +
        ", max:" +
        maxAmount +
        ", commission:" +
        commission +
        ") ",
    });

    const filter = {};
    if (req.body.cond && req.body.cond.type) {
      filter.type = req.body.cond.type;
    } else {
      filter.type = null;
    }

    const data = await Commission.find(filter).sort({ maxAmount: 1 });
    return res.json({
      success: true,
      message: "new commission parameter added",
      data: data,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export const fetchCommissionParams = async (req, res) => {
  try {
    const filter = {};
    if (req.body.cond && req.body.cond.type) {
      filter.type = req.body.cond.type;
    } else {
      filter.type = null;
    }
    const data = await Commission.find(filter).sort({ maxAmount: 1 });
    return res.json({
      success: true,
      data: data,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export const deleteParam = async (req, res) => {
  try {
    await Commission.deleteOne({ _id: req.body.cond._id });

    await _log({
      message: req.admin.emailId + " (admin) deleted a commission parameter",
    });

    const data = await Commission.find().sort({ maxAmount: 1 });
    return res.json({
      success: true,
      data: data,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export const fetchGameJson = async (req, res) => {
  try {
    const data = await checkGameStatus(req.body.cond.gameId);
    if (data.apiWorking) {
      await ManualMatch.updateOne(
        { _id: req.body.cond._id },
        { $set: { apiData: data.data } }
      );
      return res.json({
        success: true,
        data: data.data,
      });
    } else {
      return res.json({
        success: false,
        message: "api is not responding or invalid game id",
      });
    }
  } catch (error) {
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};