import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { ChatSupport } from "./assets/components/pages/ChatSupport";
import { Login } from "./assets/components/pages/Login";
import { Dashboard } from "./assets/components/pages/Dashboard";
import { ManageUsers } from "./assets/components/pages/ManageUsers";
import { ManageMatches } from "./assets/components/pages/ManageMatches";
import { ManageWithdraws } from "./assets/components/pages/ManageWithdraws";
import { ManageDeposits } from "./assets/components/pages/ManageDeposits";
import { ManageAdmins } from "./assets/components/pages/ManageAdmins";
import { ManageGames } from "./assets/components/pages/ManageGames";
import { ManageInfos } from "./assets/components/pages/ManageInfos";
import { Configuration } from "./assets/components/pages/Configuration";
import { AdminMaster } from "./assets/components/common/AdminMaster";
import { useSelector } from "react-redux";
import { NotFound } from "./assets/components/pages/NotFound";
import { ProtectedRoute } from "./assets/components/elements/ProtectedRoute";
import { OpenUser } from "./assets/components/pages/OpenUser";
import { OpenMatch } from "./assets/components/pages/OpenMatch";
import { useEffect } from "react";
import { base } from "./utils/api.manager";
import axios from "axios";
import toastr from "toastr";
import { useDispatch } from "react-redux";
import { setAuth, updateStat } from "./contexts/slices/authSlice";

