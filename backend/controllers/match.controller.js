import { response } from "express";
import { Game } from "../models/game.model.js";
import { ManualMatch } from "../models/manualmatch.model.js";
import { Transaction } from "../models/transaction.models.js";
import User from "../models/user.model.js";
import { validAmount } from "./payment.controller.js";
import { balance, newTxnId, ubalance } from "./user.controller.js";
import axios from "axios";
import fs from "fs";
import multer from "multer";
import sharp from "sharp";
import mime from "mime-types";
import path from "path";
import { uploadDir } from "../index.js";
import { _config } from "./config.controller.js";
// import { setTimeout } from "timers";
import { _log } from "./admin/account.controller.js";
import Commission from "../models/commission.model.js";
import { OnlineGame } from "../models/onlinegame.js";
import { OnlineGame2 } from "../models/onlinegame2.js";
import { match } from "assert";
import { SpeedLudo } from "../models/speedludo.js";
import { RandomNumber } from "../../frontend/src/game/twoplayer/actions/RandomNumber.js";
import FakeMatch from "../models/fakematch.model.js";
import FakeSpeed from "../models/fakespeed.model.js";
import FakeOnline from "../models/fakeonline.model.js";
import FakeOnline2 from "../models/fakeonline2.model.js";
import { QuickLudo } from "../models/quickludo.js";
import FakeQuick from "../models/fakequick.model.js";

// ====== NEW: Track timeouts for unjoined matches ======
const pendingMatchTimeouts = new Map(); // matchId → timeoutId

export const getPrize = async (amount, type = null) => {
  const config = await _config();
  const commission = await Commission.findOne({
    type: type,
    minAmount: { $lte: amount },
    maxAmount: { $gte: amount },
  });
  if (commission) {
    let com = Number(amount) + Number(amount) * commission.commission;
    return com.toFixed(2);
  } else {
    let com = Number(amount) + Number(amount) * config.WINNING_PERCENTAGE;
    return com.toFixed(2);
  }
};

export async function checkTransaction(userId, matchId) {
  try {
    const userObjectId = userId;
    const matchObjectId = matchId;
    const txnExists = await Transaction.exists({
      txnCtg: "bet",
      txnType: "debit",
      status: "completed",
      matchId: matchObjectId,
      userId: userObjectId,
    });
    return !!txnExists;
  } catch (err) {
    console.error("Error checking transaction:", err);
    return false;
  }
}

async function createBetTransaction(userId, game) {
  const newTxn = {
    txnId: await newTxnId(),
    userId,
    amount: game.entryFee,
    cash: 0,
    reward: game.entryFee,
    bonus: 0,
    remark: "Match Joined",
    status: "completed",
    txnType: "debit",
    txnCtg: "bet",
    matchId: game._id,
  };
  await _log({
    matchId: game._id,
    message: "Bot1427 : created bet transaction, with txnid : " + newTxn.txnId,
  });
  return Transaction.create(newTxn);
}

export async function bot1427() {
  const report = {
    totalMatches: 0,
    processed: 0,
    newTransactions: 0,
    errors: [],
  };
  try {
    const pipeline = [
      {
        $match: {
          matchId: { $ne: null },
          txnCtg: "bet",
          txnType: "debit",
        },
      },
      {
        $group: {
          _id: "$matchId",
          transactions: { $push: "$$ROOT" },
          count: { $sum: 1 },
        },
      },
      {
        $match: { count: { $lt: 2 } },
      },
    ];
    const data = await Transaction.aggregate(pipeline);
    report.totalMatches = data.length;
    for (const item of data) {
      const matchId = item._id;
      let game =
        (await OnlineGame.findById(matchId).lean()) ||
        (await SpeedLudo.findById(matchId).lean()) ||
        (await QuickLudo.findById(matchId).lean());
      if (game && game.status === "completed") {
        report.processed++;
        if (!(await checkTransaction(game.blue.userId, game._id))) {
          await createBetTransaction(game.blue.userId, game);
          report.newTransactions++;
        }
        if (!(await checkTransaction(game.green.userId, game._id))) {
          await createBetTransaction(game.green.userId, game);
          report.newTransactions++;
        }
      }
    }
  } catch (err) {
    console.error("Error in bot1427:", err);
    report.errors.push(err.message);
  }
  return report;
}

