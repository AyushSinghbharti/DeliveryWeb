export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  pincode: string;
  coordinates: Coordinates;
}

export interface ProductOrder {
  id: number;
  order_date: string; // Format: YYYY-MM-DD
  delivery_date: string; // Format: YYYY-MM-DD
  product_name: string;
  product_description: string;
  category: string;
  amount: number;
  user_id: number;
  delivery_boy_id: number;
  address: Address;
  image: string;
}
