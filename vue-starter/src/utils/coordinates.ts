/**
 * Calculates the haversine distance between point A, and B.
 * @param lngLatA
 * @param lngLatB
 */
export const haversineDistance = (
  [lng1, lat1]: [number, number],
  [lng2, lat2]: [number, number]
) => {
  const toRadian = (angle: number) => (Math.PI / 180) * angle;
  const distance = (a: number, b: number) => (Math.PI / 180) * (a - b);

  const RADIUS_OF_EARTH_IN_KM = 6371;

  const dLat = distance(lat2, lat1);
  const dLng = distance(lng2, lng1);

  lat1 = toRadian(lat1);
  lat2 = toRadian(lat2);

  const a =
    Math.pow(Math.sin(dLat / 2), 2) +
    Math.pow(Math.sin(dLng / 2), 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.asin(Math.sqrt(a));

  const finalDistance = RADIUS_OF_EARTH_IN_KM * c;

  return finalDistance;
};

/**
 * Returns a nearby point given a starting point and offset
 * @param point
 * @param offset
 */
export const nearbyPoint = (point: number, offset = 0.0625): number => {
  const from = point - offset;
  const to = point + offset;

  // @ts-ignore
  return (Math.random() * (to - from) + from).toFixed(8) * 1;
};

/**
 * Returns a nearby coordinate given a starting coordinate
 * @param coordinate
 */
export const nearbyCoordinate = (
  coordinate: [number, number]
): [number, number] => [nearbyPoint(coordinate[0]), nearbyPoint(coordinate[1])];
