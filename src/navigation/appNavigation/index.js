import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Platform,
} from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { routes } from "../../constants/routes";
import * as App from "../../screens/app";
import { height, totalSize, width } from "react-native-dimension";
import { goBack } from "../rootNavigation";

const AppStack = createNativeStackNavigator();
const BottomStack = createBottomTabNavigator();

const AppNavigation = ({ navigation }) => {
  return (
    <AppStack.Navigator
      initialRouteName={routes.bottom}
      screenOptions={{
        headerStyle: {
          backgroundColor: "#111827",
          borderBottomWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: "#d1d5db",
        headerTitleAlign: "left",
        headerTitleStyle: {
          fontFamily: "IBMPlexSans-Regular",
          fontSize: 30,
        },
        animation: "slide_from_right",
      }}
    >
      <AppStack.Screen
        name={routes.bottom}
        component={BottomNavigation}
        options={{ headerShown: false }}
      />
      <AppStack.Screen
        name={routes.userFollowers}
        component={App.UserFollowers}
      />
      <AppStack.Screen name={routes.userProfile} component={App.UserProfile} />
      <AppStack.Screen
        name={routes.notification}
        component={App.Notifications}
        options={{
          headerShown: false,
        }}
      />
      <AppStack.Screen
        name={routes.postDetail}
        component={App.PostDetail}
        options={{
          headerShown: false,
        }}
      />
      <AppStack.Screen
        name={routes.paymentDetails}
        component={App.PaymentDetail}
        options={{
          headerShown: false,
        }}
      />
      <AppStack.Screen
        name={routes.followRequests}
        component={App.FollowRequests}
        options={{
          headerShown: false,
        }}
      />
      <AppStack.Screen
        name={routes.leaderboard}
        component={App.LeaderBoardScreen}
        options={{
          headerShown: false,
        }}
      />
      <AppStack.Screen
        name={routes.inviteMembers}
        component={App.InviteMembers}
        options={{
          headerShown: false,
          presentation: "transparentModal",
        }}
      />
      <AppStack.Screen
        name={routes.settings}
        component={App.Setting}
        options={{
          headerShown: false,
        }}
      />
      <AppStack.Group>
        <AppStack.Screen
          name={routes.recordWorkout}
          component={App.RecordWorkout}
          options={{
            headerShown: false,
          }}
        />
        <AppStack.Screen
          name={routes.selectExerciseModal}
          component={App.SelectExerciseModal}
          options={{
            headerShown: false,
            presentation: "modal",
          }}
        />
        <AppStack.Screen
          name={routes.exerciseHistory}
          component={App.ExerciseHistory}
          options={{
            headerShown: false,
            presentation: "modal",
          }}
        />
        <AppStack.Screen
          name={routes.selectProgramPage}
          component={App.SelectProgramPage}
          options={{
            headerShown: false,
            presentation: "modal",
            contentStyle: {
              backgroundColor: "transparent",
            },
          }}
        />
        <AppStack.Screen
          name={routes.editWorkoutDay}
          component={App.EditWorkoutDay}
          options={{ headerShown: false }}
        />
        <AppStack.Screen
          name={routes.createWorkoutDay}
          component={App.CreateWorkoutDay}
          options={{ headerShown: false }}
        />
        <AppStack.Screen
          name={routes.editSelectedProgram}
          component={App.EditSelectedProgram}
          options={{ headerShown: false }}
        />
        <AppStack.Screen
          name={routes.createWorkoutProgram}
          component={App.CreateWorkoutProgram}
          options={{ headerShown: false }}
        />
        <AppStack.Screen
          name={routes.selectProgram}
          component={App.SelectProgram}
        />
        <AppStack.Screen
          name={routes.selectWorkoutPage}
          component={App.SelectWorkoutPage}
          options={{ headerShown: false }}
        />
      </AppStack.Group>
      <AppStack.Group>
        <AppStack.Screen
          name={routes.useIntervalTimerPage}
          component={App.UseIntervalTimerPage}
          options={{ headerShown: false }}
        />
        <AppStack.Screen
          name={routes.selectTimerModal}
          component={App.SelectTimerModal}
          options={{
            headerShown: false,
            presentation: "modal",
            contentStyle: {
              backgroundColor: "transparent",
            },
          }}
        />
        <AppStack.Screen name={routes.hitTimer} component={App.HITTimer} />
        <AppStack.Screen
          name={routes.createIntervalTimer}
          component={App.CreateIntervalTimer}
          options={{ headerShown: false }}
        />
        <AppStack.Screen
          name={routes.selectIntervalWorkout}
          component={App.SelectIntervalWorkout}
          options={{ headerShown: false }}
        />
        <AppStack.Screen
          name={routes.selectedIntervalTemplate}
          component={App.SelectedIntervalTemplate}
          options={{ headerShown: false }}
        />
      </AppStack.Group>
      <AppStack.Group>
        <AppStack.Screen
          name={routes.macroCalculator}
          component={App.MacroCalculator}
          options={{ headerShown: false }}
        />
        <AppStack.Screen
          name={routes.selectActivityModal}
          component={App.SelectActivityModal}
          options={{
            headerShown: false,
            presentation: "modal",
            contentStyle: {
              backgroundColor: "transparent",
            },
          }}
        />
        <AppStack.Screen
          name={routes.selectGoalModal}
          component={App.SelectGoalModal}
          options={{
            headerShown: false,
            presentation: "modal",
            contentStyle: {
              backgroundColor: "transparent",
            },
          }}
        />
      </AppStack.Group>
      <AppStack.Group>
        <AppStack.Screen
          name={routes.workoutDayHistory}
          component={App.WorkoutDayHistory}
          options={{
            headerShown: false,
          }}
        />
        <AppStack.Screen
          name={routes.selectedWorkoutDayHistory}
          component={App.SelectedWorkoutDayHistory}
          options={{
            headerShown: false,
          }}
        />
      </AppStack.Group>
      <AppStack.Screen
        name={routes.weightTracker}
        component={App.WeightTracker}
        options={{
          title: "",
          headerStyle: {
            backgroundColor: "#111828",
          },
          headerTitleStyle: {
            fontFamily: "IBMPlexSans-Regular",
            fontSize: totalSize(2),
            fontWeight: "500",
            color: "white",
          },
          headerLeft: () => (
            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center" }}
              onPress={() => navigation.navigate(routes.home)}
            >
              <Image
                source={require("../../constants/icons/arrow-left.png")}
                style={{ width: 25, height: 25, marginRight: width(2) }}
              />
              <Text
                style={{
                  fontFamily: "IBMPlexSans-Regular",
                  fontSize: totalSize(2),
                  color: "#fff",
                  fontWeight: "500",
                }}
              >
                Weight
              </Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate(routes.addWeight)}
            >
              <Text
                style={{
                  color: "#0891b2",
                  fontSize: 18,
                  fontWeight: "600",
                  fontFamily: 'fontFamily: "IBMPlexSans-Regular',
                }}
              >
                Add Weight
              </Text>
            </TouchableOpacity>
          ),
        }}
      />
      <AppStack.Screen
        name={routes.addWeight}
        component={App.AddWeight}
        options={{
          headerShown: false,
        }}
      />
    </AppStack.Navigator>
  );
};

