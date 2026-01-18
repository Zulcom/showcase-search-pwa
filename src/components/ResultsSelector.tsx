import { css } from "../../styled-system/css";

type ResultsCount = 5 | 100;

interface ResultsSelectorProps {
  value: ResultsCount;
  onChange: (value: ResultsCount) => void;
}

export function ResultsSelector({ value, onChange }: ResultsSelectorProps) {
  return (
    <div
      className={css({
        display: "flex",
        alignItems: "center",
        gap: "3",
      })}
    >
      <label
        htmlFor="results-count"
        className={css({
          fontSize: "sm",
          color: "text.muted",
        })}
      >
        Results per search:
      </label>
      <select
        id="results-count"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) as ResultsCount)}
        aria-label="Number of results to display"
        className={css({
          px: "3",
          py: "1.5",
          bg: "bg.subtle",
          border: "1px solid",
          borderColor: "border.default",
          borderRadius: "md",
          color: "text.default",
          fontSize: "sm",
          cursor: "pointer",
          outline: "none",
          transition: "all 0.2s",
          _focus: {
            borderColor: "blue.500",
          },
        })}
      >
        <option value={5}>5 results</option>
        <option value={100}>100 results</option>
      </select>
    </div>
  );
}
