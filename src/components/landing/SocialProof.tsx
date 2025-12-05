import styles from './styles/SocialProof.module.css';

const socialProofItems = [
  {
    id: 1,
    city: "Mumbai",
    text: "Finally understood my ex wasn't the right match."
  },
  {
    id: 2,
    city: "Delhi",
    text: "Stopped begging for closure. Found peace on my own terms."
  },
  {
    id: 3,
    city: "Bangalore",
    text: "Started my relationship more clearly — are they the truth."
  },
  {
    id: 4,
    city: "Pune",
    text: "Stopped accepting breadcrumbs. Set boundaries without guilt."
  },
  {
    id: 5,
    city: "Hyderabad",
    text: "Learned when to walk away. The relationship feels better."
  },
  {
    id: 6,
    city: "Chennai",
    text: "Understood the true patterns. Started attracting healthier people."
  }
];

export default function SocialProof() {
  return (
    <section className={styles.socialProof}>
      <div className={styles.container}>
        <h2 className={styles.title}>
          Real <span className={styles.gradientText}>Breakthroughs</span>
        </h2>

        <p className={styles.description}>
          These are moments of clarity that changed everything.
        </p>

        <div className={styles.proofGrid}>
          {socialProofItems.map((item) => (
            <div key={item.id} className={styles.proofCard}>
              <p className={styles.city}>Someone in {item.city}</p>
              <p className={styles.proofText}>&quot;{item.text}&quot;</p>
            </div>
          ))}
        </div>

        <div className={styles.statsSection}>
          <div className={styles.statBadge}>
            <span className={styles.statNumber}>40,000+</span>
            <span className={styles.statLabel}>conversations</span>
          </div>
          <p className={styles.statsText}>
            Each one ending with someone who&apos;s been saved lives and mental health.
          </p>
        </div>
      </div>
    </section>
  );
}

