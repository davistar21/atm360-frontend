export interface Coordinates {
  lat: number;
  lng: number;
}

export function haversineDistance(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLon = toRad(coord2.lng - coord1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.lat)) *
      Math.cos(toRad(coord2.lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export interface GraphNode {
  id: string;
  coordinates: Coordinates;
}

export interface GraphEdge {
  from: string;
  to: string;
  weight: number;
}

export function dijkstraShortestPath(
  nodes: GraphNode[],
  edges: GraphEdge[],
  startId: string,
  endId: string
): string[] | null {
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const unvisited = new Set<string>();

  nodes.forEach((node) => {
    distances[node.id] = node.id === startId ? 0 : Infinity;
    previous[node.id] = null;
    unvisited.add(node.id);
  });

  while (unvisited.size > 0) {
    const current = Array.from(unvisited).reduce((min, id) =>
      distances[id] < distances[min] ? id : min
    );

    if (distances[current] === Infinity) break;
    if (current === endId) {
      const path: string[] = [];
      let node: string | null = endId;
      while (node) {
        path.unshift(node);
        node = previous[node];
      }
      return path;
    }

    unvisited.delete(current);

    const neighbors = edges.filter((e) => e.from === current);
    neighbors.forEach((edge) => {
      const alt = distances[current] + edge.weight;
      if (alt < distances[edge.to]) {
        distances[edge.to] = alt;
        previous[edge.to] = current;
      }
    });
  }

  return null;
}
