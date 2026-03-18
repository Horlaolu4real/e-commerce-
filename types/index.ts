export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  imageUrl: string | null;
  stock: number;
}

export interface CartItem {
  id: number;
  quantity: number;
  userId: number;
  productId: number;
  product: Product;
  line_total: number;
}

export interface CartSummary {
  item_count: number;
  total_items_quantity: number;
  subtotal: string;
  tax: string;
  total: string;
}

export interface WishlistItem {
  id: number;
  userId: number;
  productId: number;
  product: Product;
  createdAt: string;
}

export interface Order {
  id: number;
  userId: number;
  amount: number;
  status: "pending" | "paid" | "failed";
  paystackRef: string;
  createdAt: string;
  orderItems: {
    id: number;
    quantity: number;
    price: string;
    product: Product;
  }[];
}

export interface AuthResponse {
  success: boolean;
  accessToken: string;
  user: User;
  message: string;
}

export interface ApiError {
  response?: {
    data?: {
      message?: string;
      code?: string;
    };
    status?: number;
  };
  message: string;
}
