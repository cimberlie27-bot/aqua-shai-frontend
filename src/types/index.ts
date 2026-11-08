export interface User {
  id: number;
  full_name: string;
  email: string;
  contact_number: string;
  default_address: string;
  role: string;
}

export interface Product {
  id: number;
  product_name: string;
  description: string;
  category: string;
  price_centavos: number;
  image_url: string;
  stock_quantity: number;
}

export interface Wallet {
  balance_centavos: number;
}