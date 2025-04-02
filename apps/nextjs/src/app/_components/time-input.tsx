import type { InputHTMLAttributes } from "react";
import { forwardRef, useEffect, useState } from "react";

import { cn } from "@acme/ui";
import { Input } from "@acme/ui/input";

interface TimeInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export const TimeInput = forwardRef<HTMLInputElement, TimeInputProps>(
  ({ className, value, onChange, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState(value ?? "");
    const [isValid, setIsValid] = useState(true);

    // Update display value when prop value changes
    useEffect(() => {
      if (value !== undefined) {
        setDisplayValue(value);
        setIsValid(isValidTime(value));
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setDisplayValue(newValue);
      setIsValid(true); // Be permissive during typing
      onChange?.(newValue);
    };

    const handleBlur = () => {
      if (!isValidTime(displayValue)) {
        // Reset to previous valid value on blur if invalid
        setDisplayValue(value ?? "");
        setIsValid(false);
        return;
      }

      // Format the time to ensure consistent format (HH:mm)
      const [hoursStr, minutesStr] = displayValue.split(":");
      const hours = parseInt(hoursStr ?? "0", 10);
      const minutes = parseInt(minutesStr ?? "0", 10);

      const formattedHours = hours.toString().padStart(2, "0");
      const formattedMinutes = minutes.toString().padStart(2, "0");
      const formattedTime = `${formattedHours}:${formattedMinutes}`;

      setDisplayValue(formattedTime);
      setIsValid(true);
      onChange?.(formattedTime);
    };

    const isValidTime = (time: string): boolean => {
      // Allow empty value
      if (!time) return true;

      // Check format (HH:mm or H:mm)
      if (!/^\d{1,2}:\d{2}$/.test(time)) return false;

      const [hoursStr, minutesStr] = time.split(":");
      const hours = parseInt(hoursStr ?? "0", 10);
      const minutes = parseInt(minutesStr ?? "0", 10);

      // Validate hours and minutes
      if (isNaN(hours) || isNaN(minutes)) return false;
      if (hours < 0 || hours > 23) return false;
      if (minutes < 0 || minutes > 59) return false;

      return true;
    };

    return (
      <Input
        type="text"
        ref={ref}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="HH:mm"
        className={cn(
          "font-mono",
          !isValid && "border-destructive focus-visible:ring-destructive",
          className,
        )}
        {...props}
      />
    );
  },
);

TimeInput.displayName = "TimeInput";
