import {
  createSlice,
  createAction,
  PayloadAction,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import React from "react";
import { set } from "react-native-reanimated";
import { useSelector } from "react-redux";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { addRecordedWorkoutDate } from "../user/userDataSlice";
import { incrementTotalWorkoutsCount, updateTotalWorkoutDuration } from "../../firebase/db";

// add recorded workoutday to user recordedWorkouts subcollection and date to recordedWorkoutsDates
export const addRecordedWorkout = createAsyncThunk(
  "workout/addRecordedWorkout",
  async ({workoutDay, duration}) => {
    const uid = auth().currentUser.uid;
    // const updatedWorkoutDay = {...workoutDay, createdAt: firestore.FieldValue.serverTimestamp()}

    // Include duration in the updatedWorkoutDay object
    const updatedWorkoutDay = {
      ...workoutDay, 
      createdAt: firestore.FieldValue.serverTimestamp(),
      duration // added duration field
    };
  
    const addRecordedWorkout = await firestore()
      .collection("users")
      .doc(uid)
      .collection("recordedWorkouts")
      .add(updatedWorkoutDay);

    await incrementTotalWorkoutsCount(uid);
    await addExerciseHistory(workoutDay)
    await updateTotalWorkoutDuration(uid, duration)

    console.log("document added to sub collection");
    const recordedWorkout = { id: addRecordedWorkout.id, updatedWorkoutDay};
    return recordedWorkout;
  }
);

const addExerciseHistory = async (workoutDay) => {
  const uid = auth().currentUser.uid;
  const currentDate = new Date();
  const documentName = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}_${uid}`;
  const workoutDocRef = firestore()
    .collection("users")
    .doc(uid)
    .collection("monthlyWorkouts")
    .doc(documentName);

  const batch = firestore().batch();

  // Adjust for timezone before converting to ISO string
  const offset = currentDate.getTimezoneOffset() * 60000; // convert offset to milliseconds
  const adjustedDate = new Date(currentDate - offset);
  const formattedDate = adjustedDate.toISOString().split('T')[0]; // YYYY-MM-DD format

  workoutDay.exercises.forEach((exerciseData) => {
    if (exerciseData.exercise !== "Select an exercise") {
      const workoutSession = {
        date: formattedDate,  // Use client-generated date
        sets: exerciseData.sets,
        // any other relevant data here
      };

      const exerciseField = `${exerciseData.exercise}`;
      batch.set(workoutDocRef, {
        [exerciseField]: firestore.FieldValue.arrayUnion(workoutSession)
      }, { merge: true });
    }
  });

  await batch.commit();
};


const initialState = {
  workoutDay: null,
  createdAt: null,
  exercises: [
    {
      exercise: "Select an exercise",
      show: true,
      sets: [{ weight: "", rep: "" }],
    },
  ],
};

export const workoutSlice = createSlice({
  name: "workout",
  initialState,
  reducers: {
    // add a new exercise card.
    addExerciseSet: (state) => {
      state.exercises.push({
        exercise: "Select an exercise",
        show: true,
        sets: [{ weight: "", rep: "" }],
      });
    },
    // delete the selected exercise card
    deleteExerciseSet: (state, action) => {
      console.log("deleteExerciseSet payload:", action.payload);
      state.exercises = state.exercises.filter((val, i) => {
        if (i !== action.payload) {
          return val;
        }
      });
    },
    // update the exercise name after selecting in list modal.
    updateExercise: (state, action) => {
      console.log(action.payload);
      const exercise = action.payload.item;
      const index = action.payload.i;

      const newExercises = state.exercises.map((item, i) => {
        if (index == i) {
          return { ...item, exercise: exercise };
        }
        return item;
      });
      console.log(newExercises);
      state.exercises = newExercises;
    },
    // hide/show sets in specific card.
    showSets: (state, action) => {
      let updatedShows = state.exercises.map((item, i) => {
        if (action.payload == i) {
          return { ...item, show: !item.show };
        }
        return item;
      });
      state.exercises = updatedShows;
    },
    // update weight and reps text
    updateWeightSets: (state, action) => {
      const cardIndex = action.payload.cardIndex;
      const setIndex = action.payload.index;
      const data = action.payload.data;

      console.log(data);
      console.log(cardIndex);

      const newExercises = state.exercises.map((item, i) => {
        if (cardIndex == i) {
          return { ...item, sets: data };
        }
        return item;
      });
      state.exercises = newExercises;
    },
    // add set to exercise card
    addSet: (state, action) => {
      const newExercises = state.exercises.map((item, i) => {
        if (action.payload == i) {
          item.sets.push({ weight: "", rep: "" });
        }
        return item;
      });

      state.exercises = newExercises;
    },
    deleteSet: (state, action) => {
      const cardIndex = action.payload.cardIndex;
      const setIndex = action.payload.index;
      console.log(action.payload);

      let updatedExercises = state.exercises.map((item, i) => {
        if (cardIndex == i) {
          let updatedSet = item.sets.filter((val, i) => {
            if (setIndex !== i) {
              return val;
            }
          });
          return { ...item, sets: updatedSet };
        }
        return item;
      });

      state.exercises.map;
      console.log(updatedExercises);
      state.exercises = updatedExercises;
    },
    updateWorkoutDay: (state, action) => {
      state.workoutDay = action.payload;
    },
    resetInitialState: (state) => initialState,
    editWorkout: (state, action) => {
      console.log(action.payload);
      state.workoutDay = action.payload.workoutDay;
      state.exercises = action.payload.exercises;
    },
    handleInputChange: (state, action) => {
      const cardIndex = action.payload.cardIndex;
      const setIndex = action.payload.i;
      const data = action.payload.text;
      const exercises = state.exercises;
      const field = action.payload.field;

      // Clone the workouts array
      const updatedWorkouts = [...exercises];

      // Clone the specific workout's exercises array
      const updatedSets = [...updatedWorkouts[cardIndex].sets];

      // Update the specific field for the exercise at the given index
      updatedSets[setIndex][field] = data;

      // Update the exercises array in the specific workout
      updatedWorkouts[cardIndex].sets = updatedSets;

      // Set the updated workouts array to state
      state.exercises = updatedWorkouts;
    },
    setToRecordedWorkoutDayData: (state, action) => action.payload,
    setExercisesToTemplate: (state, action) => {
            // action.payload is expected to be an array of exercises from the template
            const templateExercises = action.payload;

            // Create a new array of exercises based on the template
            state.exercises = templateExercises.map((exercise) => {
              return {
                ...exercise,
                sets: exercise.sets.map(() => ({ weight: '', rep: '' })) // Set weight and rep to empty strings
              };
            });
    }
  },

});

export const exercises = (state) => state.workout.exercises;

// Action creators are generated for each case reducer function
export const {
  addExerciseSet,
  deleteExerciseSet,
  updateExercise,
  showSets,
  updateWeightSets,
  addSet,
  deleteSet,
  updateWorkoutDay,
  resetInitialState,
  editWorkout,
  handleInputChange,
  setToRecordedWorkoutDayData,
  setExercisesToTemplate
} = workoutSlice.actions;

export default workoutSlice.reducer;
