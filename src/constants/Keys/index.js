import { Platform } from "react-native";

//For Production
export const AdsID =
  Platform.OS == "ios"
    ? "ca-app-pub-1877918184859918/7284458027"
    : "ca-app-pub-1877918184859918/4867227995";

//For Developmentt
// export const AdsID =
//   Platform.OS == "ios"
//     ? "ca-app-pub-3940256099942544/4411468910"
//     : "ca-app-pub-3940256099942544/1033173712";

export const WebAPIKey =
  "566332789304-t84bb2sck5d02he0n84pgqun8coum5k3.apps.googleusercontent.com";
export const IOSClientKey =
  "566332789304-2qn4uikn5oivbgdso5g8oas53mqmhtur.apps.googleusercontent.com";

export const STRIPE_PUBLISHABLE_KEY =
  "pk_test_51OFLVYBnSnvZuLK9MO1lOkPRU7uQAHkY4Hs9DpTPkQpqEy0TfDOjJ4qZSq8ZNvs6MJLIzkeYtZ4gMa3kqAoF4ke000t8XAAjDr";
export const yearSubscription = "price_1OKjo6BnSnvZuLK9Wke3aCUe";
export const monthlySubscription = "price_1OKjo6BnSnvZuLK9nrlRPx3K";
