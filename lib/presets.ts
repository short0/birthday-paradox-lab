export type RiskLevel = 'low' | 'medium' | 'high'

export interface QuickAction {
  label: string
  description: string
  sampleSize?: number
  spaceSize?: number
}

export interface Preset {
  id: string
  name: string
  icon: string
  tagline: string
  scenario: string
  spaceSize: number
  sampleSize: number
  spaceSizeLabel: string
  sampleSizeLabel: string
  collisionProbability: number
  pairCount: number
  riskLevel: RiskLevel
  simulationOutcome: string
  explanation: string
  whyFasterThanExpected: string
  practicalContext: string
  lesson: string
  quickActions: QuickAction[]
}

export const PRESETS: Preset[] = [
  {
    id: 'birthday-room',
    name: '23 People in a Room',
    icon: '🎂',
    tagline: 'The classic paradox — birthday sharing',
    scenario: 'How likely is it that two people in a room of 23 share a birthday?',
    spaceSize: 365,
    sampleSize: 23,
    spaceSizeLabel: '365 days in a year',
    sampleSizeLabel: '23 people',
    collisionProbability: 50.7,
    pairCount: 253,
    riskLevel: 'high',
    simulationOutcome:
      'In a simulated group of 23 people, persons #7 and #19 share March 14th. Collision found in the first run.',
    explanation:
      'With 23 people, there are 253 unique pairs. Each pair has roughly a 1-in-365 chance of sharing a birthday. The combined probability quickly surpasses 50%.',
    whyFasterThanExpected:
      'Most people guess 183 people are needed for a >50% chance. The key insight: we\'re not asking if anyone shares YOUR birthday — we\'re asking if ANY two people share a birthday with each other.',
    practicalContext:
      'This is the foundational insight behind hash collision attacks, UUID clashes in distributed systems, and why token spaces that seem "huge" fill up faster than engineers expect.',
    lesson:
      'The number of pairs grows as n², not n. This quadratic explosion is what makes the paradox counterintuitive.',
    quickActions: [
      { label: 'Try 30 people', sampleSize: 30, description: '70.6% collision probability' },
      { label: 'Try 50 people', sampleSize: 50, description: '97% collision probability' },
      { label: 'Try 10 people', sampleSize: 10, description: '11.7% collision probability' },
      { label: 'Leap year (366 days)', spaceSize: 366, description: 'Tiny change to the space' },
      { label: 'Try 70 people', sampleSize: 70, description: '99.9% collision probability' },
    ],
  },
  {
    id: 'hash-collision',
    name: 'Small Hash Demo',
    icon: '#',
    tagline: 'Hash collisions appear shockingly fast',
    scenario: 'How quickly do collisions appear in a 16-bit hash function?',
    spaceSize: 65536,
    sampleSize: 302,
    spaceSizeLabel: '65,536 possible hash values (16-bit)',
    sampleSizeLabel: '302 hashed items',
    collisionProbability: 50.0,
    pairCount: 45451,
    riskLevel: 'high',
    simulationOutcome:
      'Hashing 302 random strings: collision detected between items #47 ("session_abc") and #211 ("token_xyz") — both hash to 0xA3F2.',
    explanation:
      'A 16-bit hash has 65,536 possible values. The "birthday bound" — where collision probability hits 50% — is approximately √(2 × 65,536 × ln 2) ≈ 302 items.',
    whyFasterThanExpected:
      'Engineers often assume 65,536 items can be stored safely. The collision risk reaches 50% at only 302 items — less than 0.5% of capacity.',
    practicalContext:
      'MD5, SHA-1, and weaker hash functions used for deduplication or checksums face this exact problem at scale. Even "strong" hashes collide at √N — about 2 billion for SHA-256.',
    lesson:
      'The birthday bound is always approximately √(space size). A hash with N possible values collides at ~√N items, not N items.',
    quickActions: [
      { label: '8-bit hash (256)', spaceSize: 256, sampleSize: 19, description: '50% at just 19 items' },
      { label: '24-bit hash (16M)', spaceSize: 16777216, sampleSize: 4820, description: '50% at ~4,820 items' },
      { label: '32-bit hash (4B)', spaceSize: 4294967296, sampleSize: 77163, description: '50% at ~77K items' },
      { label: 'Try 100 items', sampleSize: 100, description: '~10.7% collision risk' },
      { label: 'Try 500 items', sampleSize: 500, description: '~85.9% collision risk' },
    ],
  },
  {
    id: 'invite-codes',
    name: 'Random Invite Codes',
    icon: '🔑',
    tagline: 'When short codes start clashing',
    scenario: 'How many 6-character alphanumeric invite codes can you generate before a collision?',
    spaceSize: 56800235584,
    sampleSize: 280000,
    spaceSizeLabel: '~56.8 billion codes (36^6)',
    sampleSizeLabel: '280,000 issued codes',
    collisionProbability: 0.35,
    pairCount: 39199860000,
    riskLevel: 'low',
    simulationOutcome:
      'After simulating 280,000 invite codes, no collision was detected. Expected first collision around ~8.9 million codes.',
    explanation:
      '6-character alphanumeric codes (a–z, 0–9) have 36^6 ≈ 56.8 billion possibilities. The birthday bound is √(2 × 56.8B × ln 2) ≈ 8.9 million codes.',
    whyFasterThanExpected:
      '56 billion sounds enormous, but once a SaaS app reaches millions of users, even "low" risk becomes operationally real. At 8.9M codes issued, expect a 50% chance of at least one collision.',
    practicalContext:
      'Invite code systems, referral links, and coupon codes face this directly. Moving to 8-character codes raises the birthday bound to ~1.6 trillion — a much safer margin.',
    lesson:
      'Short codes feel safe at small scale, but birthday bound math reveals the true safe operating limit. Always design for your ceiling, not your floor.',
    quickActions: [
      { label: '4-char codes (1.7M)', spaceSize: 1679616, sampleSize: 1000, description: '0.06% risk at 1K codes' },
      { label: '8-char codes (2.8T)', spaceSize: 2821109907456, sampleSize: 280000, description: 'Extremely low risk' },
      { label: '5-char codes (60M)', spaceSize: 60466176, sampleSize: 280000, description: '~88% risk — too short!' },
      { label: '1 million issued', sampleSize: 1000000, description: '~0.88% risk at 1M' },
      { label: '9 million issued', sampleSize: 9000000, description: '~57% — collision likely!' },
    ],
  },
  {
    id: 'url-shortener',
    name: 'URL Shortener Risk',
    icon: '🔗',
    tagline: 'Short slugs fill up faster than you think',
    scenario: 'A URL shortener uses 7-character base-62 slugs. How many links before collision risk grows?',
    spaceSize: 3521614606208,
    sampleSize: 1000000,
    spaceSizeLabel: '~3.5 trillion slugs (62^7)',
    sampleSizeLabel: '1 million shortened URLs',
    collisionProbability: 0.014,
    pairCount: 499999500000,
    riskLevel: 'low',
    simulationOutcome:
      'After simulating 1 million URL slugs, no collision found. Birthday bound (~2.2 billion) is safely far away at current scale.',
    explanation:
      'With 62^7 ≈ 3.5 trillion possible slugs and 1 million URLs stored, the collision probability is about 0.014%. The birthday bound sits at ~2.2 billion slugs.',
    whyFasterThanExpected:
      'bit.ly and similar services serve billions of links. At 2.2 billion shortened URLs (the birthday bound), the collision risk hits 50%. A seemingly large space has a real ceiling.',
    practicalContext:
      'Major URL shorteners handle billions of links. They avoid this by storing generated slugs in a database and checking for conflicts, but the lookup cost grows with scale.',
    lesson:
      'The right architecture anticipates the birthday bound. At 62^8 slugs (~217 trillion), the birthday bound jumps to ~138 billion — scaling the slug by 1 char buys enormous headroom.',
    quickActions: [
      { label: '6-char slugs (57B)', spaceSize: 56800235584, sampleSize: 1000000, description: '0.88% at 1M links' },
      { label: '8-char slugs (218T)', spaceSize: 218340105584896, sampleSize: 1000000, description: 'Basically zero risk' },
      { label: '100 million links', sampleSize: 100000000, description: '~0.14% risk at 100M' },
      { label: '1 billion links', sampleSize: 1000000000, description: '~13% — getting serious' },
      { label: '2 billion links', sampleSize: 2000000000, description: '~43% — near birthday bound' },
    ],
  },
  {
    id: 'uuid-risk',
    name: 'UUID-style ID Risk',
    icon: '🆔',
    tagline: 'Even 128-bit IDs have a birthday bound',
    scenario: 'UUIDs (version 4) use 122 random bits. At what scale does collision risk appear?',
    spaceSize: 5316911983139663491615228241121378304,
    sampleSize: 1000000000,
    spaceSizeLabel: '~5.3 × 10³⁶ (122 random bits)',
    sampleSizeLabel: '1 billion UUIDs generated',
    collisionProbability: 0.0,
    pairCount: 500000000000000000,
    riskLevel: 'low',
    simulationOutcome:
      'Simulating 1 billion UUIDs: no collision found or expected. The birthday bound for UUID v4 is approximately 2.7 × 10¹⁸ — many orders of magnitude away.',
    explanation:
      'UUID v4 uses 122 random bits, giving ~5.3 × 10³⁶ possible values. The birthday bound is approximately √(2 × 5.3×10³⁶ × ln 2) ≈ 2.7 × 10¹⁸ UUIDs.',
    whyFasterThanExpected:
      'Even 1 billion UUIDs per second for 100 years only produces ~3.15 × 10¹⁸ UUIDs — right at the birthday bound. So at extreme hyperscale, collision risk becomes real even for UUIDs.',
    practicalContext:
      'For most systems, UUID v4 is safe essentially forever. But cryptographic nonces, session tokens, and security-critical IDs need even longer spaces — or deterministic uniqueness guarantees.',
    lesson:
      'No random ID is collision-proof at infinite scale. The question is always: where is the birthday bound relative to your real-world generation rate?',
    quickActions: [
      { label: 'Reduce to 64 bits', spaceSize: 18446744073709551616, sampleSize: 1000000000, description: 'Birthday bound ~4.3B — much riskier' },
      { label: 'Reduce to 32 bits', spaceSize: 4294967296, sampleSize: 100000, description: '~0.11% at 100K — very risky' },
      { label: 'Reduce to 48 bits', spaceSize: 281474976710656, sampleSize: 1000000000, description: '~1.7% at 1 billion' },
      { label: '10 billion generated', sampleSize: 10000000000, description: 'Still virtually zero risk' },
      { label: 'Reduce to 16 bits', spaceSize: 65536, sampleSize: 302, description: 'Already at 50% at 302 items!' },
    ],
  },
]

