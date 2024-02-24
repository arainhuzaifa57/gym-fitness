import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

// fetch user data
export const fetchUserData = createAsyncThunk(
  "userData/fetchUserData",
  async () => {
    const uid = auth().currentUser.uid;
    const docSnap = await firestore().collection("users").doc(uid).get();
    // console.log('DocSnap>>', docSnap)
    if (docSnap?.exists) {
      console.log("fetched document user data");
      const data = docSnap.data();
      // Check if 'recordedWorkoutDates' exists in the fetched data and is an array
      // if (
      //   data?.recordedWorkoutsDates &&
      //   Array.isArray(data?.recordedWorkoutsDates)
      // ) {
      //   // Convert the array of timestamps to an array of ISO strings
      //   data.recordedWorkoutsDates = data?.recordedWorkoutsDates?.map(
      //     (timestamp) => timestamp.toDate().toISOString()
      //   );
      // }

      const userData = { id: docSnap.id, userData: data };
      return userData;
    } else {
      console.log("no document");
    }
  }
);

// update current program to selection
export const updateCurrentProgram = createAsyncThunk(
  "userData/updateCurrentProgram",
  async (newProgramId) => {
    const uid = auth().currentUser.uid;
    await firestore()
      .collection("users")
      .doc(uid)
      .update({
        currentProgram: newProgramId,
      })
      .then(() => {
        console.log("Current Program ID updated successfully");
      })
      .catch((error) => {
        console.log("Error updating document:", error);
      });

    return newProgramId;
  }
);

const initialState = {
  userData: null,
  loading: false,
  error: null,
  allUsers: [],
  bio: "",
  currentProgram: "",
  username: "",
  totalWorkoutsCount: "",
  createdAt: null,
  followers: 0,
  following: 0,
  name: "",
  profilePicture: "",
  isLoading: false,
  error: null,
  totalDuration: 0,
};

export const userDataSlice = createSlice({
  name: "userData",
  initialState,
  reducers: {
    fetchDataSuccess: (state, action) => {
      state.userData = action.payload;
      state.loading = false;
      state.error = null;
    },
    saveAllUsers: (state, acction) => {
      state.allUsers = acction.payload;
    },
    setCurrentProgram: (state, action) => {
      console.log("current program updated: " + action.payload);
      state.currentProgram = action.payload;
    },
    clearUserStats: (state) => {
      state.allUsers = [];
      state.userData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.userData = action.payload;
        state.username = action.payload.userData.username;
        state.currentProgram = action.payload.userData.currentProgram;
        state.totalWorkoutsCount = action.payload.userData.totalWorkoutsCount;
        state.bio = action.payload.userData.bio;
        state.followers = action.payload.userData.followers;
        state.following = action.payload.userData.following;
        state.name = action.payload.userData.name;
        state.totalDuration = action.payload.userData.totalDuration;
        state.profilePicture = action.payload.userData.profilePicture;
        state.isLoading = false;
        console.log("set state to user data document");
      })
      .addCase(fetchUserData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(updateCurrentProgram.fulfilled, (state, action) => {
        state.currentProgram = action.payload;
      })
  },
});

// Action creators are generated for each case reducer function
export const {
  fetchDataSuccess,
  fetchDataStart,
  fetchDataFailure,
  setCurrentProgram,
  saveAllUsers,
  clearUserStats,
} = userDataSlice.actions;

export default userDataSlice.reducer;
