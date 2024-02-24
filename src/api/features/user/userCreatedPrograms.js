import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

const convertTimestampToISO = (timestamp) => timestamp?.toDate()?.toISOString();

// fetch user created workout programs from subcollection
export const fetchUserCreatedPrograms = createAsyncThunk(
  "workoutProgram/fetchUserCreatedProgram",
  async () => {
    const uid = auth().currentUser.uid;
    const querySnapshot = await firestore()
      .collection("users")
      .doc(uid)
      .collection("userCreatedPrograms")
      .get();

    // const workoutPrograms = querySnapshot.docs.map((doc) => ({
    //    id: doc.id,
    //    workoutProgram: doc.data(),
    //  }))

    const workoutPrograms = querySnapshot.docs.map((doc) => {
      const data = doc.data();

      // Convert the timestamps
      if (data.createdAt) {
        data.createdAt = convertTimestampToISO(data.createdAt);
      }
      if (data.updatedAt) {
        data.updatedAt = convertTimestampToISO(data.updatedAt);
      }

      return {
        id: doc.id,
        workoutProgram: data,
      };
    });

    // console.log('user created workouts fetched')
    // console.log(workoutPrograms)
    return workoutPrograms;
  }
);

// delete selected program from
export const deleteCurrentProgram = createAsyncThunk(
  "userCreatedPrograms/deleteSelectedProgram",
  async (programId) => {
    const uid = auth().currentUser.uid;

    try {
      await firestore()
        .collection("users")
        .doc(uid)
        .collection("userCreatedPrograms")
        .doc(programId)
        .delete();
    } catch (e) {
      console.error("error removing document" + e);
    }
  }
);

const initialState = {
  workoutPrograms: [],
};

export const userCreatedProgramsSlice = createSlice({
  name: "userCreatedPrograms",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchUserCreatedPrograms.fulfilled, (state, action) => {
      console.log("fetch sucess");
      state.workoutPrograms = action.payload;
    });
  },
});

// Action creators are generated for each case reducer function
export const {} = userCreatedProgramsSlice.actions;

export default userCreatedProgramsSlice.reducer;
