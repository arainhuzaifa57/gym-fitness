import React, { useEffect, useState, useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AuthNavigation from "./authNavigation";
import AppNavigation from "./appNavigation";
import { routes } from "../constants/routes";
import { navigationRef } from "./rootNavigation";
import analytics from "@react-native-firebase/analytics";
import { useSelector } from "react-redux";
import SplashScreen from "react-native-splash-screen";

const MainStack = createNativeStackNavigator();

export default function Navigation() {
  const [loading, setLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState(routes.auth);

  const { userData } = useSelector((state) => state?.userData);

  const routeNameRef = React.useRef();

  useEffect(() => {
    if (userData) {
      setInitialRoute(routes.app);
    } else {
      setInitialRoute(routes.auth);
    }
    setLoading(false);
    setTimeout(() => {
      SplashScreen.hide();
    }, 2000);
  }, [userData]);

  if (loading) return null;
  else
    return (
      <NavigationContainer
        ref={navigationRef}
        onReady={() => {
          routeNameRef.current = navigationRef.current?.getCurrentRoute().name;
        }}
        onStateChange={async () => {
          const previousRouteName = routeNameRef.current;
          const currentRouteName =
            navigationRef.current?.getCurrentRoute().name;

          if (previousRouteName !== currentRouteName) {
            await analytics().logScreenView({
              screen_name: currentRouteName,
              screen_class: currentRouteName,
            });
          }
          routeNameRef.current = currentRouteName;
        }}
      >
        <MainStack.Navigator
          screenOptions={{ headerShown: false }}
          initialRouteName={initialRoute}
        >
          {!userData ? (
            <MainStack.Screen name={routes.auth} component={AuthNavigation} />
          ) : (
            <MainStack.Screen name={routes.app} component={AppNavigation} />
          )}
        </MainStack.Navigator>
      </NavigationContainer>
    );
}
