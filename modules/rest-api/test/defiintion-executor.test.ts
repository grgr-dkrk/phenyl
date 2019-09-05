import {
  GeneralAuthenticationResult,
  CustomCommandDefinition,
  CustomQueryDefinition,
  EntityClient,
  EntityRestApiDefinition,
  GeneralCustomCommandRequestData,
  GeneralCustomQueryRequestData,
  GeneralRequestData,
  GeneralResponseData,
  GeneralQueryResult,
  UserRestApiDefinition,
  Entity
} from "@phenyl/interfaces";
/* eslint-env mocha */
import {
  CustomCommandDefinitionExecutor,
  CustomQueryDefinitionExecutor,
  EntityRestApiDefinitionExecutor,
  UserRestApiDefinitionExecutor
} from "../src/definition-executor";

import assert from "assert";

// @ts-ignore mocking EntityClient
const clientMock: EntityClient = { find: () => queryResult };
// @ts-ignore mocking EntityClient
const sessionClientMock: SessionClient = {
  get: () => null,
  create: () => ({})
};

const findReqData: GeneralRequestData = {
  method: "find",
  payload: { entityName: "foo", where: {} }
};

const findReqData2: GeneralRequestData = {
  method: "find",
  payload: { entityName: "bar", where: {} }
};

const queryResult: GeneralQueryResult = { entities: [], versionsById: {} };
const findResData: GeneralResponseData = {
  type: "find",
  payload: {
    entities: [{ id: "foo", name: "bar" } as Entity],
    versionsById: {}
  }
};

describe("EntityRestApiDefinitionExecutor", () => {
  describe("authorize()", () => {
    it("should return true when a definition without authorize() method is given", async () => {
      const executor = new EntityRestApiDefinitionExecutor(
        {} as EntityRestApiDefinition,
        clientMock
      );
      const result = await executor.authorize(findReqData);
      assert.strictEqual(result, true);
    });

    it("should return the result of a given definition's authorize() method when it exists", async () => {
      const executor = new EntityRestApiDefinitionExecutor(
        { authorize: async () => false } as EntityRestApiDefinition,
        clientMock
      );
      const result = await executor.authorize(findReqData);
      assert.strictEqual(result, false);
    });
  });

  describe("validate()", () => {
    it("should do nothing when a definition without validate() method is given", async () => {
      const executor = new EntityRestApiDefinitionExecutor(
        {} as EntityRestApiDefinition,
        clientMock
      );
      await executor.validate(findReqData);
      assert.ok(true);
    });

    it("should run a given definition's validate() method when it exists", async () => {
      let counter = 0;
      const executor = new EntityRestApiDefinitionExecutor(
        {
          validate: async () => {
            counter++;
            return;
          }
        } as EntityRestApiDefinition,
        clientMock
      );
      await executor.validate(findReqData);
      assert.strictEqual(counter, 1);
    });
  });

  describe("normalize()", () => {
    it("should return the same RequestData when a definition without normalize() method is given", async () => {
      const executor = new EntityRestApiDefinitionExecutor(
        {} as EntityRestApiDefinition,
        clientMock
      );
      const result = await executor.normalize(findReqData);
      assert.strictEqual(result, findReqData);
    });

    it("should return the result of a given definition's normalize() method when it exists", async () => {
      const executor = new EntityRestApiDefinitionExecutor(
        { normalize: async () => findReqData2 } as EntityRestApiDefinition,
        clientMock
      );
      const result = await executor.normalize(findReqData);
      assert.strictEqual(result, findReqData2);
    });
  });

  describe("execute()", () => {
    it("should run the client's method when a definition without wrapExecution() method is given", async () => {
      const executor = new EntityRestApiDefinitionExecutor(
        {} as EntityRestApiDefinition,
        clientMock
      );
      const result = await executor.execute(findReqData);
      assert.deepStrictEqual(result, { type: "find", payload: queryResult });
    });

    it("should return the wrapped result of a given definition's wrapExecution() method when it exists", async () => {
      const executor = new EntityRestApiDefinitionExecutor(
        { wrapExecution: async () => findResData } as EntityRestApiDefinition,
        clientMock
      );
      const result = await executor.execute(findReqData);
      assert.strictEqual(result, findResData);
    });
  });
});

