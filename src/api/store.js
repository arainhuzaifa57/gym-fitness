import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import thunk from "redux-thunk";
import counterReducer from "../utils/features/counter/counterSlice";
import workoutReducer from "./features/workout/workoutSlice";
import workoutProgramReducer from "./features/workout/workoutProgramSlice";
import selectWorkoutProgramReducer from "./features/workout/selectWorkoutProgramSlice";
import userDataReducer from "./features/user/userDataSlice";
import currentProgramReducer from "./features/workout/currentProgramSlice";
import userCreatedProgramsReducer from "./features/user/userCreatedPrograms";
import intervalTimerReducer from "./features/tools/intervalTimerSlice";
import intervalTemplatesReducer from "./features/tools/intervalTemplatesSlice";
import workoutCalendarReducer from "./features/workoutCalendar/workoutCalendarSlice";
import macroCalculatorReducer from "./features/tools/macroCalculator/calculateMacrosSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import workoutTemplateReducer from "./features/workout/workoutTemplate"

const persistConfig = {
  key: "root",
  storage: AsyncStorage,
};

const rootReducer = combineReducers({
  counter: counterReducer,
  workout: workoutReducer,
  workoutProgram: workoutProgramReducer,
  selectWorkoutProgram: selectWorkoutProgramReducer,
  userData: userDataReducer,
  currentProgram: currentProgramReducer,
  userCreatedPrograms: userCreatedProgramsReducer,
  intervalTimer: intervalTimerReducer,
  intervalTemplates: intervalTemplatesReducer,
  workoutCalendar: workoutCalendarReducer,
  macroCalculator: macroCalculatorReducer,
  workoutTemplate: workoutTemplateReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: [thunk],
});

export const persistor = persistStore(store);
