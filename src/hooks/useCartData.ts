import {useEffect, useRef, useState} from 'react';
import {fetchCartLines} from '../services/coffeeData';
import {CartLine} from '../types/app';

/** Loads the cart through an API-shaped boundary and then tracks local edits. */
export const useCartData = (currentLines: CartLine[]) => {
  const initialLinesRef = useRef(currentLines);
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const load = async () => {
      try {
        const loadedLines = await fetchCartLines(
          initialLinesRef.current,
          controller.signal,
        );
        if (active) {
          setLines(loadedLines);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    load();
    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (!isLoading) {
      setLines(currentLines);
    }
  }, [currentLines, isLoading]);

  return {isLoading, lines};
};
