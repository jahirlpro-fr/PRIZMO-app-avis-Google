import { WheelSegment } from "@/types";
import { useEffect, useRef } from "react";

interface WheelPreviewProps {
  segments: WheelSegment[];
  size?: number;
  pointerSize?: number;
}

export function WheelPreview({ segments, size = 300, pointerSize = 40 }: WheelPreviewProps) {
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
        ctx.strokeStyle = "rgba(0,0,0,0.25)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

      // Draw text
      const textAngle = degreesPerSegment * index + degreesPerSegment / 2 - 90;
      const textRadius = radius * 0.65;
      const textX = centerX + textRadius * Math.cos(textAngle * (Math.PI / 180));
      const textY = centerY + textRadius * Math.sin(textAngle * (Math.PI / 180));

      ctx.save();
      ctx.translate(textX, textY);
      ctx.rotate(textAngle * (Math.PI / 180));
        ctx.fillStyle = "rgba(0,0,0,0.75)";
        ctx.font = "bold 13px Outfit";
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
      ctx.strokeStyle = "rgba(0,0,0,0.2)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

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
      <div 
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
        style={{ marginTop: -(size / 2) + 10 }} // Position at top
      >
        <svg 
          width={pointerSize} 
          height={pointerSize} 
          viewBox="0 0 40 40" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="filter drop-shadow-lg"
        >
          <path 
            d="M20 40L37.3205 10H2.67949L20 40Z" 
            fill="#FACC15" 
            stroke="white" 
            strokeWidth="2"
          />
        </svg>
      </div>
    </div>
  );
}