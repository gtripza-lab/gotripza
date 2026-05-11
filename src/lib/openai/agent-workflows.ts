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
    name: "وكيل SEO",
    description: "يقترح كلمات مفتاحية، عناوين، وتحسينات صفحات الظهور في البحث.",
    envVar: "OPENAI_WORKFLOW_SEO_AGENT_ID",
  },
  {
    key: "marketing",
    name: "وكيل التسويق",
    description: "ينشئ أفكار حملات، عناوين إعلانية، وخطط محتوى للشبكات الاجتماعية.",
    envVar: "OPENAI_WORKFLOW_MARKETING_AGENT_ID",
  },
  {
    key: "travel_research",
    name: "وكيل أبحاث السفر",
    description: "يبحث في الوجهات، المواسم، الأمان، التأشيرات، ونصائح السفر.",
    envVar: "OPENAI_WORKFLOW_TRAVEL_RESEARCH_AGENT_ID",
  },
  {
    key: "support_draft",
    name: "وكيل مسودات الدعم",
    description: "يقترح ردود دعم العملاء وملخصات التصعيد لفريق الإدارة.",
    envVar: "OPENAI_WORKFLOW_SUPPORT_DRAFT_AGENT_ID",
  },
  {
    key: "analytics_insight",
    name: "وكيل تحليلات الأداء",
    description: "يحوّل مؤشرات الأداء والتحليلات إلى ملاحظات تشغيلية قابلة للتنفيذ.",
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
