import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import React from "react";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

// fetch a specific recorded workout day.
export const fetchRecordedWorkoutDay = createAsyncThunk(
  "workoutCalendar/fetchRecordedWorkoutDay",
  async (date) => {
    const uid = auth().currentUser.uid;

    const [year, month, day] = date.split("-");
    const specificDate = new Date(year, month - 1, day);

    // Construct the start and end timestamps for that specific date
    const startTimestamp = firestore.Timestamp.fromDate(
      new Date(specificDate.setHours(0, 0, 0, 0))
    );
    const endTimestamp = firestore.Timestamp.fromDate(
      new Date(specificDate.setHours(23, 59, 59, 999))
    );
    const querySnapshot = await firestore()
      .collection("users")
      .doc(uid)
      ?.collection("recordedWorkouts")
      ?.where("createdAt", ">=", startTimestamp)
      ?.where("createdAt", "<=", endTimestamp)
      .get();

    // Convert QuerySnapshot to an array of document data
    const recordedWorkoutsArray = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      console.log('got data' + data)

      // Convert Timestamp to Date, then to string format
      if (data.createdAt) {
        data.createdAt = data.createdAt.toDate().toISOString();
      }

      return {
        id: doc.id,
        ...data,
      };
    });
    // // Log the array for debugging
    console.log(recordedWorkoutsArray);

    // // Return the array
    return recordedWorkoutsArray;
  }
);

const initialState = {
  recordedWorkoutDays: [],
  isLoading: false,
  error: null,
};

export const workoutCalendarSlice = createSlice({
  name: "workoutCalendar",
  initialState,
  reducers: {
    deleteRecordedWorkoutDay: (state, action) => {
      state.recordedWorkoutDays = state.recordedWorkoutDays.filter(
        workout => workout.id !== action.payload
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecordedWorkoutDay.pending, (state, action) => {
        state.isLoading = true;
      })
      .addCase(fetchRecordedWorkoutDay.fulfilled, (state, action) => {
        state.isLoading = false;
        state.recordedWorkoutDays = action.payload;
      })
      .addCase(fetchRecordedWorkoutDay.rejected, (state, action) => {
        state.error = action.error.message;
      });
  },
});

export const { deleteRecordedWorkoutDay } = workoutCalendarSlice.actions;

export default workoutCalendarSlice.reducer;
