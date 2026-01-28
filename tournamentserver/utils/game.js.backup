import { SpeedLudo } from "../../backend/models/speedludo.js";
import User from "../../backend/models/user.model.js";
import jwt from "jsonwebtoken";
import { rooms } from "../game/datastore.js";

import { Transaction } from "../../backend/models/transaction.models.js";

import Log from "../../backend/models/log.model.js";
import { Config } from "../../backend/models/config.model.js";
import { QuickLudo } from "../../backend/models/quickludo.js";

export const _config = async () => {
  const config = await Config.find().lean();
  const _setting = config[0];

  _setting.DEMO = false;
  _setting.DEMO_MSG =
    "you are not allowed, to perform this operation. contact the developer at +917669006847 on whatsapp";
  return _setting;
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
export const _log = async (log) => {
  await Log.create(log);
};

export const newTxnId = async () => {
  try {
    const lastid = await Transaction.findOne({ txnId: { $regex: /^txn\d+$/ } })
      .sort({ txnId: -1 }) // Sort in descending order
      .exec();

    let nextNumber = Date.now();
    if (lastid) {
      const match = lastid.txnId.match(/^txn(\d+)$/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    return "txn" + nextNumber;
  } catch (error) {
    ////console.log("txnid", error);
  }
};

export const fetchGameData = async ({ gameUid, token, deviceId }) => {
  try {
    const decode = await jwt.verify(token, "qwertyuiopmbvsfghj545k");
    let user = null;
    if (decode) {
      user = await User.findOne({
        _id: decode.userId,
        deviceId: deviceId,
      });
    } else {
      return { success: false };
    }

    if (!user) {
      return { success: false };
    }

    const game = await QuickLudo.findOne({
      _id: gameUid,
      status: "running",
      "blue.userId": { $exists: true },
      "green.userId": { $exists: true },
      $or: [{ "blue.userId": user._id }, { "green.userId": user._id }],
    }).lean();

    if (game) {
      if (game.blue.userId) {
        game.blue.user = await User.findOne({ _id: game.blue.userId }).lean();
      }
      if (game.green.userId) {
        game.green.user = await User.findOne({ _id: game.green.userId }).lean();
      }
      return {
        success: true,
        game: game,
      };
    } else {
      return {
        success: false,
        message: "invalid game id",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error.response ? error.response.data.message : error.message,
    };
  }
};

export const updateGameData = async ({ gameUid, data }) => {
  try {
    const game = await QuickLudo.findOne({ _id: gameUid }).lean();

    if (game && game.status == "running") {
      // console.log(data);
      if (data.winScore == data.loseScore && !data.sc) {
        const result = {
          status: "completed",
          apiData: data.roomData,
          "blue.result": "draw",
          "green.result": "draw",
          completedAt: Date.now(),
        };

        result["blue.score"] = data.winScore;
        result["green.score"] = data.loseScore;

        await QuickLudo.updateOne(
          {
            _id: game._id,
          }, // Filter by user ID
          {
            $set: result,
          } // Update the fullName field
        );

        // #######################
        await Transaction.deleteMany({ matchId: game._id });

        await _log({
          matchId: game._id,
          message:
            "all transactions related to this match deleted or refunded to both users",
        });

        setTimeout(() => {
          delete rooms[game.roomCode];
        }, 1000 * 60 * 5);
      } else {
        const result = {
          status: "completed",
          apiData: data.roomData,
          "blue.result": data.win == "blue" ? "winner" : "looser",
          "green.result": data.win == "green" ? "winner" : "looser",
          "winner.color": data.win,
          completedAt: Date.now(),
        };

        result[data.win + ".score"] = data.winScore;
        result[data.lose + ".score"] = data.loseScore;

        await QuickLudo.updateOne(
          {
            _id: game._id,
          }, // Filter by user ID
          {
            $set: result,
          } // Update the fullName field
        );

        // #######################
        const txnid = await newTxnId();
        const NewTxn = {
          txnId: txnid,
          userId: game[data.win].userId,
          amount: game.prize,
          cash: 0,
          reward: game.prize,
          bonus: 0,
          remark: "Match Won",
          status: "completed",
          txnType: "credit",
          txnCtg: "reward",
          matchId: game._id,
        };

        await Transaction.create(NewTxn);

        const h = await User.findOne({ _id: game[data.win].userId });
        await _log({
          matchId: game._id,
          message:
            h.fullName +
            " (" +
            h.mobileNumber +
            ") is winner & get reward of ₹" +
            game.prize,
        });

        await refBonusManager(game[data.win].userId, game);
        // #######################

        setTimeout(() => {
          delete rooms[game.roomCode];
        }, 1000 * 60 * 5);
      }
    }
  } catch (error) {
    return {
      success: false,
      message: error.response ? error.response.data.message : error.message,
    };
  }
};

export const cancelGame = async ({ gameUid, data }) => {
  try {
    const game = await QuickLudo.findOne({ _id: gameUid }).lean();

    if (game && game.status == "running") {
      await QuickLudo.updateOne(
        {
          _id: game._id,
        }, // Filter by user ID
        {
          $set: {
            status: "cancelled",
            apiData: data,
            completedAt: Date.now(),
          },
        } // Update the fullName field
      );

      await Transaction.deleteMany({ matchId: game._id });

      await _log({
        matchId: game._id,
        message:
          "opponent not ready to play , so match cancelled and all transaction related to this match are removed",
      });

      setTimeout(() => {
        delete rooms[game.roomCode];
      }, 1000 * 60 * 5);
    }
  } catch (error) {
    return {
      success: false,
      message: error.response ? error.response.data.message : error.message,
    };
  }
};
