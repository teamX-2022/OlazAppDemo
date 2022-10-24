import { StyleSheet, Text, View } from "react-native";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React, { useEffect } from "react";
import { Pressable, TouchableOpacity } from "react-native";
import { useState } from "react";
import useColorScheme from "../hooks/useColorScheme";
import TabChatScreen from "../screens/ChatScreen";
import TabContactScreen from "../screens/ContactScreen";
import TabUserScreen from "../screens/UserScreen";
import { RootTabParamList, RootTabScreenProps } from "../types";
import Tooltip from "react-native-walkthrough-tooltip";
import MenuPopup from "../components/MenuPopup/MenuPopup";
import { LinearGradient } from "expo-linear-gradient";
import { init, socket } from "../utils/socketClient";
import jwt from "../utils/jwt";
import { useAppDispatch, useAppSelector } from "../store";
import {
  conversationSelector,
  getList,
} from "../store/reducers/conversationSlice";
import { rerenderMessage } from "../store/reducers/messageSlice";

const BottomTab = createBottomTabNavigator<RootTabParamList>();

init();
export default function TabNavigator() {
  const colorScheme = useColorScheme();
  const [showTip, setTip] = useState(false);
  const dispatch = useAppDispatch();

  const conversations = useAppSelector(conversationSelector);

  const user = { _id: jwt.getUserId() };

  useEffect(() => {
    if (!user._id) return;
    dispatch(getList({ name: "", type: 0 }));
  }, []);

  useEffect(() => {
    const userId = user._id;
    if (userId) socket.emit("join", userId);
  }, [user]);

  useEffect(() => {
    if (conversations.conversations.length === 0) return;

    const conversationIds = conversations.conversations.map(
      (conversation) => conversation._id
    );
    socket.emit("join-conversations", conversationIds);
  }, [conversations]);

  useEffect(() => {
    socket.on("new-message", (conversationId: string, message: any) => {
      if (user._id !== message.user._id) dispatch(rerenderMessage(message));
    });
  }, []);

  function headerSearch(navigation: any) {
    return (
      <Pressable
        onPress={() => {
          navigation.navigate("Search");
        }}
      >
        <View style={{ flexDirection: "row" }}>
          <AntDesign
            name="search1"
            size={23}
            color="white"
            style={{ marginLeft: 15 }}
          />
          <Text
            style={{
              color: "white",
              paddingLeft: 22,
              fontSize: 16,
              opacity: 0.6,
            }}
          >
            Tìm kiếm
          </Text>
        </View>
      </Pressable>
    );
  }

  function headerMenuPopup(navigation: any) {
    return (
      <View style={{ flexDirection: "row" }}>
        <Pressable>
          <MaterialIcons
            name="qr-code-scanner"
            size={24}
            color="white"
            style={{ marginRight: 20 }}
          />
        </Pressable>
        <View>
          <Tooltip
            isVisible={showTip}
            content={<MenuPopup navigation={navigation} setTip={setTip} />}
            onClose={() => setTip(false)}
            placement="bottom"
            displayInsets={{ top: 24, bottom: 24, left: 24, right: 12 }}
          >
            <TouchableOpacity onPress={() => setTip(true)}>
              <AntDesign
                name="plus"
                size={25}
                color="white"
                style={{ marginRight: 15 }}
              />
            </TouchableOpacity>
          </Tooltip>
        </View>
      </View>
    );
  }

  const headerGradient = (
    <LinearGradient
      // Background Linear Gradient
      colors={["#257afe", "#00bafa"]}
      style={StyleSheet.absoluteFill}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    />
  );

  return (
    <BottomTab.Navigator
      initialRouteName="TabChat"
      screenOptions={{
        tabBarActiveTintColor: "#0091ff",
        tabBarStyle: {
          backgroundColor: "white",
        },
      }}
    >
      <BottomTab.Screen
        name="TabChat"
        component={TabChatScreen}
        options={({ navigation }: RootTabScreenProps<"TabChat">) => ({
          title: "Tin nhắn",
          tabBarIcon: ({ color }) => (
            <AntDesign name="message1" size={24} color={color} />
          ),
          headerBackground: () => headerGradient,
          headerTitle: "",
          headerLeft: () => headerSearch(navigation),
          headerRight: () => headerMenuPopup(navigation),
        })}
      />
      <BottomTab.Screen
        name="TabContact"
        component={TabContactScreen}
        options={({ navigation }: RootTabScreenProps<"TabContact">) => ({
          title: "Danh bạ",
          tabBarIcon: ({ color }) => (
            <AntDesign name="contacts" size={26} color={color} />
          ),
          headerBackground: () => headerGradient,
          headerTitle: "",
          headerLeft: () => headerSearch(navigation),
          headerRight: () => (
            <Pressable onPress={() => navigation.navigate("AddFriendScreen")}>
              <AntDesign
                name="adduser"
                size={24}
                color="white"
                style={{ marginRight: 15 }}
              />
            </Pressable>
          ),
        })}
      />
      <BottomTab.Screen
        name="TabUser"
        component={TabUserScreen}
        options={({ navigation }: RootTabScreenProps<"TabUser">) => ({
          title: "Cá nhân",
          tabBarIcon: ({ color }) => (
            <AntDesign name="user" size={26} color={color} />
          ),
          headerBackground: () => headerGradient,
          headerTitle: "",
          headerLeft: () => headerSearch(navigation),
          headerRight: () => (
            <Pressable>
              <AntDesign
                name="setting"
                size={24}
                color="white"
                style={{ marginRight: 15 }}
              />
            </Pressable>
          ),
        })}
      />
    </BottomTab.Navigator>
  );
}
