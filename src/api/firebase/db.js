import firestore from "@react-native-firebase/firestore";
import storage from "@react-native-firebase/storage";
import { collections } from "../../constants/routes";
import auth from "@react-native-firebase/auth";

export const checkUniqueName = async (username) => {
  try {
    const usersColRef = firestore().collection(collections.users);
    const querySnapshot = await usersColRef.where("name", "==", username).get();
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push(doc.data());
    });
    if (users?.length > 0) {
      return true;
    } else {
      return false;
    }
  } catch (e) {
    console.log(e);
    return false;
  }
};
// Create a new document
export const createDocument = async (collectionName, docID, data) => {
  try {
    await firestore().collection(collectionName)?.doc(docID).set(data);
    return true; // Return the ID of the newly created document
  } catch (error) {
    console.error("Error creating document:", error);
    throw error;
  }
};

export const uploadFile = async (file) => {
  try {
    let fileName = file.url?.split("/")?.pop();
    const reference = storage().ref(`userProfiles/${fileName}`);
    const task = reference.putFile(file.url);
    await Promise.resolve(task);
    const downloadURL = await storage()
      .ref(`userProfiles/${fileName}`)
      .getDownloadURL();
    return downloadURL;
  } catch (error) {
    console.error("Error uploading profile image:", error);
    throw error;
  }
};

export const getNotifications = async (userID) => {
  try {
    const querySnapshot = await firestore()
      .collection(collections.notification)
      .where("notifyTo", "==", userID)
      .get();
    const notify = [];
    querySnapshot.forEach((doc) => {
      notify.push(doc.data());
    });
    return notify;
  } catch (error) {
    console.error("Error getting Notifications>", error);
    throw error;
  }
};

export const saveNotification = async (docID, data) => {
  try {
    await firestore()
      .collection(collections.notification)
      ?.doc(docID)
      ?.set(data);
    return true;
  } catch (error) {
    console.error("Error saving notification>>", error);
    throw error;
  }
};

export const readAllNotifications = async (userID, condition, type) => {
  try {
    const postsQuerySnapshot = await firestore()
      .collection(collections.notification)
      .where("notifyTo", "==", userID)
      .where("notifyType", condition, type)
      .get();

    // Create a new batch instance
    const batch = firestore().batch();

    postsQuerySnapshot.forEach((documentSnapshot) => {
      batch.update(documentSnapshot.ref, {
        ...documentSnapshot.data(),
        read: true,
      });
    });
    return batch.commit();
  } catch (error) {
    console.error("Error read all Notifications>", error);
    throw error;
  }
};

//uploadFiletoStorage
export const uploadPostFiles = async (files) => {
  // console.log("Files>>", files);
  const uploadTasks = [];

  try {
    for (const file of files) {
      let fileName = file.url?.split("/")?.pop();
      const reference = storage().ref(`postImages/${fileName}`);
      const task = reference.putFile(file.url);

      uploadTasks.push(task);
    }

    const downloadURLs = [];

    await Promise.all(uploadTasks);

    for (const file of files) {
      let fileName = file.url?.split("/")?.pop();
      const downloadURL = await storage()
        .ref(`postImages/${fileName}`)
        .getDownloadURL();

      downloadURLs.push({ postUrl: downloadURL, fileType: file?.type });
    }

    return downloadURLs;
  } catch (error) {
    console.error("Error uploading files:", error);
    throw error;
  }
};

