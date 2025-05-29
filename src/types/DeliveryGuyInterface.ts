export default interface DeliveryGuy {
  id: number;
  name: string;
  phone_number: string;
  gender: "Male" | "Female" | "Other";
  profile_image: string;
  orders_assigned: number[];
}