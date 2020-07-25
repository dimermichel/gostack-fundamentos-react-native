import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  // console.log(products);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const productsList = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );
      if (productsList) {
        setProducts(JSON.parse(productsList));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      // TODO ADD A NEW ITEM TO THE CART
      if (products.filter(e => e.id === product.id).length === 0) {
        product.quantity = 1;
        setProducts([...products, product]);
        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify([...products, product]),
        );
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const newProductsList = products.map(productItem => {
        if (productItem.id === id) {
          productItem.quantity += 1;
          return productItem;
        }
        return productItem;
      });
      setProducts(newProductsList);
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(newProductsList),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const newProductsList = products.map(productItem => {
        if (productItem.id === id && productItem.quantity > 0) {
          productItem.quantity -= 1;
        }
        return productItem;
      });

      const fiterList = newProductsList.filter(product => product.quantity > 0);
      setProducts(fiterList);
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(fiterList),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