export const createMatch = async (req, res) => {
  try {
    const userBalance = await balance(req);
    const amount = req.body.amount;
    const isAMR = await isAnyMatchRunning(req);
    if (isAMR) {
      return res.json({
        success: false,
        message: "already_in_match",
      });
    }
    if (!validAmount(amount)) {
      return res.json({
        success: false,
        message: "invalid_amount_msg",
      });
    }
    if (amount > userBalance.balance) {
      return res.json({
        success: false,
        message: "less_balance_msg",
      });
    }
    const openmatch = await ManualMatch.find({
      status: "open",
      "host.userId": req.user._id,
    });
    if (openmatch.length >= 2) {
      return res.json({
        success: false,
        message: "max_game_create",
      });
    }
    const game = await Game.findOne({ game: req.body.game });
    if (!game) {
      return res.json({
        success: false,
        message: "game_not_found",
      });
    }
    if (game.status != "live") {
      return res.json({
        success: false,
        message: "not_active_game",
      });
    }
    if (amount % game.multipleOf != 0) {
      return res.json({
        success: false,
        message: "gie",
        game: game,
      });
    }
    if (amount > game.maxAmount) {
      return res.json({
        success: false,
        message: "gie",
        game: game,
      });
    }
    if (amount < game.minAmount) {
      return res.json({
        success: false,
        message: "gie",
        game: game,
      });
    }

    const newMatch = {
      game: game._id,
      matchId: await newMatchId(),
      host: {
        fullName: req.user.fullName,
        profilePic: req.user.profilePic,
        userId: req.user._id,
      },
      entryFee: amount,
      prize: await getPrize(amount),
    };

    const m = await ManualMatch.create(newMatch);

    // ====== AUTO-CANCEL IF NO JOINER IN 3 MINUTES ======
    const timeoutId = setTimeout(async () => {
      try {
        const stillOpen = await ManualMatch.findById(m._id);
        if (stillOpen && stillOpen.status === "open") {
          await ManualMatch.deleteOne({ _id: m._id });
          await _log({
            matchId: m._id,
            message: `Match auto-cancelled after 3 minutes (no joiner). Created by ${req.user.fullName} (${req.user.mobileNumber})`,
          });
        }
      } catch (err) {
        console.error("Auto-cancel match error:", err);
      } finally {
        pendingMatchTimeouts.delete(m._id.toString());
      }
    }, 2 * 60 * 1000); // 2 minutes

    pendingMatchTimeouts.set(m._id.toString(), timeoutId);
    // ===================================================

    await _log({
      matchId: m._id,
      message: req.user.fullName + "(" + req.user.mobileNumber + ") created match",
    });

    return res.json({
      success: true,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export const fetchMatchHistory = async (req, res) => {
  try {
    const limit = 15;
    const skip = (req.body.page - 1) * limit;
    let cond = {};
    let cond2 = {};
    let cond3 = {};
    let cond4 = {};

    if (req.body.ctg == "ALL") {
      cond = {
        $and: [
          { status: { $ne: "open" } }, // Exclude the current matchId
          {
            $or: [
              { "host.userId": req.user._id }, // Condition 1: Host userId matches
              { "joiner.userId": req.user._id },
              // Condition 2: Joiner userId matches
            ],
          },
        ],
      };

      cond2 = {
        $and: [
          { status: { $ne: "waiting" } }, // Exclude the current matchId
          {
            $or: [
              { "blue.userId": req.user._id }, // Condition 1: Host userId matches
              { "green.userId": req.user._id },
              // Condition 2: Joiner userId matches
            ],
          },
        ],
      };

      cond3 = {
        $and: [
          { status: { $ne: "waiting" } }, // Exclude the current matchId
          {
            $or: [
              { "blue.userId": req.user._id }, // Condition 1: Host userId matches
              { "green.userId": req.user._id },

              // Condition 2: Joiner userId matches
            ],
          },
        ],
      };

      cond4 = {
        $and: [
          { status: { $ne: "waiting" } }, // Exclude the current matchId
          {
            $or: [
              { "blue.userId": req.user._id }, // Condition 1: Host userId matches
              { "green.userId": req.user._id },

              // Condition 2: Joiner userId matches
            ],
          },
        ],
      };
    } else if (req.body.ctg == "WON") {
      cond = {
        $and: [
          { status: { $ne: "open" }, "winner.userId": req.userId }, // Exclude the current matchId
          {
            $or: [
              { "host.userId": req.user._id }, // Condition 1: Host userId matches
              { "joiner.userId": req.user._id },
              // Condition 2: Joiner userId matches
            ],
          },
        ],
      };

      cond2 = {
        $and: [
          { status: { $ne: "waiting" } }, // Exclude the current matchId
          {
            $or: [
              { "blue.userId": req.user._id, "blue.result": "winner" }, // Condition 1: Host userId matches
              { "green.userId": req.user._id, "green.result": "winner" },
              // Condition 2: Joiner userId matches
            ],
          },
        ],
      };

      cond3 = {
        $and: [
          { status: { $ne: "waiting" } }, // Exclude the current matchId
          {
            $or: [
              { "blue.userId": req.user._id, "blue.result": "winner" }, // Condition 1: Host userId matches

              { "green.userId": req.user._id, "green.result": "winner" },

              // Condition 2: Joiner userId matches
            ],
          },
        ],
      };
    } else if (req.body.ctg == "LOST") {
      cond = {
        $and: [
          { status: { $ne: "open" }, "looser.userId": req.userId }, // Exclude the current matchId
          {
            $or: [
              { "host.userId": req.user._id }, // Condition 1: Host userId matches
              { "joiner.userId": req.user._id },
              // Condition 2: Joiner userId matches
            ],
          },
        ],
      };

      cond2 = {
        $and: [
          { status: { $ne: "waiting" } }, // Exclude the current matchId
          {
            $or: [
              { "blue.userId": req.user._id, "blue.result": "looser" }, // Condition 1: Host userId matches
              { "green.userId": req.user._id, "green.result": "looser" },
              // Condition 2: Joiner userId matches
            ],
          },
        ],
      };

      cond3 = {
        $and: [
          { status: { $ne: "waiting" } }, // Exclude the current matchId
          {
            $or: [
              { "blue.userId": req.user._id, "blue.result": "looser" }, // Condition 1: Host userId matches

              { "green.userId": req.user._id, "green.result": "looser" },

              // Condition 2: Joiner userId matches
            ],
          },
        ],
      };
    } else if (req.body.ctg == "CANCELLED") {
      cond = {
        $and: [
          { status: "cancelled" }, // Exclude the current matchId
          {
            $or: [
              { "host.userId": req.user._id }, // Condition 1: Host userId matches
              { "joiner.userId": req.user._id },
              // Condition 2: Joiner userId matches
            ],
          },
        ],
      };

      cond2 = {
        $and: [
          { status: "cancelled" }, // Exclude the current matchId
          {
            $or: [
              { "blue.userId": req.user._id }, // Condition 1: Host userId matches
              { "green.userId": req.user._id },
              // Condition 2: Joiner userId matches
            ],
          },
        ],
      };

      cond3 = {
        $and: [
          { status: "cancelled" }, // Exclude the current matchId
          {
            $or: [
              { "blue.userId": req.user._id }, // Condition 1: Host userId matches

              { "green.userId": req.user._id },

              // Condition 2: Joiner userId matches
            ],
          },
        ],
      };
    }

    let matches = await ManualMatch.find(cond)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    let matches2 = await OnlineGame.find(cond2)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    let matches3 = await SpeedLudo.find(cond3)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    let matches4 = await QuickLudo.find(cond4)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    matches = await Promise.all(
      matches.map(async (match) => {
        match.hostData = await User.findOne({ _id: match.host.userId });
        match.joinerData = await User.findOne({ _id: match.joiner.userId });
        match.currentUserId = req.user._id;

        return match;
      })
    );

    matches2 = await Promise.all(
      matches2.map(async (match) => {
        match.hostData = await User.findOne({ _id: match.blue.userId });
        match.joinerData = await User.findOne({ _id: match.green.userId });
        match.currentUserId = req.user._id;
        return match;
      })
    );

    matches3 = await Promise.all(
      matches3.map(async (match) => {
        match.hostData = await User.findOne({ _id: match.blue.userId });
        match.joinerData = await User.findOne({ _id: match.green.userId });
        match.currentUserId = req.user._id;
        return match;
      })
    );

    matches4 = await Promise.all(
      matches4.map(async (match) => {
        match.hostData = await User.findOne({ _id: match.blue.userId });
        match.joinerData = await User.findOne({ _id: match.green.userId });
        match.currentUserId = req.user._id;
        return match;
      })
    );

    const mergedData = [...matches, ...matches2, ...matches3, ...matches4];
    mergedData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const money = await balance(req);
    return res.json({
      success: true,
      matches: mergedData,
    });
  } catch (error) {
    ////console.log("createMatch", error);
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export const fakeMatches = [];

export const getFakeRunningMatches = async () => {
  const matches = [];
  const speedmatches = [];
  const quickmatches = [];

  const onlinematches = [];
  const onlinematches2 = [];

  const getRandomNumber = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;
  const getRandomBoolean = () => Math.random() < 0.5;
  const getRandomEntryFee = () => getRandomNumber(2, 500) * 50;

  const firstNames = [
    "Mahesh",
    "Suresh",
    "Ramesh",
    "Dinesh",
    "Rajveer",
    "Veer",
    "Amit",
    "Rohit",
    "Jitender",
    "Sandeep",
    "Pradeep",
    "Vikram",
    "Harish",
    "Surender",
    "Devender",
    "Bhim",
    "Yashpal",
    "Kuldeep",
    "Narender",
    "Ravinder",
    "Jaideep",
    "Bharat",
    "Manish",
    "Anil",
    "Satish",
    "Vinod",
    "Omprakash",
    "Shivraj",
    "Brijesh",
    "Joginder",
  ];

  const surnames = [
    "Singh",
    "Shekhawat",
    "Chaudhary",
    "Yadav",
    "Jangid",
    "Dahiya",
    "Sehrawat",
    "Dhillon",
    "Tanwar",
    "Bishnoi",
    "Sohal",
    "Jakhar",
    "Godara",
    "Punia",
    "Rathore",
    "Sarang",
    "Hooda",
    "Kundu",
    "Sindhu",
    "Beniwal",
  ];

  const getRandomName = () => {
    const firstName = firstNames[getRandomNumber(0, firstNames.length - 1)];
    return getRandomBoolean()
      ? `${firstName} ${surnames[getRandomNumber(0, surnames.length - 1)]}`
      : firstName;
  };

  const getRandomAvatar = () => `avatar${getRandomNumber(1, 20)}.png`;

  for (let i = 0; i < getRandomNumber(10, 15); i++) {
    let amount = getRandomEntryFee();
    const match = {
      entryFee: amount,
      prize: await getPrize(amount),
      hostData: {
        profilePic: getRandomAvatar(),
        fullName: getRandomName(),
        kyc: getRandomBoolean(),
      },
      joinerData: {
        profilePic: getRandomAvatar(),
        fullName: getRandomName(),
        kyc: getRandomBoolean(),
      },
    };

    matches.push(match);
  }

  const onlineClassic = await Game.findOne({
    game: "classicOnline",
  }).lean();

  const onlineClassic2 = await Game.findOne({
    game: "classic1Token",
  }).lean();

  const speedLudo = await Game.findOne({
    game: "speedOnline",
  }).lean();
  const quickLudo = await Game.findOne({
    game: "quickOnline",
  }).lean();

  onlineClassic.amounts.split(",").map(async (amount) => {
    const m = {
      entryFee: amount,
      playing: getRandomNumber(1, 8),
    };
    onlinematches.push(m);
  });

  onlineClassic2.amounts.split(",").map(async (amount) => {
    const m = {
      entryFee: amount,
      playing: getRandomNumber(1, 8),
    };
    onlinematches2.push(m);
  });

  speedLudo.amounts.split(",").map(async (amount) => {
    const m = {
      entryFee: amount,
      playing: getRandomNumber(1, 8),
    };
    speedmatches.push(m);
  });

  quickLudo.amounts.split(",").map(async (amount) => {
    const m = {
      entryFee: amount,
      playing: getRandomNumber(1, 8),
    };
    quickmatches.push(m);
  });

  await FakeMatch.deleteMany({});
  await FakeOnline.deleteMany({});
  await FakeOnline2.deleteMany({});
  await FakeSpeed.deleteMany({});
  await FakeQuick.deleteMany({});

  await FakeMatch.insertMany(matches);
  await FakeOnline.insertMany(onlinematches);
  await FakeOnline2.insertMany(onlinematches2);
  await FakeSpeed.insertMany(speedmatches);
  await FakeQuick.insertMany(quickmatches);
};

export const fetchMatchData = async (req, res) => {
  try {
    const matches = {};

    matches.pmatch = await ManualMatch.findOne({
      $and: [
        { status: "running" }, // Exclude the current matchId
        {
          $or: [
            { "host.userId": req.user._id }, // Condition 1: Host userId matches
            { "joiner.userId": req.user._id },
            // Condition 2: Joiner userId matches
          ],
        },
      ],
    })
      .sort({ createdAt: -1 })
      .lean();

    if (matches.pmatch) {
      matches.pmatch.hostData = await User.findOne({
        _id: matches.pmatch.host.userId,
      });
      matches.pmatch.joinerData = await User.findOne({
        _id: matches.pmatch.joiner.userId,
      });
    }

    // matches.pmatch = await ManualMatch.find({
    //   "host.userId": req.userId,
    //   status: "open",
    // }).sort({ createdAt: -1 });

    matches.cmatch = await ManualMatch.find({
      "host.userId": req.userId,
      status: "open",
    })
      .sort({ createdAt: -1 })
      .lean();

    matches.omatch = await ManualMatch.find({
      status: "open",
      "host.userId": { $ne: req.userId },
    })
      .sort({ createdAt: -1 })
      .lean();

    matches.rmatch = await ManualMatch.find({
      status: "running",
    })
      .sort({ createdAt: -1 })
      .lean();

    matches.cmatch = await Promise.all(
      matches.cmatch.map(async (match) => {
        match.hostData = await User.findOne({ _id: match.host.userId });
        match.joinerData = await User.findOne({ _id: match.joiner.userId });
        return match;
      })
    );

    matches.omatch = await Promise.all(
      matches.omatch.map(async (match) => {
        match.hostData = await User.findOne({ _id: match.host.userId });
        match.joinerData = await User.findOne({ _id: match.joiner.userId });

        if (match.joinerReqs) {
          const userExists = match.joinerReqs.some(
            (requ) => requ.userId.toString() === req.user._id.toString()
          );
          if (userExists) {
            match.requested = true;
          } else {
            match.requested = false;
          }
        }

        return match;
      })
    );

    matches.rmatch = await Promise.all(
      matches.rmatch.map(async (match) => {
        match.hostData = await User.findOne({ _id: match.host.userId });
        match.joinerData = await User.findOne({ _id: match.joiner.userId });
        return match;
      })
    );

    matches.fmatch = await FakeMatch.find();
    const money = await balance(req);
    return res.json({
      success: true,
      matches: matches,
      balance: money,
    });
  } catch (error) {
    ////console.log("createMatch", error);
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export const fetchClassicOnline = async (req, res) => {
  try {
    const matches = {};

    matches.pmatch = await OnlineGame.findOne({
      $and: [
        { status: "running" }, // Exclude the current matchId
        {
          $or: [
            { "blue.userId": req.user._id }, // Condition 1: Host userId matches
            { "green.userId": req.user._id },
            // Condition 2: Joiner userId matches
          ],
        },
      ],
    })
      .sort({ createdAt: -1 })
      .lean();

    if (matches.pmatch) {
      matches.pmatch.blue.user = await User.findOne({
        _id: matches.pmatch.blue.userId,
      });
      matches.pmatch.green.user = await User.findOne({
        _id: matches.pmatch.green.userId,
      });
    }

    const onlineClassic = await Game.findOne({
      game: "classicOnline",
    }).lean();

    matches.omatch = await Promise.all(
      onlineClassic.amounts.split(",").map(async (amount) => {
        const wu = await OnlineGame.findOne({
          status: "waiting",
          entryFee: amount,
          "blue.userId": req.userId,
        });
        let realplaying = await OnlineGame.countDocuments({
          status: "running",
          entryFee: amount,
        });

        let fakeplaying = await FakeOnline.findOne({
          entryFee: amount,
        });
        return {
          key: amount,
          amount: Number(amount),
          waiting: await OnlineGame.countDocuments({
            status: "waiting",
            entryFee: amount,
          }),
          playing: Number(fakeplaying.playing) + Number(realplaying),
          isMeWaiting: wu ? true : false,
          prize: await getPrize(Number(amount), "online"),
        };
      })
    );

    const money = await balance(req);
    return res.json({
      success: true,
      matches: matches,
      balance: money,
    });
  } catch (error) {
    ////console.log("createMatch", error);
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export const fetchClassicOnline2 = async (req, res) => {
  try {
    const matches = {};

    matches.pmatch = await OnlineGame2.findOne({
      $and: [
        { status: "running" }, // Exclude the current matchId
        {
          $or: [
            { "blue.userId": req.user._id }, // Condition 1: Host userId matches
            { "green.userId": req.user._id },
            // Condition 2: Joiner userId matches
          ],
        },
      ],
    })
      .sort({ createdAt: -1 })
      .lean();

    if (matches.pmatch) {
      matches.pmatch.blue.user = await User.findOne({
        _id: matches.pmatch.blue.userId,
      });
      matches.pmatch.green.user = await User.findOne({
        _id: matches.pmatch.green.userId,
      });
    }

    const onlineClassic = await Game.findOne({
      game: "classic1Token",
    }).lean();

    matches.omatch = await Promise.all(
      onlineClassic.amounts.split(",").map(async (amount) => {
        const wu = await OnlineGame2.findOne({
          status: "waiting",
          entryFee: amount,
          "blue.userId": req.userId,
        });
        let realplaying = await OnlineGame2.countDocuments({
          status: "running",
          entryFee: amount,
        });

        let fakeplaying = await FakeOnline2.findOne({
          entryFee: amount,
        });
        return {
          key: amount,
          amount: Number(amount),
          waiting: await OnlineGame2.countDocuments({
            status: "waiting",
            entryFee: amount,
          }),
          playing: Number(fakeplaying.playing) + Number(realplaying),
          isMeWaiting: wu ? true : false,
          prize: await getPrize(Number(amount), "online"),
        };
      })
    );

    const money = await balance(req);
    return res.json({
      success: true,
      matches: matches,
      balance: money,
    });
  } catch (error) {
    ////console.log("createMatch", error);
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};
export const fetchSpeedLudo = async (req, res) => {
  try {
    const { lite = false } = req.body;
    const matches = {};
    const onlineClassic = await Game.findOne({
      game: "speedOnline",
    }).lean();

    let duration = onlineClassic.duration;
    if (lite) duration = onlineClassic.durationLite;

    matches.pmatch = await SpeedLudo.findOne({
      $and: [
        { status: "running", duration: duration }, // Exclude the current matchId

        {
          $or: [
            { "blue.userId": req.user._id }, // Condition 1: Host userId matches
            { "green.userId": req.user._id },
            // Condition 2: Joiner userId matches
          ],
        },
      ],
    })
      .sort({ createdAt: -1 })
      .lean();

    if (matches.pmatch) {
      matches.pmatch.blue.user = await User.findOne({
        _id: matches.pmatch.blue.userId,
      });
      matches.pmatch.green.user = await User.findOne({
        _id: matches.pmatch.green.userId,
      });
    }

    matches.omatch = await Promise.all(
      onlineClassic.amounts.split(",").map(async (amount) => {
        const wu = await SpeedLudo.findOne({
          status: "waiting",
          duration: duration,
          entryFee: amount,
          "blue.userId": req.userId,
        });

        let realplaying = await SpeedLudo.countDocuments({
          status: "running",
          duration: duration,
          entryFee: amount,
        });

        let fakeplaying = await FakeSpeed.findOne({
          entryFee: amount,
        });

        return {
          key: amount,
          amount: Number(amount),
          waiting: await SpeedLudo.countDocuments({
            status: "waiting",
            entryFee: amount,
            duration: duration,
          }),
          playing: Number(fakeplaying.playing) + Number(realplaying),
          isMeWaiting: wu ? true : false,
          prize: await getPrize(Number(amount), "speed"),
        };
      })
    );

    const money = await balance(req);
    return res.json({
      success: true,
      matches: matches,
      balance: money,
    });
  } catch (error) {
    ////console.log("createMatch", error);
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export const fetchQuickLudo = async (req, res) => {
  try {
    const matches = {};

    matches.pmatch = await QuickLudo.findOne({
      $and: [
        { status: "running" }, // Exclude the current matchId
        {
          $or: [
            { "blue.userId": req.user._id }, // Condition 1: Host userId matches
            { "green.userId": req.user._id },
            // Condition 2: Joiner userId matches
          ],
        },
      ],
    })
      .sort({ createdAt: -1 })
      .lean();

    if (matches.pmatch) {
      matches.pmatch.blue.user = await User.findOne({
        _id: matches.pmatch.blue.userId,
      });
      matches.pmatch.green.user = await User.findOne({
        _id: matches.pmatch.green.userId,
      });
    }

    const onlineClassic = await Game.findOne({
      game: "quickOnline",
    }).lean();

    matches.omatch = await Promise.all(
      onlineClassic.amounts.split(",").map(async (amount) => {
        const wu = await QuickLudo.findOne({
          status: "waiting",
          entryFee: amount,
          "blue.userId": req.userId,
        });

        let realplaying = await QuickLudo.countDocuments({
          status: "running",
          entryFee: amount,
        });

        let fakeplaying = await FakeQuick.findOne({
          entryFee: amount,
        });

        return {
          key: amount,
          amount: Number(amount),
          waiting: await QuickLudo.countDocuments({
            status: "waiting",
            entryFee: amount,
          }),
          playing: Number(fakeplaying.playing) + Number(realplaying),
          isMeWaiting: wu ? true : false,
          prize: await getPrize(Number(amount), "quick"),
        };
      })
    );

    const money = await balance(req);
    return res.json({
      success: true,
      matches: matches,
      balance: money,
    });
  } catch (error) {
    ////console.log("createMatch", error);
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export const newMatchId = async () => {
  try {
    const lastid = await ManualMatch.aggregate([
      {
        $match: { matchId: { $regex: /^MATCH\d+$/ } },
      },
      {
        $addFields: {
          numericPart: { $toInt: { $substr: ["$matchId", 5, -1] } },
        },
      },
      { $sort: { numericPart: -1 } },
      { $limit: 1 },
    ]);

    let nextNumber = 1427;
    if (lastid.length > 0) {
      nextNumber = lastid[0].numericPart + 1;
    }

    return "MATCH" + nextNumber;
  } catch (error) {
    console.error("Error generating match ID:", error);
  }
};
export const newOnlineMatchId = async () => {
  try {
    const lastMatch = await OnlineGame.aggregate([
      {
        $match: { matchId: { $regex: /^CLASSIC\d+$/ } },
      },
      {
        $addFields: {
          numericPart: {
            $toInt: {
              $substrCP: ["$matchId", 7, { $strLenCP: "$matchId" }],
            },
          },
        },
      },
      { $sort: { numericPart: -1 } },
      { $limit: 1 },
    ]);

    let nextNumber = 10427;
    if (lastMatch.length > 0) {
      nextNumber = lastMatch[0].numericPart + 1;
    }

    return `CLASSIC${nextNumber}`;
  } catch (error) {
    console.error("Error generating match ID:", error);
    throw error;
  }
};

export const newSpeedMatchId = async () => {
  try {
    const lastMatch = await SpeedLudo.aggregate([
      {
        $match: { matchId: { $regex: /^SPEED\d+$/ } },
      },
      {
        $addFields: {
          numericPart: {
            $toInt: {
              $substrCP: ["$matchId", 5, { $strLenCP: "$matchId" }],
            },
          },
        },
      },
      { $sort: { numericPart: -1 } },
      { $limit: 1 },
    ]);

    let nextNumber = 19427;
    if (lastMatch.length > 0) {
      nextNumber = lastMatch[0].numericPart + 1;
    }

    return `SPEED${nextNumber}`;
  } catch (error) {
    console.error("Error generating match ID:", error);
    throw error;
  }
};

export const newQuickMatchId = async () => {
  try {
    const lastMatch = await QuickLudo.aggregate([
      {
        $match: { matchId: { $regex: /^QUICK\d+$/ } },
      },
      {
        $addFields: {
          numericPart: {
            $toInt: {
              $substrCP: ["$matchId", 5, { $strLenCP: "$matchId" }],
            },
          },
        },
      },
      { $sort: { numericPart: -1 } },
      { $limit: 1 },
    ]);

    let nextNumber = 19427;
    if (lastMatch.length > 0) {
      nextNumber = lastMatch[0].numericPart + 1;
    }

    return `QUICK${nextNumber}`;
  } catch (error) {
    console.error("Error generating match ID:", error);
    throw error;
  }
};

export const newRoomCode = async () => {
  try {
    const lastRoom = await OnlineGame.findOne({
      roomCode: { $regex: /^0\d{8}$/ }, // exactly 9 digits with leading 0
    })
      .sort({ roomCode: -1 })
      .exec();

    let nextNumber = 14271427; // default starting number

    if (lastRoom && lastRoom.roomCode) {
      const match = lastRoom.roomCode.match(/^0(\d{8})$/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    // Pad to 8 digits after the leading 0
    const roomCode = `0${String(nextNumber).padStart(8, "0")}`;
    return roomCode;
  } catch (error) {
    console.error("Error generating new room code:", error);
    return null;
  }
};

export const newSpeedRoomCode = async () => {
  try {
    const lastRoom = await SpeedLudo.findOne({
      roomCode: { $regex: /^0\d{8}$/ }, // exactly 9 digits, leading 0
    })
      .sort({ roomCode: -1 })
      .exec();

    let nextNumber = 10256258; // default starting number

    if (lastRoom && lastRoom.roomCode) {
      const match = lastRoom.roomCode.match(/^0(\d{8})$/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    // Pad to 8 digits after the leading 0
    const roomCode = `0${String(nextNumber).padStart(8, "0")}`;
    return roomCode;
  } catch (error) {
    console.error("Error generating new speed room code:", error);
    return null;
  }
};

export const newQuickRoomCode = async () => {
  try {
    const lastRoom = await QuickLudo.findOne({
      roomCode: { $regex: /^0\d{8}$/ }, // exactly 9 digits with leading 0
    })
      .sort({ roomCode: -1 })
      .exec();

    let nextNumber = 29256258; // default starting number

    if (lastRoom && lastRoom.roomCode) {
      const match = lastRoom.roomCode.match(/^0(\d{8})$/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    // Ensure the code is always 9 digits
    const roomCode = `0${String(nextNumber).padStart(8, "0")}`;
    return roomCode;
  } catch (error) {
    console.error("Error generating new quick room code:", error);
    return null;
  }
};
export const cancelMatchAndRefund = async (matchId) => {
  const match = await ManualMatch.findOne({ _id: matchId });
  if (!match) return;
  if (match.status != "running") return;
  if (match.roomCode != null) return;
  const fiveMinutesAgo = new Date(Date.now() - 3 * 60 * 1000);
  const matchCheck = await ManualMatch.updateOne(
    {
      "joiner.joinAt": { $lte: fiveMinutesAgo },
      _id: match._id,
      status: "running",
      roomCode: null,
    }, // Filter by user ID
    {
      $set: {
        status: "cancelled",
        updatedAt: new Date(),
      },
    } // Update the fullName field
  );

  if (matchCheck.modifiedCount > 0) {
    const hostTxn = await Transaction.findOne({
      txnId: match.host.txnId,
    });
    const joinerTxn = await Transaction.findOne({
      txnId: match.joiner.txnId,
    });

    const htxnid = await newTxnId();
    const hostNewTxn = {
      txnId: htxnid,
      userId: match.host.userId,
      amount: hostTxn.amount,
      cash: hostTxn.cash,
      reward: hostTxn.reward,
      bonus: hostTxn.bonus,
      remark: "Match Cancelled / No Room Code",
      status: "completed",
      txnType: "credit",
      txnCtg: "bet",
      matchId: match._id,
    };

    const h = new Transaction(hostNewTxn);
    await h.save();

    const jtxnid = await newTxnId();

    const joinerNewTxn = {
      txnId: jtxnid,
      userId: match.joiner.userId,
      amount: joinerTxn.amount,
      cash: joinerTxn.cash,
      reward: joinerTxn.reward,
      bonus: joinerTxn.bonus,
      remark: "Match Cancelled / No Room Code",
      status: "completed",
      txnType: "credit",
      txnCtg: "bet",
      matchId: match._id,
    };
    const j = new Transaction(joinerNewTxn);
    await j.save();
    await _log({
      matchId: match._id,
      message:
        "no room code provided in 3 minutes after another player joins, so match is auto cancelled and ₹" +
        match.entryFee +
        " is refunded to both players wallet",
    });
  }
};

export const cancelMatchAndRefund2 = async (match) => {
  const hostTxn = await Transaction.findOne({
    txnId: match.host.txnId,
  });
  const joinerTxn = await Transaction.findOne({
    txnId: match.joiner.txnId,
  });

  const htxnid = await newTxnId();
  const hostNewTxn = {
    txnId: htxnid,
    userId: match.host.userId,
    amount: hostTxn.amount,
    cash: hostTxn.cash,
    reward: hostTxn.reward,
    bonus: hostTxn.bonus,
    remark: "Match Cancelled / Requested",
    status: "completed",
    txnType: "credit",
    txnCtg: "bet",
    matchId: match._id,
  };

  const h = await Transaction.create(hostNewTxn);
  if (h) {
    const jtxnid = await newTxnId();

    const joinerNewTxn = {
      txnId: jtxnid,
      userId: match.joiner.userId,
      amount: joinerTxn.amount,
      cash: joinerTxn.cash,
      reward: joinerTxn.reward,
      bonus: joinerTxn.bonus,
      remark: "Match Cancelled / Requested",
      status: "completed",
      txnType: "credit",
      txnCtg: "bet",
      matchId: match._id,
    };
    const j = await Transaction.create(joinerNewTxn);
  }
};

export const fetchMatch = async (req, res) => {
  try {
    const match = await ManualMatch.findOne({
      $and: [
        { status: "running" }, // Exclude the current matchId
        {
          $or: [
            { "host.userId": req.user._id }, // Condition 1: Host userId matches
            { "joiner.userId": req.user._id },
            // Condition 2: Joiner userId matches
          ],
        },
      ],
    })
      .sort({ createdAt: -1 })
      .lean();

    match.hostData = await User.findOne({ _id: match.host.userId });
    match.joinerData = await User.findOne({ _id: match.joiner.userId });

    let userType = null;
    if (match) {
      if (req.userId == match.host.userId) {
        userType = "host";
      } else {
        userType = "joiner";
      }
    }

    return res.json({
      success: true,
      match: match,
      userType: userType,
    });
  } catch (error) {
    ////console.log("fetchmatch", error);
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export const cancelMatch = async (req, res) => {
  try {
    const match = await ManualMatch.findOne({
      _id: req.body.matchId,
      status: "open",
      "host.userId": req.user._id,
    });

    await ManualMatch.deleteOne(
      { _id: req.body.matchId, status: "open", "host.userId": req.user._id } // Filter by user ID
    );

    if (!match) {
      return res.json({
        success: false,
        message: "cancel_match_not_possible",
      });
    }

    // const matchTxn = await Transaction.findOne({
    //   txnId: match.host.txnId,
    //   userId: req.userId,
    // });

    // const nexTxn = {
    //   txnId: await newTxnId(),
    //   userId: req.user._id,
    //   amount: matchTxn.amount,
    //   cash: matchTxn.cash,
    //   reward: matchTxn.reward,
    //   bonus: matchTxn.bonus,
    //   remark: "Match Cancelled",
    //   status: "completed",
    //   txnType: "credit",
    //   txnCtg: "bet",
    // };

    // await Transaction.create(nexTxn);

    return res.json({
      success: true,
    });
  } catch (error) {
    ////console.log("createMatch", error);
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export const cancelClassicOnline = async (req, res) => {
  try {
    const match = await OnlineGame.findOne({
      entryFee: req.body.amount,
      status: "waiting",
      "blue.userId": req.user._id,
    });

    await OnlineGame.deleteOne(
      { _id: match._id, status: "waiting", "blue.userId": req.user._id } // Filter by user ID
    );

    if (!match) {
      return res.json({
        success: false,
        message: "cancel_match_not_possible",
      });
    }

    return res.json({
      success: true,
    });
  } catch (error) {
    ////console.log("createMatch", error);
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export const cancelClassicOnline2 = async (req, res) => {
  try {
    const match = await OnlineGame2.findOne({
      entryFee: req.body.amount,
      status: "waiting",
      "blue.userId": req.user._id,
    });

    await OnlineGame2.deleteOne(
      { _id: match._id, status: "waiting", "blue.userId": req.user._id } // Filter by user ID
    );

    if (!match) {
      return res.json({
        success: false,
        message: "cancel_match_not_possible",
      });
    }

    return res.json({
      success: true,
    });
  } catch (error) {
    ////console.log("createMatch", error);
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export const fetchGames = async (req, res) => {
  try {
    const games = await Game.find({}).sort({ order: 1 });
    return res.json({
      success: true,
      games: games,
    });
  } catch (error) {
    ////console.log("fetchMatch", error);
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export const joinMatch = async (req, res) => {
  try {
    const joiner = await User.findOne({ _id: req.body.joinerId });
    const runningmatch = await ManualMatch.findOne({
      status: "running",
      $or: [
        { "host.userId": joiner._id, "host.result": null },
        { "joiner.userId": joiner._id, "joiner.result": null },
      ],
    }).sort({ createdAt: -1 });
    const runningmatch2 = await OnlineGame.findOne({
      $and: [{ status: "running" }, { $or: [{ "blue.userId": joiner._id }, { "green.userId": joiner._id }] }],
    }).sort({ createdAt: -1 });
    const runningmatch3 = await SpeedLudo.findOne({
      $and: [{ status: "running" }, { $or: [{ "blue.userId": joiner._id }, { "green.userId": joiner._id }] }],
    }).sort({ createdAt: -1 });
    const runningmatch4 = await QuickLudo.findOne({
      $and: [{ status: "running" }, { $or: [{ "blue.userId": joiner._id }, { "green.userId": joiner._id }] }],
    }).sort({ createdAt: -1 });
    if (runningmatch || runningmatch2 || runningmatch3 || runningmatch4) {
      return res.json({
        success: false,
        message: "already_in_matchj",
      });
    }
    const match = await ManualMatch.findOne({
      _id: req.body.matchId,
      status: "open",
      "host.userId": { $ne: joiner._id },
      "host.txnId": null,
      "joiner.txnId": null,
    });
    if (!match) {
      return res.json({
        success: false,
        message: "join_match_not_possible",
      });
    }
    const userBalance = await balance({ user: joiner });
    const joinerBalance = userBalance;
    if (match.entryFee > userBalance.balance) {
      return res.json({
        success: false,
        message: "less_balance_msg_j",
      });
    }
    const cBalance = await balance(req);
    const jb = cBalance;
    if (match.entryFee > jb.balance) {
      return res.json({
        success: false,
        message: "less_balance_msg",
      });
    }
    const host = await User.findOne({ _id: req.user._id });
    const hostBalance = await ubalance(host);
    const newTxnhost = {
      txnId: await newTxnId(),
      userId: host._id,
      amount: match.entryFee,
      cash: 0,
      reward: 0,
      bonus: 0,
      remark: "Match Created",
      status: "completed",
      txnType: "debit",
      txnCtg: "bet",
      matchId: match._id,
    };
    let neededMoney = match.entryFee;
    if (neededMoney > 0) {
      newTxnhost.cash = Math.min(neededMoney, hostBalance.cash);
      neededMoney -= newTxnhost.cash;
    }
    if (neededMoney > 0) {
      newTxnhost.bonus = Math.min(neededMoney, hostBalance.bonus);
      neededMoney -= newTxnhost.bonus;
    }
    if (neededMoney > 0) {
      newTxnhost.reward = Math.min(neededMoney, hostBalance.reward);
      neededMoney -= newTxnhost.reward;
    }
    if (!match.host.txnId) {
      const hostTxn = await Transaction.create(newTxnhost);
    }

    const newTxnjoiner = {
      txnId: await newTxnId(),
      userId: joiner._id,
      amount: match.entryFee,
      cash: 0,
      reward: 0,
      bonus: 0,
      remark: "Match Joined",
      status: "completed",
      txnType: "debit",
      txnCtg: "bet",
      matchId: match._id,
    };
    neededMoney = match.entryFee;
    if (neededMoney > 0) {
      newTxnjoiner.cash = Math.min(neededMoney, joinerBalance.cash);
      neededMoney -= newTxnjoiner.cash;
    }
    if (neededMoney > 0) {
      newTxnjoiner.bonus = Math.min(neededMoney, joinerBalance.bonus);
      neededMoney -= newTxnjoiner.bonus;
    }
    if (neededMoney > 0) {
      newTxnjoiner.reward = Math.min(neededMoney, joinerBalance.reward);
      neededMoney -= newTxnjoiner.reward;
    }
    if (!match.joiner.txnId) {
      const joinerTxn = await Transaction.create(newTxnjoiner);
    }

    const test = await ManualMatch.updateOne(
      { _id: match._id, status: "open", "host.userId": host._id },
      {
        $set: {
          status: "running",
          "host.txnId": newTxnhost.txnId,
          "joiner.userId": joiner._id,
          "joiner.fullName": joiner.fullName,
          "joiner.profilePic": joiner.profilePic,
          "joiner.txnId": newTxnjoiner.txnId,
          "joiner.joinAt": new Date(),
        },
      }
    );

    // ====== CLEAR AUTO-CANCEL TIMEOUT SINCE SOMEONE JOINED ======
    const timeoutId = pendingMatchTimeouts.get(match._id.toString());
    if (timeoutId) {
      clearTimeout(timeoutId);
      pendingMatchTimeouts.delete(match._id.toString());
    }
    // ============================================================

    await ManualMatch.deleteMany({
      $and: [
        { _id: { $ne: match._id }, status: "open" },
        {
          $or: [
            { "host.userId": joiner._id },
            { "joiner.userId": joiner._id },
            { "host.userId": host._id },
            { "joiner.userId": host._id },
          ],
        },
      ],
    });
    await ManualMatch.updateOne(
      { _id: { $ne: match._id }, status: "open" },
      { $pull: { joinerReqs: { userId: joiner._id } } }
    );
    await ManualMatch.updateOne(
      { _id: { $ne: match._id }, status: "open" },
      { $pull: { joinerReqs: { userId: host._id } } }
    );

    await _log({
      matchId: match._id,
      message:
        req.user.fullName +
        "(" +
        req.user.mobileNumber +
        ") accepted join request of " +
        joiner.fullName +
        "(" +
        joiner.mobileNumber +
        "), ₹" +
        match.entryFee +
        " is debited from both users wallet",
    });

    setTimeout(() => {
      cancelMatchAndRefund(match._id);
    }, 1000 * 120); // 2 minutes

    return res.json({
      success: true,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export const joinMatchReq = async (req, res) => {
  try {
    const runningmatch = await ManualMatch.findOne({
      $and: [
        { status: "running" }, // Exclude the current matchId
        {
          $or: [
            { "host.userId": req.user._id }, // Condition 1: Host userId matches
            { "joiner.userId": req.user._id },
            // Condition 2: Joiner userId matches
          ],
        },
      ],
    }).sort({ createdAt: -1 });

    const runningmatch2 = await OnlineGame.findOne({
      $and: [
        { status: "running" }, // Exclude the current matchId
        {
          $or: [
            { "blue.userId": req.user._id }, // Condition 1: Host userId matches
            { "green.userId": req.user._id },
            // Condition 2: Joiner userId matches
          ],
        },
      ],
    }).sort({ createdAt: -1 });

    if (runningmatch || runningmatch2) {
      return res.json({
        success: false,
        message: "already_in_match",
      });
    }

    const match = await ManualMatch.findOne({
      _id: req.body.matchId,
      status: "open",
      "host.userId": { $ne: req.user._id },
      "host.txnId": null,
      "joiner.txnId": null,
    });

    const matchc = await ManualMatch.findOne({
      _id: match._id,
      joinerReqs: { $elemMatch: { userId: req.user._id } },
    });

    if (matchc) {
      return res.json({
        success: false,
        message: "join_match_not_possible",
      });
    }

    if (!match) {
      return res.json({
        success: false,
        message: "join_match_not_possible",
      });
    }

    const userBalance = await balance(req);

    if (match.entryFee > userBalance.balance) {
      return res.json({
        success: false,
        message: "less_balance_msg",
      });
    }

    const requ = {
      userId: req.user._id,
      name: req.user.fullName,
    };

    const test = await ManualMatch.updateOne(
      { _id: match._id, status: "open" }, // Filter by user ID
      { $addToSet: { joinerReqs: requ } }, // Prevents duplicate players
      { new: true, upsert: true }
    );

    await _log({
      matchId: match._id,
      message:
        req.user.fullName +
        "(" +
        req.user.mobileNumber +
        ") requested to join match",
    });

    return res.json({
      success: true,
    });
  } catch (error) {
    ////console.log("joinMatch", error);
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export const joinMatchCancel = async (req, res) => {
  try {
    if (req.body.joinerId) {
      const joiner = await User.findOne({ _id: req.body.joinerId });

      const matchc = await ManualMatch.findOne({
        status: "open",
        "host.userId": req.user._id,
        _id: req.body.matchId,
      });

      const test = await ManualMatch.updateOne(
        { _id: matchc._id, status: "open", "host.userId": req.user._id }, // Filter by user ID
        { $pull: { joinerReqs: { userId: joiner._id } } } // Prevents duplicate players
      );

      await _log({
        matchId: matchc._id,
        message:
          req.user.fullName +
          "(" +
          req.user.mobileNumber +
          ") rejected join request of " +
          joiner.fullName +
          "(" +
          joiner.mobileNumber +
          ")",
      });

      return res.json({
        success: true,
      });
    } else {
      const matchc = await ManualMatch.findOne({
        status: "open",
        "host.userId": { $ne: req.user._id },
        "host.txnId": null,
        "joiner.txnId": null,
        _id: req.body.matchId,
        joinerReqs: { $elemMatch: { userId: req.user._id } },
      });

      if (!matchc) {
        return res.json({
          success: false,
          message: "cancel_match_not_possible",
        });
      }

      const test = await ManualMatch.updateOne(
        { _id: matchc._id, status: "open" }, // Filter by user ID
        { $pull: { joinerReqs: { userId: req.user._id } } } // Prevents duplicate players
      );

      await _log({
        matchId: matchc._id,
        message:
          req.user.fullName +
          "(" +
          req.user.mobileNumber +
          ") cancelled match join request",
      });

      return res.json({
        success: true,
      });
    }
  } catch (error) {
    ////console.log("joinMatch", error);
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export const verifyRoomCode = async (roomCode, retries = 2) => {
  return { apiWorking: false };
  const config = await _config();
  const url = `https://ludo-king-room-code-api.p.rapidapi.com/game-checkroom/${roomCode}`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.get(url, {
        headers: {
          "x-rapidapi-host": "ludo-king-room-code-api.p.rapidapi.com",
          "x-rapidapi-key": config.LUDOKING_RAPID_APIKEY,
        },
        timeout: 30000,
      });

      return {
        apiWorking: true,
        data: response.data,
      };
    } catch (error) {
      console.warn(`Attempt ${attempt} failed:`, error.data || "error");

      if (attempt === retries) return { apiWorking: false };
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      ); // Exponential backoff
    }
  }
};

export const checkGameStatus = async (gameId, retries = 2) => {
  return { apiWorking: false };
  const config = await _config();
  const url = `https://ludo-king-room-code-api.p.rapidapi.com/game-status/${gameId}`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.get(url, {
        headers: {
          "x-rapidapi-host": "ludo-king-room-code-api.p.rapidapi.com",
          "x-rapidapi-key": config.LUDOKING_RAPID_APIKEY,
        },
        timeout: 30000,
      });

      return {
        apiWorking: true,
        data: response.data,
      };
    } catch (error) {
      console.warn(`Attempt ${attempt} failed:`, error.data || "error");
      if (attempt === retries) return { apiWorking: false };
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      ); // Exponential backoff
    }
  }
};

export const verifyCancelReq = async (matchId) => {
  return { verifyCancel: false };

  const match = await ManualMatch.findOne({ _id: matchId });

  if (!match) {
    return { verifyCancel: false }; // Match not found
  }

  if (match.type !== "manual" || match.status !== "running") {
    return { verifyCancel: false }; // Match is not eligible for cancellation
  }

  if (match.roomCode == null) {
    return { verifyCancel: true }; // Can be canceled if no room code exists
  }

  if (match.gameId != null) {
    try {
      const config = await _config();
      const response = await axios.get(
        `https://ludo-king-room-code-api.p.rapidapi.com/game-status/${match.gameId}`,
        {
          headers: {
            "x-rapidapi-host": "ludo-king-room-code-api.p.rapidapi.com",
            "x-rapidapi-key": config.LUDOKING_RAPID_APIKEY,
          },
          timeout: 30000, // Timeout in milliseconds (30 seconds)
        }
      );

      const roomCodeStatus = response.data;

      if (!roomCodeStatus) {
        return { verifyCancel: false }; // in case api does not work
      }

      if (roomCodeStatus.player_id == null) {
        return { verifyCancel: true }; // Can be canceled if no player is found
      }

      if (
        roomCodeStatus.game_status == "Finished" &&
        Object.values(roomCodeStatus.tokenPositions.creator).filter(
          (pos) => pos !== -1
        ).length < 2 &&
        Object.values(roomCodeStatus.tokenPositions.player).filter(
          (pos) => pos !== -1
        ).length < 2
      ) {
        return { verifyCancel: true }; // Can be canceled if not more than one token is out
      }

      return { verifyCancel: false };
    } catch (error) {
      // //console.log(error);
      return { verifyCancel: false };
    }
  }

  return { verifyCancel: false };
  cccccccccccccccc;
};

function isEightDigitNumber(str) {
  const regex = /^\d{8}$/; // Matches exactly 8 digits
  return regex.test(str);
}

export const updateRoomCode = async (req, res) => {
  try {
    if (!req.body.roomCode) {
      return res.json({
        success: false,
        message: "no_room_code",
      });
    }

    if (!isEightDigitNumber(req.body.roomCode)) {
      return res.json({
        success: false,
        message: "no_room_code",
      });
    }

    const checkDup = await ManualMatch.findOne({
      roomCode: req.body.roomCode,
    });

    if (checkDup) {
      return res.json({
        success: false,
        message: "room_already_used",
      });
    }

    const match = await ManualMatch.findOne({
      _id: req.body.matchId,
      status: "running",
      "host.userId": req.user._id,
    });

    if (!match) {
      return res.json({
        success: false,
        message: "something_is_wrong",
      });
    }

    const checkRoom = await verifyRoomCode(req.body.roomCode);

    if (checkRoom.apiWorking) {
      if (
        checkRoom.data.status &&
        checkRoom.data.status == "Waiting" &&
        checkRoom.data.type &&
        checkRoom.data.type == "classic" &&
        checkRoom.data.valid
      ) {
        await ManualMatch.updateOne(
          { _id: match._id, status: "running", "host.userId": req.user._id }, // Filter by user ID
          {
            $set: {
              roomCode: req.body.roomCode,
              roomCodeUpdatedAt: new Date(),
              gameId: checkRoom.data.game_id,
            },
          } // Update the fullName field
        );

        await _log({
          matchId: match._id,
          message:
            "room code updated and verified via api, room code is " +
            req.body.roomCode,
        });

        return res.json({
          success: true,
        });
      } else {
        return res.json({
          success: false,
          message: "no_room_code",
        });
      }
    } else {
      await ManualMatch.updateOne(
        { _id: match._id, status: "running", "host.userId": req.user._id }, // Filter by user ID
        {
          $set: {
            roomCode: req.body.roomCode,
            roomCodeUpdatedAt: new Date(),
          },
        } // Update the fullName field
      );

      await _log({
        matchId: match._id,
        message:
          "api didn't responded , room code updated without verification, room code is " +
          req.body.roomCode,
      });
      return res.json({
        success: true,
      });
    }
  } catch (error) {
    ////console.log("createMatch", error);
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

// ##########################
export const submitCancelRequest = async (req, res) => {
  try {
    const match = await ManualMatch.findOne({
      $and: [
        { _id: req.body.matchId, status: "running" }, // Exclude the current matchId
        {
          $or: [
            { "host.userId": req.user._id }, // Condition 1: Host userId matches
            { "joiner.userId": req.user._id },
            // Condition 2: Joiner userId matches
          ],
        },
      ],
    });

    if (!match) {
      return res.json({
        success: false,
        message: "something_is_wrong",
      });
    }

    if (match.cancellationRequested.req) {
      return res.json({
        success: false,
        message: "cancel_already_submitted",
      });
    }

    let userType = null;

    if (req.userId == match.host.userId) {
      userType = "host";
    } else {
      userType = "joiner";
    }

    const cverify = await verifyCancelReq(req.body.matchId);

    if (cverify.verifyCancel) {
      await ManualMatch.updateOne(
        {
          $and: [
            { status: "running" }, // Status must be "running"
            {
              $or: [
                { "host.userId": req.user._id }, // Host userId matches
                { "joiner.userId": req.user._id }, // Joiner userId matches
              ],
            },
          ],
        },
        {
          $set: {
            status: "cancelled",
            "cancellationRequested.req": true,
            "cancellationRequested.userId": req.user._id,
            "cancellationRequested.by": userType,
            "cancellationRequested.reqAt": Date.now(),
            "cancellationRequested.reason": req.body.reason,
            "cancellationRequested.accepted": true,
            "cancellationRequested.acceptedBy": userType,
            "cancellationRequested.acceptedAt": Date.now(),
          },
        }
      );

      await cancelMatchAndRefund2(match);

      await _log({
        matchId: match._id,
        message:
          req.user.fullName +
          " (" +
          req.user.mobileNumber +
          ") requested cancellation of match , the reason is : " +
          req.body.reason +
          " (api verified)",
      });

      return res.json({
        success: true,
        message: "Match cancelled",
      });
    }

    await ManualMatch.updateOne(
      {
        $and: [
          { status: "running" }, // Status must be "running"
          {
            $or: [
              { "host.userId": req.user._id }, // Host userId matches
              { "joiner.userId": req.user._id }, // Joiner userId matches
            ],
          },
        ],
      },
      {
        $set: {
          "cancellationRequested.req": true,
          "cancellationRequested.userId": req.user._id,
          "cancellationRequested.by": userType,
          "cancellationRequested.reqAt": Date.now(),
          "cancellationRequested.reason": req.body.reason,
        },
      }
    );

    await _log({
      matchId: match._id,
      message:
        req.user.fullName +
        " (" +
        req.user.mobileNumber +
        ") requested cancellation of match , the reason is : " +
        req.body.reason,
    });

    return res.json({
      success: true,
      message: "cancel_req_submit",
    });
  } catch (error) {
    ////console.log("createMatch", error);
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

// export const submitCancelRequest = async (req, res) => {
//   try {
//     const match = await ManualMatch.findOne({
//       $and: [
//         { _id: req.body.matchId, status: "running" }, // Exclude the current matchId
//         {
//           $or: [
//             { "host.userId": req.user._id }, // Condition 1: Host userId matches
//             { "joiner.userId": req.user._id },
//             // Condition 2: Joiner userId matches
//           ],
//         },
//       ],
//     });

//     if (!match) {
//       return res.json({
//         success: false,
//         message: "something_is_wrong",
//       });
//     }

//     if (match.cancellationRequested.req) {
//       return res.json({
//         success: false,
//         message: "cancel_already_submitted",
//       });
//     }

//     let userType = null;

//     if (req.userId == match.host.userId) {
//       userType = "host";
//     } else {
//       userType = "joiner";
//     }

//     await ManualMatch.updateOne(
//       {
//         $and: [
//           { status: "running" }, // Status must be "running"
//           {
//             $or: [
//               { "host.userId": req.user._id }, // Host userId matches
//               { "joiner.userId": req.user._id }, // Joiner userId matches
//             ],
//           },
//         ],
//       },
//       {
//         $set: {
//           "cancellationRequested.req": true,
//           "cancellationRequested.userId": req.user._id,
//           "cancellationRequested.by": userType,
//           "cancellationRequested.reqAt": Date.now(),
//           "cancellationRequested.reason": req.body.reason,
//         },
//       }
//     );

//     await _log({
//       matchId: match._id,
//       message:
//         req.user.fullName +
//         " (" +
//         req.user.mobileNumber +
//         ") requested cancellation of match , the reason is : " +
//         req.body.reason,
//     });

//     return res.json({
//       success: true,
//       message: "cancel_req_submit",
//     });
//   } catch (error) {
//     ////console.log("createMatch", error);
//     return res.json({
//       success: false,
//       message: error.response ? error.response.data.message : error.message,
//     });
//   }
// };

export const acceptCancelRequest = async (req, res) => {
  try {
    const match = await ManualMatch.findOne({
      $and: [
        { _id: req.body.matchId, status: "running" }, // Exclude the current matchId
        {
          $or: [
            { "host.userId": req.user._id }, // Condition 1: Host userId matches
            { "joiner.userId": req.user._id },
            // Condition 2: Joiner userId matches
          ],
        },
      ],
    });

    if (!match) {
      return res.json({
        success: false,
        message: "something_is_wrong",
      });
    }

    if (!match.cancellationRequested.req) {
      return res.json({
        success: false,
        message: "cancel_req_accept_not_possible",
      });
    }

    if (match.cancellationRequested.accepted) {
      return res.json({
        success: false,
        message: "cancel_req_accept_not_possible",
      });
    }

    if (match.cancellationRequested.userId == req.userId) {
      return res.json({
        success: false,
        message: "cancel_req_accept_not_possible",
      });
    }

    let userType = null;

    if (req.userId == match.host.userId) {
      userType = "host";
    } else {
      userType = "joiner";
    }

    // return res.json({
    //   success: false,
    //   message: "cancel_req_accept_not_possible",
    //   data: [userType, req.userId, match.host.userId],
    // });

    await ManualMatch.updateOne(
      {
        $and: [
          { status: "running", _id: match._id }, // Status must be "running"
          {
            $or: [
              { "host.userId": req.user._id }, // Host userId matches
              { "joiner.userId": req.user._id }, // Joiner userId matches
            ],
          },
        ],
      },
      {
        $set: {
          status: "cancelled",
          "cancellationRequested.accepted": true,
          "cancellationRequested.acceptedBy": userType,
          "cancellationRequested.acceptedAt": Date.now(),
        },
      }
    );

    await cancelMatchAndRefund2(match);
    await _log({
      matchId: match._id,
      message:
        req.user.fullName +
        " (" +
        req.user.mobileNumber +
        ") accepted cancellation request , and  ₹" +
        match.entryFee +
        " is refunded to both players account",
    });
    return res.json({
      success: true,
      message: "cancel_req_accepted",
    });
  } catch (error) {
    ////console.log("createMatch", error);
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export const iWon = async (req, res) => {
  try {
    const match = await ManualMatch.findOne({
      $and: [
        { _id: req.body.matchId, status: "running" }, // Exclude the current matchId
        {
          $or: [
            { "host.userId": req.user._id }, // Condition 1: Host userId matches
            { "joiner.userId": req.user._id },
            // Condition 2: Joiner userId matches
          ],
        },
      ],
    });

    if (!match) {
      return res.json({
        success: false,
        message: "something_is_wrong",
      });
    }

    if (match.host.userId == req.userId && match.host.result != null) {
      return res.json({
        success: false,
        message: "result_already_submit",
      });
    }

    if (match.joiner.userId == req.userId && match.joiner.result != null) {
      return res.json({
        success: false,
        message: "result_already_submit",
      });
    }

    const checkMS = await checkGameStatus(match.gameId);
    if (checkMS.apiWorking) {
      if (checkMS.data.game_status == "Running") {
        return res.json({
          success: false,
          message: "game_is_running",
        });
      }

      if (checkMS.data.game_status == "Waiting") {
        return res.json({
          success: false,
          message: "game_is_running",
        });
      }

      if (!checkMS.data.isAutoExit && !checkMS.data.isExit) {
        // if (true) {
        if (
          checkMS.data.creator_id != null &&
          checkMS.data.winner_id != null &&
          checkMS.data.creator_id == checkMS.data.winner_id
        ) {
          //host is winner
          const cm = await ManualMatch.updateOne(
            {
              $and: [
                { status: "running", _id: match._id }, // Status must be "running"
                {
                  $or: [
                    { "host.userId": req.user._id }, // Host userId matches
                    { "joiner.userId": req.user._id }, // Joiner userId matches
                  ],
                },
              ],
            },
            {
              $set: {
                status: "completed",
                completedAt: Date.now(),
                "winner.userId": match.host.userId,
                "looser.userId": match.joiner.userId,
                apiData: checkMS.data,
              },
            }
          );

          if (cm.modifiedCount > 0) {
            const hostbet = await Transaction.findOne({
              txnId: match.host.txnId,
              userId: match.host.userId,
              txnCtg: "bet",
              txnType: "debit",
            });
            console.log("hostbet", hostbet);

            const txnid = await newTxnId();
            const NewTxn = {
              txnId: txnid,
              userId: match.host.userId,
              amount: match.prize,
              cash: hostbet.cash,
              reward: match.prize - match.entryFee + Number(hostbet.reward),
              bonus: hostbet.bonus,
              remark: "Match Won",
              status: "completed",
              txnType: "credit",
              txnCtg: "reward",
              matchId: match._id,
            };

            console.log("NewTxn", NewTxn);

            await Transaction.create(NewTxn);
            await _log({
              matchId: match._id,
              message:
                req.user.fullName +
                "(" +
                req.user.mobileNumber +
                ") submited result as winner and game result is verified by api and results are updated automatically for both players",
            });

            const h = await User.findOne({ _id: match.host.userId });
            await _log({
              matchId: match._id,
              message:
                h.fullName +
                " (" +
                h.mobileNumber +
                ") get reward of ₹" +
                match.prize +
                " as winner (verified by api)",
            });

            await refBonusManager(match.host.userId, match);

            return res.json({
              success: true,
              message: "match_finished",
            });
          } else {
            await _log({
              matchId: match._id,
              message:
                "database or server is not responded, so some transactions was skipped.",
            });
          }
        } else if (
          checkMS.data.player_id != null &&
          checkMS.data.winner_id != null &&
          checkMS.data.player_id == checkMS.data.winner_id
        ) {
          //joiner is winner
          const cm = await ManualMatch.updateOne(
            {
              $and: [
                { status: "running", _id: match._id }, // Status must be "running"
                {
                  $or: [
                    { "host.userId": req.user._id }, // Host userId matches
                    { "joiner.userId": req.user._id }, // Joiner userId matches
                  ],
                },
              ],
            },
            {
              $set: {
                status: "completed",
                completedAt: Date.now(),
                "winner.userId": match.joiner.userId,
                "looser.userId": match.host.userId,
                apiData: checkMS.data,
              },
            }
          );

          if (cm.modifiedCount > 0) {
            const joinerbet = await Transaction.findOne({
              txnId: match.joiner.txnId,
              userId: match.joiner.userId,
              txnCtg: "bet",
              txnType: "debit",
            });
            console.log("joinerbet", joinerbet);
            const txnid = await newTxnId();
            const NewTxn = {
              txnId: txnid,
              userId: match.joiner.userId,
              amount: match.prize,
              cash: joinerbet.cash,
              reward: match.prize - match.entryFee + Number(joinerbet.reward),
              bonus: joinerbet.bonus,
              remark: "Match Won",
              status: "completed",
              txnType: "credit",
              txnCtg: "reward",
              matchId: match._id,
            };
            console.log("NewTxn", NewTxn);
            await Transaction.create(NewTxn);
            await _log({
              matchId: match._id,
              message:
                req.user.fullName +
                "(" +
                req.user.mobileNumber +
                ") submited result as winner and game result is verified by api and results are updated automatically for both players",
            });

            const j = await User.findOne({ _id: match.joiner.userId });
            await _log({
              matchId: match._id,
              message:
                j.fullName +
                " (" +
                j.mobileNumber +
                ") get reward of ₹" +
                match.prize +
                " as winner (verified by api)",
            });
            await refBonusManager(match.joiner.userId, match);
            return res.json({
              success: true,
              message: "match_finished",
            });
          } else {
            await _log({
              matchId: match._id,
              message:
                "database or server is not responded, so some transactions was skipped.",
            });
          }
        }
      }
    }

    const file = req.file;

    if (!file) {
      return res.json({ success: false, message: "select_screenshot" });
    }

    const newDir = uploadDir + "/" + match.matchId;
    if (!fs.existsSync(newDir)) {
      fs.mkdirSync(newDir);
    }
    // Compress the image and save it
    const fileName = `screenshot_${Date.now()}.jpg`;
    const compressedImagePath = path.join(newDir, fileName);
    await sharp(file.buffer)
      .resize({ width: 500 }) // Resize if necessary
      .jpeg({ quality: 80 }) // Compress
      .toFile(compressedImagePath);

    const result = {};
    if (match.host.userId == req.userId) {
      result["host.result"] = "win";
      result["host.resultAt"] = Date.now();
      result["host.screenshot"] = fileName;
    } else {
      //joiner is submitting win
      result["joiner.result"] = "win";
      result["joiner.resultAt"] = Date.now();
      result["joiner.screenshot"] = fileName;
    }

    const checkMatch = await ManualMatch.updateOne(
      {
        $and: [
          { status: "running", _id: match._id }, // Status must be "running"
          {
            $or: [
              { "host.userId": req.user._id }, // Host userId matches
              { "joiner.userId": req.user._id }, // Joiner userId matches
            ],
          },
        ],
      },
      {
        $set: result,
      }
    );

    if (checkMatch.modifiedCount > 0) {
      await _log({
        matchId: match._id,
        message:
          req.user.fullName +
          " (" +
          req.user.mobileNumber +
          ") submitted result as winner, result is not verified by api",
      });

      const checkConflict = await ManualMatch.findOne({
        _id: match._id,
      });

      if (
        checkConflict.host.result == "win" &&
        checkConflict.joiner.result == "win"
      ) {
        await ManualMatch.updateOne(
          {
            $and: [
              { status: "running", _id: match._id }, // Status must be "running"
              {
                $or: [
                  { "host.userId": req.user._id }, // Host userId matches
                  { "joiner.userId": req.user._id }, // Joiner userId matches
                ],
              },
            ],
          },
          {
            $set: {
              conflict: true,
            },
          }
        );

        await _log({
          matchId: match._id,
          message:
            " both players submitted win so conflict is created for the match",
        });
      } else if (
        checkConflict.host.result == "lose" &&
        checkConflict.joiner.result == "lose"
      ) {
        await ManualMatch.updateOne(
          {
            $and: [
              { status: "running", _id: match._id }, // Status must be "running"
              {
                $or: [
                  { "host.userId": req.user._id }, // Host userId matches
                  { "joiner.userId": req.user._id }, // Joiner userId matches
                ],
              },
            ],
          },
          {
            $set: {
              status: "completed",
            },
          }
        );

        await _log({
          matchId: match._id,
          message: "both players submitted lost , match is update as completed",
        });
      } else {
        if (
          checkConflict.host.result == "win" &&
          checkConflict.joiner.result == "lose"
        ) {
          //host is winner
          const cm = await ManualMatch.updateOne(
            {
              $and: [
                { status: "running", _id: match._id }, // Status must be "running"
                {
                  $or: [
                    { "host.userId": req.user._id }, // Host userId matches
                    { "joiner.userId": req.user._id }, // Joiner userId matches
                  ],
                },
              ],
            },
            {
              $set: {
                status: "completed",
                completedAt: Date.now(),
                "winner.userId": match.host.userId,
                "looser.userId": match.joiner.userId,
              },
            }
          );

          if (cm.modifiedCount > 0) {
            const hostbet = await Transaction.findOne({
              txnId: match.host.txnId,
              userId: match.host.userId,
              txnCtg: "bet",
              txnType: "debit",
            });
            console.log("hostbet", hostbet);

            const txnid = await newTxnId();
            const NewTxn = {
              txnId: txnid,
              userId: match.host.userId,
              amount: match.prize,
              cash: hostbet.cash,
              reward: match.prize - match.entryFee + Number(hostbet.reward),
              bonus: hostbet.bonus,
              remark: "Match Won",
              status: "completed",
              txnType: "credit",
              txnCtg: "reward",
              matchId: match._id,
            };
            console.log("NewTxn", NewTxn);

            await Transaction.create(NewTxn);
            await _log({
              matchId: match._id,
              message:
                req.user.fullName +
                " (" +
                req.user.mobileNumber +
                ") is marked as winner and got reward of ₹" +
                match.prize +
                " in his wallet",
            });
            await refBonusManager(match.host.userId, match);
            return res.json({
              success: true,
              message: "match_finished",
            });
          } else {
            await _log({
              matchId: match._id,
              message:
                "database or server is not responded, so some transactions was skipped.",
            });
          }
        } else if (
          checkConflict.host.result == "lose" &&
          checkConflict.joiner.result == "win"
        ) {
          //joiner is winner
          const cm = await ManualMatch.updateOne(
            {
              $and: [
                { status: "running", _id: match._id }, // Status must be "running"
                {
                  $or: [
                    { "host.userId": req.user._id }, // Host userId matches
                    { "joiner.userId": req.user._id }, // Joiner userId matches
                  ],
                },
              ],
            },
            {
              $set: {
                status: "completed",
                completedAt: Date.now(),
                "winner.userId": match.joiner.userId,
                "looser.userId": match.host.userId,
              },
            }
          );

          if (cm.modifiedCount > 0) {
            const joinerbet = await Transaction.findOne({
              txnId: match.joiner.txnId,
              userId: match.joiner.userId,
              txnCtg: "bet",
              txnType: "debit",
            });

            console.log("joinerbet", joinerbet);

            const txnid = await newTxnId();
            const NewTxn = {
              txnId: txnid,
              userId: match.joiner.userId,
              amount: match.prize,
              cash: joinerbet.cash,
              reward: match.prize - match.entryFee + Number(joinerbet.reward),
              bonus: joinerbet.bonus,
              remark: "Match Won",
              status: "completed",
              txnType: "credit",
              txnCtg: "reward",
              matchId: match._id,
            };
            console.log("NewTxn", NewTxn);
            await Transaction.create(NewTxn);
            await _log({
              matchId: match._id,
              message:
                req.user.fullName +
                " (" +
                req.user.mobileNumber +
                ") is marked as winner and got reward of ₹" +
                match.prize +
                " in his wallet",
            });
            await refBonusManager(match.joiner.userId, match);
            return res.json({
              success: true,
              message: "match_finished",
            });
          } else {
            await _log({
              matchId: match._id,
              message:
                "database or server is not responded, so some transactions was skipped.",
            });
          }
        }
      }
    }

    return res.json({
      success: true,
      message: "result_submitted",
    });
  } catch (error) {
    ////console.log("createMatch", error);
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export const iLost = async (req, res) => {
  try {
    const match = await ManualMatch.findOne({
      $and: [
        { _id: req.body.matchId, status: "running" }, // Exclude the current matchId
        {
          $or: [
            { "host.userId": req.user._id }, // Condition 1: Host userId matches
            { "joiner.userId": req.user._id },
            // Condition 2: Joiner userId matches
          ],
        },
      ],
    });

    if (!match) {
      return res.json({
        success: false,
        message: "something_is_wrong",
      });
    }

    const checkMS = await checkGameStatus(match.gameId);
    if (checkMS.apiWorking) {
      if (checkMS.data.game_status == "Running") {
        return res.json({
          success: false,
          message: "game_is_running",
        });
      }

      if (checkMS.data.game_status == "Waiting") {
        return res.json({
          success: false,
          message: "game_is_running",
        });
      }

      if (!checkMS.data.isAutoExit && !checkMS.data.isExit) {
        // if (true) {
        if (
          checkMS.data.creator_id != null &&
          checkMS.data.winner_id != null &&
          checkMS.data.creator_id == checkMS.data.winner_id
        ) {
          //host is winner
          const cm = await ManualMatch.updateOne(
            {
              $and: [
                { status: "running", _id: match._id }, // Status must be "running"
                {
                  $or: [
                    { "host.userId": req.user._id }, // Host userId matches
                    { "joiner.userId": req.user._id }, // Joiner userId matches
                  ],
                },
              ],
            },
            {
              $set: {
                status: "completed",
                completedAt: Date.now(),
                "winner.userId": match.host.userId,
                "looser.userId": match.joiner.userId,
                apiData: checkMS.data,
              },
            }
          );

          if (cm.modifiedCount > 0) {
            const hostbet = await Transaction.findOne({
              txnId: match.host.txnId,
              userId: match.host.userId,
              txnCtg: "bet",
              txnType: "debit",
            });

            console.log("hostbet", hostbet);
            const txnid = await newTxnId();
            const NewTxn = {
              txnId: txnid,
              userId: match.host.userId,
              amount: match.prize,
              cash: hostbet.cash,
              reward: match.prize - match.entryFee + Number(hostbet.reward),
              bonus: hostbet.bonus,
              remark: "Match Won",
              status: "completed",
              txnType: "credit",
              txnCtg: "reward",
              matchId: match._id,
            };
            console.log("NewTxn", NewTxn);
            await Transaction.create(NewTxn);
            await _log({
              matchId: match._id,
              message:
                req.user.fullName +
                "(" +
                req.user.mobileNumber +
                ") submited result as lost and game result is verified by api and results are updated automatically for both players",
            });

            const h = await User.findOne({ _id: match.host.userId });
            await _log({
              matchId: match._id,
              message:
                h.fullName +
                " (" +
                h.mobileNumber +
                ") get reward of ₹" +
                match.prize +
                " as winner (verified by api)",
            });

            await refBonusManager(match.host.userId, match);
            return res.json({
              success: true,
              message: "match_finished",
            });
          } else {
            await _log({
              matchId: match._id,
              message:
                "database or server is not responded, so some transactions was skipped.",
            });
          }
        } else if (
          checkMS.data.player_id != null &&
          checkMS.data.winner_id != null &&
          checkMS.data.player_id == checkMS.data.winner_id
        ) {
          //joiner is winner
          const cm = await ManualMatch.updateOne(
            {
              $and: [
                { status: "running", _id: match._id }, // Status must be "running"
                {
                  $or: [
                    { "host.userId": req.user._id }, // Host userId matches
                    { "joiner.userId": req.user._id }, // Joiner userId matches
                  ],
                },
              ],
            },
            {
              $set: {
                status: "completed",
                completedAt: Date.now(),
                "winner.userId": match.joiner.userId,
                "looser.userId": match.host.userId,
                apiData: checkMS.data,
              },
            }
          );

          if (cm.modifiedCount > 0) {
            const joinerbet = await Transaction.findOne({
              txnId: match.joiner.txnId,
              userId: match.joiner.userId,
              txnCtg: "bet",
              txnType: "debit",
            });
            console.log("joinerbet", joinerbet);
            const txnid = await newTxnId();
            const NewTxn = {
              txnId: txnid,
              userId: match.joiner.userId,
              amount: match.prize,
              cash: joinerbet.cash,
              reward: match.prize - match.entryFee + Number(joinerbet.reward),
              bonus: joinerbet.bonus,
              remark: "Match Won",
              status: "completed",
              txnType: "credit",
              txnCtg: "reward",
              matchId: match._id,
            };
            console.log("NewTxn", NewTxn);
            await Transaction.create(NewTxn);
            await _log({
              matchId: match._id,
              message:
                req.user.fullName +
                "(" +
                req.user.mobileNumber +
                ") submited result as lost and game result is verified by api and results are updated automatically for both players",
            });

            const j = await User.findOne({ _id: match.joiner.userId });
            await _log({
              matchId: match._id,
              message:
                j.fullName +
                " (" +
                j.mobileNumber +
                ") get reward of ₹" +
                match.prize +
                " as winner (verified by api)",
            });
            await refBonusManager(match.joiner.userId, match);
            return res.json({
              success: true,
              message: "match_finished",
            });
          } else {
            await _log({
              matchId: match._id,
              message:
                "database or server is not responded, so some transactions was skipped.",
            });
          }
        }
      }
    }

    let result = {};
    if (match.host.userId == req.userId) {
      result["host.result"] = "lose";
      result["host.resultAt"] = Date.now();
    } else {
      //joiner is submitting win
      result["joiner.result"] = "lose";
      result["joiner.resultAt"] = Date.now();
    }

    const checkMatch = await ManualMatch.updateOne(
      {
        $and: [
          { status: "running", _id: match._id }, // Status must be "running"
          {
            $or: [
              { "host.userId": req.user._id }, // Host userId matches
              { "joiner.userId": req.user._id }, // Joiner userId matches
            ],
          },
        ],
      },
      {
        $set: result,
      }
    );

    if (checkMatch.modifiedCount > 0) {
      const checkConflict = await ManualMatch.findOne({
        _id: match._id,
      });

      await _log({
        matchId: match._id,
        message:
          req.user.fullName +
          " (" +
          req.user.mobileNumber +
          ") submitted result as looser",
      });

      if (
        checkConflict.host.result == "win" &&
        checkConflict.joiner.result == "win"
      ) {
        await ManualMatch.updateOne(
          {
            $and: [
              { status: "running", _id: match._id }, // Status must be "running"
              {
                $or: [
                  { "host.userId": req.user._id }, // Host userId matches
                  { "joiner.userId": req.user._id }, // Joiner userId matches
                ],
              },
            ],
          },
          {
            $set: {
              conflict: true,
            },
          }
        );

        await _log({
          matchId: match._id,
          message: "both players submitted win result, so conflict is created",
        });
      } else if (
        checkConflict.host.result == "lose" &&
        checkConflict.joiner.result == "lose"
      ) {
        await ManualMatch.updateOne(
          {
            $and: [
              { status: "running", _id: match._id }, // Status must be "running"
              {
                $or: [
                  { "host.userId": req.user._id }, // Host userId matches
                  { "joiner.userId": req.user._id }, // Joiner userId matches
                ],
              },
            ],
          },
          {
            $set: {
              status: "completed",
            },
          }
        );

        await _log({
          matchId: match._id,
          message:
            "both players submitted result as looser so , result is updated and match is marked as completed",
        });
      } else {
        if (
          checkConflict.host.result == "win" &&
          checkConflict.joiner.result == "lose"
        ) {
          //host is winner
          const cm = await ManualMatch.updateOne(
            {
              $and: [
                { status: "running", _id: match._id }, // Status must be "running"
                {
                  $or: [
                    { "host.userId": req.user._id }, // Host userId matches
                    { "joiner.userId": req.user._id }, // Joiner userId matches
                  ],
                },
              ],
            },
            {
              $set: {
                status: "completed",
                completedAt: Date.now(),
                "winner.userId": match.host.userId,
                "looser.userId": match.joiner.userId,
              },
            }
          );

          if (cm.modifiedCount > 0) {
            const hostbet = await Transaction.findOne({
              txnId: match.host.txnId,
              userId: match.host.userId,
              txnCtg: "bet",
              txnType: "debit",
            });
            console.log("hostbet", hostbet);

            const txnid = await newTxnId();
            const NewTxn = {
              txnId: txnid,
              userId: match.host.userId,
              amount: match.prize,
              cash: hostbet.cash,
              reward: match.prize - match.entryFee + Number(hostbet.reward),
              bonus: hostbet.bonus,
              remark: "Match Won",
              status: "completed",
              txnType: "credit",
              txnCtg: "reward",
              matchId: match._id,
            };
            console.log("NewTxn", NewTxn);

            await Transaction.create(NewTxn);
            const h = await User.findOne({ _id: match.host.userId });

            await _log({
              matchId: match._id,
              message:
                h.fullName +
                " (" +
                h.mobileNumber +
                ") is marked as winner and got reward of ₹" +
                match.prize +
                " in his wallet",
            });
            await refBonusManager(match.host.userId, match);
            return res.json({
              success: true,
              message: "match_finished",
            });
          } else {
            await _log({
              matchId: match._id,
              message:
                "database or server is not responded, so some transactions was skipped.",
            });
          }
        } else if (
          checkConflict.host.result == "lose" &&
          checkConflict.joiner.result == "win"
        ) {
          //joiner is winner
          const cm = await ManualMatch.updateOne(
            {
              $and: [
                { status: "running", _id: match._id }, // Status must be "running"
                {
                  $or: [
                    { "host.userId": req.user._id }, // Host userId matches
                    { "joiner.userId": req.user._id }, // Joiner userId matches
                  ],
                },
              ],
            },
            {
              $set: {
                status: "completed",
                completedAt: Date.now(),
                "winner.userId": match.joiner.userId,
                "looser.userId": match.host.userId,
              },
            }
          );

          if (cm.modifiedCount > 0) {
            const joinerbet = await Transaction.findOne({
              txnId: match.joiner.txnId,
              userId: match.joiner.userId,
              txnCtg: "bet",
              txnType: "debit",
            });
            console.log("joinerbet", joinerbet);
            const txnid = await newTxnId();
            const NewTxn = {
              txnId: txnid,
              userId: match.joiner.userId,
              amount: match.prize,
              cash: joinerbet.cash,
              reward: match.prize - match.entryFee + Number(joinerbet.reward),
              bonus: joinerbet.bonus,
              remark: "Match Won",
              status: "completed",
              txnType: "credit",
              txnCtg: "reward",
              matchId: match._id,
            };
            console.log("NewTxn", NewTxn);
            await Transaction.create(NewTxn);
            const j = await User.findOne({ _id: match.host.userId });

            await _log({
              matchId: match._id,
              message:
                j.fullName +
                " (" +
                j.mobileNumber +
                ") is marked as winner and got reward of ₹" +
                match.prize +
                " in his wallet",
            });
            await refBonusManager(match.joiner.userId, match);
            return res.json({
              success: true,
              message: "match_finished",
            });
          } else {
            await _log({
              matchId: match._id,
              message:
                "database or server is not responded, so some transactions was skipped.",
            });
          }
        }
      }
    }

    return res.json({
      success: true,
      message: "result_submitted",
    });
  } catch (error) {
    ////console.log("createMatch", error);
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export const refBonusManager = async (winnerId, match) => {
  try {
    const config = await _config();
    const winner = await User.findOne({ _id: winnerId });
    if (!winner) return;

    if (!winner.referBy) return;

    const level1_ref = await User.findOne({ referralCode: winner.referBy });
    if (!level1_ref) return;

    if (config.REFERRAL_LEVEL1 > 0) {
      const txnid_l1 = await newTxnId();
      const amount_l1 = match.entryFee * config.REFERRAL_LEVEL1;
      const newTxn_l1 = {
        txnId: txnid_l1,
        userId: level1_ref._id,
        amount: amount_l1.toFixed(2),
        cash: 0,
        reward: 0,
        bonus: amount_l1.toFixed(2),
        remark: "Referral Bonus / L1",
        status: "completed",
        txnType: "credit",
        txnCtg: "referral",
        matchId: match._id,
      };

      await Transaction.create(newTxn_l1);

      await _log({
        matchId: match._id,
        message:
          level1_ref.fullName +
          " (" +
          level1_ref.mobileNumber +
          ") got level 1 referral bonus of ₹" +
          amount_l1.toFixed(2),
      });
    }

    if (!level1_ref.referBy) return;

    const level2_ref = await User.findOne({ referralCode: level1_ref.referBy });
    if (!level1_ref) return;

    if (config.REFERRAL_LEVEL2 > 0) {
      const txnid_l2 = await newTxnId();
      const amount_l2 = match.entryFee * config.REFERRAL_LEVEL2;
      const newTxn_l2 = {
        txnId: txnid_l2,
        userId: level2_ref._id,
        amount: amount_l2.toFixed(2),
        cash: 0,
        reward: 0,
        bonus: amount_l2.toFixed(2),
        remark: "Referral Bonus / L2",
        status: "completed",
        txnType: "credit",
        txnCtg: "referral",
        matchId: match._id,
      };

      await Transaction.create(newTxn_l2);
      await _log({
        matchId: match._id,
        message:
          level2_ref.fullName +
          " (" +
          level2_ref.mobileNumber +
          ") get level 2 referral bonus of ₹" +
          amount_l2.toFixed(2),
      });
    }
  } catch (error) {
    ////console.log("createMatch", error);
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

let sixDigitCounter = 0;
export const generateMatchId = () => {
  sixDigitCounter = (sixDigitCounter + 1) % 1000; // counter cycles 0-999
  const timestampPart = Date.now() % 1000000; // last 6 digits of timestamp
  // Combine timestamp and counter, then take last 6 digits
  const raw = `${timestampPart}${sixDigitCounter.toString().padStart(3, "0")}`;
  return raw.slice(-6); // always returns a 6-digit string
};

export const playClassicOnline = async (req, res) => {
  try {
    const userBalance = await balance(req);
    const amount = req.body.amount;
    const isAMR = await isAnyMatchRunning(req);
    if (isAMR) {
      return res.json({
        success: false,
        message: "already_in_match",
      });
    }

    if (!validAmount(amount)) {
      return res.json({
        success: false,
        message: "invalid_amount_msg",
      });
    }

    if (amount > userBalance.balance) {
      return res.json({
        success: false,
        message: "less_balance_msg",
      });
    }

    const game = await Game.findOne({ game: "classicOnline" });

    if (!game) {
      return res.json({
        success: false,
        message: "game_not_found",
      });
    }

    if (game.status != "live") {
      return res.json({
        success: false,
        message: "not_active_game",
      });
    }

    const openmatch = await OnlineGame.findOne({
      status: "waiting",
      entryFee: amount,
      "green.userId": null,
    });

    if (openmatch) {
      if (openmatch.blue.userId == req.userId) {
        return res.json({
          success: false,
          message: "please do not click multiple times on play button",
        });
      }

      // Prepare transaction for joiner before joining the match
      const joinerBalance = await ubalance(req.user);
      let neededMoney = openmatch.entryFee;
      const newTxnjoiner = {
        txnId: await newTxnId(),
        userId: req.user._id,
        amount: openmatch.entryFee,
        cash: 0,
        reward: 0,
        bonus: 0,
        remark: "Match Joined",
        status: "completed",
        txnType: "debit",
        txnCtg: "bet",
        matchId: openmatch._id,
      };

      // Deduct from Cash Wallet
      if (neededMoney > 0) {
        newTxnjoiner.cash = Math.min(neededMoney, joinerBalance.cash);
        neededMoney -= newTxnjoiner.cash;
      }
      // Deduct from Bonus Wallet
      if (neededMoney > 0) {
        newTxnjoiner.bonus = Math.min(neededMoney, joinerBalance.bonus);
        neededMoney -= newTxnjoiner.bonus;
      }
      // Deduct from Reward Wallet
      if (neededMoney > 0) {
        newTxnjoiner.reward = Math.min(neededMoney, joinerBalance.reward);
        neededMoney -= newTxnjoiner.reward;
      }

      // Check if transaction already exists
      const txnExists = await Transaction.exists({
        userId: req.user._id,
        matchId: openmatch._id,
        txnCtg: "bet",
        txnType: "debit",
        status: "completed",
      });
      if (txnExists) {
        return res.json({
          success: false,
          message: "transaction_already_created",
        });
      }

      // Create transaction first
      const joinerTxn = await Transaction.create(newTxnjoiner);
      if (!joinerTxn) {
        return res.json({
          success: false,
          message: "transaction_failed",
        });
      }

      // Now join the match
      const test = await OnlineGame.updateOne(
        { _id: openmatch._id, status: "waiting", "green.userId": null },
        {
          $set: {
            status: "running",
            "green.userId": req.user._id,
            startedAt: new Date(),
          },
        }
      );

      if (test.modifiedCount === 0) {
        // Rollback transaction if match join fails (optional: implement refund logic)
        await Transaction.deleteOne({ _id: joinerTxn._id });
        return res.json({
          success: false,
          message: "match_join_failed",
        });
      }

      // Clean up waiting matches for both users
      await OnlineGame.deleteMany({
        $and: [
          { _id: { $ne: openmatch._id } },
          { status: "waiting" },
          {
            $or: [
              { "blue.userId": openmatch.blue.userId },
              { "blue.userId": req.user._id },
            ],
          },
        ],
      });

      await OnlineGame2.deleteMany({
        $and: [
          { _id: { $ne: openmatch._id } },
          { status: "waiting" },
          {
            $or: [
              { "blue.userId": openmatch.blue.userId },
              { "blue.userId": req.user._id },
            ],
          },
        ],
      });

      await SpeedLudo.deleteMany({
        $and: [
          { _id: { $ne: openmatch._id } },
          { status: "waiting" },
          {
            $or: [
              { "blue.userId": openmatch.blue.userId },
              { "blue.userId": req.user._id },
            ],
          },
        ],
      });

      await QuickLudo.deleteMany({
        $and: [
          { _id: { $ne: openmatch._id } },
          { status: "waiting" },
          {
            $or: [
              { "blue.userId": openmatch.blue.userId },
              { "blue.userId": req.user._id },
            ],
          },
        ],
      });

      await _log({
        matchId: openmatch._id,
        message:
          req.user.fullName + "(" + req.user.mobileNumber + ") joined match",
      });

      // Host transaction (if not already created)
      const match = await OnlineGame.findOne({
        _id: openmatch._id,
        status: "running",
      });
      const host = await User.findOne({ _id: match.blue.userId });
      const hostBalance = await ubalance(host);

      const hostTxnExists = await Transaction.exists({
        userId: host._id,
        matchId: openmatch._id,
        txnCtg: "bet",
        txnType: "debit",
        status: "completed",
      });
      if (!hostTxnExists) {
        let neededMoneyHost = match.entryFee;
        const newTxnhost = {
          txnId: await newTxnId(),
          userId: host._id,
          amount: match.entryFee,
          cash: 0,
          reward: 0,
          bonus: 0,
          remark: "Match Joined",
          status: "completed",
          txnType: "debit",
          txnCtg: "bet",
          matchId: openmatch._id,
        };
        if (neededMoneyHost > 0) {
          newTxnhost.cash = Math.min(neededMoneyHost, hostBalance.cash);
          neededMoneyHost -= newTxnhost.cash;
        }
        if (neededMoneyHost > 0) {
          newTxnhost.bonus = Math.min(neededMoneyHost, hostBalance.bonus);
          neededMoneyHost -= newTxnhost.bonus;
        }
        if (neededMoneyHost > 0) {
          newTxnhost.reward = Math.min(neededMoneyHost, hostBalance.reward);
          neededMoneyHost -= newTxnhost.reward;
        }
        await Transaction.create(newTxnhost);
      }

      await _log({
        matchId: openmatch._id,
        message:
          "₹" +
          openmatch.entryFee +
          " is deducted from both users wallet and match is started",
      });

      return res.json({
        success: true,
      });
    } else {
      const newMatch = {
        matchId: "CLASSIC" + generateMatchId(),
        type: "online",
        blue: {
          userId: req.user._id,
        },
        entryFee: amount,
        prize: await getPrize(amount, "online"),
        roomCode: generateUniqueRoomCode(),
      };
      const m = await OnlineGame.create(newMatch);

      await _log({
        matchId: m._id,
        message:
          req.user.fullName +
          "(" +
          req.user.mobileNumber +
          ") requested to play match",
      });
      return res.json({
        success: true,
        data: openmatch,
      });
    }
  } catch (error) {
    ////console.log("createMatch", error);
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export const playClassicOnline2 = async (req, res) => {
  try {
    const userBalance = await balance(req);
    const amount = req.body.amount;
    const isAMR = await isAnyMatchRunning(req);
    if (isAMR) {
      return res.json({
        success: false,
        message: "already_in_match",
      });
    }

    if (!validAmount(amount)) {
      return res.json({
        success: false,
        message: "invalid_amount_msg",
      });
    }

    if (amount > userBalance.balance) {
      return res.json({
        success: false,
        message: "less_balance_msg",
      });
    }

    const game = await Game.findOne({ game: "classic1Token" });

    if (!game) {
      return res.json({
        success: false,
        message: "game_not_found",
      });
    }

    if (game.status != "live") {
      return res.json({
        success: false,
        message: "not_active_game",
      });
    }

    const openmatch = await OnlineGame2.findOne({
      status: "waiting",
      entryFee: amount,
      "green.userId": null,
    });

    if (openmatch) {
      if (openmatch.blue.userId == req.userId) {
        return res.json({
          success: false,
          message: "please do not click multiple times on play button",
        });
      }

      // Prepare transaction for joiner before joining the match
      const joinerBalance = await ubalance(req.user);
      let neededMoney = openmatch.entryFee;
      const newTxnjoiner = {
        txnId: await newTxnId(),
        userId: req.user._id,
        amount: openmatch.entryFee,
        cash: 0,
        reward: 0,
        bonus: 0,
        remark: "Match Joined",
        status: "completed",
        txnType: "debit",
        txnCtg: "bet",
        matchId: openmatch._id,
      };

      // Deduct from Cash Wallet
      if (neededMoney > 0) {
        newTxnjoiner.cash = Math.min(neededMoney, joinerBalance.cash);
        neededMoney -= newTxnjoiner.cash;
      }
      // Deduct from Bonus Wallet
      if (neededMoney > 0) {
        newTxnjoiner.bonus = Math.min(neededMoney, joinerBalance.bonus);
        neededMoney -= newTxnjoiner.bonus;
      }
      // Deduct from Reward Wallet
      if (neededMoney > 0) {
        newTxnjoiner.reward = Math.min(neededMoney, joinerBalance.reward);
        neededMoney -= newTxnjoiner.reward;
      }

      // Check if transaction already exists
      const txnExists = await Transaction.exists({
        userId: req.user._id,
        matchId: openmatch._id,
        txnCtg: "bet",
        txnType: "debit",
        status: "completed",
      });
      if (txnExists) {
        return res.json({
          success: false,
          message: "transaction_already_created",
        });
      }

      // Create transaction first
      const joinerTxn = await Transaction.create(newTxnjoiner);
      if (!joinerTxn) {
        return res.json({
          success: false,
          message: "transaction_failed",
        });
      }

      // Now join the match
      const test = await OnlineGame2.updateOne(
        { _id: openmatch._id, status: "waiting", "green.userId": null },
        {
          $set: {
            status: "running",
            "green.userId": req.user._id,
            startedAt: new Date(),
          },
        }
      );

      if (test.modifiedCount === 0) {
        // Rollback transaction if match join fails (optional: implement refund logic)
        await Transaction.deleteOne({ _id: joinerTxn._id });
        return res.json({
          success: false,
          message: "match_join_failed",
        });
      }

      // Clean up waiting matches for both users
      await OnlineGame2.deleteMany({
        $and: [
          { _id: { $ne: openmatch._id } },
          { status: "waiting" },
          {
            $or: [
              { "blue.userId": openmatch.blue.userId },
              { "blue.userId": req.user._id },
            ],
          },
        ],
      });

      await OnlineGame.deleteMany({
        $and: [
          { _id: { $ne: openmatch._id } },
          { status: "waiting" },
          {
            $or: [
              { "blue.userId": openmatch.blue.userId },
              { "blue.userId": req.user._id },
            ],
          },
        ],
      });

      await OnlineGame2.deleteMany({
        $and: [
          { _id: { $ne: openmatch._id } },
          { status: "waiting" },
          {
            $or: [
              { "blue.userId": openmatch.blue.userId },
              { "blue.userId": req.user._id },
            ],
          },
        ],
      });

      await SpeedLudo.deleteMany({
        $and: [
          { _id: { $ne: openmatch._id } },
          { status: "waiting" },
          {
            $or: [
              { "blue.userId": openmatch.blue.userId },
              { "blue.userId": req.user._id },
            ],
          },
        ],
      });

      await QuickLudo.deleteMany({
        $and: [
          { _id: { $ne: openmatch._id } },
          { status: "waiting" },
          {
            $or: [
              { "blue.userId": openmatch.blue.userId },
              { "blue.userId": req.user._id },
            ],
          },
        ],
      });

      await _log({
        matchId: openmatch._id,
        message:
          req.user.fullName + "(" + req.user.mobileNumber + ") joined match",
      });

      // Host transaction (if not already created)
      const match = await OnlineGame2.findOne({
        _id: openmatch._id,
        status: "running",
      });
      const host = await User.findOne({ _id: match.blue.userId });
      const hostBalance = await ubalance(host);

      const hostTxnExists = await Transaction.exists({
        userId: host._id,
        matchId: openmatch._id,
        txnCtg: "bet",
        txnType: "debit",
        status: "completed",
      });
      if (!hostTxnExists) {
        let neededMoneyHost = match.entryFee;
        const newTxnhost = {
          txnId: await newTxnId(),
          userId: host._id,
          amount: match.entryFee,
          cash: 0,
          reward: 0,
          bonus: 0,
          remark: "Match Joined",
          status: "completed",
          txnType: "debit",
          txnCtg: "bet",
          matchId: openmatch._id,
        };
        if (neededMoneyHost > 0) {
          newTxnhost.cash = Math.min(neededMoneyHost, hostBalance.cash);
          neededMoneyHost -= newTxnhost.cash;
        }
        if (neededMoneyHost > 0) {
          newTxnhost.bonus = Math.min(neededMoneyHost, hostBalance.bonus);
          neededMoneyHost -= newTxnhost.bonus;
        }
        if (neededMoneyHost > 0) {
          newTxnhost.reward = Math.min(neededMoneyHost, hostBalance.reward);
          neededMoneyHost -= newTxnhost.reward;
        }
        await Transaction.create(newTxnhost);
      }

      await _log({
        matchId: openmatch._id,
        message:
          "₹" +
          openmatch.entryFee +
          " is deducted from both users wallet and match is started",
      });

      return res.json({
        success: true,
      });
    } else {
      const newMatch = {
        matchId: "CLASSIC" + generateMatchId(),
        type: "online",
        blue: {
          userId: req.user._id,
        },
        entryFee: amount,
        prize: await getPrize(amount, "online"),
        roomCode: generateUniqueRoomCode(),
      };
      const m = await OnlineGame2.create(newMatch);

      await _log({
        matchId: m._id,
        message:
          req.user.fullName +
          "(" +
          req.user.mobileNumber +
          ") requested to play match",
      });
      return res.json({
        success: true,
        data: openmatch,
      });
    }
  } catch (error) {
    ////console.log("createMatch", error);
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export const isAnyMatchRunning = async (req) => {
  const runningmatch = await ManualMatch.findOne({
    status: "running",
    $or: [
      {
        "host.userId": req.user._id,
        "host.result": null,
      },
      {
        "joiner.userId": req.user._id,
        "joiner.result": null,
      },
    ],
  }).sort({ createdAt: -1 });

  const runningmatch2 = await OnlineGame.findOne({
    $and: [
      { status: "running" }, // Exclude the current matchId
      {
        $or: [
          { "blue.userId": req.user._id }, // Condition 1: Host userId matches
          { "green.userId": req.user._id },
          // Condition 2: Joiner userId matches
        ],
      },
    ],
  }).sort({ createdAt: -1 });

  const runningmatch5 = await OnlineGame2.findOne({
    $and: [
      { status: "running" }, // Exclude the current matchId
      {
        $or: [
          { "blue.userId": req.user._id }, // Condition 1: Host userId matches
          { "green.userId": req.user._id },
          // Condition 2: Joiner userId matches
        ],
      },
    ],
  }).sort({ createdAt: -1 });

  const runningmatch3 = await SpeedLudo.findOne({
    $and: [
      { status: "running" }, // Exclude the current matchId
      {
        $or: [
          { "blue.userId": req.user._id }, // Condition 1: Host userId matches
          { "green.userId": req.user._id },
          // Condition 2: Joiner userId matches
        ],
      },
    ],
  }).sort({ createdAt: -1 });

  const runningmatch4 = await QuickLudo.findOne({
    $and: [
      { status: "running" }, // Exclude the current matchId
      {
        $or: [
          { "blue.userId": req.user._id }, // Condition 1: Host userId matches
          { "green.userId": req.user._id },
          // Condition 2: Joiner userId matches
        ],
      },
    ],
  }).sort({ createdAt: -1 });

  if (
    runningmatch ||
    runningmatch2 ||
    runningmatch3 ||
    runningmatch4 ||
    runningmatch5
  ) {
    return true;
  } else {
    return false;
  }
};
export const isAnyMatchRunningOrOpen = async (req) => {
  const runningmatch = await ManualMatch.findOne({
    status: { $in: ["running", "open"] }, // Corrected status condition
    $or: [
      { "host.userId": req.user._id }, // Host userId matches
      { "joiner.userId": req.user._id }, // Joiner userId matches
    ],
  }).sort({ createdAt: -1 });

  const runningmatch2 = await OnlineGame.findOne({
    status: { $in: ["running", "waiting"] }, // Corrected status condition
    $or: [
      { "blue.userId": req.user._id }, // Blue userId matches
      { "green.userId": req.user._id }, // Green userId matches
    ],
  }).sort({ createdAt: -1 });

  const runningmatch3 = await SpeedLudo.findOne({
    status: { $in: ["running", "waiting"] }, // Corrected status condition
    $or: [
      { "blue.userId": req.user._id }, // Blue userId matches
      { "green.userId": req.user._id }, // Green userId matches
    ],
  }).sort({ createdAt: -1 });

  const runningmatch4 = await QuickLudo.findOne({
    status: { $in: ["running", "waiting"] }, // Corrected status condition
    $or: [
      { "blue.userId": req.user._id }, // Blue userId matches
      { "green.userId": req.user._id }, // Green userId matches
    ],
  }).sort({ createdAt: -1 });

  return !!(runningmatch || runningmatch2 || runningmatch3 || runningmatch4);
};

export const playSpeedLudo = async (req, res) => {
  try {
    const userBalance = await balance(req);
    const amount = req.body.amount;
    const { lite = false } = req.body;

    const isAMR = await isAnyMatchRunning(req);
    if (isAMR) {
      return res.json({
        success: false,
        message: "already_in_match",
      });
    }

    if (!validAmount(amount)) {
      return res.json({
        success: false,
        message: "invalid_amount_msg",
      });
    }

    if (amount > userBalance.balance) {
      return res.json({
        success: false,
        message: "less_balance_msg",
      });
    }

    const game = await Game.findOne({ game: "speedOnline" });

    if (!game) {
      return res.json({
        success: false,
        message: "game_not_found",
      });
    }

    if (game.status != "live") {
      return res.json({
        success: false,
        message: "not_active_game",
      });
    }

    let duration = game.duration;
    if (lite) duration = game.durationLite;

    const openmatch = await SpeedLudo.findOne({
      status: "waiting",
      entryFee: amount,
      duration: duration,
      "green.userId": null,
    });

    if (openmatch) {
      if (openmatch.blue.userId == req.userId) {
        return res.json({
          success: false,
          message: "please do not click multiple times on play button",
        });
      }

      // Prepare transaction for joiner before joining the match
      const joinerBalance = await ubalance(req.user);
      let neededMoney = openmatch.entryFee;
      const newTxnjoiner = {
        txnId: await newTxnId(),
        userId: req.user._id,
        amount: openmatch.entryFee,
        cash: 0,
        reward: 0,
        bonus: 0,
        remark: "Match Joined",
        status: "completed",
        txnType: "debit",
        txnCtg: "bet",
        matchId: openmatch._id,
      };

      if (neededMoney > 0) {
        newTxnjoiner.cash = Math.min(neededMoney, joinerBalance.cash);
        neededMoney -= newTxnjoiner.cash;
      }
      if (neededMoney > 0) {
        newTxnjoiner.bonus = Math.min(neededMoney, joinerBalance.bonus);
        neededMoney -= newTxnjoiner.bonus;
      }
      if (neededMoney > 0) {
        newTxnjoiner.reward = Math.min(neededMoney, joinerBalance.reward);
        neededMoney -= newTxnjoiner.reward;
      }

      const txnExists = await Transaction.exists({
        userId: req.user._id,
        matchId: openmatch._id,
        txnCtg: "bet",
        txnType: "debit",
        status: "completed",
      });
      if (txnExists) {
        return res.json({
          success: false,
          message: "transaction_already_created",
        });
      }

      // Create transaction first
      const joinerTxn = await Transaction.create(newTxnjoiner);
      if (!joinerTxn) {
        return res.json({
          success: false,
          message: "transaction_failed",
        });
      }

      // Now join the match
      const test = await SpeedLudo.updateOne(
        { _id: openmatch._id, status: "waiting", "green.userId": null },
        {
          $set: {
            status: "running",
            "green.userId": req.user._id,
            startedAt: new Date(),
          },
        }
      );

      if (test.modifiedCount === 0) {
        // Rollback transaction if match join fails
        await Transaction.deleteOne({ _id: joinerTxn._id });
        return res.json({
          success: false,
          message: "match_join_failed",
        });
      }

      // Clean up waiting matches for both users
      await SpeedLudo.deleteMany({
        $and: [
          { _id: { $ne: openmatch._id } },
          { status: "waiting" },
          {
            $or: [
              { "blue.userId": openmatch.blue.userId },
              { "blue.userId": req.user._id },
            ],
          },
        ],
      });

      await OnlineGame.deleteMany({
        $and: [
          { status: "waiting" },
          {
            $or: [
              { "blue.userId": openmatch.blue.userId },
              { "blue.userId": req.user._id },
            ],
          },
        ],
      });

      await OnlineGame2.deleteMany({
        $and: [
          { _id: { $ne: openmatch._id } },
          { status: "waiting" },
          {
            $or: [
              { "blue.userId": openmatch.blue.userId },
              { "blue.userId": req.user._id },
            ],
          },
        ],
      });

      await QuickLudo.deleteMany({
        $and: [
          { status: "waiting" },
          {
            $or: [
              { "blue.userId": openmatch.blue.userId },
              { "blue.userId": req.user._id },
            ],
          },
        ],
      });

      await _log({
        matchId: openmatch._id,
        message:
          req.user.fullName + "(" + req.user.mobileNumber + ") joined match",
      });

      // Host transaction (if not already created)
      const match = await SpeedLudo.findOne({
        _id: openmatch._id,
        status: "running",
      });
      const host = await User.findOne({ _id: match.blue.userId });
      const hostBalance = await ubalance(host);

      const hostTxnExists = await Transaction.exists({
        userId: host._id,
        matchId: openmatch._id,
        txnCtg: "bet",
        txnType: "debit",
        status: "completed",
      });
      if (!hostTxnExists) {
        let neededMoneyHost = match.entryFee;
        const newTxnhost = {
          txnId: await newTxnId(),
          userId: host._id,
          amount: match.entryFee,
          cash: 0,
          reward: 0,
          bonus: 0,
          remark: "Match Joined",
          status: "completed",
          txnType: "debit",
          txnCtg: "bet",
          matchId: openmatch._id,
        };
        if (neededMoneyHost > 0) {
          newTxnhost.cash = Math.min(neededMoneyHost, hostBalance.cash);
          neededMoneyHost -= newTxnhost.cash;
        }
        if (neededMoneyHost > 0) {
          newTxnhost.bonus = Math.min(neededMoneyHost, hostBalance.bonus);
          neededMoneyHost -= newTxnhost.bonus;
        }
        if (neededMoneyHost > 0) {
          newTxnhost.reward = Math.min(neededMoneyHost, hostBalance.reward);
          neededMoneyHost -= newTxnhost.reward;
        }
        await Transaction.create(newTxnhost);
      }

      await _log({
        matchId: openmatch._id,
        message:
          "₹" +
          openmatch.entryFee +
          " is deducted from both users wallet and match is started",
      });

      return res.json({
        success: true,
      });
    } else {
      const newMatch = {
        matchId: "SPEED" + generateMatchId(),
        type: "speedludo",
        duration: duration,
        blue: {
          userId: req.user._id,
        },
        entryFee: amount,
        prize: await getPrize(amount, "speed"),
        roomCode: generateUniqueRoomCode(),
      };
      const m = await SpeedLudo.create(newMatch);

      await _log({
        matchId: m._id,
        message:
          req.user.fullName +
          "(" +
          req.user.mobileNumber +
          ") requested to play match",
      });
      return res.json({
        success: true,
        data: openmatch,
      });
    }
  } catch (error) {
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export const playQuickLudo = async (req, res) => {
  try {
    const userBalance = await balance(req);
    const amount = req.body.amount;

    const isAMR = await isAnyMatchRunning(req);
    if (isAMR) {
      return res.json({
        success: false,
        message: "already_in_match",
      });
    }

    if (!validAmount(amount)) {
      return res.json({
        success: false,
        message: "invalid_amount_msg",
      });
    }

    if (amount > userBalance.balance) {
      return res.json({
        success: false,
        message: "less_balance_msg",
      });
    }

    const game = await Game.findOne({ game: "quickOnline" });

    if (!game) {
      return res.json({
        success: false,
        message: "game_not_found",
      });
    }

    if (game.status != "live") {
      return res.json({
        success: false,
        message: "not_active_game",
      });
    }

    const openmatch = await QuickLudo.findOne({
      status: "waiting",
      entryFee: amount,
      "green.userId": null,
    });

    if (openmatch) {
      if (openmatch.blue.userId == req.userId) {
        return res.json({
          success: false,
          message: "please do not click multiple times on play button",
        });
      }

      // Prepare transaction for joiner before joining the match
      const joinerBalance = await ubalance(req.user);
      let neededMoney = openmatch.entryFee;
      const newTxnjoiner = {
        txnId: await newTxnId(),
        userId: req.user._id,
        amount: openmatch.entryFee,
        cash: 0,
        reward: 0,
        bonus: 0,
        remark: "Match Joined",
        status: "completed",
        txnType: "debit",
        txnCtg: "bet",
        matchId: openmatch._id,
      };

      // Deduct from Cash Wallet
      if (neededMoney > 0) {
        newTxnjoiner.cash = Math.min(neededMoney, joinerBalance.cash);
        neededMoney -= newTxnjoiner.cash;
      }
      // Deduct from Bonus Wallet
      if (neededMoney > 0) {
        newTxnjoiner.bonus = Math.min(neededMoney, joinerBalance.bonus);
        neededMoney -= newTxnjoiner.bonus;
      }
      // Deduct from Reward Wallet
      if (neededMoney > 0) {
        newTxnjoiner.reward = Math.min(neededMoney, joinerBalance.reward);
        neededMoney -= newTxnjoiner.reward;
      }

      // Check if transaction already exists
      const txnExists = await Transaction.exists({
        userId: req.user._id,
        matchId: openmatch._id,
        txnCtg: "bet",
        txnType: "debit",
        status: "completed",
      });
      if (txnExists) {
        return res.json({
          success: false,
          message: "transaction_already_created",
        });
      }

      // Create transaction first
      const joinerTxn = await Transaction.create(newTxnjoiner);
      if (!joinerTxn) {
        return res.json({
          success: false,
          message: "transaction_failed",
        });
      }

      // Now join the match
      const test = await QuickLudo.updateOne(
        { _id: openmatch._id, status: "waiting", "green.userId": null },
        {
          $set: {
            status: "running",
            "green.userId": req.user._id,
            startedAt: new Date(),
          },
        }
      );

      if (test.modifiedCount === 0) {
        // Rollback transaction if match join fails
        await Transaction.deleteOne({ _id: joinerTxn._id });
        return res.json({
          success: false,
          message: "match_join_failed",
        });
      }

      // Clean up waiting matches for both users
      await QuickLudo.deleteMany({
        $and: [
          { _id: { $ne: openmatch._id } },
          { status: "waiting" },
          {
            $or: [
              { "blue.userId": openmatch.blue.userId },
              { "blue.userId": req.user._id },
            ],
          },
        ],
      });

      await OnlineGame.deleteMany({
        $and: [
          { status: "waiting" },
          {
            $or: [
              { "blue.userId": openmatch.blue.userId },
              { "blue.userId": req.user._id },
            ],
          },
        ],
      });

      await OnlineGame2.deleteMany({
        $and: [
          { _id: { $ne: openmatch._id } },
          { status: "waiting" },
          {
            $or: [
              { "blue.userId": openmatch.blue.userId },
              { "blue.userId": req.user._id },
            ],
          },
        ],
      });

      await SpeedLudo.deleteMany({
        $and: [
          { status: "waiting" },
          {
            $or: [
              { "blue.userId": openmatch.blue.userId },
              { "blue.userId": req.user._id },
            ],
          },
        ],
      });

      await _log({
        matchId: openmatch._id,
        message:
          req.user.fullName + "(" + req.user.mobileNumber + ") joined match",
      });

      // Host transaction (if not already created)
      const match = await QuickLudo.findOne({
        _id: openmatch._id,
        status: "running",
      });
      const host = await User.findOne({ _id: match.blue.userId });
      const hostBalance = await ubalance(host);

      const hostTxnExists = await Transaction.exists({
        userId: host._id,
        matchId: openmatch._id,
        txnCtg: "bet",
        txnType: "debit",
        status: "completed",
      });
      if (!hostTxnExists) {
        let neededMoneyHost = match.entryFee;
        const newTxnhost = {
          txnId: await newTxnId(),
          userId: host._id,
          amount: match.entryFee,
          cash: 0,
          reward: 0,
          bonus: 0,
          remark: "Match Joined",
          status: "completed",
          txnType: "debit",
          txnCtg: "bet",
          matchId: openmatch._id,
        };
        if (neededMoneyHost > 0) {
          newTxnhost.cash = Math.min(neededMoneyHost, hostBalance.cash);
          neededMoneyHost -= newTxnhost.cash;
        }
        if (neededMoneyHost > 0) {
          newTxnhost.bonus = Math.min(neededMoneyHost, hostBalance.bonus);
          neededMoneyHost -= newTxnhost.bonus;
        }
        if (neededMoneyHost > 0) {
          newTxnhost.reward = Math.min(neededMoneyHost, hostBalance.reward);
          neededMoneyHost -= newTxnhost.reward;
        }
        await Transaction.create(newTxnhost);
      }

      await _log({
        matchId: openmatch._id,
        message:
          "₹" +
          openmatch.entryFee +
          " is deducted from both users wallet and match is started",
      });

      return res.json({
        success: true,
      });
    } else {
      const newMatch = {
        matchId: "QUICK" + generateMatchId(),
        type: "quickludo",
        moves: game.moves,
        blue: {
          userId: req.user._id,
        },
        entryFee: amount,
        prize: await getPrize(amount, "quick"),
        roomCode: generateUniqueRoomCode(),
      };
      const m = await QuickLudo.create(newMatch);

      await _log({
        matchId: m._id,
        message:
          req.user.fullName +
          "(" +
          req.user.mobileNumber +
          ") requested to play match",
      });
      return res.json({
        success: true,
        data: openmatch,
      });
    }
  } catch (error) {
    ////console.log("createMatch", error);
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

let counter = 0;

export const generateUniqueRoomCode = () => {
  counter = (counter + 1) % 1000; // small counter to avoid collisions
  const timestampPart = Date.now() % 1e6; // last 6 digits of timestamp
  return `0${String(timestampPart).padStart(6, "0")}${String(counter).padStart(
    3,
    "0"
  )}`;
};


async function processTransaction(userId, entryFee, openmatch) {
  if (!userId) return null; // Skip if no user in this slot

  const user = await User.findOne({ _id: userId });
  if (!user) return null; // Skip if user not found

  const userBalance = await ubalance(user);

  let neededMoney = entryFee;
  let transaction = {
    txnId: await newTxnId(),
    userId: user._id,
    amount: entryFee,
    cash: 0,
    reward: 0,
    bonus: 0,
    remark: "Match Joined",
    status: "completed",
    txnType: "debit",
    txnCtg: "bet",
    matchId: openmatch._id,
  };

  // Deduct from Cash Wallet
  if (neededMoney > 0) {
    transaction.cash = Math.min(neededMoney, userBalance.cash);
    neededMoney -= transaction.cash;
  }

  // Deduct from Bonus Wallet
  if (neededMoney > 0) {
    transaction.bonus = Math.min(neededMoney, userBalance.bonus);
    neededMoney -= transaction.bonus;
  }

  // Deduct from Reward Wallet
  if (neededMoney > 0) {
    transaction.reward = Math.min(neededMoney, userBalance.reward);
    neededMoney -= transaction.reward;
  }

  return Transaction.create(transaction);
}

export const cancelSpeedLudo = async (req, res) => {
  try {
    const game = await Game.findOne({ game: "speedOnline" });

    let duration = game.duration;
    if (req?.body?.lite) {
      duration = game.durationLite;
    }

    console.log(duration);

    const match = await SpeedLudo.findOne({
      entryFee: req.body.amount,
      status: "waiting",
      "blue.userId": req.user._id,
      duration: duration,
    });

    await SpeedLudo.deleteOne(
      { _id: match._id, status: "waiting", "blue.userId": req.user._id } // Filter by user ID
    );

    if (!match) {
      return res.json({
        success: false,
        message: "cancel_match_not_possible",
      });
    }

    return res.json({
      success: true,
    });
  } catch (error) {
    ////console.log("createMatch", error);
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export const cancelQuickLudo = async (req, res) => {
  try {
    const match = await QuickLudo.findOne({
      entryFee: req.body.amount,
      status: "waiting",
      "blue.userId": req.user._id,
    });

    await QuickLudo.deleteOne(
      { _id: match._id, status: "waiting", "blue.userId": req.user._id } // Filter by user ID
    );

    if (!match) {
      return res.json({
        success: false,
        message: "cancel_match_not_possible",
      });
    }

    return res.json({
      success: true,
    });
  } catch (error) {
    ////console.log("createMatch", error);
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

