import type { RefObject } from "react";
import type { ScrollInvitationData } from "@/lib/invitation-model";
import {
  formatEventDate,
  formatEventTime,
  isGoogleMapsUrl,
} from "@/lib/presentation";
import { StorySection } from "./story-section";
import { PartyGlass, RibbonBow } from "./party-art";
import styles from "./story.module.css";

export function StorySections({
  invite,
  scrollRoot,
}: {
  invite: ScrollInvitationData;
  scrollRoot?: RefObject<HTMLDivElement | null>;
}) {
  return (
    <>
      <StorySection
        label="Birthday introduction"
        number="01"
        scrollRoot={scrollRoot}
      >
        <div className={styles.stickerStrip} aria-hidden="true">
          <span>★</span>
          <span>♡</span>
          <span>✷</span>
          <span>♡</span>
          <span>★</span>
          <span>✷</span>
          <span>♡</span>
          <span>★</span>
          <span>♡</span>
        </div>
        <p className={styles.eyebrow}>MY FAVORITE PEOPLE. ONE SPECIAL DAY.</p>
        <h2 className={styles.heading}>
          You + me + <em>birthday magic.</em>
        </h2>
        <p className={styles.copy}>
          {invite.message ||
            `Join ${invite.host_name || "me"} for a birthday celebration with favorite people and memories worth keeping.`}
        </p>
      </StorySection>
      <StorySection
        label="Date and time"
        number="02"
        scrollRoot={scrollRoot}
        tinted
      >
        <h2 className={styles.eyebrow}>SAVE THE DATE</h2>
        <p className={styles.date}>{formatEventDate(invite.event_date)}</p>
        <p className={styles.time}>{formatEventTime(invite.event_time)}</p>
        <p className={styles.zone}>{invite.time_zone.replaceAll("_", " ")}</p>
      </StorySection>
      <StorySection label="Location" number="03" scrollRoot={scrollRoot}>
        <h2 className={styles.eyebrow}>THE PARTY IS HERE</h2>
        <span className={styles.locationPin} aria-hidden="true">
          ✦
        </span>
        <p className={styles.copy}>{invite.address}</p>
        {isGoogleMapsUrl(invite.maps_url) && (
          <a
            className={styles.action}
            href={invite.maps_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open in Maps <span aria-hidden="true">↗</span>
          </a>
        )}
      </StorySection>
      {invite.dress_code && (
        <StorySection
          label="Dress code"
          number="04"
          scrollRoot={scrollRoot}
          tinted
        >
          <RibbonBow className={`${styles.dressBow} ${styles.ambient}`} />
          <h2 className={styles.eyebrow}>DRESS CODE</h2>
          <p className={styles.dressCode}>{invite.dress_code}</p>
        </StorySection>
      )}
      <StorySection
        label="Closing message"
        number={invite.dress_code ? "05" : "04"}
        scrollRoot={scrollRoot}
        tinted={!invite.dress_code}
      >
        <PartyGlass className={styles.closingGlass} />
        <p className={styles.eyebrow}>LET’S MAKE A LITTLE BIRTHDAY HISTORY</p>
        <h2 className={styles.heading}>
          See you <em>there.</em>
        </h2>
        <p className={styles.copy}>
          {invite.scroll.closing_message || "Can’t wait to celebrate with you."}
        </p>
        <p className={styles.signature}>with love, {invite.host_name}</p>
      </StorySection>
      <footer className={styles.credit}>
        MADE WITH <span aria-hidden="true">♥</span> BY OCCASION.
      </footer>
    </>
  );
}
