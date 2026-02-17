import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Participant } from "@/types";
import { format, subDays, startOfDay, endOfDay, eachDayOfInterval, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

interface AnalyticsChartsProps {
  participants: Participant[];
  period: 7 | 30 | 90 | 365;
}

export function AnalyticsCharts({ participants, period }: AnalyticsChartsProps) {
  // Generate daily participation data
  const dailyData = useMemo(() => {
    const endDate = new Date();
    const startDate = subDays(endDate, period - 1);
    
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    return days.map(day => {
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);
      
      const dayParticipants = participants.filter(p => {
        const participantDate = parseISO(p.createdAt);
        return participantDate >= dayStart && participantDate <= dayEnd;
      });
      
      const winners = dayParticipants.filter(p => p.prize1 && p.prize1 !== "Merci !");
      
      return {
        date: format(day, "dd MMM", { locale: fr }),
        fullDate: format(day, "dd MMMM yyyy", { locale: fr }),
        participants: dayParticipants.length,
        winners: winners.length,
        conversionRate: dayParticipants.length > 0 
          ? Math.round((winners.length / dayParticipants.length) * 100) 
          : 0
      };
    });
  }, [participants, period]);

  // Calculate period comparison
  const periodComparison = useMemo(() => {
    const now = new Date();
    const currentPeriodStart = subDays(now, period);
    const previousPeriodStart = subDays(currentPeriodStart, period);
    
    const currentParticipants = participants.filter(p => 
      parseISO(p.createdAt) >= currentPeriodStart
    );
    
    const previousParticipants = participants.filter(p => {
      const date = parseISO(p.createdAt);
      return date >= previousPeriodStart && date < currentPeriodStart;
    });
    
    const currentWinners = currentParticipants.filter(p => p.prize1 && p.prize1 !== "Merci !").length;
    const previousWinners = previousParticipants.filter(p => p.prize1 && p.prize1 !== "Merci !").length;
    
    const participantGrowth = previousParticipants.length > 0
      ? Math.round(((currentParticipants.length - previousParticipants.length) / previousParticipants.length) * 100)
      : 0;
    
    const winnerGrowth = previousWinners > 0
      ? Math.round(((currentWinners - previousWinners) / previousWinners) * 100)
      : 0;
    
    return {
      currentParticipants: currentParticipants.length,
      previousParticipants: previousParticipants.length,
      participantGrowth,
      currentWinners,
      previousWinners,
      winnerGrowth
    };
  }, [participants, period]);

  // Peak activity hours
  const hourlyData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    return hours.map(hour => {
      const hourParticipants = participants.filter(p => {
        const participantHour = parseISO(p.createdAt).getHours();
        return participantHour === hour;
      });
      
      return {
        hour: `${hour}h`,
        participants: hourParticipants.length
      };
    }).filter(h => h.participants > 0); // Only show active hours
  }, [participants]);

  return (
    <div className="space-y-6">
      {/* Period Comparison Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Évolution des participants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold">{periodComparison.currentParticipants}</div>
              <div className={`text-sm font-semibold ${periodComparison.participantGrowth >= 0 ? "text-green-600" : "text-red-600"}`}>
                {periodComparison.participantGrowth >= 0 ? "+" : ""}{periodComparison.participantGrowth}%
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              vs {periodComparison.previousParticipants} période précédente
            </p>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Évolution des gagnants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold">{periodComparison.currentWinners}</div>
              <div className={`text-sm font-semibold ${periodComparison.winnerGrowth >= 0 ? "text-green-600" : "text-red-600"}`}>
                {periodComparison.winnerGrowth >= 0 ? "+" : ""}{periodComparison.winnerGrowth}%
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              vs {periodComparison.previousWinners} période précédente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Participation Chart */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Participation quotidienne</CardTitle>
          <CardDescription>Évolution du nombre de participants dans le temps</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip 
                contentStyle={{ backgroundColor: "white", border: "1px solid #ccc", borderRadius: "8px" }}
                labelFormatter={(label, payload) => payload[0]?.payload?.fullDate || label}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="participants" 
                name="Participants" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                dot={{ fill: "#8b5cf6" }}
              />
              <Line 
                type="monotone" 
                dataKey="winners" 
                name="Gagnants" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: "#10b981" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Conversion Rate Chart */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Taux de conversion quotidien</CardTitle>
          <CardDescription>Pourcentage de participants ayant gagné un lot</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                label={{ value: "Taux (%)", angle: -90, position: "insideLeft" }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: "white", border: "1px solid #ccc", borderRadius: "8px" }}
                labelFormatter={(label, payload) => payload[0]?.payload?.fullDate || label}
                formatter={(value) => `${value}%`}
              />
              <Bar 
                dataKey="conversionRate" 
                name="Taux de gain" 
                fill="#f59e0b"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Hourly Activity Chart */}
      {hourlyData.length > 0 && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Activité par heure</CardTitle>
            <CardDescription>Heures de pics d'affluence</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="hour" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip 
                  contentStyle={{ backgroundColor: "white", border: "1px solid #ccc", borderRadius: "8px" }}
                />
                <Bar 
                  dataKey="participants" 
                  name="Participations" 
                  fill="#d946ef"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}