import {
  CustomCommandDefinition,
  CustomQueryDefinition,
  Entity,
  EntityClient,
  EntityDefinition,
  GeneralCustomCommandRequestData,
  GeneralCustomCommandResponseData,
  GeneralCustomQueryRequestData,
  GeneralCustomQueryResponseData,
  GeneralEntityRequestData,
  GeneralEntityResponseData,
  GeneralRequestData,
  GeneralResponseData,
  GeneralUserEntityRequestData,
  GeneralUserEntityResponseData,
  HandlerResult,
  LoginCommand,
  LoginResponseData,
  LogoutCommand,
  LogoutResponseData,
  Nullable,
  Session,
  SessionClient,
  UserDefinition
} from "@phenyl/interfaces";

import { createServerError } from "@phenyl/utils";

export class EntityDefinitionExecutor implements DefinitionExecutor {
  definition: EntityDefinition;
  client: EntityClient;

  constructor(definition: EntityDefinition, client: EntityClient) {
    this.definition = definition;
    this.client = client;

    if (this.definition.authorize == null) {
      this.authorize = () => Promise.resolve(true);
    }
    if (this.definition.normalize == null) {
      this.normalize = val => Promise.resolve(val);
    }
    if (this.definition.validate == null) {
      this.validate = () => Promise.resolve();
    }
    if (this.definition.wrapExecution == null) {
      this.execute = executeEntityRequestData.bind(this, this.client);
    }
  }

  async authorize(
    reqData: GeneralEntityRequestData,
    session?: Nullable<Session>
  ): Promise<boolean> {
    return this.definition.authorize!(reqData, session);
  }

  async validate(
    reqData: GeneralEntityRequestData,
    session?: Nullable<Session>
  ): Promise<void> {
    return this.definition.validate!(reqData, session);
  }

  async normalize(
    reqData: GeneralEntityRequestData,
    session?: Nullable<Session>
  ): Promise<GeneralEntityRequestData> {
    return this.definition.normalize!(reqData, session);
  }

  async execute(
    reqData: GeneralEntityRequestData,
    session?: Nullable<Session>
  ): HandlerResult<GeneralEntityResponseData> {
    return this.definition.wrapExecution!(
      reqData,
      session,
      executeEntityRequestData.bind(this, this.client)
    );
  }
}

async function executeEntityRequestData(
  client: EntityClient,
  reqData: GeneralEntityRequestData,
  session?: Nullable<Session>
): Promise<GeneralEntityResponseData> {
  switch (reqData.method) {
    case "find":
      return {
        type: "find",
        payload: await client.find(reqData.payload)
      };
    case "findOne":
      return {
        type: "findOne",
        payload: await client.findOne(reqData.payload)
      };
    case "get":
      return {
        type: "get",
        payload: await client.get(reqData.payload)
      };
    case "getByIds":
      return {
        type: "getByIds",
        payload: await client.getByIds(reqData.payload)
      };
    case "pull":
      return {
        type: "pull",
        payload: await client.pull(reqData.payload)
      };
    case "insertOne":
      return {
        type: "insertOne",
        payload: await client.insertOne(reqData.payload)
      };
    case "insertMulti":
      return {
        type: "insertMulti",
        payload: await client.insertMulti(reqData.payload)
      };
    case "insertAndGet":
      return {
        type: "insertAndGet",
        payload: await client.insertAndGet(reqData.payload)
      };
    case "insertAndGetMulti":
      return {
        type: "insertAndGetMulti",
        payload: await client.insertAndGetMulti(reqData.payload)
      };
    case "updateById":
      return {
        type: "updateById",
        payload: await client.updateById(reqData.payload)
      };
    case "updateMulti":
      return {
        type: "updateMulti",
        payload: await client.updateMulti(reqData.payload)
      };
    case "updateAndGet":
      return {
        type: "updateAndGet",
        payload: await client.updateAndGet(reqData.payload)
      };
    case "updateAndFetch":
      return {
        type: "updateAndFetch",
        payload: await client.updateAndFetch(reqData.payload)
      };
    case "push":
      return {
        type: "push",
        payload: await client.push(reqData.payload)
      };
    case "delete":
      return {
        type: "delete",
        payload: await client.delete(reqData.payload)
      };
    default:
      return {
        type: "error",
        payload: createServerError(
          // @ts-ignore reqData.method is `never` here.
          `Invalid method name "${reqData.method}".`,
          "NotFound"
        )
      };
  }
}

export class UserDefinitionExecutor implements DefinitionExecutor {
  definition: UserDefinition;
  client: EntityClient;
  sessionClient: SessionClient;

  constructor(
    definition: UserDefinition,
    client: EntityClient,
    sessionClient: SessionClient
  ) {
    this.definition = definition;
    this.client = client;
    this.sessionClient = sessionClient;

    if (this.definition.authorize == null) {
      this.authorize = () => Promise.resolve(true);
    }
    if (this.definition.normalize == null) {
      this.normalize = val => Promise.resolve(val);
    }
    if (this.definition.validate == null) {
      this.validate = () => Promise.resolve();
    }
    if (this.definition.wrapExecution == null) {
      this.execute = executeEntityRequestData.bind(this, this.client);
    }
  }