describe("UserRestApiDefinitionExecutor", () => {
  describe("authorize()", () => {
    it("should return true when a definition without authorize() method is given", async () => {
      const executor = new UserRestApiDefinitionExecutor(
        {} as UserRestApiDefinition,
        clientMock,
        sessionClientMock
      );
      const result = await executor.authorize(findReqData);
      assert.strictEqual(result, true);
    });

    it("should return the result of a given definition's authorize() method when it exists", async () => {
      const authenticate = async () => ({} as GeneralAuthenticationResult);
      const executor = new UserRestApiDefinitionExecutor(
        { authenticate, authorize: async () => false } as UserRestApiDefinition,
        clientMock,
        sessionClientMock
      );
      const result = await executor.authorize(findReqData);
      assert.strictEqual(result, false);
    });
  });

  describe("validate()", () => {
    it("should do nothing when a definition without validate() method is given", async () => {
      const executor = new UserRestApiDefinitionExecutor(
        {} as UserRestApiDefinition,
        clientMock,
        sessionClientMock
      );
      await executor.validate(findReqData);
      assert.ok(true);
    });

    it("should run a given definition's validate() method when it exists", async () => {
      let counter = 0;
      const authenticate = async () => ({} as GeneralAuthenticationResult);
      const executor = new UserRestApiDefinitionExecutor(
        {
          authenticate,
          validate: async () => {
            counter++;
            return;
          }
        } as UserRestApiDefinition,
        clientMock,
        sessionClientMock
      );
      await executor.validate(findReqData);
      assert.strictEqual(counter, 1);
    });
  });

  describe("normalize()", () => {
    it("should return the same RequestData when a definition without normalize() method is given", async () => {
      const executor = new UserRestApiDefinitionExecutor(
        {} as UserRestApiDefinition,
        clientMock,
        sessionClientMock
      );
      const result = await executor.normalize(findReqData);
      assert.strictEqual(result, findReqData);
    });

    it("should return the result of a given definition's normalize() method when it exists", async () => {
      const authenticate = async () => ({} as GeneralAuthenticationResult);
      const executor = new UserRestApiDefinitionExecutor(
        { authenticate, normalize: async () => findReqData2 } as UserRestApiDefinition,
        clientMock,
        sessionClientMock
      );
      const result = await executor.normalize(findReqData);
      assert.strictEqual(result, findReqData2);
    });
  });

  describe("execute()", () => {
    it("should run the client's method when a definition without wrapExecution() method is given", async () => {
      const executor = new UserRestApiDefinitionExecutor(
        {} as UserRestApiDefinition,
        clientMock,
        sessionClientMock
      );
      const result = await executor.execute(findReqData);
      assert.deepStrictEqual(result, { type: "find", payload: queryResult });
    });

    it("should return the wrapped result of a given definition's wrapExecution() method when it exists", async () => {
      const authenticate = async () => ({} as GeneralAuthenticationResult);
      const executor = new UserRestApiDefinitionExecutor(
        {
          authenticate,
          wrapExecution: async () => findResData
        } as UserRestApiDefinition,
        clientMock,
        sessionClientMock
      );
      const result = await executor.execute(findReqData);
      assert.strictEqual(result, findResData);
    });

    it("should run definition's authenticate() method when LoginRequestData is given", async () => {
      const authenticate = async () =>
        ({ versionId: "abcd" } as GeneralAuthenticationResult);
      const executor = new UserRestApiDefinitionExecutor(
        {
          authenticate
        } as UserRestApiDefinition,
        clientMock,
        sessionClientMock
      );
      const result = await executor.execute({
        method: "login",
        payload: { entityName: "xxx", credentials: {} }
      });
      // @ts-ignore
      assert.strictEqual(result.payload.versionId, "abcd");
    });
  });
});

describe("CustomQueryDefinitionExecutor", () => {
  const customQueryReqData: GeneralCustomQueryRequestData = {
    method: "runCustomQuery",
    payload: { name: "hogefuga", params: { foo: 345 } }
  };
  describe("authorize()", () => {
    it("should return true when a definition without authorize() method is given", async () => {
      const executor = new CustomQueryDefinitionExecutor(
        { execute: async () => ({ result: 123 }) } as CustomQueryDefinition,
        clientMock
      );
      const result = await executor.authorize(customQueryReqData);
      assert.strictEqual(result, true);
    });

    it("should return the result of a given definition's authorize() method when it exists", async () => {
      const executor = new CustomQueryDefinitionExecutor(
        {
          execute: async () => ({ result: 123 }),
          authorize: async () => false
        } as CustomQueryDefinition,
        clientMock
      );
      const result = await executor.authorize(customQueryReqData);
      assert.strictEqual(result, false);
    });
  });

  describe("validate()", () => {
    it("should do nothing when a definition without validate() method is given", async () => {
      const executor = new CustomQueryDefinitionExecutor(
        { execute: async () => ({ result: 123 }) } as CustomQueryDefinition,
        clientMock
      );
      await executor.validate(customQueryReqData);
      assert.ok(true);
    });

    it("should run a given definition's validate() method when it exists", async () => {
      let counter = 0;
      const executor = new CustomQueryDefinitionExecutor(
        {
          execute: async () => ({ result: 123 }),
          validate: async () => {
            counter++;
            return;
          }
        } as CustomQueryDefinition,
        clientMock
      );
      await executor.validate(customQueryReqData);
      assert.strictEqual(counter, 1);
    });
  });

  describe("normalize()", () => {
    it("should return the same RequestData when a definition without normalize() method is given", async () => {
      const executor = new CustomQueryDefinitionExecutor(
        { execute: async () => ({ result: 123 }) } as CustomQueryDefinition,
        clientMock
      );
      const result = await executor.normalize(customQueryReqData);
      assert.strictEqual(result, customQueryReqData);
    });

    it("should return the result of a given definition's normalize() method when it exists", async () => {
      const executor = new CustomQueryDefinitionExecutor(
        {
          execute: async () => ({ result: 123 }),
          normalize: async () =>
            Object.assign({}, customQueryReqData, { ex: 1 })
        } as CustomQueryDefinition,
        clientMock
      );
      const result = await executor.normalize(customQueryReqData);
      assert.deepStrictEqual(
        result,
        Object.assign({}, customQueryReqData, { ex: 1 })
      );
    });
  });

  describe("execute()", () => {
    it("should return the result of exexute() when a given definition has no wrapExecution() method", async () => {
      const executor = new CustomQueryDefinitionExecutor(
        { execute: async () => ({ result: 123 }) } as CustomQueryDefinition,
        clientMock
      );
      const result = await executor.execute(customQueryReqData);
      assert.deepStrictEqual(result, {
        type: "runCustomQuery",
        payload: { result: 123 }
      });
    });

    it("should return the wrapped result of a given definition's wrapExecution() method when it exists", async () => {
      const executor = new CustomQueryDefinitionExecutor(
        {
          execute: async () => ({ result: 123 }),
          wrapExecution: async () => ({
            type: "runCustomQuery",
            payload: { result: 345 }
          })
        } as CustomQueryDefinition,
        clientMock
      );
      const result = await executor.execute(customQueryReqData);
      assert.deepStrictEqual(result, {
        type: "runCustomQuery",
        payload: { result: 345 }
      });
    });
  });
});

