import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, Image, ActivityIndicator } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";

export default function BarQRScanner(props) {
  const [hasPermission, setHasPermission] = useState(null);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    props.handleBarCodeScanned(data);
  };

  if (hasPermission === null) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size={"large"} color={"blue"} />
      </View>
    );
  }
  if (hasPermission === false) {
    return (
      <View className="flex-1 justify-center items-center">
        <p>No access to camera!</p>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      <Image
        style={{
          width: 100,
          height: 100,
          resizeMode: "contain",
          alignSelf: "center",
        }}
        source={require("../../../assets/images/scanner.png")}
      ></Image>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
});
