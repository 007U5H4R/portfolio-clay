import type { EnterpriseCase } from "./schema";

/**
 * `/projects` Enterprise & Client Work — the six grouped case files (TASK-116, Tushar's spec
 * 2026-09-28 §27–§35).
 *
 * Every field traces to one of the two documents Tushar named, recorded per card as the document
 * TITLE and page (never a file path):
 *   - "Project Manager portfolio V2.0" (2 pages) — the per-engagement overviews and contributions,
 *   - "Résumé" (4 pages) — page 3–4 annexure, the grouped project list.
 *
 * Public-safe by construction (spec §35): no budgets or other commercial figures (the schema rejects
 * currency symbols and the word "budget"), no team sizes, no client metrics, no impact claims beyond
 * what the documents state as scope and deliverables. The documents' own spelling slips are not
 * copied ("Indian University Health" is Indiana University Health; the résumé's "Feb 2025 – Jul 2024"
 * for Pear is read from the portfolio's per-program dates instead).
 *
 * Spec tags the documents do not support were dropped (TASK-116 report): "APIs" on LifePoint and
 * "BigQuery" on IU Health.
 */
export const enterpriseCases: EnterpriseCase[] = [
  {
    id: "pear-health-labs",
    client: "Pear Health Labs",
    program: "Cloud & Data Modernization",
    role: "Offshore Project Manager",
    period: { start: "2024-02", end: "2024-07" },
    summary:
      "Three linked programs that moved Pear Health Labs from AWS and Snowflake onto Google Cloud: the platform foundation, the enterprise API and the data warehouse.",
    workstreams: [
      {
        name: "AWS → GCP foundation",
        detail:
          "Organisational structure, naming, access, networking and security requirements, delivered as the GCP foundation setup and technical design documentation.",
      },
      {
        name: "Enterprise API migration",
        detail: "Lift-and-refactor of the enterprise API's code from AWS to GCP, taken to production on GCP.",
      },
      {
        name: "Snowflake → BigQuery",
        detail:
          "DBT logic rewritten for GCP, Airflow DAGs moved to Dagster and custom SQL repointed to BigQuery, with the Looker dashboards updated.",
      },
    ],
    tags: ["Cloud Migration", "GCP", "APIs", "BigQuery", "Data Modernization", "Program Delivery"],
    sources: [
      { document: "Project Manager portfolio V2.0", page: 1 },
      { document: "Résumé", page: 3 },
    ],
  },
  {
    id: "mojix",
    client: "Mojix",
    program: "Inventory & Data Pipeline Modernization",
    role: "Business Analyst",
    period: { start: "2023-11", end: "2024-01" },
    summary:
      "Moved Mojix's Inventory Discrepancy use case from MongoDB to Google Cloud, on a streaming pipeline and a GCP data warehouse that feed downstream dashboards.",
    workstreams: [
      {
        name: "Inventory Discrepancy on GCP",
        detail: "Requirements analysis and the data-flow architecture for moving the use case off MongoDB.",
      },
      {
        name: "Streaming pipeline and warehouse",
        detail: "A streaming pipeline and a GCP-based data warehouse behind the downstream dashboards.",
      },
      {
        name: "Databricks-to-GCP support",
        detail: "Advisory and hands-on support for migrating Databricks jobs to GCP.",
      },
    ],
    tags: ["Data Pipelines", "GCP", "Analytics", "Inventory", "Modernization"],
    sources: [
      { document: "Project Manager portfolio V2.0", page: 1 },
      { document: "Résumé", page: 4 },
    ],
  },
  {
    id: "google-cloud-hmle",
    client: "Google Cloud",
    program: "Healthcare ML Engine Benchmarking",
    role: "Technical Project Manager",
    period: { start: "2023-09", end: "2023-10" },
    summary:
      "Benchmarked Google's Healthcare ML Engine (HMLE) against existing alternatives on how it speeds up the ML journey, model performance and cost.",
    workstreams: [
      {
        name: "Comparative study",
        detail: "The benchmarking methodology and the custom model source code for the study.",
      },
      {
        name: "UXR feedback study",
        detail: "A feedback study run with the Google UXR team alongside the technical benchmarks.",
      },
      {
        name: "Benchmarking report",
        detail: "The report and study source code, presented to stakeholders in a strategic review.",
      },
    ],
    tags: ["ML", "Benchmarking", "Healthcare", "Research", "UXR", "Analytics"],
    sources: [
      { document: "Project Manager portfolio V2.0", page: 1 },
      { document: "Project Manager portfolio V2.0", page: 2 },
    ],
  },
  {
    id: "telus-health-lifeworks",
    client: "Telus Health / LifeWorks",
    program: "Global Partner Reporting Validation",
    role: "Business Analyst",
    period: { start: "2023-05", end: "2023-06" },
    summary:
      "An automated pipeline that checks the standardised spreadsheets 45+ global partners send LifeWorks, flagging and correcting data-entry errors before reports are built.",
    workstreams: [
      {
        name: "Ingestion on GCP",
        detail: "The data ingestion pipeline on GCP for the partners' input spreadsheets.",
      },
      {
        name: "Flag and correct",
        detail: "Scripts that flag and correct data-entry errors against the standardised template.",
      },
      {
        name: "Test plan and UI mockup",
        detail: "The test plan, the technical design document and a Figma mockup of the user interface.",
      },
    ],
    tags: ["Data Validation", "Automation", "GCP", "Reporting", "Figma", "Global Operations"],
    sources: [{ document: "Project Manager portfolio V2.0", page: 2 }],
  },
  {
    id: "lifepoint-health",
    client: "LifePoint Health",
    program: "Healthcare Data & FHIR Modernization",
    role: "Business Analyst, then Project Manager",
    period: { start: "2023-03", end: "2024-05" },
    summary:
      "Centralised EHR data from four inpatient instances through FHIR reconciliation, then moved Verato files into Cloud Storage and ran the Healthcare Data Engine as a managed service.",
    workstreams: [
      {
        name: "FHIR reconciliation & testing",
        detail: "Matching and merging rules for FHIR resources, testing and validating them, and the project governance.",
      },
      {
        name: "Verato SFTP → GCS",
        detail: "A Python batch pipeline on a GCP virtual machine for the Goldenview and Crosswalk CSV files.",
      },
      {
        name: "HDE managed services",
        detail: "Receiving FHIR-converted data, reconciling it in the Healthcare Data Engine and storing it for the in-scope EHRs.",
      },
    ],
    tags: ["FHIR", "Healthcare Data", "GCP", "Data Engineering", "Python", "Governance"],
    sources: [{ document: "Project Manager portfolio V2.0", page: 2 }],
  },
  {
    id: "iu-health",
    client: "Indiana University Health",
    program: "Nurse Workload Demand Forecasting",
    role: "Business Analyst",
    period: { start: "2022-12", end: "2023-03" },
    summary:
      "A Looker dashboard that brings nurse-scheduling data from Kronos, Teletracking, Oracle and Cerner together, so managers can review and approve scheduling changes toward demand-driven scheduling.",
    workstreams: [
      {
        name: "Ingestion and architecture",
        detail: "The data ingestion strategy and the solution architecture across the four scheduling sources.",
      },
      {
        name: "Pipeline and dashboard",
        detail: "The data pipeline and the Looker dashboard, with the solution-architecture documentation.",
      },
    ],
    tags: ["Looker", "Analytics", "Healthcare", "Data Pipelines", "Scheduling", "Forecasting"],
    sources: [
      { document: "Project Manager portfolio V2.0", page: 2 },
      { document: "Résumé", page: 4 },
    ],
  },
];
