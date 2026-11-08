
import { createContext, useState, ReactNode } from 'react';

export type ProductOption = 'Refill' | 'Swap' | 'New';

export interface CartItem {
  product_id: number;
  product_name: string;
  price_centavos: number;
  quantity: number;
  option: ProductOption;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  setItemQuantity: (
    product_id: number,
    option: ProductOption,
    quantity: number,
    product?: CartItem
  ) => void;
  clearCart: () => void;
  removeItem: (index: number) => void;
}

export const CartContext = createContext<CartContextType>({
  cart: [],
  addToCart: () => {},
  setItemQuantity: () => {},
  clearCart: () => {},
  removeItem: () => {},
});

export const CartProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  // ADD ITEM
  const addToCart = (newItem: CartItem) => {
    setCart((prev) => {
      const existing = prev.find(
        (item) =>
          item.product_id === newItem.product_id &&
          item.option === newItem.option
      );

      if (existing) {
        return prev.map((item) =>
          item.product_id === newItem.product_id &&
          item.option === newItem.option
            ? {
                ...item,
                product_name: newItem.product_name,
                price_centavos: newItem.price_centavos,
                quantity: item.quantity + newItem.quantity,
              }
            : item
        );
      }

      return [...prev, newItem];
    });
  };

  // UPDATE QUANTITY
  const setItemQuantity = (
    product_id: number,
    option: ProductOption,
    quantity: number,
    product?: CartItem
  ) => {
    setCart((prev) => {
      if (quantity <= 0) {
        return prev.filter(
          (item) =>
            !(
              item.product_id === product_id &&
              item.option === option
            )
        );
      }

      const existing = prev.find(
        (item) =>
          item.product_id === product_id &&
          item.option === option
      );

      if (existing) {
        return prev.map((item) =>
          item.product_id === product_id &&
          item.option === option
            ? {
                ...item,
                quantity,
                ...(product
                  ? {
                      product_name: product.product_name,
                      price_centavos: product.price_centavos,
                    }
                  : {}),
              }
            : item
        );
      }

      if (product) {
        return [...prev, { ...product, quantity }];
      }

      return prev;
    });
  };

  // CLEAR CART
  const clearCart = () => {
    setCart([]);
  };

  // REMOVE ITEM
  const removeItem = (index: number) => {
    setCart((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        setItemQuantity,
        clearCart,
        removeItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
