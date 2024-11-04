import { combineReducers, configureStore } from '@reduxjs/toolkit';
import userReducer from './user/userSlice';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import persistStore from 'redux-persist/es/persistStore';

// ----- REDUCERS -----
const rootReducer = combineReducers({ user: userReducer });

// ----- PERSIST CONFIG -----
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user'], // Persist only the user slice
};

// ----- PERSISTED REDUCER -----
const persistedReducer = persistReducer(persistConfig, rootReducer);

// ----- STORE -----
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
