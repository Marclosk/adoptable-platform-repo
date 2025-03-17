import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface AuthState {
  user: string | null; 
  token: string | null;
  error: string | null;
}

const loadState = (): AuthState => {
  try {
    const savedState = localStorage.getItem("authState");
    return savedState ? JSON.parse(savedState) : { user: null, token: null, error: null };
  } catch (error) {
    return { user: null, token: null, error: null };
  }
};

const initialState: AuthState = loadState();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (
      state,
      action: PayloadAction<{ user: any; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
      localStorage.setItem("authState", JSON.stringify(state));
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.user = null;
      state.token = null;
      localStorage.removeItem("authState");
    },
    logoutSuccess: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      localStorage.removeItem("authState"); 
    },
  },
});

export const { loginSuccess, loginFailure, logoutSuccess } = authSlice.actions;
export default authSlice.reducer;
