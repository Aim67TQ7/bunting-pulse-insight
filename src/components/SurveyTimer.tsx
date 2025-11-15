import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";

interface LocationClock {
  name: string;
  timezone: string;
}

const locations: LocationClock[] = [
  { name: "Redditch, UK", timezone: "Europe/London" },
  { name: "Berkhamsted, UK", timezone: "Europe/London" },
  { name: "DuBois, PA", timezone: "America/New_York" },
  { name: "Newton, KS", timezone: "America/Chicago" },
];

export type SurveyStatus = "before-open" | "open" | "closed";

interface SurveyTimerProps {
  onStatusChange?: (status: SurveyStatus) => void;
}

export const SurveyTimer = ({ onStatusChange }: SurveyTimerProps) => {
  const [currentTimes, setCurrentTimes] = useState<Record<string, string>>({});
  const [countdown, setCountdown] = useState<string>("");
  const [status, setStatus] = useState<SurveyStatus>("before-open");

  // Survey times
  const SURVEY_START = new Date("2025-11-16T04:00:00+00:00"); // 4 AM UK time Nov 16

  useEffect(() => {
    const updateTimes = () => {
      const now = new Date();
      
      // Update location clocks
      const times: Record<string, string> = {};
      locations.forEach((location) => {
        times[location.name] = formatInTimeZone(
          now,
          location.timezone,
          "h:mm:ss a"
        );
      });
      setCurrentTimes(times);

      // Calculate survey status and countdown
      let newStatus: SurveyStatus;
      let countdownText: string;

      if (now < SURVEY_START) {
        newStatus = "before-open";
        const diff = SURVEY_START.getTime() - now.getTime();
        countdownText = formatCountdown(diff);
      } else {
        newStatus = "open";
        countdownText = "Survey is Open";
      }

      setStatus(newStatus);
      setCountdown(countdownText);
      
      if (onStatusChange) {
        onStatusChange(newStatus);
      }
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);

    return () => clearInterval(interval);
  }, [onStatusChange]);

  const formatCountdown = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${days}d ${hours}h ${minutes}m ${secs}s`;
  };

  const getStatusStyles = () => {
    switch (status) {
      case "open":
        return "border-green-500 bg-green-50/50 dark:bg-green-950/20";
      case "closed":
        return "border-red-500 bg-red-50/50 dark:bg-red-950/20";
      default:
        return "border-primary/30 bg-primary/5";
    }
  };

  const getCountdownStyles = () => {
    switch (status) {
      case "open":
        return "text-green-600 dark:text-green-400";
      case "closed":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-primary";
    }
  };

  return (
    <Card className={`sticky top-4 ${getStatusStyles()} transition-colors duration-500`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Survey Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Location Clocks */}
        <div className="space-y-2">
          {locations.map((location) => (
            <div
              key={location.name}
              className="flex justify-between items-center text-sm border-b border-border/40 pb-2 last:border-0"
            >
              <span className="text-muted-foreground font-medium">
                {location.name}
              </span>
              <span className="font-mono font-semibold">
                {currentTimes[location.name] || "Loading..."}
              </span>
            </div>
          ))}
        </div>

        {/* Countdown Timer */}
        <div className="pt-3 border-t border-border">
          <div className="text-center space-y-2">
            <div className="text-sm font-semibold text-muted-foreground">
              {status === "before-open" && "Survey Opens In"}
              {status === "open" && "Status"}
              {status === "closed" && "Status"}
            </div>
            <div className={`text-2xl font-bold font-mono ${getCountdownStyles()}`}>
              {countdown}
            </div>
            {status === "closed" && (
              <p className="text-xs text-muted-foreground mt-2">
                The survey period has ended. Thank you to all who participated.
              </p>
            )}
            {status === "open" && (
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-medium text-green-600 dark:text-green-400">
                  Survey is Live
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
