import { v4 as uuidv4 } from "uuid";
import faker from "faker";
import { nearbyCoordinate } from "@/utils/coordinates";
import { GasStation } from "cloud-sdk-capacitor-plugin";

/**
 * Returns a list of mocked GasStation entities
 * @param coordinate
 * @param length
 * @returns
 */
const mockGasStations = (
  coordinate: [number, number],
  length = 8
): GasStation[] => {
  return [...Array(length).keys()].map((_) => ({
    id: uuidv4(),
    name: faker.company.companyName(),
    address: {
      countryCode: faker.address.countryCode(),
      city: faker.address.city(),
      zipCode: faker.address.zipCode(),
      state: faker.address.state(),
      street: faker.address.streetName(),
      houseNumber: `${faker.datatype.number(100)}`,
    },
    coordinates: nearbyCoordinate(coordinate),
    isConnectedFuelingAvailable: true,
    lastUpdated: new Date(),
  }));
};

export { mockGasStations };
