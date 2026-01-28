import { useRef, useState } from "react";
import { base, formatTimestamp, maskMobile } from "../../../utils/api.manager";
import { PostForm } from "./PostForm";
import { WalletButton } from "./WalletButton";
import { HiCurrencyRupee } from "react-icons/hi";
import { FaRegUserCircle, FaWallet } from "react-icons/fa";
import { Link } from "react-router-dom";
import { MdOutlineVerified, MdVerified } from "react-icons/md";
import { IoMdGift } from "react-icons/io";
import { IoFingerPrintSharp, IoGift, IoReload } from "react-icons/io5";
import { GrMoney } from "react-icons/gr";
import { TbMoneybag } from "react-icons/tb";
import { WalletButton2 } from "./WalletButton2";

export const UserInfo = ({ user, refresh, isSuperadmin = false }) => {
  const statusToggleForm = useRef();

  // Initialize all toggles inside one state object
  const [flags, setFlags] = useState({
    status: user.status === "active",
    _su: !!user._su,
    _y: !!user._y,
  });

  // Generic toggle function
  const toggleFlag = (key) => {
    setFlags((prev) => ({ ...prev, [key]: !prev[key] }));
    statusToggleForm.current?.requestSubmit();
  };

  return (
    <>
      <div className={`col-12 `} style={{ opacity: status ? 1 : 1 }}>
        <div className="border bg-white shadow-sm p-2 m-1 rounded opacity-75">
          <div className="d-flex justify-content-between">
            <div className="d-flex align-items-center  gap-2">
              <img
                src={`/assets/avatars/${user.profilePic}`}
                height="60px"
                width="60px"
                className="rounded border"
              />
              <div style={{ lineHeight: "18px" }}>
                <div className="fw-bold small text-dark d-flex align-items-center gap-1">
                  <span>{user.fullName}</span>{" "}
                  {user.kyc ? (
                    <MdVerified
                      className="text-success"
                      title="KYC Completed"
                    />
                  ) : (
                    ""
                  )}
                </div>
                <div className="small text-dark">
                  {maskMobile(user.mobileNumber)}
                </div>
                <div className="xs-small">
                  Registered On {formatTimestamp(user.createdAt)}
                </div>
              </div>
            </div>
            <div>
              <PostForm
                action="/updateUserStatus"
                formRef={statusToggleForm}
                hideBtn={true}
              >
                {/* User ID always sent */}
                <input type="hidden" name="userId" value={user._id} />

                {/* Status Toggle */}
                <div className="d-flex align-items-center">
                  <div className="form-check form-switch">
                    <input type="hidden" name="status" value="inactive" />
                    <input
                      name="status"
                      value="active"
                      className="form-check-input"
                      type="checkbox"
                      id="statusSwitch"
                      onChange={() => toggleFlag("status")}
                      checked={flags.status}
                    />
                  </div>
                  <div className="xs-small text-center">
                    {flags.status ? "Active" : "Inactive"}
                  </div>
                </div>

                {/* Super User Toggle - Only visible for superadmins */}
                {isSuperadmin && (
                  <div className="d-flex align-items-center">
                    <div className="form-check form-switch">
                      <input
                        name="_su"
                        value={flags._su ? "1" : "1"}
                        className="form-check-input"
                        type="checkbox"
                        id="suSwitch"
                        onChange={() => toggleFlag("_su")}
                        checked={flags._su}
                      />
                    </div>
                    <div className="xs-small text-center">
                      {flags._su ? "SuperUser" : "Normal User"}
                    </div>
                  </div>
                )}

                <div className="d-flex align-items-center">
                  <div className="form-check form-switch">
                    <input
                      name="_y"
                      value={flags._y ? "1" : "1"}
                      className="form-check-input"
                      type="checkbox"
                      id="ySwitch"
                      onChange={() => toggleFlag("_y")}
                      checked={flags._y}
                    />
                  </div>
                  <div className="xs-small text-center">
                    {flags._y ? "Name Change" : "Name Change"}
                  </div>
                </div>
              </PostForm>
            </div>
          </div>

          <div className="d-flex flex-wrap gap-1 mt-2">
            <WalletButton2
              icon={<HiCurrencyRupee />}
              class="btn-success"
              title="CASH"
              amount={"₹ " + user.balance.cash}
            />

            <WalletButton2
              icon={<TbMoneybag />}
              class="btn-info"
              title="REWARD"
              amount={"₹ " + user.balance.reward}
            />

            <WalletButton2
              icon={<IoGift />}
              class="btn-warning"
              title="BONUS"
              amount={"₹ " + user.balance.bonus}
            />
            <WalletButton2
              icon={<FaWallet />}
              class="btn-dark text-white"
              title="WALLET BALANCE"
              amount={"₹ " + user.balance.balance}
            />
            <WalletButton2
              icon={<IoFingerPrintSharp />}
              class={user.kyc ? "btn-success" : "btn-secondary"}
              title="KYC STATUS"
              amount={user.kyc ? "KYC Completed" : "KYC Pending"}
            />
            <WalletButton2
              icon={<FaRegUserCircle />}
              class={flags.status ? "btn-success" : "btn-danger"}
              title="ACCOUNT STATUS"
              amount={flags.status ? "Active" : "Inactive"}
            />

            <button
              onClick={refresh}
              className="btn btn-outline-dark btn-sm m-0 px-3 py-1"
            >
              Refresh Data
            </button>
          </div>
        </div>
      </div>
    </>
  );
};