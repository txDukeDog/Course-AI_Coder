## Starting Point

A working MVP of the frontend and backend has been built and is they exist in frontend and backend folders repectfully.

# High level steps for project

Part 1: Explore

Explore the existing code base. Gather a deep understanding before proceeding.

Part 2: Plan

Enrich this document to plan out each of these parts in detail, with substeps listed out as a checklist to be checked off by the agent, and with tests and success critieria for each. refer to AGENTS.md file inside the frontend directory that describes the existing code there. Ensure the user checks and approves the plan.

Part 3: More boards

The current project only allows for one board of cards. The ultimate goal will be to have an unlimited amount of boards, each are locked down to a user's role/organization. Please create additional boards, each with their own set of dummy data that persists to the database.

Part 4: Toggle between boards

The main user and eventually power user will want the ability to toggle between more than one Kanban board.

Part 5: Assign roles to users

There should be an admin role that can see all boards, a management role that can see all boards related to a specific organization, and a user role who can see specific multiple boards or a single board within one organization. Let's have at least 10 different boards. Users to create: 1 admin role, 3 mangement roles who represent 3 separate organizations, and a few users per organization. The admin can view all, managers should only be able to see boards associated with their organization, and users should only be able to see one board.

