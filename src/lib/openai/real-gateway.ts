import OpenAI from "openai";
import type {
  CreatedServiceAccount,
  OpenAIAdminGateway,
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
}

function isNotFound(error: unknown) {
  return (
    error instanceof OpenAI.APIError
      ? error.status
      : (error as { status?: number } | null)?.status
  ) === 404;
}
