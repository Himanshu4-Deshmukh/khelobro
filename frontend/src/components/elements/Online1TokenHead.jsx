import { useTranslation } from "react-i18next";
import Button1 from "./Button1";
import { useSelector } from "react-redux";
import { MdOutlineInfo } from "react-icons/md";

export const Online1TokenHead = (props) => {
  const { t, i18n } = useTranslation();
  const { textData } = useSelector((store) => store.auth);
  return (
    <>
      {" "}
      <div className="mt-3 border-bottom">
        <div className="d-flex justify-content-between mb-2 align-items-center">
          <div className="fw-bold  fs-5 mb-2 ">Classic 1 Token</div>
          <div className="">
            {/* //user */}
            <button
              className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
              data-bs-toggle="offcanvas"
              data-bs-target="#avatars"
            >
              <MdOutlineInfo /> {t("guide_btn")}
            </button>

            <div
              className="offcanvas offcanvas-bottom h-75"
              tabIndex="-1"
              id="avatars"
              aria-labelledby="offcanvasBottomLabel"
            >
              <div className="offcanvas-header pb-0">
                <button
                  type="button"
                  className="btn-close cancelcanvas"
                  data-bs-dismiss="offcanvas"
                  aria-label="Close"
                ></button>
              </div>
              <div className="offcanvas-body">
                <div
                  dangerouslySetInnerHTML={{
                    __html:
                      textData &&
                      textData["Classic Online 1 Token"] &&
                      textData["Classic Online 1 Token"][
                        i18n.language == "hindi" ? "hindi" : "english"
                      ],
                  }}
                />
                {}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
