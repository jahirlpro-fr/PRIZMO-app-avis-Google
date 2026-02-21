import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WheelSegment } from "@/types";
import { Sparkles, Zap } from "lucide-react";

interface WheelOfFortuneProps {
  segments: WheelSegment[];
  onSpinComplete: (prize: string) => void;
  wheelNumber: 1 | 2;
  establishmentName: string;
}

export function WheelOfFortune({ segments, onSpinComplete, wheelNumber, establishmentName }: WheelOfFortuneProps) {
    const [isSpinning, setIsSpinning] = useState(false);
    const [currentRotation, setCurrentRotation] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);

    const spinWheel = () => {
        if (isSpinning || segments.length === 0) return;
        setIsSpinning(true);

        const totalProbability = segments.reduce((sum, seg) => sum + seg.probability, 0);
        const random = Math.random() * totalProbability;
        let cumulativeProbability = 0;
        let selectedIndex = 0;

        for (let i = 0; i < segments.length; i++) {
            cumulativeProbability += segments[i].probability;
            if (random <= cumulativeProbability) {
                selectedIndex = i;
                break;
            }
        }

        const selectedSegment = segments[selectedIndex];
        const degreesPerSegment = 360 / segments.length;
const targetAngle = 360 - (degreesPerSegment * selectedIndex + degreesPerSegment / 2);
const extraSpins = 1800;
const normalizedCurrent = currentRotation % 360;
const finalRotation = currentRotation + (360 - normalizedCurrent) + extraSpins + targetAngle;

        setCurrentRotation(finalRotation);

        if (wheelRef.current) {
            wheelRef.current.style.transition = "transform 5000ms cubic-bezier(0.17, 0.67, 0.12, 0.99)";
            wheelRef.current.style.transform = `rotate(${finalRotation}deg)`;
        }

        setTimeout(() => {
            setIsSpinning(false);
            onSpinComplete(selectedSegment.title);
        }, 5000);
    };

  const degreesPerSegment = 360 / segments.length;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 prizmo-gradient">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl">
            {wheelNumber === 1 ? "🎡 Tournez la roue !" : "🎁 Bonus Instagram !"}
          </CardTitle>
          <p className="text-muted-foreground">
            {wheelNumber === 1 
              ? `Merci pour votre avis ! Tentez votre chance chez ${establishmentName}`
              : "Un deuxième cadeau vous attend !"}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative w-full max-w-md mx-auto aspect-square">
            {/* Wheel container */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                ref={wheelRef}
                className="relative w-full h-full rounded-full shadow-2xl"
                style={{ transformOrigin: "center" }}
              >
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  {segments.map((segment, index) => {
                    const startAngle = (degreesPerSegment * index - 90) * (Math.PI / 180);
                    const endAngle = (degreesPerSegment * (index + 1) - 90) * (Math.PI / 180);
                    const x1 = 100 + 100 * Math.cos(startAngle);
                    const y1 = 100 + 100 * Math.sin(startAngle);
                    const x2 = 100 + 100 * Math.cos(endAngle);
                    const y2 = 100 + 100 * Math.sin(endAngle);
                    const largeArcFlag = degreesPerSegment > 180 ? 1 : 0;
                    const textAngle = degreesPerSegment * index + degreesPerSegment / 2 - 90;
                    const textRadius = 65;
                    const textX = 100 + textRadius * Math.cos(textAngle * (Math.PI / 180));
                    const textY = 100 + textRadius * Math.sin(textAngle * (Math.PI / 180));

                    return (
                      <g key={segment.id}>
                        <path
                          d={`M 100 100 L ${x1} ${y1} A 100 100 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                          fill={segment.color}
                          stroke="white"
                          strokeWidth="2"
                        />
                        <text
                          x={textX}
                          y={textY}
                          fill="white"
                          fontSize="8"
                          fontWeight="bold"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          transform={`rotate(${textAngle}, ${textX}, ${textY})`}
                          style={{ pointerEvents: "none" }}
                        >
                          {segment.title.length > 15 ? segment.title.substring(0, 15) + "..." : segment.title}
                        </text>
                      </g>
                    );
                  })}
                  {/* Center circle */}
                  <circle cx="100" cy="100" r="15" fill="white" stroke="#333" strokeWidth="2" />
                </svg>
              </div>
            </div>

            {/* Pointer */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
              <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-red-500 drop-shadow-lg" />
            </div>
          </div>

          <Button
            onClick={spinWheel}
            disabled={isSpinning}
            className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:from-purple-700 hover:via-pink-700 hover:to-orange-600 text-white text-xl font-bold py-8 disabled:opacity-50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:transform-none"
          >
            {isSpinning ? (
              <>
                <Zap className="w-6 h-6 mr-2 animate-bounce" />
                La roue tourne..
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6 mr-2 animate-pulse" />
                🎰 TOURNER LA ROUE !
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}