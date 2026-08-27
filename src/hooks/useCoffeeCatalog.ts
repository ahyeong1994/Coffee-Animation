import {useMemo, useState} from 'react';
import {coffees} from '../data/coffee';

/** Owns category/search filters and returns the matching coffee catalog. */
export const useCoffeeCatalog = () => {
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');

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
    [category, query],
  );

  return {
    category,
    query,
    filteredCoffees,
    setCategory,
    setQuery,
  };
};