import { io } from "socket.io-client";
import { HOST } from "./utils/constants";
import { Conflicts } from "./assets/components/pages/Conflicts";
import { CancelRequests } from "./assets/components/pages/CancelRequests";
import { PendingResults } from "./assets/components/pages/PendingResults";
import { AdminLogs } from "./assets/components/pages/AdminLogs";
import { useState } from "react";
import { Account } from "./assets/components/pages/Account";
import { ManageAutoDeposits } from "./assets/components/pages/ManageAutoDeposits";
import { ManageCommission } from "./assets/components/pages/ManageCommission";
import { ManageOnlineMatches } from "./assets/components/pages/ManageOnlineMatches";
import { OpenOnlineMatch } from "./assets/components/pages/OpenOnlineMatch";
import { ManageSpeedMatches } from "./assets/components/pages/ManageSpeedMatches";
import { OpenSpeedMatch } from "./assets/components/pages/OpenSpeedMatch";
import { ManageQuickMatches } from "./assets/components/pages/ManageQuickMatches";
import { OpenQuickMatch } from "./assets/components/pages/OpenQuickMatch";
import { ManageOnlineMatches2 } from "./assets/components/pages/ManageOnlineMatches2";
import { OpenOnlineMatch2 } from "./assets/components/pages/OpenOnlineMatch2";
export const App = () => {
  const { isAuth } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const [socket, setSocket] = useState(null);
  useEffect(() => {
    const token = localStorage.getItem("_token");
    const deviceId = localStorage.getItem("_deviceId");

    const data = {};
    data.token = token;
    data.deviceId = deviceId;

    if (token && deviceId) {
      axios
        .post(base("/autologin"), data)
        .then(function (response) {
          if (response.data.success) {
            if (response.data.data) {
              dispatch(setAuth(response.data.data));

              const newSocket = io(HOST, {
                query: {
                  adminRoom: "admin",
                },
              });

              setSocket(newSocket);

              newSocket.on("connect", () => {
                //console.log("admin connected");
              });

              newSocket.on("stat", (stat) => {
                dispatch(updateStat(stat));
              });
            }
            if (response.data.message) {
              toastr.success(response.data.message);
            }
          } else {
            toastr.error(response.data.message);
          }
        })
        .catch(function (error) {
          toastr.error(error.response ? error.response.data : error.message);
        });
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);
  const navigate = useNavigate();
  return (
    <>
      <Routes>
        {/* Catch-all route for 404 pages */}
        <Route path="*" element={<NotFound />} />

        {/* Login Route: Redirects authenticated users to home */}
        <Route
          path="/login"
          element={isAuth ? <Navigate to="/" replace /> : <Login />}
        />

        {/* Protected Routes under AdminMaster Layout */}
        <Route path="/" element={<AdminMaster />}>
          <Route
            index
            element={
              <ProtectedRoute isAuth={isAuth}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="manage-users"
            element={
              <ProtectedRoute isAuth={isAuth}>
                <ManageUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="manage-matches"
            element={
              <ProtectedRoute isAuth={isAuth}>
                <ManageMatches />
              </ProtectedRoute>
            }
          />
          <Route
            path="manage-online-matches"
            element={
              <ProtectedRoute isAuth={isAuth}>
                <ManageOnlineMatches />
              </ProtectedRoute>
            }
          />

          <Route
            path="manage-1token-matches"
            element={
              <ProtectedRoute isAuth={isAuth}>
                <ManageOnlineMatches2 />
              </ProtectedRoute>
            }
          />

          <Route
            path="manage-speed-matches"
            element={
              <ProtectedRoute isAuth={isAuth}>
                <ManageSpeedMatches />
              </ProtectedRoute>
            }
          />
          <Route
            path="manage-quick-matches"
            element={
              <ProtectedRoute isAuth={isAuth}>
                <ManageQuickMatches />
              </ProtectedRoute>
            }
          />
          <Route
            path="manage-withdraws"
            element={
              <ProtectedRoute isAuth={isAuth}>
                <ManageWithdraws />
              </ProtectedRoute>
            }
          />
          <Route
            path="auto-deposits"
            element={
              <ProtectedRoute isAuth={isAuth}>
                <ManageAutoDeposits />
              </ProtectedRoute>
            }
          />
          <Route
            path="manage-deposits"
            element={
              <ProtectedRoute isAuth={isAuth}>
                <ManageDeposits />
              </ProtectedRoute>
            }
          />
          <Route
            path="manage-admins"
            element={
              <ProtectedRoute isAuth={isAuth}>
                <ManageAdmins />
              </ProtectedRoute>
            }
          />
          <Route
            path="manage-games"
            element={
              <ProtectedRoute isAuth={isAuth}>
                <ManageGames />
              </ProtectedRoute>
            }
          />
          <Route
            path="chat-support"
            element={
              <ProtectedRoute isAuth={isAuth}>
                <ChatSupport />
              </ProtectedRoute>
            }
          />

          <Route
            path="chat-support/:userId"
            element={
              <ProtectedRoute isAuth={isAuth}>
                <ChatSupport />
              </ProtectedRoute>
            }
          />
          <Route
            path="manage-infos"
            element={
              <ProtectedRoute isAuth={isAuth}>
                <ManageInfos />
              </ProtectedRoute>
            }
          />
          <Route
            path="configuration"
            element={
              <ProtectedRoute isAuth={isAuth}>
                <Configuration />
              </ProtectedRoute>
            }
          />
          <Route
            path="manage-commission"
            element={
              <ProtectedRoute isAuth={isAuth}>
                <ManageCommission />
              </ProtectedRoute>
            }
          />

          <Route
            path="account"
            element={
              <ProtectedRoute isAuth={isAuth}>
                <Account />
              </ProtectedRoute>
            }
          />

          <Route
            path="conflicts"
            element={
              <ProtectedRoute isAuth={isAuth}>
                <Conflicts />
              </ProtectedRoute>
            }
          />

          <Route
            path="cancel-requests"
            element={
              <ProtectedRoute isAuth={isAuth}>
                <CancelRequests />
              </ProtectedRoute>
            }
          />

          <Route
            path="pending-results"
            element={
              <ProtectedRoute isAuth={isAuth}>
                <PendingResults />
              </ProtectedRoute>
            }
          />

          <Route
            path="logs"
            element={
              <ProtectedRoute isAuth={isAuth}>
                <AdminLogs />
              </ProtectedRoute>
            }
          />

          <Route
            path="user/:userId"
            element={
              <ProtectedRoute isAuth={isAuth}>
                <OpenUser />
              </ProtectedRoute>
            }
          />

          <Route
            path="match/:matchId"
            element={
              <ProtectedRoute isAuth={isAuth}>
                <OpenMatch />
              </ProtectedRoute>
            }
          />

          <Route
            path="online-match/:matchId"
            element={
              <ProtectedRoute isAuth={isAuth}>
                <OpenOnlineMatch />
              </ProtectedRoute>
            }
          />

          <Route
            path="online-match2/:matchId"
            element={
              <ProtectedRoute isAuth={isAuth}>
                <OpenOnlineMatch2 />
              </ProtectedRoute>
            }
          />

          <Route
            path="speed-match/:matchId"
            element={
              <ProtectedRoute isAuth={isAuth}>
                <OpenSpeedMatch />
              </ProtectedRoute>
            }
          />

          <Route
            path="quick-match/:matchId"
            element={
              <ProtectedRoute isAuth={isAuth}>
                <OpenQuickMatch />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </>
  );
};