describe("CustomCommandDefinitionExecutor", () => {
  const customCommandReqData: GeneralCustomCommandRequestData = {
    method: "runCustomCommand",
    payload: { name: "hogefuga", params: { foo: 345 } }
  };
  describe("authorize()", () => {
    it("should return true when a definition without authorize() method is given", async () => {
      const executor = new CustomCommandDefinitionExecutor(
        { execute: async () => ({ result: 123 }) } as CustomCommandDefinition,
        clientMock
      );
      const result = await executor.authorize(customCommandReqData);
      assert.strictEqual(result, true);
    });

    it("should return the result of a given definition's authorize() method when it exists", async () => {
      const executor = new CustomCommandDefinitionExecutor(
        {
          execute: async () => ({ result: 123 }),
          authorize: async () => false
        } as CustomCommandDefinition,
        clientMock
      );
      const result = await executor.authorize(customCommandReqData);
      assert.strictEqual(result, false);
    });
  });

  describe("validate()", () => {
    it("should do nothing when a definition without validate() method is given", async () => {
      const executor = new CustomCommandDefinitionExecutor(
        { execute: async () => ({ result: 123 }) } as CustomCommandDefinition,
        clientMock
      );
      await executor.validate(customCommandReqData);
      assert.ok(true);
    });

    it("should run a given definition's validate() method when it exists", async () => {
      let counter = 0;
      const executor = new CustomCommandDefinitionExecutor(
        {
          execute: async () => ({ result: 123 }),
          validate: async () => {
            counter++;
            return;
          }
        } as CustomCommandDefinition,
        clientMock
      );
      await executor.validate(customCommandReqData);
      assert.strictEqual(counter, 1);
    });
  });

  describe("normalize()", () => {
    it("should return the same RequestData when a definition without normalize() method is given", async () => {
      const executor = new CustomCommandDefinitionExecutor(
        { execute: async () => ({ result: 123 }) } as CustomCommandDefinition,
        clientMock
      );
      const result = await executor.normalize(customCommandReqData);
      assert.strictEqual(result, customCommandReqData);
    });

    it("should return the result of a given definition's normalize() method when it exists", async () => {
      const executor = new CustomCommandDefinitionExecutor(
        {
          execute: async () => ({ result: 123 }),
          normalize: async () =>
            Object.assign({}, customCommandReqData, { ex: 1 })
        } as CustomCommandDefinition,
        clientMock
      );
      const result = await executor.normalize(customCommandReqData);
      assert.deepStrictEqual(
        result,
        Object.assign({}, customCommandReqData, { ex: 1 })
      );
    });
  });

  describe("execute()", () => {
    it("should return the result of exexute() when a given definition has no wrapExecution() method", async () => {
      const executor = new CustomCommandDefinitionExecutor(
        { execute: async () => ({ result: 123 }) } as CustomCommandDefinition,
        clientMock
      );
      const result = await executor.execute(customCommandReqData);
      assert.deepStrictEqual(result, {
        type: "runCustomCommand",
        payload: { result: 123 }
      });
    });

    it("should return the wrapped result of a given definition's wrapExecution() method when it exists", async () => {
      const executor = new CustomCommandDefinitionExecutor(
        {
          execute: async () => ({ result: 123 }),
          wrapExecution: async () => ({
            type: "runCustomCommand",
            payload: { result: 345 }
          })
        } as CustomCommandDefinition,
        clientMock
      );
      const result = await executor.execute(customCommandReqData);
      assert.deepStrictEqual(result, {
        type: "runCustomCommand",
        payload: { result: 345 }
      });
    });
  });
});
