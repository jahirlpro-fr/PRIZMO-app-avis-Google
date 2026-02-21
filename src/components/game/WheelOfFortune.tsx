import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WheelSegment } from "@/types";
import { Sparkles, Zap, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface WheelOfFortuneProps {
  segments: WheelSegment[];
  onSpinComplete: (prize: WheelSegment) => void;
}

export function WheelOfFortune({ segments, onSpinComplete }: WheelOfFortuneProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<WheelSegment | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  
  // Ticker animation state
  const [tickerWiggle, setTickerWiggle] = useState(false);

  const spinWheel = () => {
    if (isSpinning) return;
    
    // Reset states
    setIsSpinning(true);
    setShowCelebration(false);
    setResult(null);
    setTickerWiggle(true);

    // Calculate weighted random selection
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
    
    // Calculate rotation to land on the selected segment
    // Segment 0 is at -90deg (top) initially
    // To land on index i, we need to rotate so that index i is at -90deg
    // The wheel rotates clockwise, so we need to subtract the angle
    const segmentAngle = 360 / segments.length;
    const targetAngle = 360 - (selectedIndex * segmentAngle);
    
    // Add randomness within the segment (±40% of segment width) to avoid lines
    const randomOffset = (Math.random() - 0.5) * segmentAngle * 0.8;
    
    // Minimum 5 full spins (1800 degrees)
    // We add to the current rotation to ensure continuous spinning
    const spins = 5;
    const currentRotationMod = rotation % 360;
    const distanceToTarget = targetAngle - currentRotationMod;
    
    // Ensure we always spin forward significantly
    const forwardAdjustment = distanceToTarget < 0 ? 360 : 0;
    const newRotation = rotation + (spins * 360) + distanceToTarget + forwardAdjustment + randomOffset;

    setRotation(newRotation);

    // Stop spinning after 4 seconds
    setTimeout(() => {
      setIsSpinning(false);
      setTickerWiggle(false);
      setResult(selectedSegment);
      setShowCelebration(true);
      
      // Call parent callback after a short delay to show celebration
      setTimeout(() => {
        onSpinComplete(selectedSegment);
      }, 3000);
    }, 4000);
  };

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-xl shadow-2xl bg-white/90 backdrop-blur border-none overflow-hidden">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl md:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            {isSpinning ? "La roue tourne..." : "Tentez votre chance !"}
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            {isSpinning ? "Suspens..." : "Lancez la roue pour découvrir votre cadeau"}
          </p>
        </CardHeader>
        
        <CardContent className="flex flex-col items-center space-y-8 pt-4">
          <div className="relative w-full max-w-[320px] aspect-square">
            
            {/* Ticker / Arrow (Fixed at Top) */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
              <div className={cn(
                "w-8 h-10 bg-gradient-to-b from-red-600 to-red-700 clip-path-arrow shadow-xl drop-shadow-lg transform origin-top transition-transform",
                tickerWiggle && "animate-[wiggle_0.15s_ease-in-out_infinite]"
              )} style={{ clipPath: "polygon(0% 0%, 100% 0%, 50% 100%)" }} />
            </div>

            {/* Wheel Container */}
            <div className="relative w-full h-full rounded-full shadow-[0_0_20px_rgba(0,0,0,0.2)] border-[8px] border-gray-800 bg-white overflow-hidden">
              
              {/* Outer Ring with Pins */}
              <div className="absolute inset-0 rounded-full border-[2px] border-white/50 z-10 pointer-events-none">
                {[...Array(24)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-yellow-400 rounded-full shadow-sm"
                    style={{
                      left: '50%',
                      top: '4px',
                      transformOrigin: '50% calc(50% - 4px + 150px)', // Approx radius
                      transform: `translateX(-50%) rotate(${i * (360 / 24)}deg) translateY(-2px)`
                    }}
                  />
                ))}
              </div>

              {/* Spinning Wheel */}
              <div
                className="w-full h-full transition-transform duration-[4000ms] cubic-bezier(0.2, 0.8, 0.2, 1)"
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  {segments.map((segment, index) => {
                    // Calculate SVG path for segment
                    const percentage = 1 / segments.length;
                    const startAngle = index * percentage * Math.PI * 2;
                    const endAngle = (index + 1) * percentage * Math.PI * 2;
                    
                    const x1 = 50 + 50 * Math.cos(startAngle);
                    const y1 = 50 + 50 * Math.sin(startAngle);
                    const x2 = 50 + 50 * Math.cos(endAngle);
                    const y2 = 50 + 50 * Math.sin(endAngle);
                    
                    // Determine if the arc should be the long way around (flag 1) or short way (flag 0)
                    const largeArcFlag = percentage > 0.5 ? 1 : 0;
                    
                    // Text positioning
                    const textAngle = startAngle + (endAngle - startAngle) / 2;
                    const textRadius = 35; // Position text at 70% radius
                    const textX = 50 + textRadius * Math.cos(textAngle);
                    const textY = 50 + textRadius * Math.sin(textAngle);
                    const rotationDeg = (textAngle * 180) / Math.PI;

                    return (
                      <g key={segment.id}>
                        <path
                          d={`M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                          fill={segment.color}
                          stroke="white"
                          strokeWidth="0.5"
                        />
                        <text
                          x={textX}
                          y={textY}
                          fill="white"
                          fontSize="4"
                          fontWeight="bold"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          transform={`rotate(${rotationDeg}, ${textX}, ${textY})`}
                          style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}
                        >
                          {segment.title.length > 12 ? segment.title.substring(0, 10) + ".." : segment.title}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Center Hub */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border-4 border-gray-200">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <Button
            onClick={spinWheel}
            disabled={isSpinning || !!result}
            className="w-full max-w-xs h-14 text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg transform transition-all active:scale-95 disabled:opacity-80 disabled:cursor-not-allowed"
          >
            {isSpinning ? (
              <span className="flex items-center gap-2">
                <Zap className="w-5 h-5 animate-pulse" />
                La roue tourne...
              </span>
            ) : result ? (
              <span className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-300" />
                Gagné !
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                LANCER LA ROUE
              </span>
            )}
          </Button>

          {/* Result & Celebration Overlay */}
          {showCelebration && result && (
            <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" />
              
              <div className="relative bg-white p-8 rounded-2xl shadow-2xl text-center max-w-sm w-full animate-in zoom-in-50 duration-500 border-4 border-yellow-400">
                {/* Floating particles */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-6xl animate-bounce">
                  🏆
                </div>
                
                <h3 className="text-2xl font-bold text-gray-800 mt-4 mb-2">Félicitations !</h3>
                <p className="text-gray-500 mb-6">Vous avez gagné :</p>
                
                <div className="py-4 px-6 bg-gradient-to-r from-yellow-100 to-yellow-50 rounded-lg border border-yellow-200 mb-6 transform rotate-1">
                  <p className="text-xl font-extrabold text-yellow-700 break-words">
                    {result.title}
                  </p>
                </div>
                
                <p className="text-sm text-gray-400 animate-pulse">
                  Redirection en cours...
                </p>
              </div>

              {/* CSS Confetti */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(30)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-3 h-3 rounded-sm"
                    style={{
                      backgroundColor: ['#FFD700', '#FF69B4', '#00BFFF', '#32CD32'][Math.floor(Math.random() * 4)],
                      left: `${Math.random() * 100}%`,
                      top: '-20px',
                      animation: `fall ${2 + Math.random() * 2}s linear infinite`,
                      animationDelay: `${Math.random() * 2}s`
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <style jsx global>{`
        @keyframes wiggle {
          0%, 100% { transform: translateX(-50%) rotate(0deg); }
          25% { transform: translateX(-50%) rotate(-15deg); }
          75% { transform: translateX(-50%) rotate(15deg); }
        }
        @keyframes fall {
          to { transform: translateY(100vh) rotate(720deg); }
        }
      `}</style>
    </div>
  );
}