// create post
export const createPost = async (docId, data) => {
  try {
    await firestore().collection(collections.userPosts)?.doc(docId)?.set(data);
    return true;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};

// Create a new document in sub collection
export const addComment = async (docId, subCollectionDocID, data) => {
  try {
    await firestore()
      .collection(collections.userPosts)
      .doc(docId)
      .collection(collections.postComments)
      .doc(subCollectionDocID)
      .set(data);
    console.log("document added to sub collection");
    return true;
  } catch (error) {
    console.error("Error add comment:", error);
    throw error;
  }
};

export const deleteComment = async (docId, subCollectionDocID) => {
  try {
    await firestore()
      .collection(collections.userPosts)
      .doc(docId)
      .collection(collections.postComments)
      .doc(subCollectionDocID)
      .delete();
    console.log("document added to sub collection");
    return true;
  } catch (error) {
    console.error("Error add comment:", error);
    throw error;
  }
};

export const getPostComments = async (docID, limit) => {
  try {
    const querySnapshot = await firestore()
      .collection(collections.userPosts)
      .doc(docID)
      .collection(collections.postComments)
      .limit(limit)
      .get();

    const comments = [];
    querySnapshot.forEach((doc) => {
      comments.push(doc.data());
    });
    return comments;
  } catch (error) {
    console.error("Error get comments:", error);
    throw error;
  }
};

export const getuserPosts = async (userID, lastDocument) => {
  try {
    let query = await firestore()
      .collection(collections.userPosts)
      .where("user.userID", "==", userID)
      .orderBy("createdAt", "desc");
    // sort the data
    // if (lastDocument) {
    //   query = query.startAfter(lastDocument); // fetch data following the last document accessed
    // }
    const querySnapshot = query
      .limit(lastDocument + 5) // limit to your page size
      .get();
    const posts = [];
    (await querySnapshot).forEach((doc) => {
      posts.push(doc.data());
    });
    return {
      newPosts: posts,
      // lastDocument: (await querySnapshot).docs[
      //   (await querySnapshot).docs.length - 1
      // ],
      lastDocument: (await querySnapshot).docs.length,
    };
  } catch (error) {
    console.error("Error getting user Posts:", error);
    throw error;
  }
};

export const getSinglePost = async (docID) => {
  try {
    let post = await firestore()
      .collection(collections.userPosts)
      .doc(docID)
      .get();
    return post.data();
  } catch (error) {
    console.error("Error getting user single Post:", error);
    throw error;
  }
};

export const deletePost = async (docID) => {
  try {
    await firestore().collection(collections.userPosts).doc(docID).delete();
    return true;
  } catch (error) {
    console.error("Error deleting user Posts:", error);
    throw error;
  }
};

// Read a single document by ID
export const getDocumentById = async (collectionName, documentId) => {
  try {
    const docSnap = await firestore()
      .collection(collectionName)
      .doc(documentId)
      .get();

    if (docSnap.exists) {
      return docSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting document:", error);
    throw error;
  }
};

// Update a document
export const updateDocument = async (collectionName, documentId, newData) => {
  try {
    await firestore()
      .collection(collectionName)
      .doc(documentId)
      .update(newData);
    return true;
  } catch (error) {
    console.error("Error updating document:", error);
    throw error;
  }
};

// Delete a document
export const deleteDocument = async (collectionName, documentId) => {
  try {
    await firestore().collection(collectionName).doc(documentId).delete();
  } catch (error) {
    console.error("Error deleting document:", error);
    throw error;
  }
};

export const getFollowingUserPosts = async (followersList, lastDocument) => {
  try {
    let query = await firestore()
      .collection(collections.userPosts)
      .where("user.userID", "in", followersList)
      .orderBy("createdAt", "desc");
    // sort the data
    // if (lastDocument) {
    //   query = query.startAfter(lastDocument); // fetch data following the last document accessed
    // }
    const querySnapshot = query
      .limit(lastDocument + 5) // limit to your page size
      .get();
    const posts = [];
    (await querySnapshot).forEach((doc) => {
      posts.push(doc.data());
    });
    return {
      newPosts: posts,
      // lastDocument: (await querySnapshot).docs[
      //   (await querySnapshot).docs.length - 1
      // ],
      lastDocument: (await querySnapshot).docs.length,
    };
  } catch (error) {
    console.error("Error getting Posts:", error);
    throw error;
  }
};

export const getAllUser = async (userID) => {
  try {
    const querySnapshot = await firestore()
      .collection(collections.users)
      .where("uid", "!=", userID)
      .get();
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push(doc.data());
    });
    return users;
  } catch (error) {
    console.error("Error getting Users:", error);
    throw error;
  }
};

