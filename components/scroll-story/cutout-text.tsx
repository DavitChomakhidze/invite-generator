import styles from "./story.module.css";

export function CutoutText({
  text,
  animated = false,
}: {
  text: string;
  animated?: boolean;
}) {
  // Keep combined characters and emoji together, including non-Latin names.
  const characters = Array.from(
    new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text),
    (part) => part.segment,
  );
  return (
    <span
      data-decoration={animated ? "lettering" : undefined}
      className={`${styles.cutoutText} ${animated ? `${styles.letteringFloat} ${styles.ambient}` : ""}`}
      aria-hidden="true"
    >
      {characters.map((letter, i) =>
        /\s/u.test(letter) ? (
          <span key={i} className={styles.letterSpace} />
        ) : (
          <span key={i} className={styles.letter}>
            {letter}
          </span>
        ),
      )}
    </span>
  );
}
