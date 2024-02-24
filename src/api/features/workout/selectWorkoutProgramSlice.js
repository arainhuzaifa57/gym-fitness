import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { updateCurrentProgram } from "../user/userDataSlice";

const convertTimestampToISO = (timestamp) => timestamp?.toDate()?.toISOString();

// add new workout program to user created workouts subcollection
export const addProgramToUserCreatedCollection = createAsyncThunk(
  "workoutProgram/addProgramToUserCollection",
  async (workoutProgram, thunkAPI) => {
    const uid = auth().currentUser.uid;
    const timestamp = firestore.FieldValue.serverTimestamp();

    const newWorkoutProgram = {
      ...workoutProgram,
      createdBy: uid,
      createdAt: timestamp,
    };

    const addProgram = await firestore()
      .collection("users")
      .doc(uid)
      .collection("userCreatedPrograms")
      .add(newWorkoutProgram);

    // Fetch the saved document to get the actual timestamp
    const savedProgramDoc = await firestore()
      .collection("users")
      .doc(uid)
      .collection("userCreatedPrograms")
      .doc(addProgram.id)
      .get();
    const savedProgramData = savedProgramDoc.data();

    // Ensure the saved data exists and has a 'createdAt' field
    if (savedProgramData && "createdAt" in savedProgramData) {
      newWorkoutProgram.createdAt = savedProgramData.createdAt
        .toDate()
        .toISOString();
    }

    const newProgram = { id: addProgram.id, ...newWorkoutProgram };
    thunkAPI.dispatch(updateCurrentProgram(newProgram.id));
    return newProgram;
  }
);

// fetch user created workout programs from subcollection
export const fetchUserCreatedProgram = createAsyncThunk(
  "workoutProgram/fetchUserCreatedProgram",
  async () => {
    const uid = auth().currentUser.uid;
    const querySnapshot = await firestore()
      .collection("users")
      .doc(uid)
      .collection("userCreatedPrograms")
      .get();

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

    console.log("user created workouts fetched");
    console.log(workoutPrograms);
    return workoutPrograms;
  }
);

// update workout program in firestore
export const updateWorkoutProgram = createAsyncThunk(
  "workoutProgram/updateWorkoutProgram",
  async ({ workoutProgram, programId }) => {
    console.log(programId);
    console.log(workoutProgram);
    const uid = auth().currentUser.uid;
    console.log(uid);
    const updatedWorkoutProgram = {
      ...workoutProgram,
      updatedAt: firestore.FieldValue.serverTimestamp(), // Add the server timestamp
    };

    try {
      await firestore()
        .collection("users")
        .doc(uid)
        .collection("userCreatedPrograms")
        .doc(programId)
        .update(updatedWorkoutProgram);
      console.log("Document successfully replaced!");
    } catch (error) {
      console.error("Error replacing document:", error);
    }
    return workoutProgram;
  }
);

const initialState = {
  workoutPrograms: [],
};

export const selectWorkoutProgramSlice = createSlice({
  name: "selectWorkoutProgram",
  initialState,
  reducers: {
    // add Workout Program
    addWorkoutProgram: (state, action) => {
      console.log(action.payload);
      state.workoutPrograms.push(action.payload);
    },
    // updates specific update day
    edittedWorkoutProgram: (state, action) => {
      const newWorkoutProgram = action.payload.selectedWorkoutProgram;
      const index = action.payload.index;
      console.log("edittedWorkoutProgram ran");
      const updatedWorkoutProgram = [...state.workoutPrograms];
      updatedWorkoutProgram[index] = newWorkoutProgram;
      state.workoutPrograms = updatedWorkoutProgram;
    },
    //remove workoutday from list.
    deleteWorkoutProgram: (state, action) => {
      console.log("delete workout day" + action.payload);

      state.workoutPrograms = state.workoutPrograms.filter((val, i) => {
        if (i !== action.payload) {
          return val;
        }
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addProgramToUserCreatedCollection.fulfilled, (state, action) => {
        state.workoutPrograms.push(action.payload);
      })
      .addCase(fetchUserCreatedProgram.fulfilled, (state, action) => {
        console.log("fetch sucess");
        state.workoutPrograms = action.payload;
      })
      .addCase(updateWorkoutProgram.fulfilled, (state, action) => {
        console.log("fetch sucess");
      });
  },
});

// Action creators are generated for each case reducer function
export const {
  deleteWorkoutProgram,
  addWorkoutProgram,
  edittedWorkoutProgram,
} = selectWorkoutProgramSlice.actions;

export default selectWorkoutProgramSlice.reducer;
