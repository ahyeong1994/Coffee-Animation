import {useEffect, useMemo, useState} from 'react';
import {fetchCoffeeCatalog} from '../services/coffeeData';
import {Coffee} from '../types/app';

/** Owns category/search filters and returns the matching coffee catalog. */
export const useCoffeeCatalog = () => {
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [coffees, setCoffees] = useState<Coffee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const load = async () => {
      try {
        const loadedCoffees = await fetchCoffeeCatalog(controller.signal);
        if (active) {
          setCoffees(loadedCoffees);
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

  const filteredCoffees = useMemo(
    () =>
      coffees.filter(coffee => {
        const matchesCategory =
          category === 'All' || coffee.category === category;
        const searchable =
          `${coffee.name} ${coffee.subtitle} ${coffee.origin}`.toLowerCase();
        return (
          matchesCategory && searchable.includes(query.trim().toLowerCase())
        );
      }),
    [category, coffees, query],
  );

  return {
    category,
    query,
    isLoading,
    filteredCoffees,
    setCategory,
    setQuery,
  };
};
