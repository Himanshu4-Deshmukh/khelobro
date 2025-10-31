import { useEffect, useState } from "react";
import { PostForm } from "../elements/PostForm";
import { singleFetcher } from "../../../utils/api.manager";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export const Configuration = () => {
  const [configs, setConfigs] = useState(null);
  const navigate = useNavigate();
  const { _access, _isSuperadmin } = useSelector((store) => store.auth);
  useEffect(() => {
    if (!_isSuperadmin) navigate("/");
    singleFetcher("/fetchConfig", {}, setConfigs, () => {});
  }, []);
  return (
    <>
      <div className="border mx-2 p-4 shadow rounded bg-white">
        <div className="fw-bold mb-2 border-bottom">Website Configuration</div>
        <PostForm
          action="/updateConfig"
          subBtn="UPDATE WEBSITE CONFIGURATION"
          subBtnClass="btn bg-gradient-dark mt-3 w-100 mb-2"
          loaderColor="white"
        >
          {configs &&
            Object.entries(configs).map(([key, value]) => {
              // Skip sensitive/system keys
              if (
                key === "__v" ||
                key === "createdAt" ||
                key === "updatedAt" ||
                key === "_id" ||
                key === "PAYTM_PAYMENT_VERIFICATION_URL" ||
                key === "FAST2SMS_APIKEY" ||
                key === "FAST2SMS_ROUTE" ||
                key === "FAST2SMS_SENDER_ID" ||
                key === "FAST2SMS_MESSAGE" ||
                // key === "SANDBOX_SECRET_KEY" ||
                // key === "SANDBOX_API_KEY" ||
                key === "OTPLESS_CLIENT_ID" ||
                key === "OTPLESS_SECRET" ||
                key === "LUDOKING_RAPID_APIKEY" ||
                key === "PAYTM_CHECKSUM"
              ) {
                return null;
              }

              // Format label -> "WITHDRAW_START_TIME" -> "Withdraw Start Time"
              const formatLabel = (label) =>
                label
                  .replaceAll("_", " ")
                  .toLowerCase()
                  .replace(/\b\w/g, (c) => c.toUpperCase());

              // Withdraw time fields
              if (
                key === "WITHDRAW_START_TIME" ||
                key === "WITHDRAW_END_TIME"
              ) {
                return (
                  <div key={key} className="my-3">
                    <div className="small fw-bold text-dark">
                      {formatLabel(key)}
                    </div>
                    <input
                      type="time"
                      name={key}
                      className="form-control"
                      defaultValue={value}
                    />
                  </div>
                );
              }

              // Withdraw status dropdown
              if (key === "WITHDRAW_STATUS") {
                return (
                  <div key={key} className="my-3">
                    <div className="small fw-bold text-dark">
                      {formatLabel(key)}
                    </div>
                    <select
                      name={key}
                      className="form-control"
                      defaultValue={Number(value)}
                    >
                      <option value={1}>Open</option>
                      <option value={0}>Closed</option>
                    </select>
                  </div>
                );
              }
              let keytemp = key;
              if (key === "YOUTUBE_VIDEO_LINK") keytemp = "TELEGRAM_LINK";
              // Default text field
              return (
                <div key={key} className="my-3">
                  <div className="small fw-bold text-dark">
                    {formatLabel(keytemp)}
                  </div>
                  <input
                    type="text"
                    name={key}
                    className="form-control"
                    defaultValue={value}
                  />
                </div>
              );
            })}
        </PostForm>
      </div>
    </>
  );
};
