import type { Column } from './types';

export const initialColumns: Column[] = [
  {
    id: 'backlog',
    name: 'Backlog',
    cards: [
      { id: 'card-1', title: 'Set up CI/CD pipeline', details: 'Configure GitHub Actions for automated builds and deployments.' },
      { id: 'card-2', title: 'Write API documentation', details: 'Document all endpoints using OpenAPI specification.' },
    ],
  },
  {
    id: 'todo',
    name: 'Todo',
    cards: [
      { id: 'card-3', title: 'Implement user authentication', details: 'Add JWT-based login and session management.' },
      { id: 'card-4', title: 'Design database schema', details: 'Define tables for users, boards, columns, and cards.' },
    ],
  },
  {
    id: 'in-progress',
    name: 'In Progress',
    cards: [
      { id: 'card-5', title: 'Build Kanban board UI', details: 'Implement drag-and-drop interface with column management.' },
      { id: 'card-6', title: 'Integrate REST API', details: 'Connect frontend state to backend endpoints.' },
    ],
  },
  {
    id: 'review',
    name: 'Review',
    cards: [
      { id: 'card-7', title: 'Code review: drag-and-drop', details: 'Review implementation of dnd-kit integration.' },
      { id: 'card-8', title: 'Test login flow', details: 'Verify authentication works end-to-end in staging.' },
    ],
  },
  {
    id: 'done',
    name: 'Done',
    cards: [
      { id: 'card-9', title: 'Initial project setup', details: 'Created repository, base configuration, and README.' },
      { id: 'card-10', title: 'Docker configuration', details: 'Multi-stage Dockerfile and docker-compose.yml complete.' },
    ],
  },
];
