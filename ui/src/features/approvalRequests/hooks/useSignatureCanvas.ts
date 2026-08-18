import { normalizeSignatureLeft } from "@/features/approvalRequests/components/approvalRequestSignatureUtils";
import { useEffect, useRef } from "react";
import SignaturePad from "signature_pad";
import type { PointGroup } from "signature_pad";

interface UseSignatureCanvasOptions {
  backgroundColor: string;
  editable?: boolean;
  onChange?: (value: string) => void;
  penColor: string;
  value?: string;
}

const applyPenColor = (signatureData: PointGroup[], penColor: string): PointGroup[] =>
  signatureData.map((group) => ({ ...group, penColor }));

const deserializeSignature = (value: string | undefined): PointGroup[] => {
  if (!value) {
    return [];
  }

  try {
    const signatureData: unknown = JSON.parse(value);
    return Array.isArray(signatureData) ? (signatureData as PointGroup[]) : [];
  } catch {
    return [];
  }
};

const serializeSignature = (signatureData: PointGroup[]): string => {
  if (signatureData.length === 0) {
    return "";
  }

  return JSON.stringify(
    normalizeSignatureLeft(signatureData).map((group) => {
      const { penColor, ...groupWithoutPenColor } = group;
      void penColor;
      return groupWithoutPenColor;
    }),
  );
};

export const useSignatureCanvas = ({
  backgroundColor,
  editable = false,
  onChange,
  penColor,
  value,
}: UseSignatureCanvasOptions) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signaturePadRef = useRef<SignaturePad | null>(null);
  const signatureDataRef = useRef<PointGroup[]>([]);
  const valueRef = useRef(value);
  valueRef.current = value;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    const signaturePad = new SignaturePad(canvas, { backgroundColor, penColor });
    signaturePadRef.current = signaturePad;
    signatureDataRef.current = normalizeSignatureLeft(deserializeSignature(valueRef.current));

    const drawSignature = () => {
      signaturePad.clear();
      if (signatureDataRef.current.length > 0) {
        signaturePad.fromData(applyPenColor(signatureDataRef.current, penColor));
      }
    };
    const resizeCanvas = () => {
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * ratio;
      canvas.height = rect.height * ratio;
      canvas.getContext("2d")?.scale(ratio, ratio);
      drawSignature();
    };
    const handleEndStroke = () => {
      signatureDataRef.current = signaturePad.toData();
      onChange?.(serializeSignature(signatureDataRef.current));
    };

    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(canvas);
    if (editable) {
      signaturePad.addEventListener("endStroke", handleEndStroke);
    } else {
      signaturePad.off();
    }
    resizeCanvas();

    return () => {
      signatureDataRef.current = signaturePad.toData();
      observer.disconnect();
      signaturePad.removeEventListener("endStroke", handleEndStroke);
      signaturePad.off();
      signaturePadRef.current = null;
    };
  }, [backgroundColor, editable, onChange, penColor]);

  useEffect(() => {
    const signatureData = normalizeSignatureLeft(deserializeSignature(value));
    if (serializeSignature(signatureDataRef.current) === serializeSignature(signatureData)) {
      return;
    }

    signatureDataRef.current = signatureData;
    const signaturePad = signaturePadRef.current;
    if (!signaturePad) {
      return;
    }

    signaturePad.clear();
    if (signatureData.length > 0) {
      signaturePad.fromData(applyPenColor(signatureData, penColor));
    }
  }, [penColor, value]);

  const clear = () => {
    signaturePadRef.current?.clear();
    signatureDataRef.current = [];
    onChange?.("");
  };

  return { canvasRef, clear };
};
