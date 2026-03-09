// import { io, uploadChatData } from "../index.js";
// import { Message } from "../models/message.model.js";
// import fs from "fs";
// import mongoose from "mongoose";
// import { _log, fetchChatList } from "./admin/account.controller.js";
// import { adminOnChat } from "./socket.controller.js";
// import { Config } from "../models/config.model.js";
// import { _config } from "./config.controller.js";
// const ObjectId = mongoose.Types.ObjectId;

// export const updateConfig = async (req, res) => {
//   try {
//     const config = await _config();
//     if (config.DEMO == true) {
//       return res.json({
//         success: false,
//         message: config.DEMO_MSG,
//       });
//     }

//     const updatedGame = await Config.updateMany(
//       {},
//       {
//         $set: req.body,
//       }
//     );

//     // await Info.create({
//     //   hindiText: req.body.hindiText,
//     //   englishText: req.body.englishText,
//     // });

//     _log({
//       message: req.admin.emailId + " updated  website configuration",
//     });
//     return res.json({
//       success: true,
//       message: "configuration updated !",
//       b: req.body,
//     });
//   } catch (error) {
//     return res.json({
//       success: false,
//       message: error.response ? error.response.data.message : error.message,
//     });
//   }
// };

// export const fetchMessages = async (req, res) => {
//   try {
//     const messages = await Message.find({
//       $or: [{ senderId: req.user._id }, { receiverId: req.user._id }],
//     })
//       .sort({ _id: -1 })
//       .skip(req.body.skip)
//       .limit(20);

//     await Message.updateMany(
//       { receiverId: req.user._id, isAdmin: true },
//       { $set: { isRead: true } }
//     );

//     return res.json({
//       success: true,
//       messages: messages.reverse(),
//     });
//   } catch (error) {
//     ////console.log("createMatch", error);
//     return res.json({
//       success: false,
//       message: error.response ? error.response.data.message : error.message,
//     });
//   }
// };

// export const sendMessage = async (req, res) => {
//   try {
//     if (!req.body.text.trim() && !req.body.image && !req.file)
//       return res.json({ success: true });

//     const audio = req.file;
//     const text = req.body.text.trim();
//     const image = req.body.image;
//     const newMsg = {
//       senderId: req.user._id,
//       receiverId: req.user._id,
//       isAdmin: false,
//       text: text,
//     };

//     if (adminOnChat) {
//       newMsg.isRead = true;
//     }

//     await Message.updateMany(
//       { receiverId: req.user._id, isAdmin: true },
//       { $set: { isRead: true } }
//     );

//     if (audio && audio.filename) {
//       newMsg.audio = audio.filename;
//     }
//     if (image && image != "null") {
//       let base64String = image;
//       let base64Image = base64String.split(";base64,").pop();
//       let filename = "image_" + Date.now() + ".png";
//       let dirname = uploadChatData + "/ADMIN_" + req.user.mobileNumber + "/";
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
//           io.to(req.user.mobileNumber).emit("newMsg", [nm]);
//           return res.json({
//             success: true,
//             message: nm,
//           });
//         }
//       );
//     } else {
// const senderId = req.userId;
//       const lastMessage = await Message.findOne({
//         $or: [
//           { senderId, isAdmin: false }, // last user message
//           { receiverId: senderId, isAdmin: true }, // last admin message
//         ],
//       }).sort({ createdAt: -1 });


//       if (lastMessage) {

//          if (!lastMessage.isAdmin) {
//           return res.status(400).json({
//             success: false,
//             message: "please wait for admin reply before sending a new message.",
//           });
//         }
//       }



//       nm = await Message.create(newMsg);
//       io.to(req.user.mobileNumber).emit("newMsg", [nm]);
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

import { io, uploadChatData } from "../index.js";
import { Message } from "../models/message.model.js";
import fs from "fs";
import mongoose from "mongoose";
import { _log, fetchChatList } from "./admin/account.controller.js";
import { adminOnChat } from "./socket.controller.js";
import { Config } from "../models/config.model.js";
import { _config } from "./config.controller.js";
import { sendTelegramNotification } from "../utils/telegram.js";
const ObjectId = mongoose.Types.ObjectId;

export const updateConfig = async (req, res) => {
  try {
    const config = await _config();
    if (config.DEMO == true) {
      return res.json({
        success: false,
        message: config.DEMO_MSG,
      });
    }

    // Convert string "0"/"1" to proper booleans for boolean fields
    const boolFields = ["WITHDRAW_STATUS", "SHOW_PAYTM_DEPOSIT", "SHOW_QR_DEPOSIT", "SHOW_UPI_DEPOSIT"];
    boolFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        req.body[field] = req.body[field] === "1" || req.body[field] === true || req.body[field] === 1;
      }
    });

    const updatedGame = await Config.updateMany(
      {},
      {
        $set: req.body,
      }
    );

    _log({
      message: req.admin.emailId + " updated  website configuration",
    });
    return res.json({
      success: true,
      message: "configuration updated !",
      b: req.body,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};


export const fetchMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ senderId: req.user._id }, { receiverId: req.user._id }],
    })
      .sort({ _id: -1 })
      .skip(req.body.skip)
      .limit(20);

    await Message.updateMany(
      { receiverId: req.user._id, isAdmin: true },
      { $set: { isRead: true } }
    );

    return res.json({
      success: true,
      messages: messages.reverse(),
    });
  } catch (error) {
    ////console.log("createMatch", error);
    return res.json({
      success: false,
      message: error.response ? error.response.data.message : error.message,
    });
  }
};

export const sendMessage = async (req, res) => {
  try {
    if (!req.body.text.trim() && !req.body.image && !req.file)
      return res.json({ success: true });

    const audio = req.file;
    const text = req.body.text.trim();
    const image = req.body.image;
    const newMsg = {
      senderId: req.user._id,
      receiverId: req.user._id,
      isAdmin: false,
      text: text,
    };

    if (adminOnChat) {
      newMsg.isRead = true;
    }

    await Message.updateMany(
      { receiverId: req.user._id, isAdmin: true },
      { $set: { isRead: true } }
    );

    if (audio && audio.filename) {
      newMsg.audio = audio.filename;
    }
    if (image && image != "null") {
      let base64String = image;
      let base64Image = base64String.split(";base64,").pop();
      let filename = "image_" + Date.now() + ".png";
      let dirname = uploadChatData + "/ADMIN_" + req.user.mobileNumber + "/";
      if (!fs.existsSync(dirname)) {
        fs.mkdirSync(dirname);
      }
      var nm = null;
      await fs.writeFile(
        dirname + filename,
        base64Image,
        { encoding: "base64" },
        async function (err) {
          newMsg.image = filename;
          nm = await Message.create(newMsg);
          io.to(req.user.mobileNumber).emit("newMsg", [nm]);

          // 📩 Notify admin on Telegram
          sendTelegramNotification(
            `📸 *New image message* from user \`${req.user.mobileNumber}\`\n_[Image attached]_`
          );

          return res.json({
            success: true,
            message: nm,
          });
        }
      );
    } else {


      nm = await Message.create(newMsg);
      io.to(req.user.mobileNumber).emit("newMsg", [nm]);
      const list = await fetchChatList();

      io.to("admin").emit("updatechatlist", list);

      // 📩 Notify admin on Telegram
      const notifText = audio && audio.filename
        ? `🎵 *New audio message* from user \`${req.user.mobileNumber}\`\n_[Audio attached]_`
        : `💬 *New message* from user \`${req.user.mobileNumber}\`\n\n${text}`;
      sendTelegramNotification(notifText);

      return res.json({
        success: true,
        message: nm,
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
