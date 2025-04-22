// src/components/PowerControls.tsx
import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { Zap, Moon } from "lucide-react-native";
import deviceService from "../services/deviceService";
import { Device } from "../../src/types/device";

export default function PowerControls({ device }: { device: Device }) {
  return (
    <View style={{ flexDirection: "row", gap: 24 }}>
      <TouchableOpacity
        onPress={() => deviceService.wakeMachine(device.id, device.mac)}
        style={{ alignItems: "center" }}
      >
        <Zap size={32} />
        <Text>Wake</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() =>
          fetch(`http://${device.ip}:7777/command`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "power",
              action: "sleep",
            }),
          })
        }
        style={{ alignItems: "center" }}
      >
        <Moon size={32} />
        <Text>Sleep</Text>
      </TouchableOpacity>
    </View>
  );
}
