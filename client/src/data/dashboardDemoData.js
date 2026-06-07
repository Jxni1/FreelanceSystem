export const DEMO_NAV_BADGES = {
  clientJobPosts: 3,
  freelancerProposals: 4,
  adminModeration: 12,
  adminDisputes: 3,
};

export const DEMO_CLIENT = {
  stats: {
    jobPosts: { value: 6, delta: '2 new this week', deltaDir: 'up' },
    proposals: { value: 34, delta: '11 today', deltaDir: 'up' },
    escrow: { value: '$28.4k', delta: 'across 4 milestones', deltaDir: 'neutral' },
    hires: { value: 9, delta: '1 ending soon', deltaDir: 'warn' },
  },
  jobPosts: [
    {
      id: 'demo-jp-1',
      title: 'Senior Brand & Identity Designer',
      status: 'Receiving',
      budget: '$6–9k',
      proposals: 18,
      tags: ['Branding', 'Figma', 'Remote'],
    },
    {
      id: 'demo-jp-2',
      title: 'Webflow Developer — Marketing Site',
      status: 'Receiving',
      budget: '$45/hr',
      proposals: 9,
      tags: ['Webflow', 'CMS'],
    },
    {
      id: 'demo-jp-3',
      title: 'Motion Designer for Launch Video',
      status: 'Shortlisting',
      budget: '$3.5k',
      proposals: 24,
      tags: ['After Effects', '3D'],
    },
    {
      id: 'demo-jp-4',
      title: 'Technical Copywriter (Fintech)',
      status: 'Interviewing',
      budget: '$70/hr',
      proposals: 6,
      tags: ['Copy', 'SaaS'],
    },
  ],
  talent: [
    { id: 'demo-t-1', name: 'Devin Park', role: 'Product Designer', rate: '$85/hr', rating: 4.9, verified: true },
    { id: 'demo-t-2', name: 'Lena Voss', role: 'Brand Designer', rate: '$78/hr', rating: 5, verified: false },
    { id: 'demo-t-3', name: 'Arman Reyes', role: 'Webflow Developer', rate: '$60/hr', rating: 4.8, verified: false },
  ],
  escrow: {
    amountLabel: '$28,400',
    milestones: 4,
    text: 'held safely across 4 milestones. Funds release only when you approve the work.',
  },
};

export const DEMO_FREELANCER = {
  stats: {
    earnings: { value: '$12.4k', delta: '18%', deltaDir: 'up' },
    activeContracts: { value: 3, delta: null, deltaDir: 'neutral' },
    proposalsOut: { value: 7, delta: '2 viewed', deltaDir: 'up' },
    profileViews: { value: 248, delta: '31%', deltaDir: 'up' },
    jobSuccess: { value: '98%', delta: null, deltaDir: 'neutral' },
  },
  matches: [
    {
      id: 'demo-m-1',
      title: 'Design System Lead — B2B SaaS',
      company: 'Northwind Cloud',
      match: 96,
      rate: '$90/hr',
      rating: 5,
      tags: ['Figma', 'Design systems', 'React'],
    },
    {
      id: 'demo-m-2',
      title: 'Mobile App Redesign (iOS)',
      company: 'Tidepool Health',
      match: 91,
      rate: '$8k fixed',
      rating: 5,
      tags: ['iOS', 'Prototyping'],
    },
    {
      id: 'demo-m-3',
      title: 'Marketing Site — Webflow Build',
      company: 'Cobalt Labs',
      match: 88,
      rate: '$55/hr',
      rating: 5,
      tags: ['Webflow', 'UX'],
    },
  ],
  activeContract: {
    title: 'Brand refresh — NorthLoop',
    milestoneCurrent: 2,
    milestoneTotal: 4,
    due: 'Jun 12',
    earned: 5500,
    total: 10000,
  },
  profileStrength: {
    percent: 85,
    checklist: [
      { label: 'Portfolio added', done: true },
      { label: 'Add 2 more skills', done: false, hint: '+10%' },
    ],
  },
};

export const DEMO_ADMIN = {
  stats: {
    grossVolume: { value: '$4.82M', delta: '9.1%', deltaDir: 'up' },
    activeUsers: { value: '38,210', delta: '4.3%', deltaDir: 'up' },
    openDisputes: { value: 17, delta: '3 escalated', deltaDir: 'warn' },
    jobsPosted: { value: '2,940', delta: '6.8%', deltaDir: 'up' },
  },
  moderation: [
    { id: 'demo-mq-1', type: 'Job post', item: '"Earn $$$ fast from home — no skills"', subject: 'NovaGigs', reason: 'Spam / scam' },
    { id: 'demo-mq-2', type: 'Freelancer', item: 'Profile uses stock portfolio images', subject: 'K. Mbeki', reason: 'Plagiarism' },
    { id: 'demo-mq-3', type: 'Dispute', item: 'Milestone not released — $2,400', subject: 'Cobalt Labs', reason: 'Payment' },
    { id: 'demo-mq-4', type: 'Client', item: 'Off-platform payment request', subject: 'Vela Studio', reason: 'Policy' },
    { id: 'demo-mq-5', type: 'Review', item: 'Suspected fake 5★ cluster', subject: '—', reason: 'Integrity' },
  ],
  health: [
    { label: 'Escrow on-time release', value: '98.6%', percent: 98.6, tone: 'emerald' },
    { label: 'Dispute rate', value: '0.7%', percent: 7, tone: 'emerald' },
    { label: 'Avg. hire time', value: '2.4 days', percent: 62, tone: 'brand' },
    { label: 'Repeat-client rate', value: '71%', percent: 71, tone: 'brand' },
  ],
  escalated: {
    count: 3,
    text: 'Pending T&S decision over 48h. SLA breach risk.',
  },
};
