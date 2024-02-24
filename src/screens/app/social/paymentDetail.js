import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Header } from "../../../components/Header";
import { width, height, totalSize } from "react-native-dimension";
import { goBack } from "../../../navigation/rootNavigation";
import { TextInput } from "react-native-paper";
import { useSelector, useDispatch } from "react-redux";
import { fetchUserData } from "../../../api/features/user/userDataSlice";
import { updateDocument } from "../../../api/firebase/db";
import { collections, endPoints } from "../../../constants/routes";
import { SafeAreaProvider } from "react-native-safe-area-context";
import APIServiceManager from "../../../constants/API";
import {
  STRIPE_PUBLISHABLE_KEY,
  yearSubscription,
  monthlySubscription,
} from "../../../constants/Keys";
import moment from "moment";
import {
  isPlatformPaySupported,
  confirmPlatformPayPayment,
  PlatformPay
} from "@stripe/stripe-react-native";

const API = new APIServiceManager();
const PaymentDetail = ({ route }) => {
  const { plan } = route.params;
  // console.log("Selected Plan: " + plan);
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state?.userData);

  const [cardDetail, setCardDetail] = useState({
    cardName: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
    cardType: "",
  });
  const [isError, setError] = useState({
    field: "",
    msg: "",
  });
  const [isLoading, setLoading] = useState(false);
  const [isApplePaySupported, setIsApplePaySupported] = useState(false);

  useEffect(() => {
    (async function () {
      setIsApplePaySupported(await isPlatformPaySupported());
    })();
  }, [isPlatformPaySupported]);

  useEffect(() => {
    if (
      cardDetail?.cardName !== "" &&
      cardDetail.cardNumber !== "" &&
      cardDetail.cardExpiry !== "" &&
      cardDetail.cardCvv !== ""
    ) {
      setError({
        field: "",
        msg: "",
      });
    }
  }, [cardDetail]);

  const _handlingCardNumber = (number) => {
    setCardDetail((prevState) => ({
      ...prevState,
      cardNumber: number
        .replace(/\s?/g, "")
        .replace(/(\d{4})/g, "$1 ")
        .substring(0, 19)
        .trim(),
    }));
  };

  const _handleCardExpiry = (newValue) => {
    setCardDetail((prevState) => ({
      ...prevState,
      cardExpiry: newValue
        .replace(/\W/gi, "")
        .replace(/(.{2})/g, "$1/")
        .substring(0, 5)
        .trim(),
    }));
  };

  const addCardDetail = async () => {
    if (
      cardDetail?.cardName == "" ||
      cardDetail.cardNumber == "" ||
      cardDetail.cardExpiry == "" ||
      cardDetail.cardCvv == ""
    ) {
      setError({
        field: "all",
        msg: "All fields are required!",
      });
    } else {
      setLoading(true);
      let cardToken = await getCreditCardToken();
      if (cardToken !== undefined) {
        createUser(cardToken);
      }
    }
  };

  const getCreditCardToken = async () => {
    // alert()
    const card = {
      "card[number]": cardDetail.cardNumber?.replace(/ /g, ""),
      "card[exp_month]": cardDetail?.cardExpiry?.split("/")[0],
      "card[exp_year]": cardDetail?.cardExpiry?.split("/")[1],
      "card[cvc]": cardDetail.cardCvv,
    };
    return fetch("https://api.stripe.com/v1/tokens", {
      headers: {
        // Use the correct MIME type for your server
        Accept: "application/json",
        // Use the correct Content Type to send data to Stripe
        "Content-Type": "application/x-www-form-urlencoded",
        // Use the Stripe publishable key as Bearer
        Authorization: `Bearer ${STRIPE_PUBLISHABLE_KEY}`,
      },
      // Use a proper HTTP method
      method: "post",
      // Format the credit card data to a string of key-value pairs
      // divided by &
      body: Object.keys(card)
        .map((key) => key + "=" + card[key])
        .join("&"),
    })
      .then((response) => response.json())
      .then((res) => {
        // console.log("token>>", res);
        if (res?.error) {
          Alert.alert(res.error.message);
          return;
        }
        return res?.id;
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  };

  const createUser = async (cardToken) => {
    let customerData = {
      email: userData?.userData?.email,
      name: userData?.userData?.fullName,
      token: cardToken,
    };
    // console.log("Customer data", customerData);
    const customerTokenData = await API.request(
      "post",
      endPoints.createCustomer,
      JSON.stringify(customerData)
    )
      .then((res) => {
        // console.log("Create Customer Response>>", res.data);
        return res.data;
      })
      .catch((error) => {
        console.log("Create Customer Error>>", error);
        setLoading(false);
      });
    if (customerTokenData) {
      let subscribeData = {
        customerId: customerTokenData?.id,
        priceId: plan == "year" ? yearSubscription : monthlySubscription,
      };
      await API.request(
        "post",
        endPoints.createSubscription,
        JSON.stringify(subscribeData)
      )
        .then((res) => {
          let response = res?.data;
          saveDataonFirebase({
            ...response,
            customerID: customerTokenData?.id,
            paymentMethod:
              customerTokenData?.invoice_settings?.default_payment_method,
            plan: plan,
            subscribedAt: moment().valueOf(),
          });
        })
        .catch((err) => {
          console.log("Create Subscribe Error>>", err);
          setLoading(false);
        });
    }
  };

  const saveDataonFirebase = async (data) => {
    // console.log("SubscriptionData>>", data);
    await updateDocument(collections.users, userData?.id, {
      ...userData?.userData,
      subscriptionData: data,
    }).then(() => {
      dispatch(fetchUserData());
      setTimeout(() => {
        setLoading(false);
        goBack();
      }, 2000);
    });
  };

  //   const CardIcon = ({ cardNumber }) => {
  //     const { card } = cardValidator.number(cardNumber);

  //     console.log("Card>>", cardNumber);
  //     let source;
  //     switch (card?.type) {
  //       case "visa":
  //         source = appImages.VISA;
  //         break;
  //       case "mastercard":
  //         source = appImages.MASTERCARD;
  //         break;
  //       case "discover":
  //         source = appImages.DISCOVER;
  //         break;
  //       case "american-express":
  //         source = appImages.AMERICAN;
  //         break;
  //       case "unionpay":
  //         source = appImages.UNIONPAY;
  //         break;
  //       default:
  //         source = appImages.credit_card;
  //         break;
  //     }

  //     if (!source) return null;

  //     return <Image style={styles.image} source={source} resizeMode="contain" />;
  //   };

  return (
    <SafeAreaProvider
      style={{
        flex: 1,
        backgroundColor: "#111828",
      }}
    >
      <Header
        onBack={false}
        leftHeader={
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center" }}
            onPress={goBack}
          >
            <Image
              source={require("../../../constants/icons/arrow-left.png")}
              resizeMode="contain"
              style={{
                width: 25,
                height: 25,
              }}
            />
            <Text style={styles.heading}>Payment Details</Text>
          </TouchableOpacity>
        }
        containerStyle={{ marginBottom: height(4) }}
      />
      <Text style={styles.heading1}>Card Info</Text>
      <KeyboardAvoidingView>
        <View style={styles.txtinpmain}>
          <View
            style={{
              ...styles.txtinpcon,
              borderWidth:
                cardDetail?.cardName == "" && isError.field == "all" ? 2 : 0,
            }}
          >
            <TextInput
              mode="flat"
              label="Card Holder Name"
              style={styles.txtinp}
              activeUnderlineColor={"#07B6D5"}
              textColor={"white"}
              value={cardDetail?.cardName}
              onChangeText={(text) => {
                setCardDetail((prevState) => ({
                  ...prevState,
                  cardName: text,
                }));
              }}
              autoCapitalize="words"
            />
          </View>
          <View
            style={{
              ...styles.txtinpcon,
              borderWidth:
                cardDetail?.cardNumber == "" && isError.field == "all" ? 2 : 0,
            }}
          >
            <TextInput
              mode="flat"
              label="Card Number"
              style={styles.txtinp}
              textColor={"white"}
              value={cardDetail?.cardNumber}
              onChangeText={(text) => _handlingCardNumber(text)}
              activeUnderlineColor={"#07B6D5"}
              keyboardType="number-pad"
            />
          </View>
          <View style={styles.row}>
            <View
              style={{
                ...styles.txtinpconsmall,
                borderWidth:
                  cardDetail?.cardExpiry == "" && isError.field == "all"
                    ? 2
                    : 0,
              }}
            >
              <TextInput
                mode="flat"
                label="Expiry Date"
                style={styles.txtinp}
                textColor={"white"}
                value={cardDetail?.cardExpiry}
                onChangeText={(text) => _handleCardExpiry(text)}
                activeUnderlineColor={"#07B6D5"}
                keyboardType="number-pad"
              />
            </View>
            <View
              style={[
                styles.txtinpconsmall,
                {
                  borderWidth:
                    cardDetail?.cardCvv == "" && isError.field == "all" ? 2 : 0,
                },
              ]}
            >
              <TextInput
                mode="flat"
                label="CVV"
                style={styles.txtinp}
                textColor={"white"}
                value={cardDetail?.cardCvv}
                onChangeText={(text) => {
                  setCardDetail((prevState) => ({
                    ...prevState,
                    cardCvv: text?.substring(0, 3),
                  }));
                }}
                keyboardType="number-pad"
                activeUnderlineColor={"#07B6D5"}
              />
            </View>
          </View>
          {isError.field == "all" && (
            <Text style={styles.errorMsg}>{isError.msg}</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.signupbtn}
          onPress={addCardDetail}
          disabled={isError.field !== "" ? true : false}
        >
          {isLoading ? (
            <ActivityIndicator color={"#f9fafb"} size={"small"} />
          ) : (
            <Text
              className="text-center text-gray-700 font-ibmBold text-xl"
              style={{ color: "white" }}
            >
              Save
            </Text>
          )}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaProvider>
  );
};

export default PaymentDetail;

const styles = StyleSheet.create({
  heading: {
    paddingLeft: width(2),
    color: "#fff",
    fontSize: totalSize(2),
    fontFamily: "IBMPlexSans-Regular",
    fontWeight: "500",
  },
  heading1: {
    color: "#fff",
    fontWeight: "700",
    fontSize: totalSize(2.2),
    paddingHorizontal: width(5),
  },
  errorMsg: {
    fontSize: totalSize(1.3),
    color: "#f43f5e",
    paddingTop: 10,
    width: width(90),
  },
  txtinpmain: {
    backgroundColor: "#111828",
    paddingHorizontal: 20,
    marginTop: 10,
  },
  txtinpcon: {
    borderRadius: 10,
    height: 55,
    overflow: "hidden",
    marginTop: 15,
    borderColor: "#f43f5e",
    backgroundColor: "#182130",
  },
  txtinp: {
    height: 57,
    overflow: "hidden",
    backgroundColor: "#182130",
  },
  txtinpconsmall: {
    borderRadius: 10,
    height: 55,
    overflow: "hidden",
    marginTop: 15,
    borderColor: "#f43f5e",
    width: width(42),
  },
  signupbtn: {
    alignSelf: "center",
    backgroundColor: "#0891b2",
    height: height(6),
    width: width(90),
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginTop: height(5),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: width(90),
    alignSelf: "center",
  },
  image: {
    height: 25,
    width: 25,
    // tintColor: "#fff",
  },
});
