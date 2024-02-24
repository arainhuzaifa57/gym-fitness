import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Image,
} from 'react-native'
import React, { useState, useEffect } from 'react'
import { goBack, navigate } from "../../../../navigation/rootNavigation";
import { routes } from "../../../../constants/routes";
import DropDownPicker from 'react-native-dropdown-picker';
import { useDispatch, useSelector } from 'react-redux';
import { resetMacroCalculator } from '../../../../api/features/tools/macroCalculator/calculateMacrosSlice';
import { Header } from '../../../../components/Header';

const MacroCalculator = ({ navigation }) => {
  const dispatch = useDispatch()
  const activity = useSelector((state) => state.macroCalculator.activity)
  const goal = useSelector((state) => state.macroCalculator.goal)

  const [age, setAge] = useState("");
  const [feet, setFeet] = useState("");
  const [inches, setInches] = useState("");
  const [weight, setWeight] = useState("");
  const [selectedGender, setSelectedGender] = useState(null);
  const [dietType, setDietType] = useState("balanced");
  const [calculated, setCalculated] = useState(false);
  const [macros, setMacros] = useState("");

  const [ageValid, setAgeValid] = useState(true);
  const [feetValid, setFeetValid] = useState(true);
  const [inchesValid, setInchesValid] = useState(true);
  const [weightValid, setWeightValid] = useState(true);
  const [genderValid, setgGenderValid] = useState(true);
  const [activityValid, setActivityValid] = useState(true);
  const [goalValid, setGoalValid] = useState(true);


  const backAndReset = () => {
    dispatch(resetMacroCalculator())
    goBack()
  }

  const validateInputs = () => {
    let isValid = true;

    if (!age || age.trim() === '') {
      setAgeValid(false);
      isValid = false;
    } else {
      setAgeValid(true);
    }

    if (!feet || feet.trim() === '') {
      setFeetValid(false);
      isValid = false;
    } else {
      setFeetValid(true);
    }

    if (!inches || inches.trim() === '') {
      setInchesValid(false);
      isValid = false;
    } else {
      setInchesValid(true);
    }

    if (!weight || weight.trim() === '') {
      setWeightValid(false);
      isValid = false;
    } else {
      setWeightValid(true);
    }

    if (!selectedGender) {
      setgGenderValid(false);
      isValid = false;
    } else {
      setgGenderValid(true);
    }

    if (activity.label === 'Select an item') {
      setActivityValid(false);
      isValid = false;
    } else {
      setActivityValid(true);
    }

    if (goal.label === 'Select an item') {
      setGoalValid(false);
      isValid = false;
    } else {
      setGoalValid(true);
    }

    return isValid;
  };

  // Function to handle gender selection
  const handleSelectGender = (gender) => {
    setSelectedGender(gender);
    setgGenderValid(true); // Reset gender validation state
  };

  const handleSelectDietType = (dietType) => {
    setDietType(dietType)
    const macros = calculateMacros(weight, feet, inches, age, selectedGender, activity, goal, dietType)
    setMacros(macros)
  }

  // Function to get button style based on selection
  const getButtonStyle = (gender) => {
    return `m-2 p-2 border-2 rounded-xl w-20 ${selectedGender === gender ? 'bg-gray-900 border-cyan-600' : 'bg-transparent border-gray-400'
      }`;
  };

  // Function to get button style based on selection
  const getInputStyle = (error) => {
    return `bg-gray-900 text-center w-1/6 h-8 rounded-xl text-white ${error ? null : 'border-2 border-rose-500'}`;
  };

  // Function to get button style based on selection
  const getDietTypeButtonStyle = (selectedDietType) => {
    return `m-1 p-2 border rounded-xl w-25 ${dietType === selectedDietType ? 'bg-cyan-600 border-cyan-600' : 'bg-transparent border-gray-300'}`;
  };

  const getModalStyle = (error) => {
    return `${error ? null : 'border-2 border-rose-500'} rounded-lg py-3 bg-gray-900 my-1`;
  };


  function calculateMacros(weight, feet, inches, age, gender, activity, goal, dietType) {
    // Convert height from feet and inches to centimeters
    const heightInCentimeters = feet * 30.48 + inches * 2.54;
    // Convert weight from pounds to kilograms
    const weightInKilograms = weight * 0.453592;

    // Define activity level multipliers
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      veryActive: 1.9,
      extraActive: 2.2
    };

    // Calculate BMR using the metric values
    const bmr =
      gender === 'male'
        ? 10 * weightInKilograms + 6.25 * heightInCentimeters - 5 * age + 5
        : 10 * weightInKilograms + 6.25 * heightInCentimeters - 5 * age - 161;

    // Adjust BMR based on activity level
    const tdee = bmr * (activityMultipliers[activity] || 1); // Use the value from the activities state

    // Define goal adjustments
    const goalAdjustments = {
      maintain: 0,
      mildLoss: -250,
      loss: -500,
      extremeLoss: -1000,
      mildGain: 250,
      gain: 500,
      extremeGain: 1000
    };

    // Adjust based on goal
    let dailyCalories = tdee + (goalAdjustments[goal] || 0); // Use the value from the goals state

    // Define macro ratios for different diet types
    const dietRatios = {
      balanced: { carbs: 0.55, protein: 0.20, fat: 0.25 },
      lowFat: { carbs: 0.60, protein: 0.25, fat: 0.15 },
      lowCarb: { carbs: 0.20, protein: 0.50, fat: 0.30 },
      highProtein: { carbs: 0.25, protein: 0.45, fat: 0.30 }
    };

    // Select the appropriate ratios based on diet type
    const selectedRatios = dietRatios[dietType]

    // Calculate macros based on the selected ratios and total daily calories
    const proteinCalories = dailyCalories * selectedRatios.protein;
    const fatCalories = dailyCalories * selectedRatios.fat;
    const carbCalories = dailyCalories * selectedRatios.carbs;

    const proteinGrams = Math.round(proteinCalories / 4);
    const fatGrams = Math.round(fatCalories / 9);
    const carbGrams = Math.round(carbCalories / 4);

    return {
      calories: Math.round(dailyCalories),
      protein: proteinGrams,
      fat: fatGrams,
      carbs: carbGrams,
    };
  }

  const results = () => {
    if (validateInputs()) {
      const macros = calculateMacros(weight, feet, inches, age, selectedGender, activity, goal, dietType);
      setMacros(macros);
      setCalculated(true);
    } else {
      console.log("input missing")
    }
  }


  return (
    <ScrollView 
    showsVerticalScrollIndicator={false}
    className="flex-1 bg-gray-900">
      <Header
        onBack={false}
        leftHeader={
          <TouchableOpacity
            className="flex-row items-center ml-2"
            onPress={backAndReset}
          >
            <Image
              source={require("../../../../constants/icons/arrow-left.png")}
              resizeMode="contain"
              style={{
                width: 24,
                height: 24,
              }}
            />
            <Text className="text-white text-lg ml-1 font-semibold">Macro Calculator</Text>
          </TouchableOpacity>
        }
      />
      <View className='mx-4 my-2 bg-card-bg p-4 rounded-xl'>
        <Text className="text-white mb-4">Enter the information below then hit calculate for suggested macros.</Text>
        <View>
          <View className="flex-row items-center">
            <Text className="text-white pr-2">Age:</Text>
            <TextInput
              mode="flat"
              label="Age"
              value={age}
              keyboardType='number-pad'
              onFocus={() => setAgeValid(true)}
              onChangeText={(text) => setAge(text)}
              className={getInputStyle(ageValid)}
            />
          </View>
          <View className="flex-row my-2 items-center">
            <TouchableOpacity
              onPress={() => handleSelectGender('male')}
              className={getButtonStyle('male')}
            >
              <Text className="text-center text-white">Male</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleSelectGender('female')}
              className={getButtonStyle('female')}
            >
              <Text className="text-center text-white">Female</Text>
            </TouchableOpacity>
            {genderValid ? null : <Text className="text-rose-500">Select a gender</Text>}
          </View>
          <View className="flex-row items-center space-x-2 my-2">
            <Text className="text-white pr-2">Height:</Text>
            <TextInput
              mode="flat"
              label="feet"
              activeUnderlineColor={"#07B6D5"}
              value={feet}
              keyboardType='number-pad'
              onChangeText={(text) => setFeet(text)}
              className={getInputStyle(feetValid)}
              onFocus={() => setFeetValid(true)}
            />
            <Text className="text-white">ft</Text>
            <TextInput
              mode="flat"
              label="inches"
              activeUnderlineColor={"#07B6D5"}
              value={inches}
              keyboardType='number-pad'
              onChangeText={(text) => setInches(text)}
              className={getInputStyle(inchesValid)}
              onFocus={() => setInchesValid(true)}
            />
            <Text className="text-white">in</Text>
          </View>
          <View className="flex-row items-center space-x-2 my-2">
            <Text className="text-white pr-2">Weight:</Text>
            <TextInput
              mode="flat"
              label="feet"
              activeUnderlineColor={"#07B6D5"}
              value={weight}
              keyboardType='number-pad'
              onChangeText={(text) => setWeight(text)}
              className={getInputStyle(weightValid)}
              onFocus={() => setWeightValid(true)}
            />
            <Text className="text-white">lbs</Text>
          </View>

          <View className="flex-row items-center">
            <Text className="text-white mr-2">Activity:</Text>

            <View className="flex-grow">
              <View className={getModalStyle(activityValid)}>
                <Pressable onPress={() => {
                  navigate(routes.selectActivityModal);
                  setActivityValid(true); // Reset validation state
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }} className="mx-2">
                    <Text
                      style={{ flex: 1, marginRight: 10 }}
                      className="text-white">
                      {activity.label}
                    </Text>
                    <Image
                      source={require("../../../../constants/icons/arrow-down.png")}
                      resizeMode="contain"
                      className="ml-2"
                      style={{
                        width: 16,
                        height: 16,
                      }}
                    />
                  </View>
                </Pressable>
              </View>
            </View>

          </View>

          <View className="flex-row items-center">
            <Text className="text-white">Goal:       </Text>
            <View className="flex-grow">
              <View className={getModalStyle(goalValid)}>
                <Pressable onPress={() => {
                  navigate(routes.selectGoalModal);
                  setGoalValid(true); // Reset validation state
                }}>
                  <View className="flex-row justify-between mx-2 items-center">
                    <Text
                      style={{ flex: 1, marginRight: 10 }}
                      className="text-white">
                      {goal.label}
                    </Text>
                    <Image
                      source={require("../../../../constants/icons/arrow-down.png")}
                      resizeMode="contain"
                      className="ml-2"
                      style={{
                        width: 16,
                        height: 16,
                      }}
                    />
                  </View>
                </Pressable>
              </View>
            </View>
          </View>
          <View className="mt-4 items-center">
            <TouchableOpacity
              onPress={() => results()}
            >
              <View className="bg-cyan-600 w-28 h-10 rounded-xl items-center justify-center">
                <Text className="text-white font-semibold">Calculate</Text>
              </View>
            </TouchableOpacity>
          </View>


        </View>
      </View>
      {calculated ?
        <View className="mx-4 mb-4">
          <View className="flex-row my-2 mt-6 ">
            <TouchableOpacity
              onPress={() => handleSelectDietType('balanced')}
              className={getDietTypeButtonStyle('balanced')}
            >
              <Text className="text-center text-white">Balanced</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleSelectDietType('lowFat')}
              className={getDietTypeButtonStyle('lowFat')}
            >
              <Text className="text-center text-white">Low Fat</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleSelectDietType('lowCarb')}
              className={getDietTypeButtonStyle('lowCarb')}
            >
              <Text className="text-center text-white">Low Carb</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleSelectDietType('highProtein')}
              className={getDietTypeButtonStyle('highProtein')}
            >
              <Text className="text-center text-white">High Protein</Text>
            </TouchableOpacity>
          </View>
          <View className='mt-2'>
            <Text className="text-white">Calories: {macros.calories}</Text>
            <Text className="text-white">Fats: {macros.fat}</Text>
            <Text className="text-white">Carbs: {macros.carbs}</Text>
            <Text className="text-white">Protein: {macros.protein}</Text>
          </View>
          <Text className='text-gray-500 mt-4'>Disclaimer: The macro calculations in this app are for informational purposes only and not a substitute for professional advice. Individual needs vary; consult a healthcare professional before making dietary changes. We are not responsible for the accuracy of these calculations or their outcomes.</Text>
        </View>
        : null}
    </ScrollView>
  )
}

export default MacroCalculator