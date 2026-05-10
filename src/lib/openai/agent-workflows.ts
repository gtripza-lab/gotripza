import "server-only";

export type AgentWorkflowKey =
  | "seo"
  | "marketing"
  | "travel_research"
  | "support_draft"
  | "analytics_insight";

export type AgentWorkflowDefinition = {
  key: AgentWorkflowKey;
  name: string;
  description: string;
  envVar: string;
};

export const AGENT_WORKFLOWS: AgentWorkflowDefinition[] = [
  {
    key: "seo",
    name: "Gotripza SEO Agent",
    description: "Generates SEO briefs, keyword ideas, and page improvement suggestions.",
    envVar: "OPENAI_WORKFLOW_SEO_AGENT_ID",
  },
  {
    key: "marketing",
    name: "Gotripza Marketing Agent",
    description: "Creates campaign ideas, captions, hooks, and social content plans.",
    envVar: "OPENAI_WORKFLOW_MARKETING_AGENT_ID",
  },
  {
    key: "travel_research",
    name: "Gotripza Travel Research Agent",
    description: "Researches destinations, seasonality, safety, visas, and travel tips.",
    envVar: "OPENAI_WORKFLOW_TRAVEL_RESEARCH_AGENT_ID",
  },
  {
    key: "support_draft",
    name: "Gotripza Support Draft Agent",
    description: "Drafts customer support responses and escalation summaries.",
    envVar: "OPENAI_WORKFLOW_SUPPORT_DRAFT_AGENT_ID",
  },
  {
    key: "analytics_insight",
    name: "Gotripza Analytics Insight Agent",
    description: "Turns analytics and performance notes into operational insights.",
    envVar: "OPENAI_WORKFLOW_ANALYTICS_INSIGHT_AGENT_ID",
  },
];

export function getAgentWorkflow(key: string) {
  return AGENT_WORKFLOWS.find((workflow) => workflow.key === key) ?? null;
}

export function getWorkflowId(key: AgentWorkflowKey) {
  const workflow = getAgentWorkflow(key);
  if (!workflow) return "";
  return process.env[workflow.envVar]?.trim() ?? "";
}

export function getAgentWorkflowStatuses() {
  return AGENT_WORKFLOWS.map((workflow) => ({
    ...workflow,
    configured: Boolean(process.env[workflow.envVar]?.trim()),
  }));
}
