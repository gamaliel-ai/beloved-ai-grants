import OpenAI from "openai";
import type {
  CreatedServiceAccount,
  OpenAIAdminGateway,
  ProjectUsageBucket,
} from "./gateway";

export class RealOpenAIAdminGateway implements OpenAIAdminGateway {
  private readonly client: OpenAI;

  constructor(adminAPIKey: string) {
    this.client = new OpenAI({ adminAPIKey });
  }

  async createProject(name: string) {
    const project = await this.client.admin.organization.projects.create({
      name,
    });
    return { id: project.id };
  }

  async createServiceAccount(
    projectId: string,
    name: string,
  ): Promise<CreatedServiceAccount> {
    const serviceAccount =
      await this.client.admin.organization.projects.serviceAccounts.create(
        projectId,
        { name },
      );
    const apiKey =
      serviceAccount.api_key ??
      (await this.client.admin.organization.projects.serviceAccounts.apiKeys.create(
        serviceAccount.id,
        { project_id: projectId, name },
      ));

    return {
      id: serviceAccount.id,
      apiKey: {
        id: apiKey.id,
        value: apiKey.value,
        name: apiKey.name,
      },
    };
  }

  async deleteApiKey(
    projectId: string,
    serviceAccountId: string,
  ) {
    try {
      // Project API-key deletion rejects service-account-owned keys. Deleting
      // the service account is the supported revoke boundary for these keys.
      await this.client.admin.organization.projects.serviceAccounts.delete(
        serviceAccountId,
        { project_id: projectId },
      );
    } catch (error) {
      if (!isNotFound(error)) throw error;
    }
  }

  async archiveProject(projectId: string) {
    try {
      await this.client.admin.organization.projects.archive(projectId);
    } catch (error) {
      if (!isNotFound(error)) throw error;
    }
  }

  async listProjectUsage(params: {
    startTime: Date;
    endTime: Date;
  }): Promise<ProjectUsageBucket[]> {
    const byKey = new Map<string, ProjectUsageBucket>();

    await this.paginateCosts(params, byKey);
    await this.paginateCompletions(params, byKey);

    return [...byKey.values()];
  }

  private async paginateCosts(
    params: { startTime: Date; endTime: Date },
    byKey: Map<string, ProjectUsageBucket>,
  ) {
    let page: string | undefined;
    do {
      const response = await this.client.admin.organization.usage.costs({
        start_time: Math.floor(params.startTime.getTime() / 1000),
        end_time: Math.floor(params.endTime.getTime() / 1000),
        bucket_width: "1d",
        group_by: ["project_id"],
        limit: 31,
        page,
      });

      for (const bucket of response.data) {
        const bucketStart = new Date(bucket.start_time * 1000);
        const bucketEnd = new Date(bucket.end_time * 1000);
        for (const result of bucket.results) {
          if (result.object !== "organization.costs.result") continue;
          const projectId = result.project_id;
          if (!projectId) continue;
          const key = `${projectId}:${bucket.start_time}`;
          const existing = byKey.get(key) ?? emptyBucket(
            projectId,
            bucketStart,
            bucketEnd,
          );
          const usd = result.amount?.value ?? 0;
          existing.costCents += Math.round(usd * 100);
          byKey.set(key, existing);
        }
      }

      page = response.next_page ?? undefined;
    } while (page);
  }

  private async paginateCompletions(
    params: { startTime: Date; endTime: Date },
    byKey: Map<string, ProjectUsageBucket>,
  ) {
    let page: string | undefined;
    do {
      const response = await this.client.admin.organization.usage.completions({
        start_time: Math.floor(params.startTime.getTime() / 1000),
        end_time: Math.floor(params.endTime.getTime() / 1000),
        bucket_width: "1d",
        group_by: ["project_id"],
        limit: 31,
        page,
      });

      for (const bucket of response.data) {
        const bucketStart = new Date(bucket.start_time * 1000);
        const bucketEnd = new Date(bucket.end_time * 1000);
        for (const result of bucket.results) {
          if (result.object !== "organization.usage.completions.result") {
            continue;
          }
          const projectId = result.project_id;
          if (!projectId) continue;
          const key = `${projectId}:${bucket.start_time}`;
          const existing = byKey.get(key) ?? emptyBucket(
            projectId,
            bucketStart,
            bucketEnd,
          );
          existing.inputTokens += result.input_tokens;
          existing.outputTokens += result.output_tokens;
          existing.requests += result.num_model_requests;
          existing.lastActivityAt = bucketEnd;
          byKey.set(key, existing);
        }
      }

      page = response.next_page ?? undefined;
    } while (page);
  }
}

function emptyBucket(
  openaiProjectId: string,
  bucketStart: Date,
  bucketEnd: Date,
): ProjectUsageBucket {
  return {
    openaiProjectId,
    bucketStart,
    bucketEnd,
    costCents: 0,
    inputTokens: 0,
    outputTokens: 0,
    requests: 0,
    lastActivityAt: null,
  };
}

function isNotFound(error: unknown) {
  return (
    error instanceof OpenAI.APIError
      ? error.status
      : (error as { status?: number } | null)?.status
  ) === 404;
}
