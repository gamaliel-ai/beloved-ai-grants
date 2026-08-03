import { randomUUID } from "node:crypto";

export type CreatedProject = { id: string };
export type CreatedServiceAccount = {
  id: string;
  apiKey: {
    id: string;
    value: string;
    name: string;
  };
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
}

export type FakeFailure =
  | "createProject"
  | "createServiceAccount"
  | "deleteApiKey"
  | "archiveProject";

export class FakeOpenAIAdminGateway implements OpenAIAdminGateway {
  projects = new Map<string, { name: string; archived: boolean }>();
  keys = new Map<
    string,
    { projectId: string; serviceAccountId: string; value: string }
  >();
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

  private maybeFail(operation: FakeFailure) {
    if (this.failAt === operation) {
      throw new Error(`Fake OpenAI failure at ${operation}`);
    }
  }
}
