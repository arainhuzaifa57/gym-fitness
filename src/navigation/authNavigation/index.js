import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { routes } from "../../constants/routes";
import * as Auth from "../../screens/auth";

const AuthStack = createNativeStackNavigator();

const AuthNavigation = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={routes.login}
    >
      <AuthStack.Screen
        name={routes.login}
        component={Auth.LoginScreen}
        options={{
          title: "Sign In",
        }}
      />
      <AuthStack.Screen
        name={routes.signUp}
        component={Auth.SignUpScreen}
        options={{
          title: "Sign Up",
        }}
      />
    </AuthStack.Navigator>
  );
};

export default AuthNavigation;
