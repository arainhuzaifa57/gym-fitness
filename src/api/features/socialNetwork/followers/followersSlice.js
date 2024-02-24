import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { fetchUserCurrentprogram } from "../workout/currentProgramSlice";

const initialState = {
  followers: [],
};

export const followersSlice = createSlice({
  name: "followers",
  initialState,
  reducers: {
    fetchDataStart: (state) => {
      state.loading = true;
    },
  },
  extraReducers: (builder) => {
    builder;
  },
});

// Action creators are generated for each case reducer function
export const {} = followersSlice.actions;

export default followersSlice.reducer;
