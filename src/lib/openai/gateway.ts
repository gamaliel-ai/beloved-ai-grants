import { createHash, randomUUID } from "node:crypto";

export type CreatedProject = { id: string };
export type CreatedServiceAccount = {
  id: string;
  apiKey: {
    id: string;
    value: string;
    name: string;
  };
};

/** One project-day of usage/cost from the Admin API (or fake). */
export type ProjectUsageBucket = {
  openaiProjectId: string;
  bucketStart: Date;
  bucketEnd: Date;
  costCents: number;
  inputTokens: number;
  outputTokens: number;
  requests: number;
  lastActivityAt: Date | null;
};

export interface OpenAIAdminGateway {
  createProject(name: string): Promise<CreatedProject>;
  createServiceAccount(
    projectId: string,
    name: string,
  ): Promise<CreatedServiceAccount>;
  deleteApiKey(
    projectId: string,
    serviceAccountId: string,
    apiKeyId: string,
  ): Promise<void>;
  archiveProject(projectId: string): Promise<void>;
  listProjectUsage(params: {
    startTime: Date;
    endTime: Date;
  }): Promise<ProjectUsageBucket[]>;
}

export type FakeFailure =
  | "createProject"
  | "createServiceAccount"
  | "deleteApiKey"
  | "archiveProject"
  | "listProjectUsage";

export class FakeOpenAIAdminGateway implements OpenAIAdminGateway {
  projects = new Map<string, { name: string; archived: boolean }>();
  keys = new Map<
    string,
    { projectId: string; serviceAccountId: string; value: string }
  >();
  /** Optional explicit usage overrides for tests (projectId → buckets). */
  seededUsage = new Map<string, ProjectUsageBucket[]>();

  constructor(private readonly failAt?: FakeFailure) {}

  async createProject(name: string) {
    this.maybeFail("createProject");
    const id = `proj_fake_${randomUUID()}`;
    this.projects.set(id, { name, archived: false });
    return { id };
  }

  async createServiceAccount(projectId: string, name: string) {
    this.maybeFail("createServiceAccount");
    const serviceAccountId = `svc_fake_${randomUUID()}`;
    const apiKeyId = `key_fake_${randomUUID()}`;
    const value = `sk-fake-${randomUUID().replaceAll("-", "")}`;
    this.keys.set(apiKeyId, { projectId, serviceAccountId, value });
    return {
      id: serviceAccountId,
      apiKey: { id: apiKeyId, value, name },
    };
  }

  async deleteApiKey(
    projectId: string,
    _serviceAccountId: string,
    apiKeyId: string,
  ) {
    this.maybeFail("deleteApiKey");
    const key = this.keys.get(apiKeyId);
    if (key && key.projectId === projectId) {
      this.keys.delete(apiKeyId);
    }
  }

  async archiveProject(projectId: string) {
    this.maybeFail("archiveProject");
    const project = this.projects.get(projectId);
    if (project) project.archived = true;
  }

  seedUsage(buckets: ProjectUsageBucket[]) {
    for (const bucket of buckets) {
      const existing = this.seededUsage.get(bucket.openaiProjectId) ?? [];
      existing.push(bucket);
      this.seededUsage.set(bucket.openaiProjectId, existing);
    }
  }

  async listProjectUsage(params: {
    startTime: Date;
    endTime: Date;
  }): Promise<ProjectUsageBucket[]> {
    this.maybeFail("listProjectUsage");
    const results: ProjectUsageBucket[] = [];

    for (const buckets of this.seededUsage.values()) {
      for (const bucket of buckets) {
        if (
          bucket.bucketStart >= params.startTime &&
          bucket.bucketStart < params.endTime
        ) {
          results.push(bucket);
        }
      }
    }

    // Deterministic synthetic usage for known projects without seed data.
    for (const [projectId, project] of this.projects) {
      if (project.archived) continue;
      if (this.seededUsage.has(projectId)) continue;
      results.push(
        ...syntheticUsageForProject(projectId, params.startTime, params.endTime),
      );
    }

    return results;
  }

  private maybeFail(operation: FakeFailure) {
    if (this.failAt === operation) {
      throw new Error(`Fake OpenAI failure at ${operation}`);
    }
  }
}

function syntheticUsageForProject(
  projectId: string,
  startTime: Date,
  endTime: Date,
): ProjectUsageBucket[] {
  const hash = createHash("sha256").update(projectId).digest();
  const dailyCostCents = 12 + (hash[0]! % 80);
  const dailyRequests = 5 + (hash[1]! % 40);
  const dailyInput = 2_000 + hash[2]! * 40;
  const dailyOutput = 800 + hash[3]! * 20;
  const buckets: ProjectUsageBucket[] = [];

  for (
    let cursor = startOfUtcDay(startTime);
    cursor < endTime;
    cursor = new Date(cursor.getTime() + 86_400_000)
  ) {
    // Skip ~30% of days for a realistic sparse pattern.
    if ((hash[cursor.getUTCDate() % 16]! + cursor.getUTCDate()) % 3 === 0) {
      continue;
    }
    const bucketEnd = new Date(cursor.getTime() + 86_400_000);
    if (bucketEnd <= startTime) continue;
    buckets.push({
      openaiProjectId: projectId,
      bucketStart: cursor,
      bucketEnd,
      costCents: dailyCostCents,
      inputTokens: dailyInput,
      outputTokens: dailyOutput,
      requests: dailyRequests,
      lastActivityAt: new Date(cursor.getTime() + 12 * 3_600_000),
    });
  }
  return buckets;
}

function startOfUtcDay(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}
