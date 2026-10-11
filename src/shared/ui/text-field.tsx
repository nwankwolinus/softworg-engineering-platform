import { useId } from "react";

interface TextFieldProps {
  name: string;
  label: string;
  type?: "text" | "email" | "tel";
  multiline?: boolean;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  defaultValue?: string;
  placeholder?: string;
  /** Persistent guidance, associated with the control via `aria-describedby`. */
  helperText?: string;
  /** Validation message. Shown with an icon and a screen-reader prefix, so it never relies on colour alone. */
  error?: string;
}

const controlClassName =
  "w-full rounded-md border border-border-input bg-surface px-3.5 py-2.5 text-body text-foreground placeholder:text-muted-foreground/70 motion-fast hover:border-foreground/70 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border-input aria-[invalid=true]:border-error";

export function TextField({
  name,
  label,
  type = "text",
  multiline = false,
  required = false,
  disabled = false,
  autoComplete,
  defaultValue,
  placeholder,
  helperText,
  error,
}: TextFieldProps) {
  const id = useId();
  const helperId = `${id}-helper`;
  const errorId = `${id}-error`;
  const describedBy = [helperText && helperId, error && errorId].filter(Boolean).join(" ") || undefined;

  const controlProps = {
    id,
    name,
    required,
    disabled,
    defaultValue,
    placeholder,
    className: controlClassName,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-label text-foreground">
        {label}
        {!required && <span className="font-normal text-muted-foreground"> (optional)</span>}
      </label>
      {multiline ? (
        <textarea rows={6} {...controlProps} />
      ) : (
        <input type={type} autoComplete={autoComplete} {...controlProps} />
      )}
      {helperText && (
        <p id={helperId} className="text-body-sm text-muted-foreground">
          {helperText}
        </p>
      )}
      {error && (
        <p id={errorId} className="flex items-start gap-1.5 text-body-sm text-error">
          <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 size-4 shrink-0">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-11.5a.75.75 0 011.5 0v4a.75.75 0 01-1.5 0v-4zM10 15a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
          <span>
            <span className="sr-only">Error: </span>
            {error}
          </span>
        </p>
      )}
    </div>
  );
}
