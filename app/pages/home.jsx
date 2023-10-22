import { useEffect, useRef, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import WebView from "react-native-webview";
import BarQRScanner from "./scanner/scanner";
import {
  View,
  TouchableOpacity,
  Modal,
  Image,
  BackHandler,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Linking from "expo-linking";
function HomeScreen(props) {
  const [showModal, setShowModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const webviewRef = useRef(null);
  const [WebLoading, setWebLoading] = useState(true);

  useEffect(() => {
    if (Platform.OS === "android") {
      BackHandler.addEventListener("hardwareBackPress", onAndroidBackPress);
      return () => {
        BackHandler.removeEventListener(
          "hardwareBackPress",
          onAndroidBackPress
        );
      };
    }
  }, []);

  const onAndroidBackPress = () => {
    if (webviewRef.current) {
      webviewRef.current.goBack();
      return true; // prevent default behavior (exit app)
    }
    return false;
  };

  // * this will be used in the webview to display the result

  const navChangeHandler = (event) => {
    setWebLoading(event.loading);
    if (
      event.url.includes("sale") ||
      event.url.includes("purchase") ||
      event.url.includes("stock")
    ) {
      setShowScanner(true);
    } else {
      setShowScanner(false);
    }

    if (
      event.url.includes("/history/sale") ||
      event.url.includes("/history/purchase") ||
      event.url.includes("/history/stock")
    ) {
      Linking.openURL(event.url);
      webviewRef.current.goBack();
    }
  };

  const handleBarCodeScanned = (data) => {
    console.log("Scanned Result: ", data);
    setShowModal(false);
    alert(`Result: ${data}`);
    injectPayload(data);
  };

  const injectPayload = async (data) => {
    console.log("Injecting payload...");

    await webviewRef.current.injectJavaScript(
      `
      localStorage.setItem('EXPO_SCN_RESULT', '${data}');
      localStorage.setItem('APP', 'true');
      window.dispatchEvent(new Event("EXPO_LS_EVENT"));

      `
    );
  };
  return (
    <View className="flex-1">
      {showModal && (
        <Modal animationType="slide">
          <View className="flex-1">
            <BarQRScanner handleBarCodeScanned={handleBarCodeScanned} />
            <View className="justify-center items-center p-3">
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Image
                  className="w-16 h-16"
                  source={require("../../assets/images/close.png")}
                />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
      <SafeAreaView className="flex-1">
        {WebLoading && (
          <View className="p-3">
            <ActivityIndicator size={"small"} />
          </View>
        )}
        <WebView
          cacheEnabled={true}
          ref={webviewRef}
          onNavigationStateChange={navChangeHandler}
          source={{
            uri: "https://jyestha-motors.vercel.app/",
          }}
          domStorageEnabled={true}
          onError={() => alert("Error, restart the app to fix it.")}
        />
      </SafeAreaView>
      {showScanner && (
        <View className="justify-center items-center">
          <TouchableOpacity
            style={{
              width: 50,
              height: 50,
              borderRadius: 50,
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() => setShowModal(true)}
          >
            <Image
              className="w-10 h-10 justify-center items-center"
              source={require("../../assets/images/scanner.png")}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const Tab = createBottomTabNavigator();

export default function StartPage() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Home"
        options={{ tabBarStyle: { display: "none" }, headerShown: false }}
        component={HomeScreen}
      />
    </Tab.Navigator>
  );
}
