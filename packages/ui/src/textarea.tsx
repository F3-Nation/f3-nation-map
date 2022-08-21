import type { Control, FieldValues, Path } from "react-hook-form";
import * as React from "react";
import { Controller } from "react-hook-form";

import { cn } from ".";

export type TextareaProps =
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label?: string;
    width?: number;
  };
export type ControlledInputProps<T extends FieldValues> = Omit<
  TextareaProps,
  "value"
> & {
  control: Control<T>;
  name: Path<T>;
};

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, width, required, ...props }, ref) => {
    return (
      <div className="relative" style={{ width: width }}>
        <label
          className={cn(
            "absolute px-3 pt-2 text-sm font-semibold tracking-wide text-primary",
          )}
        >
          {label} {required ? <span style={{ color: "red" }}>*</span> : null}
        </label>
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 pt-7 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300",
            className,
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  },
);
Textarea.displayName = "Textarea";

const ControlledTextArea = <T extends FieldValues>(
  props: ControlledInputProps<T>,
) => {
  const { control, name, ...rest } = props;
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => (
        <Textarea onChange={onChange} onBlur={onBlur} value={value} {...rest} />
      )}
    />
  );
};
export { Textarea, ControlledTextArea };
