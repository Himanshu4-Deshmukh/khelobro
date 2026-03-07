import { MdInfoOutline, MdInstallMobile } from "react-icons/md";
import Button1 from "../elements/Button1";
import Marquee from "react-fast-marquee";
import { useTranslation } from "react-i18next";
import { LiaLanguageSolid } from "react-icons/lia";
import Button2 from "../elements/Button2";
import Button3 from "../elements/Button3";
import { RiMenu2Fill } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";

import { Link, NavLink, useNavigate } from "react-router";
import toastr from "toastr";
import { WalletButton } from "../elements/WalletButton";
import { IoIosNotifications } from "react-icons/io";
import { API_FETCH_TEXT_DATA, API_HOST, CLIENT } from "../../utils/constants";
import { useEffect, useState } from "react";
import axios from "axios";
import { setTextData } from "../../contexts/slices/authSlice";
// import ReactPWAInstallProvider, { useReactPWAInstall } from "react-pwa-install";

const Header = () => {
  // const { pwaInstall, supported, isInstalled } = useReactPWAInstall();
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);
  const PWA_INSTALLED_KEY = "khelobro_pwa_installed";

  const { t, i18n } = useTranslation();
  const { isAuth, textData } = useSelector((store) => store.auth);
  const { balance } = useSelector((store) => store.user);
  // const [textData, setTextData] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fetchTextData = async () => {
    try {
      const res = await axios.post(API_HOST + API_FETCH_TEXT_DATA);

      // console.log(res.data);
      if (res.data.success) {
        dispatch(setTextData(res.data.data));
      }
    } catch (error) {
      toastr.error(error.message);
    }
  };

  function formatAmount(amount) {
    // Check if the amount is an integer
    if (Number.isInteger(amount)) {
      return amount; // Return without decimal places
    } else {
      return amount.toFixed(2); // Return with two decimal places
    }
  }

  const checkInstallStatus = async () => {
    const isStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true ||
      document.referrer.startsWith("android-app://");

    if (isStandaloneMode) {
      localStorage.setItem(PWA_INSTALLED_KEY, "1");
      setIsPwaInstalled(true);
      return;
    }

    if (localStorage.getItem(PWA_INSTALLED_KEY) === "1") {
      setIsPwaInstalled(true);
      return;
    }

    if (typeof navigator.getInstalledRelatedApps === "function") {
      try {
        const relatedApps = await navigator.getInstalledRelatedApps();
        if (Array.isArray(relatedApps) && relatedApps.length > 0) {
          localStorage.setItem(PWA_INSTALLED_KEY, "1");
          setIsPwaInstalled(true);
          return;
        }
      } catch (_err) {
        // Ignore and continue fallback checks.
      }
    }

    setIsPwaInstalled(false);
  };

  useEffect(() => {
    fetchTextData();
  }, []);

  useEffect(() => {
    checkInstallStatus();

    const onBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPromptEvent(event);
    };

    const onAppInstalled = () => {
      localStorage.setItem(PWA_INSTALLED_KEY, "1");
      setIsPwaInstalled(true);
      setInstallPromptEvent(null);
    };

    const displayModeQuery = window.matchMedia("(display-mode: standalone)");
    const onDisplayModeChange = () => {
      checkInstallStatus();
    };

    if (displayModeQuery.addEventListener) {
      displayModeQuery.addEventListener("change", onDisplayModeChange);
    } else {
      displayModeQuery.addListener(onDisplayModeChange);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);

      if (displayModeQuery.removeEventListener) {
        displayModeQuery.removeEventListener("change", onDisplayModeChange);
      } else {
        displayModeQuery.removeListener(onDisplayModeChange);
      }
    };
  }, []);

  return (
    <>
      <nav className="navbar p-0 border-bottom py-1 shadow-sm col-md-5 mx-auto">
        <div className="container-fluid ">
          <div className="d-flex gap-1">
            {isAuth && <Button3 icon={<RiMenu2Fill />} canvasid="#sidebar" />}
            <Link className="navbar-brand" to="/">
              <img
                src={`/assets/logo.png`}
                alt="Logo"
                height="40"
                className="d-inline-block align-text-top"
              />
            </Link>
          </div>

          <div className="d-flex align-items-center gap-1">
            {!!installPromptEvent && !isPwaInstalled && (
              <Button2
                icon={<MdInstallMobile />}
                working={false}
                text={t("app_install_btn")}
                class="btn-primary text-white rounded-3"
                action={async () => {
                  await installPromptEvent.prompt();
                  if (installPromptEvent.userChoice) {
                    await installPromptEvent.userChoice;
                  }
                  setInstallPromptEvent(null);
                  checkInstallStatus();
                }}
              />
            )}

            {isAuth && <WalletButton balance={formatAmount(Number(balance))} />}
          </div>
        </div>
      </nav>
      <Marquee className="bg-success text-white overflow-hidden text-center py-1  ">
        {textData &&
          textData["Top Moving Banner"] &&
          textData["Top Moving Banner"][
            i18n.language == "hindi" ? "hindi" : "english"
          ]}
      </Marquee>
    </>
  );
};

export default Header;
