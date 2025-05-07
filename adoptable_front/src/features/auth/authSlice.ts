import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface AuthState {
  user: { id: number; username: string; email: string } | null;
  role: "adoptante" | "protectora" | "admin" | null;
  error: string | null;
}

const saved = localStorage.getItem("authState");
const initialState: AuthState = saved
  ? JSON.parse(saved)
  : {
      user: null,
      role: null,
      error: null,
    };

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (
      state,
      action: PayloadAction<{
        user: { id: number; username: string; email: string };
        role: "adoptante" | "protectora" | "admin";
      }>
    ) => {
      state.user = action.payload.user;
      state.role = action.payload.role;
      state.error = null;
      localStorage.setItem(
        "authState",
        JSON.stringify({
          user: state.user,
          role: state.role,
        })
      );
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.user  = null;
      state.role  = null;
      localStorage.removeItem("authState");
    },
    logoutSuccess: (state) => {
      state.user  = null;
      state.role  = null;
      state.error = null;
      localStorage.removeItem("authState");
    },
  },
});

export const { loginSuccess, loginFailure, logoutSuccess } = authSlice.actions;
export default authSlice.reducer;
