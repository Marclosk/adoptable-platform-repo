import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  user: { id: string; name: string; email: string } | null;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<any>) => {
      state.user = action.payload;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.user = null;
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
