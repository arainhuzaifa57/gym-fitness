import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activity: {label: "Select an item"},
  goal: {label: "Select an item"},
};

export const macroCalculatorSlice = createSlice({
  name: 'macroCalculator',
  initialState,
  reducers: {
    updateMacrosField: (state, action) => {
      const { field, value } = action.payload;
      if (field in state) {
        state[field] = value;
      }
    },
    resetMacroCalculator: (state, action) => initialState,
  },
});

// Actions
export const { updateMacrosField, resetMacroCalculator } = macroCalculatorSlice.actions;

// Reducer
export default macroCalculatorSlice.reducer;
