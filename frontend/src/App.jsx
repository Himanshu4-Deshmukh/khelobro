// import { Route, Routes, useLocation } from "react-router";
// import Master from "./components/common/Master";
// import Homepage from "./components/pages/Homepage";
// import { Login } from "./components/pages/Login";
// import { Register } from "./components/pages/Register";
// import { VerifyOtp } from "./components/pages/VerifyOtp";
// import { AutoLogin } from "./components/common/AutoLogin";
// import { Wallet } from "./components/pages/Wallet";
// import { useSelector } from "react-redux";
// import { LoadingScreen } from "./components/pages/LoadingScreen";
// import { AddMoney } from "./components/pages/AddMoney";
// import { Transactions } from "./components/pages/Transactions";
// import { Chat } from "./components/pages/Chat";
// import { CreateMatch } from "./components/pages/CreateMatch";
// import { Match } from "./components/pages/Match";
// import { Matches } from "./components/pages/Matches";
// import { Withdraw } from "./components/pages/Withdraw";
// import { Refer } from "./components/pages/Refer";
// import { Leaderboard } from "./components/pages/Leaderboard";
// import { Profile } from "./components/pages/Profile";
// import { ClassicOnline } from "./components/pages/ClassicOnline";
// import OnlineClassic from "./onlineclassic";
// import SpeedLudo from "./speedludo";
// import QuickLudo from "./quickludo";

// import { SpeedLudoP } from "./components/pages/SpeedLudoP";
// import { Deposit } from "./components/pages/Deposit";
// import { AddMoney3 } from "./components/pages/AddMoney3";
// import { AddMoney2 } from "./components/pages/AddMoney2";
// import { Terms } from "./components/pages/Terms";
// import { QuickLudoP } from "./components/pages/QuickLudoP";
// import { SpeedLudoP2 } from "./components/pages/SpeedLudoP2";
// import OnlineClassic2 from "./onlineclassic2";
// import { ClassicOnline2 } from "./components/pages/ClassicOnline2";

// export const App = () => {
//   const { loading } = useSelector((store) => store.auth);
//   const location = useLocation();
//   return (
//     <>
//       <AutoLogin />
//       {loading && <LoadingScreen />}
//       {!loading && (
//         <Routes location={location} key={123}>
//           <Route path="/" element={<Master />}>
//             <Route index element={<Homepage />} />
//             <Route path="login" element={<Login />} />
//             <Route path="terms" element={<Terms />} />
//             <Route path="register" element={<Register />} />
//             <Route path="register/:referralCode" element={<Register />} />
//             <Route path="verify-otp" element={<VerifyOtp />} />
//             <Route path="wallet" element={<Wallet />} />
//             <Route path="deposit" element={<Deposit />} />

//             <Route path="add-money" element={<AddMoney />} />
//             <Route path="add-money2" element={<AddMoney2 />} />
//             <Route path="add-money3" element={<AddMoney3 />} />

//             <Route path="transactions" element={<Transactions />} />

//             <Route path="classic-manual" element={<CreateMatch />} />
//             <Route path="classic-online" element={<ClassicOnline />} />
//             <Route path="classic-1token" element={<ClassicOnline2 />} />
//             <Route path="speedludo" element={<SpeedLudoP />} />
//             <Route path="speedludo2" element={<SpeedLudoP2 />} />

//             <Route path="quickludo" element={<QuickLudoP />} />

//             <Route path="match" element={<Match />} />
//             {/* <Route path="matches" element={<Matches />} /> */}
//             <Route path="withdraw" element={<Withdraw />} />
//             <Route path="refer" element={<Refer />} />

//             <Route path="leaderboard" element={<Leaderboard />} />
//             <Route path="profile" element={<Profile />} />
//           </Route>
//           <Route path="/chat" element={<Chat />} />
//           <Route
//             path="/classic-online-game/:gameUid"
//             element={<OnlineClassic />}
//           />
//           <Route
//             path="/classic-online-game/:gameUid"
//             element={<OnlineClassic />}
//           />
//           <Route
//             path="/classic-1token-game/:gameUid"
//             element={<OnlineClassic2 />}
//           />
//           <Route path="/speed-ludo-game/:gameUid" element={<SpeedLudo />} />
//           <Route path="/quick-ludo-game/:gameUid" element={<QuickLudo />} />
//         </Routes>
//       )}
//     </>
//   );
// };


