import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  user: { id: string; name: string; email: string } | null;
  token: string | null;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null, 
  error: null,
};

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
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.user = null;
      state.token = null;
    },
    registerSuccess: (state, action: PayloadAction<any>) => {
      state.user = action.payload;
      state.error = null;
    },
    registerFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.user = null;
    },
  },
});

export const { loginSuccess, loginFailure, registerSuccess, registerFailure } =
  authSlice.actions;
export default authSlice.reducer;