  async authorize(
    reqData: GeneralUserEntityRequestData,
    session?: Nullable<Session>
  ): Promise<boolean> {
    return this.definition.authorize!(reqData, session);
  }

  async validate(
    reqData: GeneralUserEntityRequestData,
    session?: Nullable<Session>
  ): Promise<void> {
    return this.definition.validate!(reqData, session);
  }

  async normalize(
    reqData: GeneralUserEntityRequestData,
    session?: Nullable<Session>
  ): Promise<GeneralUserEntityRequestData> {
    return this.definition.normalize!(reqData, session);
  }

  async execute(
    reqData: GeneralUserEntityRequestData,
    session?: Nullable<Session>
  ): HandlerResult<GeneralUserEntityResponseData> {
    if (reqData.method == "login") {
      return this.login(reqData.payload, session);
    }
    if (reqData.method == "logout") {
      return this.logout(reqData.payload, session);
    }

    return this.definition.wrapExecution!(
      reqData,
      session,
      executeEntityRequestData.bind(this, this.client)
    );
  }

  private async login(
    loginCommand: LoginCommand<string, Object>,
    session?: Nullable<Session>
  ): Promise<LoginResponseData<string, Entity, Object>> {
    const result = await this.definition.authenticate(loginCommand, session);
    const newSession = await this.sessionClient.create(result.preSession);
    return {
      type: "login",
      payload: {
        user: result.user,
        versionId: result.versionId,
        session: newSession
      }
    };
  }

  private async logout(
    logoutCommand: LogoutCommand<string>,
    session?: Nullable<Session>
  ): Promise<LogoutResponseData> {
    const { sessionId } = logoutCommand;
    const result = await this.sessionClient.delete(sessionId);

    if (!result) {
      throw createServerError("sessionId not found", "BadRequest");
    }

    return {
      type: "logout",
      payload: { ok: 1 }
    };
  }
}

export class CustomQueryDefinitionExecutor implements DefinitionExecutor {
  definition: CustomQueryDefinition;
  client: EntityClient;

  constructor(definition: CustomQueryDefinition, client: EntityClient) {
    this.definition = definition;
    this.client = client;

    if (this.definition.authorize == null) {
      this.authorize = () => Promise.resolve(true);
    }
    if (this.definition.normalize == null) {
      this.normalize = val => Promise.resolve(val);
    }
    if (this.definition.validate == null) {
      this.validate = () => Promise.resolve();
    }
  }

  async authorize(
    reqData: GeneralCustomQueryRequestData,
    session?: Nullable<Session>
  ): Promise<boolean> {
    return this.definition.authorize!(reqData, session);
  }

  async validate(
    reqData: GeneralCustomQueryRequestData,
    session?: Nullable<Session>
  ): Promise<void> {
    return this.definition.validate!(reqData, session);
  }

  async normalize(
    reqData: GeneralCustomQueryRequestData,
    session?: Nullable<Session>
  ): Promise<GeneralCustomQueryRequestData> {
    return this.definition.normalize!(reqData, session);
  }

  async execute(
    reqData: GeneralCustomQueryRequestData,
    session?: Nullable<Session>
  ): HandlerResult<GeneralCustomQueryResponseData> {
    return {
      type: "runCustomQuery",
      payload: await this.definition.execute(reqData.payload, session)
    };
  }
}

export class CustomCommandDefinitionExecutor implements DefinitionExecutor {
  definition: CustomCommandDefinition;
  client: EntityClient;

  constructor(definition: CustomCommandDefinition, client: EntityClient) {
    this.definition = definition;
    this.client = client;

    if (this.definition.authorize == null) {
      this.authorize = () => Promise.resolve(true);
    }
    if (this.definition.normalize == null) {
      this.normalize = val => Promise.resolve(val);
    }
    if (this.definition.validate == null) {
      this.validate = () => Promise.resolve();
    }
  }

  async authorize(
    reqData: GeneralCustomCommandRequestData,
    session?: Nullable<Session>
  ): Promise<boolean> {
    return this.definition.authorize!(reqData, session);
  }

  async validate(
    reqData: GeneralCustomCommandRequestData,
    session?: Nullable<Session>
  ): Promise<void> {
    return this.definition.validate!(reqData, session);
  }

  async normalize(
    reqData: GeneralCustomCommandRequestData,
    session?: Nullable<Session>
  ): Promise<GeneralCustomCommandRequestData> {
    return this.definition.normalize!(reqData, session);
  }

  async execute(
    reqData: GeneralCustomCommandRequestData,
    session?: Nullable<Session>
  ): HandlerResult<GeneralCustomCommandResponseData> {
    return {
      type: "runCustomCommand",
      payload: await this.definition.execute(reqData.payload, session)
    };
  }
}

export interface DefinitionExecutor {
  authorize(
    reqData: GeneralRequestData,
    session?: Nullable<Session>
  ): Promise<boolean>;

  normalize(
    reqData: GeneralRequestData,
    session?: Nullable<Session>
  ): Promise<GeneralRequestData>;

  validate(
    reqData: GeneralRequestData,
    session?: Nullable<Session>
  ): Promise<void>;

  execute(
    reqData: GeneralRequestData,
    session?: Nullable<Session>
  ): Promise<GeneralResponseData>;
}