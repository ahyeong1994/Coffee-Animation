import {coffees} from '../data/coffee';
import {CartLine, Coffee} from '../types/app';

// Keeps today's local data on the same async boundary a future API will use.
const MOCK_API_DELAY_MS = 1400;

const waitForMockApi = (signal?: AbortSignal) =>
  new Promise<void>(resolve => {
    const timeout = setTimeout(resolve, MOCK_API_DELAY_MS);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timeout);
        resolve();
      },
      {once: true},
    );
  });

/** Replace the body with the catalog endpoint when the API is available. */
export const fetchCoffeeCatalog = async (
  signal?: AbortSignal,
): Promise<Coffee[]> => {
  await waitForMockApi(signal);
  return coffees;
};

/** Replace the body with the cart endpoint when the API is available. */
export const fetchCartLines = async (
  currentLines: CartLine[],
  signal?: AbortSignal,
): Promise<CartLine[]> => {
  await waitForMockApi(signal);
  return currentLines;
};
