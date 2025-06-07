import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface LocationState {
  lat: number | null;
  lng: number | null;
  cityText: string;
}

const initialState: LocationState = {
  lat: null,
  lng: null,
  cityText: '',
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setLocation(
      state,
      action: PayloadAction<{ lat: number; lng: number; cityText: string }>
    ) {
      state.lat = action.payload.lat;
      state.lng = action.payload.lng;
      state.cityText = action.payload.cityText;
    },
    clearLocation(state) {
      state.lat = null;
      state.lng = null;
      state.cityText = '';
    },
  },
});

export const { setLocation, clearLocation } = locationSlice.actions;
export default locationSlice.reducer;
