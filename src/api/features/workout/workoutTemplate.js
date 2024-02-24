import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";


const initialState = {
    templateExercises: []
};

export const workoutTemplateSlice = createSlice({
    name: "workoutTemplate",
    initialState,
    reducers: {
        // updates the program name
        setExercisesTemplate: (state, action) => {
            state.templateExercises = action.payload;
            console.log("exercises template set")
        },

        deleteTemplateSet: (state, action) => {
            const cardIndex = action.payload.cardIndex;
            const setIndex = action.payload.index;

            let updatedExercises = state.templateExercises.map((item, i) => {
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

            state.templateExercises = updatedExercises;
        },
        // delete the selected exercise card
        deleteTemplateExerciseSet: (state, action) => {
            console.log("deleteTemplateExerciseSet payload:", action.payload);
            
            state.templateExercises = state.templateExercises.filter((val, i) => {
                if (i !== action.payload) {
                    return val;
                }
            });
        },
    },
});

// Action creators are generated for each case reducer function
export const {
    setExercisesTemplate,
    deleteTemplateSet,
    deleteTemplateExerciseSet,
} = workoutTemplateSlice.actions;

export default workoutTemplateSlice.reducer;
