import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from '../features/auth/authSlice';
import profileReducer from './slices/profileSlice';
import locationReducer from './slices/location_slice'; // <-- importar nuevo slice

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    location: locationReducer, // <-- agregar aquí
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
