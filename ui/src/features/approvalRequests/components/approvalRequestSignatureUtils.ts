import type { PointGroup } from "signature_pad";

export const normalizedSignatureLeftInset = 16;

export const normalizeSignatureLeft = (signatureData: PointGroup[]): PointGroup[] => {
  const points = signatureData.flatMap((group) => group.points ?? []);
  if (points.length === 0) {
    return signatureData;
  }

  const minX = Math.min(...points.map((point) => point.x));
  if (!Number.isFinite(minX)) {
    return signatureData;
  }

  return signatureData.map((group) => ({
    ...group,
    points: group.points?.map((point) => ({
      ...point,
      x: point.x - minX + normalizedSignatureLeftInset,
    })),
  }));
};
