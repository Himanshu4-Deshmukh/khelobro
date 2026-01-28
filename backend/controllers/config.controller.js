import { Admin, encryptPassword } from "../models/admin.model.js";
import { Config } from "../models/config.model.js";
import DEVELOPER from "../models/developer.model.js";
import { ManualMatch } from "../models/manualmatch.model.js";
import { OnlineGame } from "../models/onlinegame.js";
import { OnlineGame2 } from "../models/onlinegame2.js";
import OTP from "../models/otp.model.js";
import { QuickLudo } from "../models/quickludo.js";
import { SpeedLudo } from "../models/speedludo.js";
import Tournament from "../models/tournaments.js";
import { Transaction } from "../models/transaction.models.js";
import User from "../models/user.model.js";
import {
  _log,
  isEmptyOrSpaces,
  isValidEmail,
} from "./admin/account.controller.js";

export const fetchConfig = async (req, res) => {
  try {
    const config = await Config.find();

    const configo = await _config();
    if (configo.DEMO == true) {
      config[0].PAYTM_PAYMENT_VERIFICATION_URL =
        "** restricted information for demo **";
      config[0].FAST2SMS_APIKEY = "** restricted information for demo **";
      config[0].LUDOKING_RAPID_APIKEY = "** restricted information for demo **";
      config[0].SANDBOX_API_KEY = "** restricted information for demo **";
      config[0].SANDBOX_SECRET_KEY = "** restricted information for demo **";
      config[0].FAST2SMS_APIKEY = "** restricted information for demo **";
    }

    return res.json({
      success: true,
      data: config[0],
    });
  } catch (error) {
    ////console.log("createMatch", error);
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export const fetchAdmin = async (req, res) => {
  try {
    return res.json({
      success: true,
      data: req.admin,
    });
  } catch (error) {
    ////console.log("createMatch", error);
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export const _config = async () => {
  const config = await Config.find().lean();
  const _setting = config[0];

  _setting.DEMO = false;
  _setting.DEMO_MSG =
    "you are not allowed, to perform this operation. contact the developer at +917669006847 on whatsapp";
  return _setting;
};
export function convertISTtoUTC(dateStr, endOfDay = false) {
  let date = new Date(dateStr);

  if (endOfDay) {
    date.setHours(23, 59, 59, 999); // Set to end of the day in IST
  } else {
    date.setHours(0, 0, 0, 0); // Set to start of the day in IST
  }

  return new Date(date.getTime() - 5.5 * 60 * 60 * 1000); // Convert to UTC
}

export const fetchReports = async (req, res) => {
  try {
    let cond = req.body.cond;
    let start, end;
    const data = {};

    if (cond.startDate && cond.endDate) {
      // If both dates are the same, fetch full-day data
      if (cond.startDate === cond.endDate) {
        start = new Date(cond.startDate);
        end = new Date(cond.startDate);
        end.setHours(23, 59, 59, 999); // End of the same day
      } else {
        // Fetch data between the given range
        start = new Date(cond.startDate);
        end = new Date(cond.endDate);
        end.setHours(23, 59, 59, 999); // Include the full end date
      }
      start = convertISTtoUTC(cond.startDate, false);
      end = convertISTtoUTC(cond.endDate, true);
    } else {
      // If no date is provided, use today's date
      const today = new Date();
      start = new Date(today.setHours(0, 0, 0, 0));
      end = new Date(today.setHours(23, 59, 59, 999)); // Include full day
      const today2 = new Date();
      start = convertISTtoUTC(today2.toISOString().split("T")[0], false);
      end = convertISTtoUTC(today2.toISOString().split("T")[0], true);
    }

    // Construct the filter object

    const zone = { $gte: start, $lte: end };

    data.Total_Registered_Users = await User.countDocuments({
      createdAt: zone,
    });

    data.Total_Matches_Cancelled = await ManualMatch.countDocuments({
      status: "cancelled",
      createdAt: zone,
    });

    data.Total_Matches_Completed = await ManualMatch.countDocuments({
      status: "completed",
      createdAt: zone,
    });

    const betmoney = await ManualMatch.aggregate([
      {
        $match: {
          status: "completed",

          createdAt: zone, // Make sure `zone` is a valid date filter
        },
      },
      {
        $group: {
          _id: null, // Group all matching documents together
          totalAmount: { $sum: "$entryFee" }, // Sum the "amount" field
          totalPrize: { $sum: "$prize" }, // Sum the "amount" field
        },
      },
    ]);

    const betmoney2 = await OnlineGame.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: zone, // Make sure `zone` is a valid date filter
        },
      },
      {
        $group: {
          _id: null, // Group all matching documents together
          totalAmount: { $sum: "$entryFee" }, // Sum the "amount" field
          totalPrize: { $sum: "$prize" }, // Sum the "amount" field
        },
      },
    ]);

    const betmoney3 = await SpeedLudo.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: zone, // Make sure `zone` is a valid date filter
        },
      },
      {
        $group: {
          _id: null, // Group all matching documents together
          totalAmount: { $sum: "$entryFee" }, // Sum the "amount" field
          totalPrize: { $sum: "$prize" }, // Sum the "amount" fiel
        },
      },
    ]);

    const betmoney4 = await QuickLudo.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: zone, // Make sure `zone` is a valid date filter
        },
      },
      {
        $group: {
          _id: null, // Group all matching documents together
          totalAmount: { $sum: "$entryFee" }, // Sum the "amount" field
          totalPrize: { $sum: "$prize" }, // Sum the "amount" fiel
        },
      },
    ]);

    const betmoney5 = await OnlineGame2.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: zone, // Make sure `zone` is a valid date filter
        },
      },
      {
        $group: {
          _id: null, // Group all matching documents together
          totalAmount: { $sum: "$entryFee" }, // Sum the "amount" field
          totalPrize: { $sum: "$prize" }, // Sum the "amount" field
        },
      },
    ]);

    let bmoney = betmoney.length > 0 ? betmoney[0].totalAmount : 0;
    let pmoney = betmoney.length > 0 ? betmoney[0].totalPrize : 0;

    data.ManualBet = bmoney * 2;
    data.ManualReward = pmoney;

    bmoney += betmoney2.length > 0 ? betmoney2[0].totalAmount : 0;
    pmoney += betmoney2.length > 0 ? betmoney2[0].totalPrize : 0;

    data.OnlineBet = betmoney2.length > 0 ? betmoney2[0].totalAmount : 0;
    data.OnlineBet *= 2;
    data.OnlineReward = betmoney2.length > 0 ? betmoney2[0].totalPrize : 0;

    data.SpeedBet = betmoney3.length > 0 ? betmoney3[0].totalAmount : 0;
    data.SpeedBet *= 2;

    data.SpeedReward = betmoney3.length > 0 ? betmoney3[0].totalPrize : 0;

    data.QuickBet = betmoney4.length > 0 ? betmoney4[0].totalAmount : 0;
    data.QuickBet *= 2;

    data.QuickReward = betmoney4.length > 0 ? betmoney4[0].totalPrize : 0;

    data.TokenBet = betmoney5.length > 0 ? betmoney5[0].totalAmount : 0;
    data.TokenBet *= 2;

    data.TokenReward = betmoney5.length > 0 ? betmoney5[0].totalPrize : 0;

        const tournaments = await Tournament.find(
      {
        status: "completed",
        completedAt: zone,
      },
      { _id: 1 }
    );

    const tournamentIds = tournaments.map((t) => t._id);

    const stats = await Transaction.aggregate([
      {
        $match: {
          tournamentId: { $in: tournamentIds },
          txnCtg: { $in: ["bet", "reward"] },
          txnType: { $in: ["debit", "credit"] },
        },
      },
      {
        $group: {
          _id: null,

          totalBetAmount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$txnCtg", "bet"] },
                    { $eq: ["$txnType", "debit"] },
                  ],
                },
                "$amount",
                0,
              ],
            },
          },

          totalRewardAmount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$txnCtg", "reward"] },
                    { $eq: ["$txnType", "credit"] },
                  ],
                },
                "$amount",
                0,
              ],
            },
          },
        },
      },
    ]);

    const resultt = stats[0] || { totalBetAmount: 0, totalRewardAmount: 0 };


    // data.SpeedReward += betmoney3.length > 0 ? betmoney3[0].totalPrize2 : 0;

    // Extract the total sum from the result
    data.Total_Played_Bet = bmoney * 2;
    data.Total_Reward_Earned = pmoney;

    data.Total_Played_Bet += data.SpeedBet;
    data.Total_Reward_Earned += data.SpeedReward;

    data.Total_Played_Bet += data.QuickBet;
    data.Total_Reward_Earned += data.QuickReward;

    data.Total_Played_Bet += data.TokenBet;
    data.Total_Reward_Earned += data.TokenReward;

    data.Total_Conflicted_Matches = await ManualMatch.countDocuments({
      conflict: true,
      createdAt: zone,
    });

    data.Total_Withdraws_Given = await Transaction.countDocuments({
      txnCtg: "withdrawal",
      txnType: "debit",
      status: "completed",
      createdAt: zone,
    });

    data.Total_Users = await User.countDocuments({});

    const wd = await Transaction.aggregate([
      {
        $match: {
          txnCtg: "withdrawal",
          txnType: "debit",
          status: "completed",
          createdAt: zone,
        },
      },
      {
        $group: {
          _id: null, // Group all matching documents together
          totalAmount: { $sum: "$amount" }, // Sum the "amount" field
        },
      },
    ]);

    const wamount = wd.length > 0 ? wd[0].totalAmount : 0;
    data.Total_Withdraws_Given = wamount;

    data.Total_Manual_Deposits = await Transaction.countDocuments({
      txnCtg: "deposit",
      txnType: "credit",
      status: "completed",
      isManual: true,
      createdAt: zone,
    });

    const mdd = await Transaction.aggregate([
      {
        $match: {
          txnCtg: "deposit",
          txnType: "credit",
          status: "completed",
          createdAt: zone,
        },
      },
      {
        $group: {
          _id: null, // Group all matching documents together
          totalAmount: { $sum: "$amount" }, // Sum the "amount" field
        },
      },
    ]);

    const mdamount = mdd.length > 0 ? mdd[0].totalAmount : 0;
    data.Total_Deposits = mdamount;

    data.Total_Automatic_Deposits = await Transaction.countDocuments({
      txnCtg: "deposit",
      txnType: "credit",
      status: "completed",
      isManual: false,
      createdAt: zone,
    });

    const b = await Transaction.aggregate([
      {
        $match: {
          txnCtg: "bonus",
          txnType: "credit",
          status: "completed",
          createdAt: zone,
        },
      },
      {
        $group: {
          _id: null, // Group all matching documents together
          totalAmount: { $sum: "$amount" }, // Sum the "amount" field
        },
      },
    ]);

    const bamount = b.length > 0 ? b[0].totalAmount : 0;
    data.Total_Bonus_Given = bamount;

    const r = await Transaction.aggregate([
      {
        $match: {
          txnCtg: "referral",
          txnType: "credit",
          status: "completed",
          createdAt: zone,
        },
      },
      {
        $group: {
          _id: null, // Group all matching documents together
          totalAmount: { $sum: "$amount" }, // Sum the "amount" field
        },
      },
    ]);

    const ramount = r.length > 0 ? r[0].totalAmount : 0;
    data.Total_Referral_Given = ramount;

    data.Total_Admin_Earnings =
      data.Total_Played_Bet -
      data.Total_Reward_Earned -
      data.Total_Referral_Given;

    data.Total_Admin_Earnings = data.Total_Admin_Earnings.toFixed(2);
    const account = await Transaction.aggregate([
      {
        $group: {
          _id: null,
          cashcredit: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$txnType", "credit"] },
                    { $eq: ["$status", "completed"] },
                  ],
                },
                "$cash", // If both conditions are true, return the amount
                0, // Otherwise, return 0
              ],
            },
          },
          cashdebit: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$txnType", "debit"] },
                    { $eq: ["$status", "completed"] },
                  ],
                },
                "$cash", // If both conditions are true, return the amount
                0, // Otherwise, return 0
              ],
            },
          },
          bonuscredit: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$txnType", "credit"] },
                    { $eq: ["$status", "completed"] },
                  ],
                },
                "$bonus", // If both conditions are true, return the amount
                0, // Otherwise, return 0
              ],
            },
          },
          bonusdebit: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$txnType", "debit"] },
                    { $eq: ["$status", "completed"] },
                  ],
                },
                "$bonus", // If both conditions are true, return the amount
                0, // Otherwise, return 0
              ],
            },
          },
          rewardcredit: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$txnType", "credit"] },
                    { $eq: ["$status", "completed"] },
                  ],
                },
                "$reward", // If both conditions are true, return the amount
                0, // Otherwise, return 0
              ],
            },
          },
          rewarddebit: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$txnType", "debit"] },
                    { $ne: ["$status", "cancelled"] },
                  ],
                },
                "$reward", // If both conditions are true, return the amount
                0, // Otherwise, return 0
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          cash: { $subtract: ["$cashcredit", "$cashdebit"] },
          reward: { $subtract: ["$rewardcredit", "$rewarddebit"] },
          bonus: { $subtract: ["$bonuscredit", "$bonusdebit"] },
        },
      },
    ]);

    const money = {
      cash: 0,
      reward: 0,
      bonus: 0,
      balance: 0,
    };
    if (account.length > 0) {
      money.cash = account[0].cash.toFixed(2) || 0;
      money.reward = account[0].reward.toFixed(2) || 0;
      money.bonus = account[0].bonus.toFixed(2) || 0;
      money.cash = Number(money.cash);
      money.reward = Number(money.reward);
      money.bonus = Number(money.bonus);

      money.balance =
        Number(money.cash) + Number(money.reward) + Number(money.bonus);
    }

    const d = await DEVELOPER.findOne({}, "otpCount");

    data.otpCount = 0;

    data.User_Wallet_Balance = money.balance.toFixed(2);
    data.User_Cash_Wallet_Balance = money.cash.toFixed(2);
    data.User_Bonus_Wallet_Balance = money.bonus.toFixed(2);
    data.User_Reward_Wallet_Balance = money.reward.toFixed(2);
    data.Tournament_Data = resultt;


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

