import { createSlice } from "@reduxjs/toolkit";

// const initialState = {
//   _token: null,
//   _name: null,
//   _status: null,
//   _access: null,
//   _isSuperadmin: null,
//   isAuth: false,
// };

const initialState = {
  _token: null,
  _deviceId: null,
  _name: null,
  _status: null,
  _access: null,
  _isSuperadmin: null,
  isAuth: false,

  conflict: 0,
  cancelReq: 0,
  withdraw: 0,
  message: 0,
  deposit: 0,
  pendingResult: 0,
  runningMatch: 0,
  onlineMatch: 0,
  onlineMatch2: 0,

  speedMatch: 0,
  quickMatch: 0,
};
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    updateStat: (state, action) => {
      state.conflict = action.payload.conflict;
      state.cancelReq = action.payload.cancelReq;
      state.withdraw = action.payload.withdraw;
      state.message = action.payload.message;
      state.deposit = action.payload.deposit;
      state.pendingResult = action.payload.pendingResult;
      state.runningMatch = action.payload.runningMatch;
      state.onlineMatch = action.payload.onlineMatch;
      state.onlineMatch2 = action.payload.onlineMatch2;

      state.speedMatch = action.payload.speedMatch;
      state.quickMatch = action.payload.quickMatch;
    },
    setAuth: (state, action) => {
      state.isAuth = true;
      state._token = action.payload._token;
      state._name = action.payload._name;
      state._status = action.payload._status;
      state._access = action.payload._access;
      state._isSuperadmin = action.payload._isSuperadmin;

      localStorage.setItem("_token", action.payload._token);
      localStorage.setItem("_deviceId", action.payload._deviceId);

      // state = { ...state, ...action.payload };
    },
    resetAuth: (state) => {
      state._token = null;
      state._name = null;
      state._status = null;
      state._access = null;
      state._isSuperadmin = null;
      state.isAuth = false;
      localStorage.removeItem("_token");
      localStorage.removeItem("_deviceId");
    },
  },
});

export const { setAuth, resetAuth, updateStat } = authSlice.actions;

export default authSlice.reducer;
