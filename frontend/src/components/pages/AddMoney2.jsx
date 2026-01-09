import { useTranslation } from "react-i18next";
import { Card } from "../elements/Card";
import $ from "jquery";
import { Input1 } from "../elements/Input1";
import { FaRegUser } from "react-icons/fa6";
import { FaFileAlt } from "react-icons/fa";
import { CopyToClipboard } from "react-copy-to-clipboard";
import {
  MdOutlineContentCopy,
  MdOutlineCurrencyRupee,
  MdOutlinePhoneIphone,
} from "react-icons/md";
import Button1 from "../elements/Button1";
import { BsQrCode } from "react-icons/bs";
import Button2 from "../elements/Button2";
import toastr from "toastr";
import axios from "axios";
import {
  API_CANCEL_PAYMENT,
  API_GET_PAYMENT_QR,
  API_HOST,
  API_PAYMENT_QR_STATUS,
  API_SUBMIT_PAYMENT,
} from "../../utils/constants";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { updateBalance, updateWallet } from "../../contexts/slices/userSlice";
import { motion } from "motion/react";
import { IoChevronBackCircleOutline } from "react-icons/io5";
import GST from "../elements/GST";
export const AddMoney2 = () => {
  const {
    isAuth,
    minUpiDeposit,
    maxUpiDeposit,
    minQrDeposit,
    maxQrDeposit,
    depositUPI,
  } = useSelector((store) => store.auth);
  const [working, setWorking] = useState(false);
  const [qr, setQr] = useState("");
  const [btnlink, setBtnlink] = useState(null);
  const [txnid, setTxnid] = useState(false);
  const [am, setAm] = useState(0);

  const [dpa, setDpa] = useState(0);
  const handleChange = (e) => {
    const value = e.target.value;
    setDpa(value);
  };

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const upiId = "7669006847@axisbank";
  const { t } = useTranslation();
  const add = (amount) => {
    $("#addmoney_amount").val(amount);
    $("#addmoney_amount2").val(amount);
    setDpa(amount);
  };

  const createPaymentQr = async () => {
    try {
      const headers = {
        "Content-Type": "application/json",
        _t: localStorage.getItem("_tk"),
        _di: localStorage.getItem("_di"),
      };

      const data = {
        amount: $("#addmoney_amount").val(),
        ...headers,
      };

      setWorking(true);
      const res = await axios.post(API_HOST + API_GET_PAYMENT_QR, data, {
        headers,
      });
      //console.log(res.data);
      if (res.data.success) {
        setQr(res.data.qr);
        setTxnid(res.data.txnid);
        setAm(res.data.amount);
        setBtnlink(res.data.paytm);
      } else {
        toastr.error(t(res.data.message));
      }
      setWorking(false);
    } catch (error) {
      //console.log(error);
      toastr.error(error.response ? error.response.data : error.message);
      setWorking(false);
    }
  };

  const submitPayment = async () => {
    try {
      const headers = {
        "Content-Type": "application/json",
        _t: localStorage.getItem("_tk"),
        _di: localStorage.getItem("_di"),
      };

      const data = {
        amount: $("#addmoney_amount2").val(),
        orderId: $("#addmoney_orderid").val(),
        ...headers,
      };
      setWorking(true);
      const res = await axios.post(API_HOST + API_SUBMIT_PAYMENT, data, {
        headers,
      });
      //console.log(res.data);
      if (res.data.success) {
        $("#addmoney_amount").val("");
        $("#addmoney_amount2").val("");
        $("#addmoney_orderid").val("");
        toastr.success(t(res.data.message));
      } else {
        toastr.error(t(res.data.message));
      }
      setWorking(false);
    } catch (error) {
      //console.log(error);
      toastr.error(error.response ? error.response.data : error.message);
      setWorking(false);
    }
  };

  const cancelPayment = async () => {
    try {
      const headers = {
        "Content-Type": "application/json",
        _t: localStorage.getItem("_tk"),
        _di: localStorage.getItem("_di"),
      };

      const data = {
        txnId: txnid,
        ...headers,
      };
      setWorking(true);
      const res = await axios.post(API_HOST + API_CANCEL_PAYMENT, data, {
        headers,
      });
      //console.log(res.data);
      if (res.data.success) {
        $("#addmoney_amount").val("");
        $("#addmoney_amount2").val("");
        $("#addmoney_orderid").val("");
        dispatch(updateWallet(res.data.money));
        setQr(false);
        setTxnid(false);
        setAm(0);
        toastr.success(t(res.data.message));

        navigate("/add-money2");
      } else {
        toastr.error(t(res.data.message));
      }
      setWorking(false);
    } catch (error) {
      //console.log(error);
      toastr.error(error.response ? error.response.data : error.message);
      setWorking(false);
    }
  };

  const checkQrStatus = async () => {
    if (!txnid || !qr) return;
    try {
      const headers = {
        "Content-Type": "application/json",
        _t: localStorage.getItem("_tk"),
        _di: localStorage.getItem("_di"),
      };

      const data = {
        txnid: txnid,
        ...headers,
      };

      const res = await axios.post(API_HOST + API_PAYMENT_QR_STATUS, data, {
        headers,
      });
      //console.log(res.data);
      if (res.data.success) {
        dispatch(updateWallet(res.data.money));
        setQr(false);
        setTxnid(false);
        setAm(0);
        toastr.success(t(res.data.message));

        navigate("/add-money2");
      } else {
      }
    } catch (error) {
      //console.log(error);
      toastr.error(error.response ? error.response.data : error.message);
    }
  };

  useEffect(() => {
    if (!isAuth) navigate("/login");
    const stv = setInterval(() => {
      if (txnid && qr) {
        checkQrStatus();
      }
    }, 1500);

    return () => {
      clearInterval(stv);
    };
  });

  return (
    <>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
        <Card class="p-0">
          <div className="tab-content" id="pills-tabContent">
            <div
              className="tab-pane fade show active"
              id="pills-home"
              role="tabpanel"
              aria-labelledby="pills-home-tab"
              tabIndex="0"
            >
              <div className="d-flex justify-content-between align-items-center  pb-2 mb-2">
                <div className="fw-bold text-primary">PAY BY QR</div>
                <Link to="/deposit" className="btn btn-sm btn-outline-primary">
                  <IoChevronBackCircleOutline /> Go Back
                </Link>
              </div>
              {!txnid && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  {" "}
                  <Input1
                    icon={<MdOutlineCurrencyRupee />}
                    label={t("amount_label")}
                    id="addmoney_amount"
                    type="number"
                    action={handleChange}
                  />
                  <div className="d-flex  justify-content-between mb-2">
                    <Button2
                      text="₹ 100"
                      class=""
                      working={false}
                      action={() => add(100)}
                    />

                    <Button2
                      text="₹ 500"
                      class=""
                      working={false}
                      action={() => add(500)}
                    />

                    <Button2
                      text="₹ 1000"
                      class=""
                      working={false}
                      action={() => add(1000)}
                    />

                    <Button2
                      text="₹ 1500"
                      class=""
                      working={false}
                      action={() => add(1500)}
                    />

                    <Button2
                      text="₹ 2000"
                      class=""
                      working={false}
                      action={() => add(2000)}
                    />
                  </div>
                  <div className="d-flex gap-2">
                    <Button1
                      icon={<BsQrCode />}
                      text={t("qr_pay_btn")}
                      class="w-100 btn-primary"
                      working={working}
                      action={createPaymentQr}
                    />
                  </div>
                  <div className="x-small opacity-75 mt-1">
                    <b>{t("note")} : </b>
                    {t("min_deposit")} <b>₹{minQrDeposit}</b> &{" "}
                    {t("max_deposit")} <b>₹{maxQrDeposit}</b>{" "}
                    {t("using_automatic")}
                  </div>
                </motion.div>
              )}
              {/* //qr */}
              {txnid && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <div className="text-center">
                    <img className="w-100" src={qr} />
                  </div>

                  <div>
                    <div className="text-center small my-3">
                      {t("payment_qr_msg")}
                    </div>

                    <div className="d-flex ">
                      <div style={{ opacity: 0, pointerEvents: 'none', width: '100%' }}>
                        <Button1
                          text={t("checking_msg")}
                          class="btn-dark w-100 my-2"
                          working={true}
                        />
                      </div>
                    </div>
                    <div className="d-flex w-100">
                      <Button1
                        text={t("cancel_deposit_btn")}
                        class="btn-danger w-100 my-2"
                        action={cancelPayment}
                        working={working}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* //qrens */}
            </div>
            <div
              className="tab-pane fade"
              id="pills-profile"
              role="tabpanel"
              aria-labelledby="pills-profile-tab"
              tabIndex="0"
            >
              <CopyToClipboard
                text={depositUPI}
                onCopy={() => {
                  toastr.success(t("upi_copied_msg"));
                }}
              >
                <div className="border rounded-4 border border-primary p-2  my-3 alert alert-primary d-flex justify-content-between align-items-center">
                  <div className="mx-2">
                    <div className="small">UPI ID</div>
                    <div className="fw-bold">{depositUPI}</div>
                  </div>
                  <div className="mx-1">
                    <button className=" border-0 bg-primary rounded-4 text-white fs-4 fw-bold py-1 px-2">
                      <MdOutlineContentCopy />
                    </button>
                  </div>
                </div>
              </CopyToClipboard>
              <Input1
                icon={<FaFileAlt />}
                label={t("order_utr_label")}
                id="addmoney_orderid"
                type="text"
              />
              <Input1
                icon={<MdOutlineCurrencyRupee />}
                label={t("amount_label")}
                id="addmoney_amount2"
                type="number"
              />

              <div className="d-flex justify-content-between mb-2">
                <Button2
                  text="₹ 2000"
                  class=""
                  working={false}
                  action={() => add(2000)}
                />

                <Button2
                  text="₹ 5000"
                  class=""
                  working={false}
                  action={() => add(5000)}
                />

                <Button2
                  text="₹ 10000"
                  class=""
                  working={false}
                  action={() => add(10000)}
                />

                <Button2
                  text="₹ 15000"
                  class=""
                  working={false}
                  action={() => add(15000)}
                />

                <Button2
                  text="₹ 20000"
                  class=""
                  working={false}
                  action={() => add(20000)}
                />
              </div>
              <div className="d-flex gap-2">
                <Button1
                  text={t("submit_deposit_btn")}
                  class="btn-primary w-100 "
                  working={working}
                  action={submitPayment}
                />
              </div>
              <div className="x-small opacity-75 mt-1">
                <b>{t("note")} : </b>
                {t("min_deposit")} <b>₹{minUpiDeposit}</b> & {t("max_deposit")}{" "}
                <b>₹{maxUpiDeposit}</b> {t("using_manual")}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
      <GST amount={Number(dpa)} />
    </>
  );
};
