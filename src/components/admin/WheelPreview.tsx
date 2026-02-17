import { WheelSegment } from "@/types";
import { useEffect, useRef } from "react";

interface WheelPreviewProps {
  segments: WheelSegment[];
  size?: number;
}

export function WheelPreview({ segments, size = 400 }: WheelPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || segments.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 10;
    const degreesPerSegment = 360 / segments.length;

    // Draw segments
    segments.forEach((segment, index) => {
      const startAngle = (degreesPerSegment * index - 90) * (Math.PI / 180);
      const endAngle = (degreesPerSegment * (index + 1) - 90) * (Math.PI / 180);

      // Draw segment
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = segment.color;
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw text
      const textAngle = degreesPerSegment * index + degreesPerSegment / 2 - 90;
      const textRadius = radius * 0.65;
      const textX = centerX + textRadius * Math.cos(textAngle * (Math.PI / 180));
      const textY = centerY + textRadius * Math.sin(textAngle * (Math.PI / 180));

      ctx.save();
      ctx.translate(textX, textY);
      ctx.rotate(textAngle * (Math.PI / 180));
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 14px Outfit";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      const maxLength = 20;
      const text = segment.title.length > maxLength 
        ? segment.title.substring(0, maxLength) + "..." 
        : segment.title;
      
      ctx.fillText(text, 0, 0);
      ctx.restore();
    });

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.strokeStyle = "#333333";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw center text
    ctx.fillStyle = "#333333";
    ctx.font = "bold 16px Outfit";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("SPIN", centerX, centerY);

  }, [segments, size]);

  if (segments.length === 0) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-100 rounded-full border-4 border-dashed border-gray-300"
        style={{ width: size, height: size }}
      >
        <p className="text-gray-400 text-center px-8">
          Ajoutez des segments pour voir la roue
        </p>
      </div>
    );
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="rounded-full shadow-2xl"
      />
      {/* Pointer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
        <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-red-500 drop-shadow-lg" />
      </div>
    </div>
  );
}