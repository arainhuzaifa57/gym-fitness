import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

const convertTimestampToISO = (timestamp) => timestamp?.toDate()?.toISOString();

// fetch user created interval templates  from subcollection
export const fetchUserIntervalTemplates = createAsyncThunk(
  "intervalTemplates/fetchUserIntervalTemplates",
  async () => {
    const uid = auth().currentUser.uid;
    const querySnapshot = await firestore()
      .collection("users")
      .doc(uid)
      .collection("userCreatedIntervalTemplate")
      .get();

    const intervalTemplates = querySnapshot.docs.map((doc) => {
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
        template: data,
      };
    });
    console.log("user created templates workouts fetched");
    console.log(intervalTemplates);
    return intervalTemplates;
  }
);

// delete selected template
export const deleteSelectedTemplate = createAsyncThunk(
  "intervalTemplates/deleteSelectedTemplate",
  async ({ item, index }) => {
    const uid = auth().currentUser.uid;

    try {
      await firestore()
        .collection("users")
        .doc(uid)
        .collection("userCreatedIntervalTemplate")
        .doc(item.id)
        .delete();
      return index;
    } catch (e) {
      console.error("error removing document" + e);
    }
  }
);

// update a specific workout program in user created workouts subcollection
export const updateTemplateInUserCollection = createAsyncThunk(
  "intervaltimer/updateTemplateInUserCollection",
  async ({ templateId, updatedTemplateData }, thunkAPI) => {
    try {
      const uid = auth().currentUser.uid;

      // Update the document in the subcollection
      await firestore()
        .collection("users")
        .doc(uid)
        .collection("userCreatedIntervalTemplate")
        .doc(templateId)
        .update(updatedTemplateData);

      console.log("document updated in interval timer template collection");

      // You might want to dispatch an action to update your Redux store
      // thunkAPI.dispatch(updateTemplateInStore({ templateId, updatedTemplateData }));

      return { templateId, updatedTemplateData };
    } catch (error) {
      // Handle any errors here
      console.error("Error updating document in sub collection", error);
      return thunkAPI.rejectWithValue(error);
    }
  }
);


const initialState = {
  intervalTemplates: [],
  isLoading: false,
  error: null,
};

export const intervalTemplatesSlice = createSlice({
  name: "intervalTemplates",
  initialState,
  reducers: {
    setRounds: (state, action) => {
      state.rounds = action.payload;
    },
    removeTemplate: (state, action) => {
      state.intervalTemplates.splice(action.payload, 1);
    },
    addNewTemplate: (state, action) => {
      state.intervalTemplates.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserIntervalTemplates.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserIntervalTemplates.fulfilled, (state, action) => {
        console.log("fetch sucess");
        state.isLoading = false;
        state.intervalTemplates = action.payload;
      })
      .addCase(fetchUserIntervalTemplates.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(deleteSelectedTemplate.fulfilled, (state, action) => {
        state.intervalTemplates.splice(action.payload, 1);
      })
       .addCase(updateTemplateInUserCollection.fulfilled, (state, action) => {
         const index = state.intervalTemplates.findIndex(template => template.id === action.payload.templateId);
         console.log(action.payload.templateId)
         console.log('found template in array')
         if (index !== -1) {
           console.log(action.payload.updatedTemplateData)
           state.intervalTemplates[index] = { ...state.intervalTemplates[index], ...action.payload.updatedTemplateData };
           console.log('updated interval template state in array')
         }
       });
  },
});

// Action creators are generated for each case reducer function
export const { addNewTemplate, removeTemplate, updateIntervalTemplate } =
  intervalTemplatesSlice.actions;

export default intervalTemplatesSlice.reducer;
