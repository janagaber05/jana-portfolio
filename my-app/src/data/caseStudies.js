import { attachCaseStudyImages } from './caseStudyImages';

function buildCaseStudy(project) {
  return {
    heroImage: '',
    abbreviation: project.title
      .split(' ')
      .map((word) => word[0])
      .join('')
      .slice(0, 3)
      .toUpperCase(),
    facts: {
      role: project.role,
      timeline: `6 weeks · ${project.year}`,
      tools: (project.tools || []).join(', '),
      type: project.tag,
    },
    overview: {
      sectionNumber: '01',
      title: 'The problem and the solution.',
      highlight: 'problem',
      problemLabel: 'The problem',
      problemTitle: 'What was broken',
      problemText: project.challenge,
      solutionLabel: 'The solution',
      solutionTitle: 'What I designed',
      solutionText: project.outcome,
    },
    myRole: {
      sectionNumber: '02',
      title: 'What I specifically did.',
      highlight: 'specifically',
      intro: `I led the end-to-end UX process on ${project.title}, from early research through to final UI and developer handoff.`,
      pills: [
        'User research',
        'Competitive analysis',
        'User personas',
        'Journey mapping',
        'Wireframing',
        'Prototyping',
        'UI Design',
        'Usability testing',
        'Developer handoff',
      ],
    },
    research: {
      sectionNumber: '03',
      title: 'What users actually told me.',
      highlight: 'actually',
      insights: [
        {
          number: '01',
          title: 'Key insight',
          text: 'Users wanted clarity before commitment — they needed to understand value within the first screen, not after several taps.',
        },
        {
          number: '02',
          title: 'Key insight',
          text: 'Drop-off clustered around moments of uncertainty: unclear labels, hidden steps, and feedback that arrived too late.',
        },
        {
          number: '03',
          title: 'Key insight',
          text: 'People trusted the product more when progress felt visible and reversible — small confirmations reduced anxiety.',
        },
      ],
      persona: {
        name: 'Sara M.',
        role: 'Primary user persona',
        goal: 'Complete tasks quickly without second-guessing every step',
        painPoint: 'Confusing flows and inconsistent patterns across screens',
        behaviour: 'Skims first, reads details only when something feels risky',
        quote: '"I just want to know I am doing it right before I commit."',
      },
    },
    quote: {
      text: '"I just want to know I am doing it right before I commit."',
      attribution: 'Sara M. — User interview, March 2025',
    },
    designProcess: {
      sectionNumber: '04',
      title: 'From sketch to final screen.',
      highlight: 'sketch',
      stages: [
        { label: 'Low fidelity wireframe', variant: 'low', imageUrl: '' },
        { label: 'Mid fidelity', variant: 'mid', imageUrl: '' },
        { label: 'High fidelity', variant: 'high', imageUrl: '' },
      ],
    },
    finalDesign: {
      sectionNumber: '05',
      title: 'The final screens.',
      highlight: 'final',
      screens: [
        { label: 'Home screen', variant: 'home', imageUrl: '' },
        { label: 'Detail screen', variant: 'detail', imageUrl: '' },
        { label: 'Checkout screen', variant: 'checkout', imageUrl: '' },
      ],
    },
    outcomes: {
      sectionNumber: '06',
      title: 'The proof it worked.',
      highlight: 'proof',
      metrics: [
        {
          value: '89%',
          label: 'Task completion rate — up from 58% in baseline testing',
        },
        {
          value: '4.7',
          label: 'Average user satisfaction score out of 5',
        },
        {
          value: '-40%',
          label: 'Reduction in time on task across core flows',
        },
      ],
    },
  };
}

export function getCaseStudy(project, caseStudies = {}) {
  if (!project) return null;
  const base = caseStudies[project.slug] || buildCaseStudy(project);
  return attachCaseStudyImages(base, project.slug);
}

export const PROGRESS_SECTIONS = [
  { id: 'section-overview', label: 'Overview' },
  { id: 'section-role', label: 'My role' },
  { id: 'section-research', label: 'Research' },
  { id: 'section-quote', label: 'Quote' },
  { id: 'section-process', label: 'Design process' },
  { id: 'section-final', label: 'Final design' },
  { id: 'section-outcomes', label: 'Outcomes' },
];
