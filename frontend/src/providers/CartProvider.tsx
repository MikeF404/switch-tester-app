import React, { createContext, useContext, useState, useCallback } from 'react';

interface CartContextType {
  cartCount: number;
  cartItems: CartItem[];
  addToCart: (item: SimpleCartItem | CustomTesterItem) => Promise<string>;
  removeFromCart: (cartId: string, itemId: string) => Promise<void>;
  updateItemQuantity: (itemId: string, quantity: number) => Promise<void>;
  updateCart: () => Promise<void>;
  clearCart: () => void;
}

interface SimpleCartItem {
  itemId: number;
  quantity: number;
}

interface CustomTesterItem {
  name: string;
  size: number;
  keycaps: string;
  switches: Array<{ id: number; quantity: number }>;
  quantity: number;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size?: number;
  keycaps?: string;
  switches?: Array<{ id: number; name: string; quantity: number }>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);

  const updateCart = useCallback(async () => {
    try {
      const cartId = localStorage.getItem('cartId');
      if (!cartId) {
        setCartItems([]);
        setCartCount(0);
        return;
      }

      const response = await fetch(`http://localhost:8080/api/cart/${cartId}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const cart = await response.json();
      
      // Transform cart items to match the frontend format
      const transformedItems = cart.items.map((item: any) => ({
        id: item.item.id,
        name: item.item.name,
        price: item.item.price,
        quantity: item.quantity,
        // For custom testers
        size: item.item.size,
        keycaps: item.item.keycaps,
        switches: item.item.switches?.map((s: any) => ({
          id: s.id,
          name: s.name,
          quantity: s.quantity
        }))
      }));

      setCartItems(transformedItems);
      setCartCount(transformedItems.length);
    } catch (error) {
      console.error("Error updating cart:", error);
      setCartItems([]);
      setCartCount(0);
    }
  }, []);

  const addToCart = useCallback(async (item: SimpleCartItem | CustomTesterItem) => {
    try {
      const cartId = localStorage.getItem('cartId');
      
      const url = new URL('http://localhost:8080/api/cart/add');
      if ('itemId' in item) {
        // Simple item
        url.searchParams.append('itemId', item.itemId.toString());
        url.searchParams.append('quantity', item.quantity.toString());
        if (cartId) {
          url.searchParams.append('cartId', cartId);
        }
      } else {
        // Custom tester
        // Add custom tester parameters
        if (cartId) {
          url.searchParams.append('cartId', cartId);
        }
        url.searchParams.append('name', item.name);
        url.searchParams.append('size', item.size.toString());
        url.searchParams.append('keycaps', item.keycaps);
        url.searchParams.append('switches', JSON.stringify(item.switches));
        url.searchParams.append('quantity', item.quantity.toString());
      }

      const response = await fetch(url.toString(), {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to add item to cart');
      }

      const data = await response.json();
      
      // Save the cartId if it's a new cart
      if (!cartId && data.id) {
        localStorage.setItem('cartId', data.id);
      }

      await updateCart();
      return "Item added to cart";
    } catch (error) {
      console.error("Error adding to cart:", error);
      throw error;
    }
  }, [updateCart]);

  const removeFromCart = useCallback(async (cartId: string, itemId: string) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/cart/${cartId}/items/${itemId}`,
        {
          method: 'DELETE'
        }
      );

      if (!response.ok) {
        throw new Error('Failed to remove item from cart');
      }

      await updateCart();
    } catch (error) {
      console.error('Error removing item from cart:', error);
      throw error;
    }
  }, [updateCart]);

  const updateItemQuantity = useCallback(async (itemId: string, quantity: number) => {
    try {
      const cartId = localStorage.getItem('cartId');
      if (!cartId) return;

      if (quantity <= 0) {
        await removeFromCart(cartId, itemId);
        return;
      }

      const response = await fetch(
        `http://localhost:8080/api/cart/${cartId}/items/${itemId}?quantity=${quantity}`,
        {
          method: 'PUT'
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update item quantity');
      }

      await updateCart();
    } catch (error) {
      console.error('Error updating item quantity:', error);
      throw error;
    }
  }, [removeFromCart, updateCart]);

  const clearCart = useCallback(() => {
    localStorage.removeItem('cartId');
    setCartItems([]);
    setCartCount(0);
  }, []);

  return (
    <CartContext.Provider
      value={{
        cartCount,
        cartItems,
        addToCart,
        removeFromCart,
        updateItemQuantity,
        updateCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
