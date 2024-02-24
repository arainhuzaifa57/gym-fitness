import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

const initialState = {
  programName: null,
  workoutDays: [],
  createdAt: null,
  createdBy: null,
};

export const workoutProgramSlice = createSlice({
  name: "workoutProgram",
  initialState,
  reducers: {
    // updates the program name
    updateProgramName: (state, action) => {
      state.programName = action.payload;
    },
    // add workout day
    addWorkoutDay: (state, action) => {
      state.workoutDays.push(action.payload);
    },
    //set to intial state
    resetWorkoutProgram: (state) => initialState,
    // updates specific update day
    edittedWorkoutDay: (state, action) => {
      const newWorkoutDay = action.payload.workoutDay;
      const index = action.payload.index;

      const updatedWorkoutday = [...state.workoutDays];
      updatedWorkoutday[index] = newWorkoutDay;
      state.workoutDays = updatedWorkoutday;
    },
    //remote workoutday from list.
    deleteWorkoutDay: (state, action) => {
      console.log("delete workout day" + action.payload);

      state.workoutDays = state.workoutDays.filter((val, i) => {
        if (i !== action.payload) {
          return val;
        }
      });
    },
    editWorkoutProgram: (state, action) => {
      console.log(action.payload);
      state.workoutDays = action.payload.workoutDays;
      state.programName = action.payload.programName;
    },
    editCurrentProgram: (state, action) => {
      console.log(action.payload);
      state.workoutDays = action.payload.workoutProgram.workoutDays;
      state.programName = action.payload.workoutProgram.programName;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  updateProgramName,
  addWorkoutDay,
  resetWorkoutProgram,
  edittedWorkoutDay,
  deleteWorkoutDay,
  editWorkoutProgram,
  editCurrentProgram,
} = workoutProgramSlice.actions;

export default workoutProgramSlice.reducer;
