import { ElementError, getElementErrorAria } from "@/components/general/element-error";
import { ElementHeader } from "@/components/general/element-header";
import { Input } from "@/components/general/input";
import { Textarea } from "@/components/general/textarea";
import { cn } from "@/lib/utils";

interface OpenTextProps {
  elementId: string;
  headline: string;
  description?: string;
  placeholder?: string;
  inputId: string;
  value?: string;
  onChange: (value: string) => void;
  required?: boolean;
  requiredLabel?: string;
  longAnswer?: boolean;
  inputType?: "text" | "email" | "url" | "phone" | "number";
  characterCountLimit?: number;
  charLimit?: {
    min?: number;
    max?: number;
  };
  errorMessage?: string;
  dir?: "ltr" | "rtl" | "auto";
  rows?: number;
  disabled?: boolean;
  imageUrl?: string;
  videoUrl?: string;
}

function OpenText({
  elementId,
  headline,
  description,
  placeholder,
  value = "",
  inputId,
  onChange,
  required = false,
  requiredLabel,
  longAnswer = false,
  inputType = "text",
  charLimit,
  characterCountLimit,
  errorMessage,
  dir = "auto",
  rows = 3,
  disabled = false,
  imageUrl,
  videoUrl,
}: Readonly<OpenTextProps>): React.JSX.Element {
  const currentLength = value.length;
  const counterMax = characterCountLimit ?? charLimit?.max;
  const counterId = counterMax !== undefined ? `${inputId}-character-count` : undefined;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    onChange(e.target.value);
  };

  const renderCharLimit = (): React.JSX.Element | null => {
    if (counterMax === undefined) return null;
    const isOverLimit = currentLength >= counterMax;
    return (
      <div
        id={counterId}
        className={cn("text-xs", isOverLimit ? "font-semibold text-red-500" : "text-brand")}>
        {currentLength}/{counterMax}
      </div>
    );
  };

  const descriptionId = description ? `${inputId}-description` : undefined;
  const errorAria = getElementErrorAria(inputId, errorMessage);
  const describedBy = [descriptionId, errorAria.ariaDescribedBy, counterId].filter(Boolean).join(" ");

  return (
    <div className="w-full space-y-4" id={elementId} dir={dir}>
      {/* Headline */}
      <ElementHeader
        headline={headline}
        description={description}
        descriptionId={descriptionId}
        required={required}
        requiredLabel={requiredLabel}
        htmlFor={inputId}
        imageUrl={imageUrl}
        videoUrl={videoUrl}
      />
      <div className="relative" data-element-input>
        <ElementError errorMessage={errorMessage} id={errorAria.errorId} />
        {/* Input or Textarea */}
        <div className="space-y-1">
          {longAnswer ? (
            <Textarea
              id={inputId}
              placeholder={placeholder}
              value={value}
              onChange={handleChange}
              aria-required={required}
              aria-invalid={errorAria.ariaInvalid}
              aria-describedby={describedBy || undefined}
              dir={dir}
              rows={rows}
              disabled={disabled}
              errorMessage={errorMessage}
              minLength={charLimit?.min}
              maxLength={charLimit?.max}
            />
          ) : (
            <Input
              id={inputId}
              type={inputType}
              placeholder={placeholder}
              value={value}
              onChange={handleChange}
              aria-required={required}
              aria-invalid={errorAria.ariaInvalid}
              aria-describedby={describedBy || undefined}
              dir={dir}
              disabled={disabled}
              errorMessage={errorMessage}
              minLength={charLimit?.min}
              maxLength={charLimit?.max}
            />
          )}
          {renderCharLimit()}
        </div>
      </div>
    </div>
  );
}

export { OpenText };
export type { OpenTextProps };
