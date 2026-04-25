export const ITEM_REQUEST_PURPOSES = ["propulsion", "stopping", "car_design", "other"] as const;
export type ItemRequestPurpose = (typeof ITEM_REQUEST_PURPOSES)[number];

export const ITEM_REQUEST_PURPOSE_LABEL: Record<ItemRequestPurpose, string> = {
  propulsion: "Propulsion",
  stopping: "Stopping",
  car_design: "Car design",
  other: "Other",
};

export function isItemRequestPurpose(v: string): v is ItemRequestPurpose {
  return (ITEM_REQUEST_PURPOSES as readonly string[]).includes(v);
}