export function computeCollisionProbability(n: number, d: number): number {
  if (n <= 1 || d <= 0) return 0
  if (n > d) return 100

  // Use log computation to avoid overflow
  let logProb = 0
  const maxN = Math.min(n, 1000)
  for (let k = 1; k < maxN; k++) {
    logProb += Math.log(1 - k / d)
  }
  // For large n, use approximation: 1 - e^(-n*(n-1)/(2*d))
  if (n > 1000) {
    const approxExp = -(n * (n - 1)) / (2 * d)
    return Math.min(100, (1 - Math.exp(approxExp)) * 100)
  }
  return Math.min(100, (1 - Math.exp(logProb)) * 100)
}

export function computeBirthdayBound(d: number, targetProb = 0.5): number {
  // Approximate: n ≈ sqrt(2 * d * ln(1/(1-p)))
  return Math.sqrt(2 * d * Math.log(1 / (1 - targetProb)))
}

export function computePairCount(n: number): number {
  return (n * (n - 1)) / 2
}

export function getRiskLevel(probability: number): RiskLevel {
  if (probability < 5) return 'low'
  if (probability < 30) return 'medium'
  return 'high'
}

export function formatLargeNumber(n: number): string {
  if (n >= 1e12) return `${(n / 1e12).toFixed(1)}T`
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`
  return n.toLocaleString()
}

export function formatProbability(p: number): string {
  if (p < 0.001) return '< 0.001%'
  if (p < 0.01) return `${p.toFixed(4)}%`
  if (p < 0.1) return `${p.toFixed(3)}%`
  if (p < 1) return `${p.toFixed(2)}%`
  if (p < 10) return `${p.toFixed(1)}%`
  return `${p.toFixed(0)}%`
}

// Generate probability curve data points (n from 1 to max_n)
export function generateCurveData(
  spaceSize: number,
  maxSamples: number
): Array<{ n: number; probability: number }> {
  const points: Array<{ n: number; probability: number }> = []
  const bound50 = computeBirthdayBound(spaceSize)
  const maxN = Math.min(maxSamples * 2, bound50 * 3, 1e9)
  const steps = 60

  for (let i = 0; i <= steps; i++) {
    const n = Math.round((i / steps) * maxN)
    if (n === 0) { points.push({ n: 0, probability: 0 }); continue }
    const p = computeCollisionProbability(n, spaceSize)
    points.push({ n, probability: parseFloat(p.toFixed(3)) })
    if (p >= 99.9) break
  }
  return points
}
