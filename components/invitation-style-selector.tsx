import type { InvitationStyle } from "@/lib/invitation-model";

export function InvitationStyleSelector({
  value,
  onChange,
  disabled,
}: {
  value: InvitationStyle;
  onChange: (style: InvitationStyle) => void;
  disabled: boolean;
}) {
  return (
    <fieldset className="style-selector" disabled={disabled}>
      <legend>Choose your invitation style</legend>
      <div className="style-options">
        {(
          [
            ["card", "Animated Card", "Interactive envelope/card invitation"],
            [
              "scroll",
              "Scroll Story",
              "Pink scrapbook party · scroll to celebrate",
            ],
          ] as const
        ).map(([id, title, description]) => (
          <label key={id} className={value === id ? "selected" : ""}>
            <input
              type="radio"
              name="style"
              value={id}
              checked={value === id}
              onChange={() => onChange(id)}
            />
            <span>
              <strong>{title}</strong>
              <small>{description}</small>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
