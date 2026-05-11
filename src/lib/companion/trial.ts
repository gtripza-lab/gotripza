export const RYA_TRIAL_COOKIE = "ria_companion_trial_start";
export const RYA_TRIAL_DAYS = Number(process.env.RYA_COMPANION_TRIAL_DAYS ?? "14");

export type RyaTrialState = {
  active: boolean;
  startedAt: string | null;
  endsAt: string | null;
  daysRemaining: number;
};

export function getTrialState(startedAt: string | null | undefined): RyaTrialState {
  if (!startedAt) {
    return { active: false, startedAt: null, endsAt: null, daysRemaining: 0 };
  }
  const startMs = Date.parse(startedAt);
  if (!Number.isFinite(startMs)) {
    return { active: false, startedAt: null, endsAt: null, daysRemaining: 0 };
  }
  const endMs = startMs + RYA_TRIAL_DAYS * 86_400_000;
  const remainingMs = endMs - Date.now();
  const daysRemaining = Math.max(0, Math.ceil(remainingMs / 86_400_000));
  return {
    active: remainingMs > 0,
    startedAt: new Date(startMs).toISOString(),
    endsAt: new Date(endMs).toISOString(),
    daysRemaining,
  };
}
