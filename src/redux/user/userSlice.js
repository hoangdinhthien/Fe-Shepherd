import { createSlice } from '@reduxjs/toolkit';

// ----- INITIAL STATE -----
const initialState = {
  currentUser: null,
  error: null,
  loading: false,
};
// ----- INITIAL STATE -----
//
// ----- SLICE -----
export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // ======Auth=======
    logIn: (state, action) => {
      state.currentUser = action.payload;
    },
    logOut: (state) => {
      state.currentUser = null;
    },
    // ----- SIGN IN -----
    signInStart: (state, action) => {
      state.loading = true;
    },
    signInSuccess: (state, action) => {
      state.currentUser = action.payload;
      state.loading = false;
      state.error = null;
    },
    signInFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    // ----- SIGN IN -----
    //
    // ----- UPDATE USER -----
    updateUserStart: (state) => {
      state.loading = true;
    },
    updateUserSuccess: (state, action) => {
      state.currentUser = action.payload;
      state.loading = false;
      state.error = null;
    },
    updateUserFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    // ----- UPDATE USER -----
    //
    // ----- DELETE USER -----
    deleteUserStart: (state) => {
      state.loading = true;
    },
    deleteUserSuccess: (state) => {
      state.currentUser = null;
      state.loading = false;
      state.error = null;
    },
    deleteUserFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    // ----- DELETE USER -----
    //
    // ----- SIGN OUT USER -----
    signOutUserStart: (state) => {
      state.loading = true;
    },
    signOutUserSuccess: (state) => {
      state.currentUser = null;
      state.loading = false;
      state.error = null;
    },
    signOutUserFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    // ----- SIGN OUT USER -----
  },
});
// ----- SLICE -----

// Action creators are generated for each case reducer function
export const {
  logIn,
  logOut,
  signInStart,
  signInSuccess,
  signInFailure,
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserStart,
  deleteUserFailure,
  deleteUserSuccess,
  signOutUserFailure,
  signOutUserStart,
  signOutUserSuccess,
} = userSlice.actions;

export default userSlice.reducer;