export const updateAdmin = async (req, res) => {
  try {
    const name = req.body.name;
    const emailId = req.body.emailId;
    const password = req.body.password;
    const status = req.body.status;
    const access = req.body.access;
    const adminId = req.body._id;

    const config = await _config();
    if (config.DEMO == true) {
      return res.json({
        success: false,
        message: config.DEMO_MSG,
      });
    }

    if (isEmptyOrSpaces(emailId)) {
      return res.json({
        success: false,
        message: "please enter valid email id",
      });
    }

    if (isEmptyOrSpaces(name)) {
      return res.json({
        success: false,
        message: "please enter a valid name",
      });
    }

    if (!isValidEmail(emailId)) {
      return res.json({
        success: false,
        message: "please enter a valid email id",
      });
    }

    const upadmin = {};

    upadmin.name = name;
    upadmin.emailId = emailId;

    if (!isEmptyOrSpaces(password)) {
      upadmin.password = await encryptPassword(password);
    }

    upadmin.updatedAt = Date.now();

    if (adminId && status) {
      upadmin.status = status;
      upadmin.access = access;
    }

    await Admin.updateOne({ _id: req.body._id }, { $set: upadmin });
    await _log({
      message:
        req.admin.emailId +
        " updated admin " +
        upadmin.name +
        " (" +
        upadmin.emailId +
        ")",
    });
    const na = await Admin.findOne({ _id: req.body._id });
    return res.json({
      success: true,
      message: "admin updated",
      data: na,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export const deleteAdmin = async (req, res) => {
  try {
    const config = await _config();
    if (config.DEMO == true) {
      return res.json({
        success: false,
        message: config.DEMO_MSG,
      });
    }

    const admin = await Admin.findOne({ _id: req.body._id });

    await Admin.deleteOne({ _id: req.body._id });
    await _log({
      message:
        req.admin.emailId +
        " deleted admin " +
        admin.emailId +
        " (" +
        admin.emailId +
        ")",
    });
    return res.json({
      success: true,
      message: "admin removed",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export const cleanOtp = async () => {
  const fiveHoursAgo = new Date(Date.now() - 30 * 60 * 1000);
  const result = await OTP.deleteMany({ createdAt: { $lt: fiveHoursAgo } });
};

export const cleanPayemnts = async () => {
  const fiveHoursAgo = new Date(Date.now() - 20 * 60 * 1000);
  const fix = {};
  fix.reason = "automatically cancelled because of no payment";
  const result = await Transaction.updateMany(
    {
      txnCtg: "deposit",
      txnType: "credit",
      status: "pending",
      isManual: false,
      createdAt: { $lt: fiveHoursAgo },
    },
    {
      $set: {
        status: "cancelled",
        txnData: JSON.stringify(fix),
      },
    }
  );
};

export const addNewAdmin = async (req, res) => {
  try {
    const name = req.body.name;
    const emailId = req.body.emailId;
    const password = req.body.password;
    const status = req.body.status;
    const access = req.body.access || [];

    const config = await _config();
    if (config.DEMO == true) {
      return res.json({
        success: false,
        message: config.DEMO_MSG,
      });
    }

    if (isEmptyOrSpaces(emailId)) {
      return res.json({
        success: false,
        message: "please enter valid email id",
      });
    }

    if (isEmptyOrSpaces(name)) {
      return res.json({
        success: false,
        message: "please enter a valid name",
      });
    }

    if (!isValidEmail(emailId)) {
      return res.json({
        success: false,
        message: "please enter a valid email id",
      });
    }

    const checkadmin = await Admin.findOne({ emailId: emailId });

    if (checkadmin) {
      return res.json({
        success: false,
        message: "a admin is already available with this email",
      });
    }

    const newadmin = {};

    newadmin.name = name;
    newadmin.status = status;

    newadmin.emailId = emailId;

    if (isEmptyOrSpaces(password)) {
      return res.json({
        success: false,
        message: "please enter a valid password",
      });
    }

    newadmin.password = await encryptPassword(password);

    newadmin.createdAt = Date.now();
    newadmin.access = access;

    await Admin.create(newadmin);
    await _log({
      message:
        req.admin.emailId +
        " created new admin " +
        newadmin.name +
        " (" +
        newadmin.emailId +
        ")",
    });
    return res.json({
      success: true,
      message: "new admin created",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};