export const uploadUserWeightFiles = async (files) => {
  const uploadTasks = [];

  try {
    for (const file of files) {
      let fileName = file.url?.split("/")?.pop();
      const reference = storage().ref(`userWeight/${fileName}`);
      const task = reference.putFile(file.url);

      uploadTasks.push(task);
    }

    const downloadURLs = [];

    await Promise.all(uploadTasks);

    for (const file of files) {
      let fileName = file.url?.split("/")?.pop();
      const downloadURL = await storage()
        .ref(`userWeight/${fileName}`)
        .getDownloadURL();

      downloadURLs.push({ postUrl: downloadURL, fileType: file?.type });
    }

    return downloadURLs;
  } catch (error) {
    console.error("Error uploading files:", error);
    throw error;
  }
};

export const addUserWeight = async (docID, subCollectionID, data) => {
  try {
    await firestore()
      .collection(collections.users)
      .doc(docID)
      .collection(collections.userWorkout)
      .doc(subCollectionID)
      .set(data);
    return true;
  } catch (error) {
    console.error("Error save user Weight:", error);
    throw error;
  }
};

export const updateUserWeight = async (docID, subCollectionID, data) => {
  try {
    await firestore()
      .collection(collections.users)
      .doc(docID)
      .collection(collections.userWorkout)
      .doc(subCollectionID)
      .update(data);
    return true;
  } catch (error) {
    console.error("Error save user Weight:", error);
    throw error;
  }
};

export const getUserWeight = async (userID) => {
  try {
    const querySnapshot = await firestore()
      .collection(collections.users)
      .doc(userID)
      .collection(collections.userWorkout)
      .get();
    const posts = [];
    querySnapshot.forEach((doc) => {
      posts.push(doc.data());
    });
    return posts;
  } catch (error) {
    console.error("Error getting user Weight:", error);
    throw error;
  }
};

export const deleteUserWeight = async (userID, docID) => {
  try {
    await firestore()
      .collection(collections.users)
      .doc(userID)
      .collection(collections.userWorkout)
      .doc(docID)
      .delete();
    return true;
  } catch (error) {
    console.error("Error getting user Weight:", error);
    throw error;
  }
};

export const uploadGroupFile = async (file) => {
  try {
    let fileName = file.url?.split("/")?.pop();
    const reference = storage().ref(`groups/${fileName}`);
    const task = reference.putFile(file.url);
    await Promise.resolve(task);
    const downloadURL = await storage()
      .ref(`groups/${fileName}`)
      .getDownloadURL();
    return downloadURL;
  } catch (error) {
    console.error("Error uploading group profile image:", error);
    throw error;
  }
};

export const getGroupList = async (userID) => {
  try {
    const querySnapshot = await firestore()
      .collection(collections.groups)
      .where("members", "array-contains", userID)
      .get();
    const groups = [];
    querySnapshot.forEach(async (doc) => {
      groups.push(doc.data());
    });
    return groups;
  } catch (error) {
    console.error("Error getting Groups:", error);
    throw error;
  }
};

export const getGroupMembers = async (membersArray, groupCreatedBy) => {
  try {
    const querySnapshot = await firestore()
      .collection(collections.users)
      .where("uid", "in", membersArray)
      .get();
    const users = [];
    querySnapshot.forEach(async (doc) => {
      users.push(doc.data());
    });
    // const filterusers = [];
    // for (const user of users.docs) {
    //   await firestore()
    //     .collection(collections.users)
    //     .doc(user?.uid)
    //     .collection(collections.recordedWorkouts)
    //     .where("createdAt", ">=", groupCreatedBy)
    //     .get()
    //     .then((record) => {
    //       let total = record.size;
    //       // console.log("Record Size:", total);
    //       filterusers.push({ ...user.data(), workout: total });
    //     });
    // }
    return users;
  } catch (error) {
    console.error("Error getting Groups:", error);
    throw error;
  }
};

