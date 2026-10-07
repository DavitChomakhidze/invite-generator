import styles from "./story.module.css";

export function StorySparkles({ opening = false }: { opening?: boolean }) {
  return (
    <div
      className={`${styles.sparkles} ${opening ? styles.openingSparkles : ""}`}
      aria-hidden="true"
    >
      {Array.from({ length: opening ? 8 : 3 }, (_, i) => (
        <span
          data-decoration="star"
          className={`${styles.sparkle} ${styles.ambient}`}
          key={i}
        >
          ✦
        </span>
      ))}
    </div>
  );
}
