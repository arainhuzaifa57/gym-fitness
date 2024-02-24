import React, { useState } from "react";
import { View, Button, Image, Alert } from "react-native";
import ImagePicker from "react-native-image-crop-picker";
import storage from "@react-native-firebase/storage";

export default function UploadImagePage() {
  const [imageUri, setImageUri] = useState(null);

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    const result = await ImagePicker.openPicker({
      mediaType: "any",
      cropping: true,
      height: height(40),
      width: width(100),
      compressImageQuality: 0.6,
    });

    console.log(result);

    if (!result.canceled) {
      setImageUri(result.path);
    }
  };

  const uploadImageToFirebase = async (imageUri) => {
    const imageName = Date.now() + ".jpg"; // Assuming the image is in JPEG format. You can choose your own naming logic
    const imageRef = storage().ref("images/" + imageName);

    const uploadTask = imageRef.putFile(
      await fetch(imageUri).then((res) => res.blob())
    );
    //  uploadBytesResumable(
    //   imageRef,
    //   await fetch(imageUri).then((res) => res.blob())
    // );

    // Listen for state changes, errors, and completion of the upload.
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
      },
      (error) => {
        console.error("Error uploading image:", error);
        Alert.alert("Error", "There was an error uploading the image.");
      },
      async () => {
        // Upload completed successfully, now we can get the download URL
        await imageRef.getDownloadURL().then((downloadURL) => {
          console.log("File available at", downloadURL);
          Alert.alert("Success", "Image uploaded successfully.");
        });
      }
    );
  };

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Button title="Pick an image from camera roll" onPress={pickImage} />
      {imageUri && (
        <Image source={{ uri: imageUri }} style={{ width: 200, height: 200 }} />
      )}
      {imageUri && (
        <Button title="Upload Image" onPress={uploadImageToFirebase} />
      )}
    </View>
  );
}
