export const routes = {
  auth: "auth",
  bottom: "bottom",
  app: "app",
  //Workout screens
  workout: "workout",
  recordWorkout: "recordWorkout",
  selectExerciseModal: "selectExerciseModal",
  selectProgramPage: "selectProgramPage",
  editWorkoutDay: "editWorkoutDay",
  createWorkoutDay: "createWorkoutDay",
  editSelectedProgram: "editSelectedProgram",
  editWorkoutProgram: "editWorkoutProgram",
  createWorkoutProgram: "createWorkoutProgram",
  selectProgram: "selectProgram",
  selectWorkoutPage: "selectWorkoutPage",
  exerciseHistory: "exerciseHistory",
  //Tools Screens
  selectTimerModal: "selectTimerModal",
  useIntervalTimerPage: "useIntervalTimerPage",
  hitTimer: "hitTimer",
  selectIntervalWorkout: "selectIntervalWorkout",
  selectedIntervalTemplate: "selectedIntervalTemplate",
  createIntervalTimer: "createIntervalTimer",
  weightTracker: "weightTracker",
  addWeight: "AddWeight",
  macroCalculator: "macroCalculator",
  selectActivityModal: "selectActivityModal",
  selectGoalModal: "selectGoalModal",
  //Calendar Screens
  workoutDayHistory: "workoutDayHistory",
  selectedWorkoutDayHistory: "selectedWorkoutDayHistory",

  // Auth Screens
  login: "loginScreen",
  signUp: "signUpScreen",
  //Bottom Tab Screens
  home: "home",
  search: "search",
  profile: "profile",
  group: "group",
  //Social Screens
  userProfile: "userProfile",
  userFollowers: "userFollowers",
  notification: "notification",
  followRequests: "followRequests",
  leaderboard: "leaderboard",
  inviteMembers: "inviteMembers",
  paymentDetails: "paymentDetails",
  settings: "setting",
  postDetail: "postDetail",
};

export const collections = {
  users: "users",
  userPosts: "userPosts",
  postComments: "postComments",
  userWorkout: "userWeight",
  notification: "notifications",
  recordedWorkouts: "recordedWorkouts",
  groups: "groups",
  workoutPrograms: "userCreatedPrograms",
  userCreatedIntervalTemplate: "userCreatedIntervalTemplate",
};

export const endPoints = {
  createCustomer: "create-customer",
  createSubscription: "create-subscription",
  cancelSubscription: "cancel-subscription",
  getCustomer: "get-customer",
  updateSubscription: "update-subscription",
};