//fetch all the users recorded workout dates for the month for calendar component
export const fetchWorkoutDatesForMonth = async (uid, year, month) => {
  // Calculate the start and end dates of the month
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);

  try {
    // Query the Firestore database
    const querySnapshot = await firestore()
      .collection(collections.users)
      .doc(uid)
      .collection(collections.recordedWorkouts)
      .where("createdAt", ">=", startDate)
      .where("createdAt", "<=", endDate)
      .get();
    // Extract dates and convert them to your desired format
    const workoutDates = querySnapshot.docs.map((doc) => {
      console.log("doc id is " + doc.id);
      const data = doc.data();
      return data.createdAt.toDate().toISOString(); // or any other format
    });
    // Return the array of dates or send it to your calendar component
    return workoutDates;
  } catch (error) {
    console.error("Error getting recorded workouts:", error);
    throw error;
  }
};

export const getExerciseHistoryData = async (userId, exerciseName) => {
  try {
    const userWorkoutsCollection = firestore()
      .collection("users")
      .doc(userId)
      .collection("recordedWorkouts");

    const snapshot = await userWorkoutsCollection
      .orderBy("date", "desc")
      .limit(1)
      .get();

    if (!snapshot.empty) {
      const latestWorkout = snapshot.docs[0].data();
      const exerciseData = latestWorkout[exerciseName];
      return exerciseData; // Returning the latest exercise data
    } else {
      console.log("No workout data found for user", userId);
      return null;
    }
  } catch (error) {
    console.error("Error getting workout data for user", userId, ":", error);
    return null;
  }
};

export const incrementTotalWorkoutsCount = async (uid) => {
  const userDocRef = firestore().collection("users").doc(uid);

  await firestore().runTransaction(async (transaction) => {
    const userDoc = await transaction.get(userDocRef);
    const currentCount = userDoc.data().totalWorkoutsCount || 0;
    transaction.update(userDocRef, { totalWorkoutsCount: currentCount + 1 });
  });

  console.log("Recorded workouts count updated");
};

export const decrementTotalWorkoutsCount = async (uid) => {
  const userDocRef = firestore().collection("users").doc(uid);

  await firestore().runTransaction(async (transaction) => {
    const userDoc = await transaction.get(userDocRef);
    const currentCount = userDoc.data().totalWorkoutsCount || 0;
    transaction.update(userDocRef, {
      totalWorkoutsCount: Math.max(0, currentCount - 1),
    });
  });

  console.log("Recorded workouts count decremented");
};

// Delete a document from a collection or subcollection
export const deleteDocumentFromPath = async (path, documentId) => {
  try {
    await firestore().doc(`${path}/${documentId}`).delete();
  } catch (error) {
    console.error("Error deleting document:", error);
    throw error;
  }
};

// Get WOrkout Program count
export const getWorkoutProgramCount = async (docID) => {
  try {
    let querySnapshot = await firestore()
      .collection(collections.users)
      .doc(docID)
      .collection(collections.workoutPrograms)
      .get();
    let count = [];
    querySnapshot.forEach(async (doc) => {
      count.push(doc.data());
    });
    return count;
  } catch (error) {
    console.error("Error get workout collection length:", error);
    throw error;
  }
};

// Get Templates count
export const getTemplatesCount = async (docID) => {
  try {
    let querySnapshot = await firestore()
      .collection(collections.users)
      .doc(docID)
      .collection(collections.userCreatedIntervalTemplate)
      .get();
    let count = [];
    querySnapshot.forEach(async (doc) => {
      count.push(doc.data());
    });
    return count;
  } catch (error) {
    console.error("Error get workout collection length:", error);
    throw error;
  }
};

export const fetchMonthlyWorkoutHistory = async (userId) => {
  const uid = userId;
  const currentDate = new Date();
  const documentName = `${currentDate.getFullYear()}-${String(
    currentDate.getMonth() + 1
  ).padStart(2, "0")}_${uid}`;

  try {
    const workoutDocRef = firestore()
      .collection("users")
      .doc(uid)
      .collection("monthlyWorkouts")
      .doc(documentName);

    const doc = await workoutDocRef.get();

    if (doc.exists) {
      console.log("got monthy workout " + doc.data());
      return doc.data();
    } else {
      console.log("No workout history found for this month");
      return {};
    }
  } catch (error) {
    console.error("Error fetching workout history:", error);
    return {};
  }
};

