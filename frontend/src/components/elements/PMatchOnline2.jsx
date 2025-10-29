import { GiDiceSixFacesSix } from "react-icons/gi";
import Button1 from "./Button1";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { MdVerified } from "react-icons/md";

export const PMatchOnline2 = ({ match }) => {
  const { t } = useTranslation();
  return (
    <>
      {" "}
      <div className="rounded-2 bg-success border my-3 animate__animated animate__backInLeft animate__fast">
        <div className="p-1 px-2 bg-overlay">
          <div className="border-bottom border-2 py-1 d-flex justify-content-between">
            <div className="x-small fw-bold text-white d-flex gap-2">
              {t("playing_for")}{" "}
              <span className=" d-flex gap-1 align-items-center text-black">
                {" "}
                ₹ {match.entryFee}
              </span>
            </div>
            <div className="x-small text-white fw-bold d-flex gap-2">
              {t("prize")}{" "}
              <span className="d-flex gap-1 align-items-center text-black">
                {" "}
                ₹ {match.prize}
              </span>
            </div>
          </div>
          <div className="d-flex justify-content-between align-items-center py-1">
            <div className="text-center py-0 fw-bold">
              <img
                src={`assets/avatars/${match.blue.user.profilePic}`}
                className="rounded-circle border"
                height="40px"
              />
              <div className="small text-white d-flex gap-1 align-items-center">
                {match.blue.user.fullName}{" "}
                {match.blue.user.kyc ? (
                  <MdVerified className="text-white" title="KYC Completed" />
                ) : (
                  ""
                )}
              </div>
            </div>
            <div>
              <Link
                to={`/classic-1token-game/${match._id}`}
                className="text-decoration-none"
              >
                <Button1
                  icon={<GiDiceSixFacesSix />}
                  text={t("play")}
                  working={false}
                  class="btn-dark fw-bold"
                />
              </Link>
            </div>
            <div className="text-center py-0 fw-bold">
              <img
                src={`assets/avatars/${match.green.user.profilePic}`}
                className="rounded-circle border"
                height="40px"
              />
              <div className="small text-white d-flex gap-1 align-items-center">
                {match.green.user.fullName}{" "}
                {match.green.user.kyc ? (
                  <MdVerified className="text-white" title="KYC Completed" />
                ) : (
                  ""
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
