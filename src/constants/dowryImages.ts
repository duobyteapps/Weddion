import { ImageSourcePropType } from "react-native";

import { DowryCategoryImageKey } from "@/types/dowry";

export const lavenderBranchLeft = require("../../assets/images/illustration/dowry/lavender-branch-left.png");

export const lavenderBranchRight = require("../../assets/images/illustration/dowry/lavender-branch-right.png");

export const dowryCategoryImages: Record<
  DowryCategoryImageKey,
  ImageSourcePropType
> = {
  "living-room": require("../../assets/images/illustration/dowry/living-room.png"),
  bedroom: require("../../assets/images/illustration/dowry/bedroom.png"),
  kitchen: require("../../assets/images/illustration/dowry/kitchen.png"),
  bathroom: require("../../assets/images/illustration/dowry/bathroom.png"),
  "home-decoration": require("../../assets/images/illustration/dowry/home-decoration.png"),
  technology: require("../../assets/images/illustration/dowry/technology.png"),
  "small-appliances": require("../../assets/images/illustration/dowry/small-appliances.png"),
  other: require("../../assets/images/illustration/dowry/other.png"),
};
