"use client";
import { THEMES, themesFor, type Audience, type ThemeId } from "@/lib/themes";

export function DesignPicker({
  theme,
  onChange,
  disabled,
}: {
  theme: ThemeId;
  onChange: (theme: ThemeId) => void;
  disabled: boolean;
}) {
  const audience = THEMES[theme].audience;
  return (
    <fieldset className="design-picker" disabled={disabled}>
      <legend>Design</legend>
      <div className="audience-switch">
        {(
          [
            ["her", "For her"],
            ["him", "For him"],
          ] as [Audience, string][]
        ).map(([id, label]) => (
          <label key={id} className={audience === id ? "selected" : ""}>
            <input
              type="radio"
              name="audience"
              value={id}
              checked={audience === id}
              onChange={() => onChange(themesFor(id)[0])}
            />
            {label}
          </label>
        ))}
      </div>
      <div className="theme-options">
        {themesFor(audience).map((id) => (
          <label key={id} className={theme === id ? "selected" : ""}>
            <input
              type="radio"
              name="theme"
              value={id}
              checked={theme === id}
              onChange={() => onChange(id)}
            />
            <span className="theme-swatches" aria-hidden="true">
              {THEMES[id].swatches.map((color) => (
                <span key={color} style={{ background: color }} />
              ))}
            </span>
            {THEMES[id].name}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
