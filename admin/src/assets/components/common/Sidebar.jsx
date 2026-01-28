import { SidebarNavItem } from "../elements/SidebarNavItem";
import { LuDice6, LuLayoutTemplate, LuUserRoundCog } from "react-icons/lu";
import { MdOutlineAdminPanelSettings, MdOutlineSettings } from "react-icons/md";
import { GrUserAdmin } from "react-icons/gr";
import { IoMdChatboxes, IoMdInformationCircleOutline } from "react-icons/io";
import { GiMoneyStack, GiPayMoney, GiTakeMyMoney } from "react-icons/gi";
import { CgDice6 } from "react-icons/cg";
import { FaPeopleGroup } from "react-icons/fa6";

import {
  MdNearbyError,
  MdCancelPresentation,
  MdOutlinePendingActions,
} from "react-icons/md";
import { IoLogoSlack } from "react-icons/io";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { RiLuggageDepositLine } from "react-icons/ri";

export const Sidebar = () => {
  const { _access, _isSuperadmin } = useSelector((store) => store.auth);
  useEffect(() => {
    console.log(_access, _isSuperadmin);
  });
  return (
    <>
      {" "}
      <aside
        className="sidenav navbar navbar-vertical navbar-expand-xs border-0 border-radius-xl my-3 fixed-start ms-3 shadow bg-white"
        id="sidenav-main"
      >
        <div className="sidenav-header">
          <i
            className="fas fa-times p-3 cursor-pointer text-secondary opacity-5 position-absolute end-0 top-0 d-none d-xl-none"
            aria-hidden="true"
            id="iconSidenav"
          ></i>
          <a className="navbar-brand m-0">
            <img
              src="/assets/logo.png"
              className="navbar-brand-img h-100"
              alt="main_logo"
            />

            <span className="ms-1 font-weight-bold">Admin Panel</span>
          </a>
        </div>
        <hr className="horizontal dark mt-0" />
        <div
          className="collapse navbar-collapse  w-auto "
          id="sidenav-collapse-main"
        >
          {_access && (
            <ul className="navbar-nav">
              <SidebarNavItem
                icon={<LuLayoutTemplate />}
                to="/"
                title="Dashboard"
              />
              {_isSuperadmin && (
                <SidebarNavItem
                  icon={<IoLogoSlack />}
                  to="/logs"
                  title="Logs"
                />
              )}

              {(_access.includes("MANAGE USER") || _isSuperadmin) && (
                <SidebarNavItem
                  icon={<LuUserRoundCog />}
                  to="/manage-users"
                  title="Manage Users"
                />
              )}
              {(_access.includes("MANAGE MATCH") || _isSuperadmin) && (
                <>
                  <SidebarNavItem
                    icon={<CgDice6 />}
                    to="/manage-matches"
                    title="Manual Matches"
                  />
                  <SidebarNavItem
                    icon={<CgDice6 />}
                    to="/manage-online-matches"
                    title="Classic Online Matches"
                  />{" "}
                  <SidebarNavItem
                    icon={<CgDice6 />}
                    to="/manage-1token-matches"
                    title="Classic 1 Token Matches"
                  />
                                    <SidebarNavItem
                    icon={<FaPeopleGroup />}
                    to="/manage-tournaments"
                    title="Manage Tournaments"
                  />
                  <SidebarNavItem
                    icon={<FaPeopleGroup />}
                    to="/manage-tournaments"
                    title="Manage Tournaments"
                  />
                  <SidebarNavItem
                    icon={<CgDice6 />}
                    to="/manage-speed-matches"
                    title="Speed Ludo Matches"
                  />
                  <SidebarNavItem
                    icon={<CgDice6 />}
                    to="/manage-quick-matches"
                    title="Quick Ludo Matches"
                  />
                </>
              )}
              {(_access.includes("MANAGE CONFLICT") || _isSuperadmin) && (
                <SidebarNavItem
                  icon={<MdNearbyError />}
                  to="/conflicts"
                  title="Conflicts"
                />
              )}
              {(_access.includes("CANCEL REQUEST") || _isSuperadmin) && (
                <SidebarNavItem
                  icon={<MdCancelPresentation />}
                  to="/cancel-requests"
                  title="Cancel Requests"
                />
              )}
              {(_access.includes("PENDING RESULT") || _isSuperadmin) && (
                <SidebarNavItem
                  icon={<MdOutlinePendingActions />}
                  to="/pending-results"
                  title="Pending Results"
                />
              )}
              {(_access.includes("MANAGE WITHDRAW") || _isSuperadmin) && (
                <SidebarNavItem
                  icon={<GiTakeMyMoney />}
                  to="/manage-withdraws"
                  title="Manage Withdraws"
                />
              )}
              {(_access.includes("MANAGE DEPOSIT") || _isSuperadmin) && (
                <>
                  <SidebarNavItem
                    icon={<RiLuggageDepositLine />}
                    to="/auto-deposits"
                    title="Auto Deposits"
                  />
                  <SidebarNavItem
                    icon={<GiMoneyStack />}
                    to="/manage-deposits"
                    title="Manual Deposits"
                  />
                </>
              )}
              {(_access.includes("CHAT SUPPORT") || _isSuperadmin) && (
                <SidebarNavItem
                  icon={<IoMdChatboxes />}
                  to="/chat-support"
                  title="Chat Support"
                />
              )}

              {_isSuperadmin && (
                <>
                  <SidebarNavItem
                    icon={<IoMdInformationCircleOutline />}
                    to="/manage-infos"
                    title="Manage Infos"
                  />
                  <SidebarNavItem
                    icon={<IoMdInformationCircleOutline />}
                    to="/manage-games"
                    title="Games Info"
                  />
                  <SidebarNavItem
                    icon={<GrUserAdmin />}
                    to="/manage-admins"
                    title="Manage Admins"
                  />
                  <SidebarNavItem
                    icon={<GiPayMoney />}
                    to="/manage-commission"
                    title="Manage Commission"
                  />
                  <SidebarNavItem
                    icon={<MdOutlineSettings />}
                    to="/configuration"
                    title="Configuration"
                  />
                  <SidebarNavItem
                    icon={<MdOutlineAdminPanelSettings />}
                    to="/account"
                    title="Account"
                  />
                </>
              )}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
};
