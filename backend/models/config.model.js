// import mongoose from "mongoose";

// const configSchema = new mongoose.Schema(
//   {
//     PAYTM_BUSINESS_MID: { type: String, default: "" },
//     PAYTM_BUSINESS_VPA: { type: String, default: "" },
//     PAYTM_CHECKSUM: { type: String, default: "" },

//     MANUAL_UPI_ID: { type: String, default: "" },
//     PAYTM_PAYMENT_VERIFICATION_URL: { type: String, default: "" },

//     MERAOTP_APIKEY: { type: String, default: "" },

//     LUDOKING_RAPID_APIKEY: { type: String, default: "" },

//     WINNING_PERCENTAGE: { type: Number, default: "" },
//     REFERRAL_LEVEL1: { type: Number, default: "" },
//     REFERRAL_LEVEL2: { type: Number, default: "" },
//     JOINING_BONUS: { type: Number, default: "" },

//     MINIMUM_DEPOSIT_QR: { type: Number, default: "" },
//     MAXIMUM_DEPOSIT_QR: { type: Number, default: "" },
//     MINIMUM_DEPOSIT_UPI: { type: Number, default: "" },
//     MAXIMUM_DEPOSIT_UPI: { type: Number, default: "" },

//     MINIMUM_WITHDRAW: { type: Number, default: "" },
//     MAXIMUM_WITHDRAW: { type: Number, default: "" },
//     WITHDRAW_DAY_LIMIT: { type: Number, default: "" },
//     WITHDRAW_START_TIME: { type: String, default: "" },
//     WITHDRAW_END_TIME: { type: String, default: "" },
//     WITHDRAW_STATUS: { type: Boolean, default: false },
//     SANDBOX_API_KEY: { type: String, default: "" },
//     SANDBOX_SECRET_KEY: { type: String, default: "" },
//     YOUTUBE_VIDEO_LINK: { type: String, default: "" },
//   },
//   { timestamps: true }
// );

// export const Config = mongoose.model("Config", configSchema);


import mongoose from "mongoose";

const configSchema = new mongoose.Schema(
  {
    PAYTM_BUSINESS_MID: { type: String, default: "" },
    PAYTM_BUSINESS_VPA: { type: String, default: "" },
    PAYTM_CHECKSUM: { type: String, default: "" },

    MANUAL_UPI_ID: { type: String, default: "" },
    PAYTM_PAYMENT_VERIFICATION_URL: { type: String, default: "" },

    MERAOTP_APIKEY: { type: String, default: "" },

    LUDOKING_RAPID_APIKEY: { type: String, default: "" },

    WINNING_PERCENTAGE: { type: Number, default: "" },
    REFERRAL_LEVEL1: { type: Number, default: "" },
    REFERRAL_LEVEL2: { type: Number, default: "" },
    JOINING_BONUS: { type: Number, default: "" },

    MINIMUM_DEPOSIT_QR: { type: Number, default: "" },
    MAXIMUM_DEPOSIT_QR: { type: Number, default: "" },
    MINIMUM_DEPOSIT_UPI: { type: Number, default: "" },
    MAXIMUM_DEPOSIT_UPI: { type: Number, default: "" },

    MINIMUM_WITHDRAW: { type: Number, default: "" },
    MAXIMUM_WITHDRAW: { type: Number, default: "" },
    WITHDRAW_DAY_LIMIT: { type: Number, default: "" },
    WITHDRAW_START_TIME: { type: String, default: "" },
    WITHDRAW_END_TIME: { type: String, default: "" },
    WITHDRAW_STATUS: { type: Boolean, default: false },
    SANDBOX_API_KEY: { type: String, default: "" },
    SANDBOX_SECRET_KEY: { type: String, default: "" },
    YOUTUBE_VIDEO_LINK: { type: String, default: "" },

    SHOW_PAYTM_DEPOSIT: { type: Boolean, default: true },
    SHOW_QR_DEPOSIT: { type: Boolean, default: true },
    SHOW_UPI_DEPOSIT: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Config = mongoose.model("Config", configSchema);
