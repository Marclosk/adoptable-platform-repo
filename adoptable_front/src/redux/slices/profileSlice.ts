// src/features/profile/profileSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { getProfile as fetchProfileFromApi } from "../../pages/profile/user_services";

// 1) Creamos un asyncThunk que envía la petición al backend
export const fetchProfile = createAsyncThunk(
  "profile/fetchProfile",
  async (_, thunkAPI) => {
    // aquí llamamos a tu servicio que hace GET /users/profile/
    const data = await fetchProfileFromApi();
    return data;
  }
);

// 2) Definimos la forma del estado
export interface ProfileState {
  profile: any | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: ProfileState = {
  profile: null,
  status: "idle",
  error: null,
};

// 3) Creamos el slice
const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    // si quisieras acciones extra las pondrías aquí
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action: PayloadAction<any>) => {
        state.status = "succeeded";
        state.profile = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Error cargando perfil";
      });
  },
});

export default profileSlice.reducer;