const BottomNavigation = () => {
  return (
    <BottomStack.Navigator
      tabBar={(props) => <CustomBottomTab {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: "#111827",
          borderBottomWidth: 0,
          elevation: 0,
          shadowOpacity: 0,

          borderBottomWidth: 1,
          borderBottomColor: "#182130",
        },
        headerTintColor: "#d1d5db",
        headerTitleAlign: "left",
        headerTitleStyle: {
          fontFamily: "IBMPlexSans-Regular",
          fontSize: 30,
        },
        tabBarHideOnKeyboard: true,
      }}
      initialRouteName={routes.home}
    >
      <BottomStack.Screen
        name={routes.home}
        component={App.Home}
        options={{ headerShown: false }}
      />
      <BottomStack.Screen
        name={routes.search}
        component={App.SearchPage}
        options={{ headerShown: false }}
      />
      <BottomStack.Screen
        name={routes.group}
        component={App.GroupScreen}
        options={{ headerShown: false }}
      />
      <BottomStack.Screen
        name={routes.profile}
        component={App.ProfileScreen}
        options={{
          tabBarShowLabel: false,
        }}
      />
    </BottomStack.Navigator>
  );
};

function CustomBottomTab({ state, descriptors, navigation }) {
  return (
    <View style={styles.bottomView}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const Btnview =
          route.name == routes.home ? (
            <View
              style={[
                styles.bottomBtn,
                { backgroundColor: isFocused ? "#102839" : "transparent" },
              ]}
            >
              <Image
                source={require("../../constants/icons/Home.png")}
                resizeMode="contain"
                style={{
                  width: 25,
                  height: 25,
                  tintColor: isFocused ? "#fff" : "#B0B0B0",
                }}
              />
            </View>
          ) : route.name == routes.search ? (
            <View
              style={[
                styles.bottomBtn,
                { backgroundColor: isFocused ? "#102839" : "transparent" },
              ]}
            >
              <Image
                source={require("../../constants/icons/Search.png")}
                resizeMode="contain"
                style={{
                  width: 25,
                  height: 25,
                  tintColor: isFocused ? "#fff" : "#B0B0B0",
                }}
              />
            </View>
          ) : route.name == routes.profile ? (
            <View
              style={[
                styles.bottomBtn,
                { backgroundColor: isFocused ? "#102839" : "transparent" },
              ]}
            >
              <Image
                source={require("../../constants/icons/Profile.png")}
                resizeMode="contain"
                style={{
                  width: 25,
                  height: 25,
                  tintColor: isFocused ? "#fff" : "#B0B0B0",
                }}
              />
            </View>
          ) : route.name == routes.group ? (
            <View
              style={[
                styles.bottomBtn,
                { backgroundColor: isFocused ? "#102839" : "transparent" },
              ]}
            >
              <Image
                source={require("../../constants/icons/Group.png")}
                resizeMode="contain"
                style={{
                  width: 25,
                  height: 25,
                  tintColor: isFocused ? "#fff" : "#B0B0B0",
                }}
              />
            </View>
          ) : null;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        if (Btnview !== null) {
          return (
            <TouchableOpacity
              key={index}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              // style={{ flex: 1 }}
            >
              {Btnview}
            </TouchableOpacity>
          );
        }
      })}
    </View>
  );
}

export default AppNavigation;

const styles = StyleSheet.create({
  bottomView: {
    width: width(100),
    paddingTop: height(1),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: width(5),
    paddingBottom: Platform.OS == "ios" ? height(2) : height(1),
    borderTopWidth: 0,
    backgroundColor: "#111827",
    shadowColor: "#6b7280",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
  },
  drawerHeading: {
    fontFamily: "IBMPlexSans-Regular",
    fontSize: 30,
    color: "#fff",
    fontWeight: "600",
    marginBottom: height(2),
  },
  drawerBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: height(2),
  },
  drawerBtnTxt: {
    fontSize: 20,
    color: "#fff",
    paddingHorizontal: width(4),
  },
  bottomBtn: {
    height: totalSize(5),
    width: totalSize(5),
    borderRadius: totalSize(5),
    justifyContent: "center",
    alignItems: "center",
  },
});
