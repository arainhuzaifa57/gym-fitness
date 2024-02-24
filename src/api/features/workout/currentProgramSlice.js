import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

// fetch user current workout prorgram
export const fetchUserCurrentprogram = createAsyncThunk(
  "currentProgram/fetchUserCurrentProgram",
  async (currentProgramId) => {
    const uid = auth().currentUser.uid;
    const getCurrentProgram = await firestore()
      .collection("users")
      .doc(uid)
      .collection("userCreatedPrograms")
      .doc(currentProgramId)
      .get();
    const currentProgram = getCurrentProgram.data();
    console.log("current program fetched");

    const convertTimestampToISO = (timestamp) =>
      timestamp?.toDate()?.toISOString();

    if (currentProgram) {
      currentProgram.createdAt = convertTimestampToISO(
        currentProgram.createdAt
      );
      currentProgram.updatedAt = convertTimestampToISO(
        currentProgram.updatedAt
      );
    }

    return currentProgram;
  }
);

const initialState = {
  programName: null,
  workoutDays: [],
  date: null,
  createdBy: null,
  isLoading: false,
  error: null,
};

export const currentProgramSlice = createSlice({
  name: "currentProgram",
  initialState,
  reducers: {
    setStateToEditedProgram: (state, action) => action.payload,
    resetCurrentProgram: (state) => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserCurrentprogram.pending, (state, action) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserCurrentprogram.fulfilled, (state, action) => {
        state.isLoading = false;
        state.programName = action.payload.programName;
        state.workoutDays = action.payload.workoutDays;
      })
      .addCase(fetchUserCurrentprogram.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

// Action creators are generated for each case reducer function
export const { setStateToEditedProgram, resetCurrentProgram } = currentProgramSlice.actions;

export default currentProgramSlice.reducer;