export const updateTotalWorkoutDuration = async (uid, duration) => {
  const userDocRef = firestore().collection("users").doc(uid);

  try {
    await firestore().runTransaction(async (transaction) => {
      // Get the current user document
      const userDoc = await transaction.get(userDocRef);

      if (!userDoc.exists) {
        throw new Error("User document does not exist!");
      }

      // Get the current total duration and add the new duration
      const currentTotalDuration = userDoc.data().totalDuration || 0;
      const newTotalDuration = currentTotalDuration + duration;

      // Update the user document with the new total duration
      transaction.update(userDocRef, { totalDuration: newTotalDuration });
    });

    console.log("Total workout duration updated successfully.");
  } catch (error) {
    console.error("Failed to update total workout duration:", error);
  }
};

export const deleteWorkout = (docId, userId) => {
  if (userId && docId) {
    const workoutDocRef = firestore()
      .collection(`users/${userId}/recordedWorkouts`)
      .doc(docId);
    const userDocRef = firestore().collection("users").doc(userId);

    firestore()
      .runTransaction(async (transaction) => {
        const workoutDoc = await transaction.get(workoutDocRef);
        if (!workoutDoc.exists) {
          throw new Error("Workout document does not exist!");
        }

        const workoutDuration = workoutDoc.data().duration || 0;

        const userDoc = await transaction.get(userDocRef);
        if (!userDoc.exists) {
          throw new Error("User document does not exist!");
        }

        const currentTotalDuration = userDoc.data().totalDuration || 0;
        const newTotalDuration = currentTotalDuration - workoutDuration;

        if (newTotalDuration >= 0) {
          transaction.update(userDocRef, { totalDuration: newTotalDuration });
        }

        transaction.delete(workoutDocRef);
      })
      .then(() => {
        decrementTotalWorkoutsCount(userId);
        console.log(
          "Recorded workout day deleted successfully and total duration updated."
        );
      })
      .catch((error) => {
        console.error("Error in transaction:", error);
      });
  } else {
    console.log("No user logged in or document id is missing");
  }
};

export const deleteAccount = async (userID) => {
  try {
    let success = false;
    await firestore()
      .collection(collections.users)
      .doc(userID)
      .delete()
      .then(async () => {
        await massDeleteAllUserNotifications(userID);
      })
      .then(async () => {
        await massDeleteAllUserPosts(userID);
      })
      .then(() => {
        success = true;
      })
      .catch((err) => {
        console.log(err);
        success = false;
      });
    return success;
  } catch (error) {
    console.error("Error delete user account:", error);
    throw error;
  }
};

export const massDeleteAllUserNotifications = async (userID) => {
  try {
    const postsQuerySnapshot = await firestore()
      .collection(collections.notification)
      .where("notifyTo", "==", userID)
      .get();

    // Create a new batch instance
    const batch = firestore().batch();

    postsQuerySnapshot.forEach((documentSnapshot) => {
      batch.delete(documentSnapshot.ref);
    });
    console.log("user notifications Deleted!");
    return batch.commit();
  } catch (error) {
    console.error("Error delete all Notifications>", error);
    throw error;
  }
};

export const massDeleteAllUserPosts = async (userID) => {
  try {
    const postsQuerySnapshot = await firestore()
      .collection(collections.userPosts)
      .where("user.userID", "==", userID)
      .get();

    // Create a new batch instance
    const batch = firestore().batch();

    postsQuerySnapshot.forEach((documentSnapshot) => {
      batch.delete(documentSnapshot.ref);
    });
    console.log("user posts Deleted!");
    return batch.commit();
  } catch (error) {
    console.error("Error delete all user posts>", error);
    throw error;
  }
};
