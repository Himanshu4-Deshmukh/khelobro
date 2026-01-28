import { useState } from "react";
import { Log } from "../elements/Log";
import { useEffect } from "react";
import { fetcher, singleFetcher } from "../../../utils/api.manager";
import { ReportItem } from "../elements/ReportItem";
import { useSelector } from "react-redux";
import { ReportItem2 } from "../elements/ReportItem2";
export function filterDateFormat(date) {
  const dd = String(date.getDate()).padStart(2, "0"); // Ensure 2-digit day
  const mm = String(date.getMonth() + 1).padStart(2, "0"); // Ensure 2-digit month (Month is zero-based)
  const yyyy = date.getFullYear();

  return `${yyyy}-${mm}-${dd}`;
}

export const Dashboard = () => {
  const auth = "DASHBOARD REPORT";
  const [data, setData] = useState(null);
  const [startDate, setStartDate] = useState(filterDateFormat(new Date()));
  const [endDate, setEndDate] = useState(filterDateFormat(new Date()));

  const handleSearch = (e) => {
    e.preventDefault();
    setData([]);
    singleFetcher(
      "/fetchReports",
      {
        startDate: startDate,
        endDate: endDate,
      },
      setData,
      () => {}
    );
  };
  const { _access, _isSuperadmin } = useSelector((store) => store.auth);
  useEffect(() => {
    if (!_access.includes(auth) && !_isSuperadmin) return;
    singleFetcher(
      "/fetchReports",
      {
        startDate: startDate,
        endDate: endDate,
      },
      setData,
      () => {}
    );
  }, []);

  return (
    <>
      {data && (
        <div>
          <div className="p-2 rounded shadow-sm bg-white mx-2">
            <div className="p-2 bg-white rounded mb-3">
              <div className="mb-1 d-flex justify-content-between flex-column">
                <div className="fw-bold text-primary">Reports</div>
                <div className="d-flex gap-2">
                  <div className="w-100">
                    <div className="fw-bold small">From</div>
                    <div>
                      <input
                        type="date"
                        onChange={(e) => setStartDate(e.target.value)}
                        className="form-control form-control-sm"
                        value={startDate}
                      />
                    </div>
                  </div>

                  <div className="w-100">
                    <div className="fw-bold small">To</div>
                    <div>
                      <input
                        value={endDate}
                        type="date"
                        onChange={(e) => setEndDate(e.target.value)}
                        className="form-control form-control-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSearch}>
                <div className="mt-2">
                  <button
                    className="btn w-100 btn-outline-primary mb-0"
                    type="submit"
                  >
                    GET REPORTS
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="px-2 mt-3">
            {data && (
              <div className="d-flex flex-wrap">
                <ReportItem2
                  value={data.User_Wallet_Balance}
                  cash={data.User_Cash_Wallet_Balance}
                  reward={data.User_Reward_Wallet_Balance}
                  bonus={data.User_Bonus_Wallet_Balance}
                  users={data.Total_Users}
                  otp={data.otpCount}
                />

                <ReportItem
                  title="Admin Commission"
                  value={data.Total_Admin_Earnings}
                  money={true}
                  desc="( bet - reward - referral )"
                />

                <ReportItem
                  title="Total Deposits"
                  value={data.Total_Deposits}
                  money={true}
                  desc="( manual + automatic )"
                />

                <ReportItem
                  title="Total Withdraws"
                  value={data.Total_Withdraws_Given}
                  money={true}
                  desc="( bank + upi )"
                />

                <ReportItem
                  title="Bonus Given"
                  value={data.Total_Bonus_Given}
                  money={true}
                  desc={`(joining bonus + offer + admin given)`}
                />

                <ReportItem
                  title="Referral Given"
                  value={data.Total_Referral_Given}
                  money={true}
                  desc={`(level 1 + level 2)`}
                />

                <ReportItem
                  title="Total Played Bet"
                  value={data.Total_Played_Bet}
                  money={true}
                  desc={`(all finished matches)`}
                />

                <ReportItem
                  title="Total Reward Given"
                  value={data.Total_Reward_Earned}
                  money={true}
                  desc={`(all finished matches)`}
                />

                <ReportItem
                  title="New Users Registered"
                  value={data.Total_Registered_Users}
                  desc={`(new users)`}
                />

                <ReportItem
                  title="Manual Match Bets"
                  value={data.ManualBet}
                  money={true}
                  desc={`(total completed manual match bets)`}
                />

                <ReportItem
                  title="Manual Match Rewards"
                  value={data.ManualReward}
                  money={true}
                  desc={`(total completed manual match reward)`}
                />

                <ReportItem
                  title="Classic Online Bets"
                  value={data.OnlineBet}
                  money={true}
                  desc={`(total completed online match bets)`}
                />

                <ReportItem
                  title="Classic Online Rewards"
                  value={data.OnlineReward}
                  money={true}
                  desc={`(total completed online match reward)`}
                />
                <ReportItem
                  title="SpeedLudo Bets"
                  value={data.SpeedBet}
                  money={true}
                  desc={`(total completed speedludo match bets)`}
                />
                <ReportItem
                  title="SpeedLudo Rewards"
                  value={data.SpeedReward}
                  money={true}
                  desc={`(total completed speedludo match reward)`}
                />

                <ReportItem
                  title="QuickLudo Bets"
                  value={data.QuickBet}
                  money={true}
                  desc={`(total completed quickludo match bets)`}
                />
                <ReportItem
                  title="QuickLudo Rewards"
                  value={data.QuickReward}
                  money={true}
                  desc={`(total completed quickludo match reward)`}
                />

                <ReportItem
                  title="Classic 1 Token Bets"
                  value={data.TokenBet}
                  money={true}
                  desc={`(total completed 1 token match bets)`}
                />

                <ReportItem
                  title="Classic 1 Token Rewards"
                  value={data.TokenReward}
                  money={true}
                  desc={`(total completed 1 token match reward)`}
                />

                <ReportItem
                  title="Tournament Profit/Loss"
                  value={
                    data.Tournament_Data.totalBetAmount -
                    data.Tournament_Data.totalRewardAmount
                  }
                  money={true}
                  desc={`(only completed tournaments)`}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {!data && (
        <div className="text-center my-2 fs-bold fs-1">
          Welcome to Admin Panel
        </div>
      )}
    </>
  );
};
