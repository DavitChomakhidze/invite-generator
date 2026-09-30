import { Header, Footer } from "@/components/brand";
import { InvitationForm } from "@/components/invitation-form";

export default function Home() {
  return (
    <>
      <Header />
      <main id="main-content" className="home-main">
        <section className="hero">
          <div className="hero-eyebrow">
            YOUR SIXTEENTH, BEAUTIFULLY INVITED
          </div>
          <h1>
            Turning sixteen.
            <br className="mobile-break" /> <em>Making memories.</em>
          </h1>
          <p>
            A personal invitation for a once-in-a-lifetime celebration.
            <br />
            Add your details, watch it unfold, and send it to your favorite
            people.
          </p>
        </section>
        <div className="journey" aria-label="Three simple steps">
          <span className="active">
            <span className="step-number">01</span>Make it yours
          </span>
          <span className="journey-line" />
          <span>
            <span className="step-number">02</span>See it unfold
          </span>
          <span className="journey-line" />
          <span>
            <span className="step-number">03</span>Send your invite
          </span>
        </div>
        <InvitationForm />
        <section id="how-it-works" className="how-section">
          <div className="how-title">
            <span className="eyebrow">FROM YOUR PLANS TO THEIR INBOX</span>
            <h2>Three steps. One special day.</h2>
          </div>
          <div className="how-grid">
            <article>
              <span>01</span>
              <h3>Set the scene</h3>
              <p>
                Your name, the date, and the place. Add a note in your own
                words.
              </p>
            </article>
            <article>
              <span>02</span>
              <h3>Watch it unfold</h3>
              <p>
                An illustrated host delivers an envelope that opens into your
                invitation.
              </p>
            </article>
            <article>
              <span>03</span>
              <h3>Send it their way</h3>
              <p>
                Copy the link and send it to your guests. Everything they need
                is inside.
              </p>
            </article>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
