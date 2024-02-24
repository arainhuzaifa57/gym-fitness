import React from "react";

export const getRandomNumber = () => {
  let characters =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  let length = 10; // Customize the length here.
  for (let i = length; i > 0; --i)
    result += characters[Math.round(Math.random() * (characters.length - 1))];
  return result;
};

export const convertToInternationalCurrencySystem = (labelValue) => {
  // Nine Zeroes for Billions
  return Math.abs(Number(labelValue)) >= 1.0e9
    ? (Math.abs(Number(labelValue)) / 1.0e9).toFixed(2) + "B"
    : // Six Zeroes for Millions
    Math.abs(Number(labelValue)) >= 1.0e6
    ? (Math.abs(Number(labelValue)) / 1.0e6).toFixed(2) + "M"
    : // Three Zeroes for Thousands
    Math.abs(Number(labelValue)) >= 1.0e3
    ? (Math.abs(Number(labelValue)) / 1.0e3).toFixed(2) + "K"
    : Math.abs(Number(labelValue));
};

export const handleWeightConverter = (weight, unit) => {
  if (unit === "kg") {
    // Remove "Kg" from the input
    const kgValue = parseFloat(weight);
    const lbsValue = (kgValue / 2.205).toFixed(2); // Convert Kg to Lbs
    return lbsValue;
  } else {
    // Remove "Lbs" from the input
    const lbsValue = parseFloat(weight);
    const kgValue = (lbsValue * 2.205).toFixed(2); // Convert Lbs to Kg
    return kgValue;
  }
};
