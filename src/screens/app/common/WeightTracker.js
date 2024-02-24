import React, { useState, useEffect, useCallback } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Image,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import CalenderModal from "../../../components/CalendarModal/CalendarModal";
import { TextInput } from "react-native-paper";
import { LineChart } from "react-native-chart-kit";
import WeightDetails from "../../../components/WeightDetails/WeightDetails";
import moment from "moment";
import { totalSize, width, height } from "react-native-dimension";
import { getUserWeight } from "../../../api/firebase/db";
import { useSelector } from "react-redux";
import { Interstitial } from "react-native-ad-manager";
import { AdsID } from "../../../constants/Keys";
import Modal from "react-native-modal";
import AntDesign from "react-native-vector-icons/AntDesign";

const WeightTracker = () => {
  const [showCalendar, setShowCalender] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [weightData, setWeightData] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [chartSegments, setChartSegments] = useState(20);
  const [isLoading, setLoading] = useState(false);
  const [filterChart, setFilterChart] = useState("custom");
  const [showCompare, setShowCompare] = useState(false);

  const { userData } = useSelector((state) => state?.userData);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [tooltipData, setTooltipData] = useState(null);

  useEffect(() => {
    // For Ads
    Interstitial.setAdUnitID(AdsID);
    Interstitial.setTestDevices([Interstitial.simulatorId]);
    Interstitial.requestAd().then(() => {
      Interstitial.showAd();
      StatusBar.setHidden(true);
    });
    // if (!userData?.userData?.subscriptionData?.subscriptionId) {

    // }
    setEndDate(new Date());
    setStartDate(moment(new Date()).subtract(1, "months"));
    const listener = Interstitial.addEventListener("adClosed", () => {
      StatusBar.setHidden(false);
    });
    return () => {
      listener.remove();
      StatusBar.setHidden(false);
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      getUserData();
    }, [startDate, endDate, filterChart])
  );

  async function getUserData() {
    setLoading(true);
    let data = await getUserWeight(userData?.id);
    let start = moment(startDate).format("DD/MM/YYYY");
    let end = moment(endDate).format("DD/MM/YYYY");
    let filt = data?.filter((i) => {
      let compareDate = moment(i?.createdAt).format("DD/MM/YYYY");
      if (
        moment(i?.createdAt).isBetween(startDate, endDate) ||
        compareDate == start ||
        compareDate == end
      ) {
        return i;
      }
    });
    console.log(data);
    if (filt?.length > 0) {
      filt = filt?.sort((a, b) => moment(a?.createdAt) - moment(b?.createdAt));
      //For Chart Week and Month Filters
      if (filterChart == "week" || filterChart == "month") {
        const processedData = filt.map((item) => ({
          ...item,
          createdAt: item.createdAt,
          week: `${new Date(item.createdAt).getFullYear()}-${(
            new Date(item.createdAt).getWeek() + 1
          )
            .toString()
            .padStart(2, "0")}`,
          month: new Date(item.createdAt).toLocaleString("en-US", {
            year: "numeric",
            month: "2-digit",
          }),
        }));

        // Calculate weekly and monthly averages
        const calculateAverages = Object.values(
          processedData.reduce((acc, item) => {
            // console.log("Date>>", item?.createdAt);
            const { [filterChart]: key, weight, createdAt } = item;
            if (!acc[key]) {
              acc[key] = { sum: 0, count: 0, createdAt: new Date() };
            }
            acc[key].sum =
              parseFloat(weight) > acc[key].sum
                ? parseFloat(weight)
                : acc[key].sum;
            acc[key].count += 1;
            acc[key].createdAt = createdAt;
            return acc;
          }, {})
        ).map(({ sum, count, createdAt, ...rest }) => ({
          ...rest,
          average: sum,
          dates: createdAt,
        }));
        // console.log(calculateAverages);
        let newData = [];
        newData = calculateAverages?.sort(
          (a, b) => moment(a?.dates) - moment(b.dates)
        );
        let dates = [];
        let sets = [];
        let dateFormat = "MM/DD";
        if (filterChart == "month") {
          dateFormat = "MM";
        }
        newData?.map((i) => {
          dates.push(moment(i?.dates).format(dateFormat));
          sets.push(parseFloat(i?.average));
        });
        let segments = 5;
        if (sets?.length >= 5) {
          segments = 10;
        } else if (sets?.length >= 10) {
          segments = 20;
        }
        setChartSegments(segments);
        setChartData({
          labels: dates,
          datasets: [
            {
              data: sets,
            },
          ],
        });
      } else {
        //For Chart Custom Filters
        let dates = [];
        let sets = [];
        let dateFormat = "MM/DD";
        // if (moment(endDate).diff(startDate, "months") > 6) {
        //   dateFormat = "MM";
        // }
        // console.log("Date Format>>", dateFormat);
        filt?.map((i) => {
          dates.push(moment(i?.createdAt).format(dateFormat));
          sets.push(parseFloat(i?.weight));
        });
        let segments = 5;
        if (sets?.length >= 5) {
          segments = 10;
        } else if (sets?.length >= 10) {
          segments = 20;
        }
        setChartSegments(segments);
        setChartData({
          labels: dates,
          datasets: [
            {
              data: sets,
            },
          ],
        });
      }
      setWeightData(filt);
    }
    setLoading(false);
  }

  const handleDataSelection = (data) => {
    if (data && data.dateString) {
      if (showCalendar == "start") {
        setStartDate(data?.dateString);
      } else {
        setEndDate(data?.dateString);
      }
    }
    setShowCalender("");
  };

  const chartConfig = {
    backgroundGradientFrom: "#172033",
    backgroundGradientTo: "#172033",
    color: (opacity = 1) => `#07B6D5`,
    labelColor: (opacity = 1) => `#fff`,
    verticalLabelRotation: 70,
    yAxisSuffix: "",
    decimalPlaces: 0,
    propsForBackgroundLines: {
      strokeWidth: 2,
      stroke: "rgba(164, 164, 164, 1)",
      strokeDasharray: "0",
    },
  };

  const Tooltip = ({ x, y, data }) => {
    return (
      <View
        style={{
          position: "absolute",
          left: x,
          top: y,
          backgroundColor: "#0891b2",
          padding: 5,
          borderRadius: 5,
        }}
      >
        <Text style={styles.textstyle}>{`Weight: ${data}`}</Text>
      </View>
    );
  };

  const getWeightDifference = () => {
    let diff =
      weightData[weightData?.length - 1]?.weight - weightData[0]?.weight;
    return diff;
  };

  const emptyImageView = (viewStyle) => {
    return (
      <View style={[styles.imageView, viewStyle]}>
        <Image
          source={require("../../../constants/icons/Add-Image.png")}
          style={{ height: 30, width: 30 }}
        />
        <Text
          style={{
            color: "#fff",
            fontWeight: "700",
            fontSize: totalSize(1.3),
            paddingTop: height(1),
          }}
        >
          No Image
        </Text>
      </View>
    );
  };

  return (
    <>
      {showCalendar !== "" && (
        <CalenderModal
          visible={true}
          onSwipeComplete={() => setShowCalender("")}
          Data={handleDataSelection}
          onBackdropPress
        />
      )}
      <StatusBar barStyle={"light-content"} />
      <ScrollView
        style={{
          flexGrow: 1,
          backgroundColor: "rgba(17, 24, 40, 1)",
        }}
        contentContainerStyle={{ paddingBottom: height(10) }}
      >
        <View
          style={{
            flexDirection: "row",
            marginTop: 10,
            justifyContent: "space-between",
            paddingHorizontal: 10,
          }}
        >
          <TouchableOpacity
            onPress={() => setCalender(true)}
            style={{ width: "47%" }}
          >
            <View
              style={{
                borderRadius: 10,
                height: 57,
                overflow: "hidden",
                marginBottom: 15,
              }}
            >
              <TextInput
                mode="flat"
                label="Start Date"
                style={{
                  backgroundColor: "#172033",
                }}
                activeUnderlineColor={"#07B6D5"}
                textColor={"white"}
                editable={false}
                value={startDate ? moment(startDate).format("MM/DD/YYYY") : ""}
                right={
                  <TextInput.Icon
                    icon={"calendar-blank-outline"}
                    iconColor="white"
                    onPress={() => setShowCalender("start")}
                  />
                }
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              borderRadius: 10,
              height: 56,
              overflow: "hidden",
              marginBottom: 15,
              width: "47%",
            }}
            onPress={() => setEndCalender(true)}
          >
            <TextInput
              mode="flat"
              label="End Date"
              style={{
                backgroundColor: "#172033",
              }}
              activeUnderlineColor={"rgba(164, 164, 164, 1)"}
              textColor={"white"}
              value={endDate ? moment(endDate).format("MM/DD/YYYY") : ""}
              editable={false}
              right={
                <TextInput.Icon
                  icon={"calendar-blank-outline"}
                  iconColor="white"
                  onPress={() => setShowCalender("end")}
                />
              }
            />
          </TouchableOpacity>
        </View>
        {isLoading && (
          <ActivityIndicator
            color={"#f9fafb"}
            size={"large"}
            style={styles.indicator}
          />
        )}
        {weightData?.length > 0 && (
          <View style={styles.chartView}>
            <View style={styles.row}>
              <Text style={styles.chartHeading}>Weight</Text>
              <View style={styles.chartBtnsView}>
                <TouchableOpacity
                  style={[
                    styles.chartBtn,
                    {
                      backgroundColor:
                        filterChart == "custom" ? "#0891b2" : "transparent",
                    },
                  ]}
                  onPress={() => setFilterChart("custom")}
                >
                  <Text
                    style={{ color: filterChart == "custom" ? "#fff" : "grey" }}
                  >
                    Day
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.chartBtn,
                    {
                      backgroundColor:
                        filterChart == "week" ? "#0891b2" : "transparent",
                    },
                  ]}
                  onPress={() => setFilterChart("week")}
                >
                  <Text
                    style={{ color: filterChart == "week" ? "#fff" : "grey" }}
                  >
                    Week
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.chartBtn,
                    {
                      backgroundColor:
                        filterChart == "month" ? "#0891b2" : "transparent",
                    },
                  ]}
                  onPress={() => setFilterChart("month")}
                >
                  <Text
                    style={{ color: filterChart == "month" ? "#fff" : "grey" }}
                  >
                    Month
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <LineChart
                data={chartData}
                bezier
                width={600}
                height={height(30)}
                chartConfig={chartConfig}
                withShadow={false}
                withInnerLines={false}
                segments={chartSegments}
                xLabelsOffset={5}
                yLabelsOffset={15}
                onDataPointClick={({ x, y, value }) => {
                  setTooltipVisible(true);
                  setTooltipPosition({ x, y });
                  setTooltipData(value);
                  setTimeout(() => {
                    setTooltipVisible(false);
                  }, 2000);
                }}
                style={{
                  alignSelf: "center",
                  marginTop: height(3),
                  backgroundColor: "#fff",
                }}
              />
              {tooltipVisible && (
                <Tooltip
                  x={tooltipPosition.x}
                  y={tooltipPosition.y}
                  data={tooltipData}
                />
              )}
            </ScrollView>
          </View>
        )}
        {weightData?.length == 0 ? (
          <Text style={styles.emptyMsg}>Add your weight for tracking</Text>
        ) : (
          <View>
            <View style={[styles.row, { marginTop: 20 }]}>
              <Text
                style={{
                  fontWeight: "700",
                  fontSize: 20,
                  color: "white",
                }}
              >
                Weight Details
              </Text>
              {weightData?.length > 1 && (
                <TouchableOpacity onPress={() => setShowCompare(true)}>
                  <Text
                    style={{
                      fontWeight: "500",
                      fontSize: 18,
                      color: "#0891b2",
                    }}
                  >
                    Compare
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <WeightDetails
              data={weightData}
              onDone={() => {
                getUserData();
              }}
            />
          </View>
        )}
      </ScrollView>
      <Modal
        isVisible={showCompare}
        onBackButtonPress={() => setShowCompare(false)}
        onBackdropPress={() => setShowCompare(false)}
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      >
        <View style={styles.innerView}>
          <Text style={styles.modalHeading}>Compare</Text>
          <View style={styles.rowBasic}>
            {weightData[0]?.weightImages[0]?.postUrl ? (
              <Image
                source={{ uri: weightData[0]?.weightImages[0]?.postUrl }}
                style={[
                  styles.imageView,
                  {
                    borderTopLeftRadius: totalSize(1),
                    borderBottomLeftRadius: totalSize(1),
                  },
                ]}
              />
            ) : (
              emptyImageView({
                borderTopLeftRadius: totalSize(1),
                borderBottomLeftRadius: totalSize(1),
                backgroundColor: "#111828",
                justifyContent: "center",
                alignItems: "center",
              })
            )}
            {weightData[weightData?.length - 1]?.weightImages[0]?.postUrl ? (
              <Image
                source={{
                  uri: weightData[weightData?.length - 1]?.weightImages[0]
                    ?.postUrl,
                }}
                style={[
                  styles.imageView,
                  {
                    borderTopRightRadius: totalSize(1),
                    borderBottomRightRadius: totalSize(1),
                  },
                ]}
              />
            ) : (
              emptyImageView({
                borderTopRightRadius: totalSize(1),
                borderBottomRightRadius: totalSize(1),
                backgroundColor: "#111828",
                justifyContent: "center",
                alignItems: "center",
              })
            )}
          </View>
          <View style={styles.rowBasic}>
            <View
              style={{
                width: width(42.5),
                marginTop: height(1),
                alignItems: "center",
              }}
            >
              <Text style={styles.modalsubHeading}>
                Date:{" "}
                <Text style={{ fontWeight: "500", color: "#A4A4A4" }}>
                  {moment(weightData[0]?.createdAt).format("MM/DD/YYYY")}
                </Text>
              </Text>
              <Text style={styles.modalsubHeading}>
                Weight:{" "}
                <Text style={{ fontWeight: "500", color: "#A4A4A4" }}>
                  {`${parseInt(weightData[0]?.weight)} lbs`}
                </Text>
              </Text>
            </View>
            <View
              style={{
                width: width(42.5),
                marginTop: height(1),
                alignItems: "center",
              }}
            >
              <Text style={styles.modalsubHeading}>
                Date:{" "}
                <Text style={{ fontWeight: "500", color: "#A4A4A4" }}>
                  {moment(weightData[weightData?.length - 1]?.createdAt).format(
                    "MM/DD/YYYY"
                  )}
                </Text>
              </Text>
              <Text style={styles.modalsubHeading}>
                Weight:{" "}
                <Text style={{ fontWeight: "500", color: "#A4A4A4" }}>
                  {`${parseInt(
                    weightData[weightData?.length - 1]?.weight
                  )} lbs`}
                </Text>
              </Text>
            </View>
          </View>
          <View
            style={{
              ...styles.rowBasic,
              alignSelf: "center",
              marginTop: height(2),
            }}
          >
            {getWeightDifference() !== 0 && (
              <AntDesign
                name={getWeightDifference() > 0 ? "caretup" : "caretdown"}
                size={totalSize(1.3)}
                color={getWeightDifference() > 0 ? "#79D509" : "#d50808"}
                style={{ paddingTop: 4 }}
              />
            )}
            <Text
              style={{
                ...styles.modalsubHeading,
                fontSize: totalSize(1.5),
                paddingTop: 0,
              }}
            >
              {` ${getWeightDifference()} ${weightData[0]?.weightUnit}`}
            </Text>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default WeightTracker;

const styles = StyleSheet.create({
  emptyMsg: {
    color: "#B0B0B0",
    textAlign: "center",
    marginTop: height(10),
  },
  indicator: {
    position: "absolute",
    top: height(30),
    alignSelf: "center",
  },
  chartView: {
    height: height(40),
    backgroundColor: "#172033",
    width: width(95),
    alignSelf: "center",
    borderRadius: 10,
    paddingVertical: height(1),
  },
  chartHeading: {
    color: "#fff",
    fontSize: totalSize(2),
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: width(3),
  },
  chartBtnsView: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#232E41",
    borderRadius: 5,
  },
  chartBtn: {
    width: width(20),
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: height(0.5),
  },
  textstyle: {
    fontSize: 10,
    fontWeight: "500",
    color: "#fff",
  },
  innerView: {
    backgroundColor: "#182130",
    paddingVertical: height(2),
    borderRadius: totalSize(1),
    paddingHorizontal: width(5),
    width: width(95),
  },
  modalHeading: {
    fontSize: totalSize(2),
    fontWeight: "700",
    color: "#fff",
  },
  rowBasic: {
    flexDirection: "row",
    alignItems: "center",
  },
  imageView: {
    width: width(42.5),
    height: height(25),
    marginTop: height(2),
  },
  modalsubHeading: {
    fontWeight: "600",
    fontSize: totalSize(1.3),
    color: "#fff",
    paddingTop: 5,
  },
});

Date.prototype.getWeek = function () {
  const date = new Date(this.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 4 - (date.getDay() || 7));
  const yearStart = new Date(date.getFullYear(), 0, 1);
  return Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
};
