import type { Column } from './types';

export const initialColumns: Column[] = [
  {
    id: 1, name: 'Backlog', position: 0,
    cards: [
      { id: 1, title: 'Set up CI/CD pipeline', details: 'Configure GitHub Actions for automated builds and deployments.', position: 0 },
      { id: 2, title: 'Write API documentation', details: 'Document all endpoints using OpenAPI specification.', position: 1 },
    ],
  },
  {
    id: 2, name: 'Todo', position: 1,
    cards: [
      { id: 3, title: 'Implement user authentication', details: 'Add JWT-based login and session management.', position: 0 },
      { id: 4, title: 'Design database schema', details: 'Define tables for users, boards, columns, and cards.', position: 1 },
    ],
  },
  {
    id: 3, name: 'In Progress', position: 2,
    cards: [
      { id: 5, title: 'Build Kanban board UI', details: 'Implement drag-and-drop interface with column management.', position: 0 },
      { id: 6, title: 'Integrate REST API', details: 'Connect frontend state to backend endpoints.', position: 1 },
    ],
  },
  {
    id: 4, name: 'Review', position: 3,
    cards: [
      { id: 7, title: 'Code review: drag-and-drop', details: 'Review implementation of dnd-kit integration.', position: 0 },
      { id: 8, title: 'Test login flow', details: 'Verify authentication works end-to-end in staging.', position: 1 },
    ],
  },
  {
    id: 5, name: 'Done', position: 4,
    cards: [
      { id: 9, title: 'Initial project setup', details: 'Created repository, base configuration, and README.', position: 0 },
      { id: 10, title: 'Docker configuration', details: 'Multi-stage Dockerfile and docker-compose.yml complete.', position: 1 },
    ],
  },
];
