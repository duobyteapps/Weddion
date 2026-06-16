import { MaterialCommunityIcons } from "@expo/vector-icons";

export type MaterialIconName = keyof typeof MaterialCommunityIcons.glyphMap;

export type DowryCategoryImageKey =
  | "living-room"
  | "bedroom"
  | "kitchen"
  | "bathroom"
  | "home-decoration"
  | "technology"
  | "small-appliances"
  | "other";

export type DowryChecklistItem = {
  id: string;
  title: string;
  completed: boolean;
};

export type DowryCategoryDetail = {
  id: string;
  title: string;
  icon: MaterialIconName;
  imageKey: DowryCategoryImageKey;
  items: DowryChecklistItem[];
};

export type DowryFilterType = "all" | "completed" | "missing";
