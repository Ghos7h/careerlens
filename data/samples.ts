export interface SampleResume {
  id: string;
  label: string;
  text: string;
}

export const SAMPLES: SampleResume[] = [
  {
    id: "frontend",
    label: "Frontend engineer",
    text: `Priya Raman
Senior Frontend Engineer | Bengaluru, India

SUMMARY
Frontend engineer with 8 years of experience building fast, accessible web applications for fintech and e-commerce. Strong in React, TypeScript and Next.js, with a focus on design systems and performance.

EXPERIENCE
Senior Frontend Engineer, PayLoop (2021 - present)
- Led migration of a 200-page dashboard from Create React App to Next.js, cutting load time by 45%.
- Built a component library in TypeScript and Storybook used by 6 product teams.
- Introduced Jest, React Testing Library and Playwright; raised coverage from 30% to 85%.
- Consumed GraphQL APIs with Apollo Client; mentored 3 junior engineers.

Frontend Engineer, ShopKart (2017 - 2021)
- Built checkout flows in React and Redux serving 2M monthly users.
- Drove WCAG 2.1 AA accessibility fixes across the storefront.
- Worked with Node.js and Express for BFF endpoints.

SKILLS
React, TypeScript, JavaScript, Next.js, GraphQL, Tailwind CSS, Jest, Playwright, Accessibility, Storybook, Node.js

EDUCATION
B.E. Computer Science, VTU`,
  },
  {
    id: "data",
    label: "Data scientist",
    text: `Marcus Webb
Data Scientist | Manchester, UK

SUMMARY
Data scientist with 6 years of experience building forecasting and recommendation models for retail and transport companies. Comfortable from raw SQL through to production ML services.

EXPERIENCE
Senior Data Scientist, RailSense (2022 - present)
- Built gradient boosting and PyTorch models to predict train delays; improved accuracy by 18%.
- Own the feature pipeline in Airflow and Python; deploy models with Docker and MLflow.
- Run A/B tests and communicate results to operations leadership.

Data Scientist, BrightCart (2019 - 2022)
- Built a product recommendation engine using scikit-learn and implicit feedback.
- Wrote complex SQL on BigQuery; created Tableau dashboards for category managers.
- Applied statistics and causal inference to measure promotion uplift.

SKILLS
Python, PyTorch, scikit-learn, SQL, Airflow, MLOps, MLflow, Docker, Tableau, Statistics, dbt

EDUCATION
MSc Statistics, University of Leeds`,
  },
  {
    id: "designer",
    label: "Product designer",
    text: `Elena Rossi
Product Designer | Milan, Italy

SUMMARY
Product designer with 7 years of experience designing B2B SaaS tools. I love untangling complicated workflows, running research with real users and building design systems teams enjoy using.

EXPERIENCE
Lead Product Designer, FleetOS (2020 - present)
- Redesigned the dispatch console after 30 interviews with dispatchers; task time dropped 35%.
- Built and maintain a Figma design system with 120 components and accessibility guidelines.
- Prototype in Figma and run moderated usability tests; partner with PMs on discovery.

Product Designer, Studio Nove (2017 - 2020)
- Designed web and mobile apps for logistics, healthcare and energy clients.
- Facilitated workshops, journey mapping and service blueprints.

SKILLS
Figma, Design Systems, User Research, Prototyping, Accessibility, Workshop facilitation, Journey mapping

EDUCATION
BA Industrial Design, Politecnico di Milano`,
  },
];