import { Route, Routes, useLocation } from "react-router";
import Master from "./components/common/Master";
import Homepage from "./components/pages/Homepage";
import { Login } from "./components/pages/Login";
import { Register } from "./components/pages/Register";
import { VerifyOtp } from "./components/pages/VerifyOtp";
import { AutoLogin } from "./components/common/AutoLogin";
import { Wallet } from "./components/pages/Wallet";
import { useSelector } from "react-redux";
import { LoadingScreen } from "./components/pages/LoadingScreen";
import { AddMoney } from "./components/pages/AddMoney";
import { Transactions } from "./components/pages/Transactions";
import { Chat } from "./components/pages/Chat";
import { CreateMatch } from "./components/pages/CreateMatch";
import { Match } from "./components/pages/Match";
import { Matches } from "./components/pages/Matches";
import { Withdraw } from "./components/pages/Withdraw";
import { Refer } from "./components/pages/Refer";
import { Leaderboard } from "./components/pages/Leaderboard";
import { Profile } from "./components/pages/Profile";
import { ClassicOnline } from "./components/pages/ClassicOnline";
import OnlineClassic from "./onlineclassic";
import SpeedLudo from "./speedludo";
import QuickLudo from "./quickludo";
import TournaGame from "./tournament";
import { TMatch } from "./components/pages/TMatch";


import { SpeedLudoP } from "./components/pages/SpeedLudoP";
import { Deposit } from "./components/pages/Deposit";
import { AddMoney3 } from "./components/pages/AddMoney3";
import { AddMoney2 } from "./components/pages/AddMoney2";
import { Terms } from "./components/pages/Terms";
import { QuickLudoP } from "./components/pages/QuickLudoP";
import { SpeedLudoP2 } from "./components/pages/SpeedLudoP2";
import { Tournament } from "./components/pages/Tournament";

import OnlineClassic2 from "./onlineclassic2";
import { ClassicOnline2 } from "./components/pages/ClassicOnline2";

export const App = () => {
  const { loading } = useSelector((store) => store.auth);
  const location = useLocation();
  return (
    <>
      <AutoLogin />
      {loading && <LoadingScreen />}
      {!loading && (
        <Routes location={location} key={123}>
          <Route path="/" element={<Master />}>
            <Route index element={<Homepage />} />
            <Route path="login" element={<Login />} />
            <Route path="terms" element={<Terms />} />
            <Route path="register" element={<Register />} />
            <Route path="register/:referralCode" element={<Register />} />
            <Route path="verify-otp" element={<VerifyOtp />} />
            <Route path="wallet" element={<Wallet />} />
            <Route path="deposit" element={<Deposit />} />

            <Route path="add-money" element={<AddMoney />} />
            <Route path="add-money2" element={<AddMoney2 />} />
            <Route path="add-money3" element={<AddMoney3 />} />

            <Route path="transactions" element={<Transactions />} />

            <Route path="classic-manual" element={<CreateMatch />} />
            <Route path="classic-online" element={<ClassicOnline />} />
            <Route path="classic-1token" element={<ClassicOnline2 />} />
            <Route path="speedludo" element={<SpeedLudoP />} />
            <Route path="speedludo2" element={<SpeedLudoP2 />} />

            <Route path="quickludo" element={<QuickLudoP />} />
            <Route path="tournament" element={<Tournament />} />


            <Route path="match" element={<Match />} />
            {/* <Route path="matches" element={<Matches />} /> */}
            <Route path="withdraw" element={<Withdraw />} />
            <Route path="refer" element={<Refer />} />
            <Route path="/open-tournament/:gameUid" element={<TMatch />} />

            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          <Route path="/chat" element={<Chat />} />
          <Route
            path="/classic-online-game/:gameUid"
            element={<OnlineClassic />}
          />
          <Route
            path="/classic-online-game/:gameUid"
            element={<OnlineClassic />}
          />
          <Route
            path="/classic-1token-game/:gameUid"
            element={<OnlineClassic2 />}
          />
          <Route path="/speed-ludo-game/:gameUid" element={<SpeedLudo />} />
          <Route path="/quick-ludo-game/:gameUid" element={<QuickLudo />} />
          <Route path="/play-tournament/:gameUid" element={<TournaGame />} />

        </Routes>
      )}
    </>
  );
};
