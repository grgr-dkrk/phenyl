import powerCrypt from "power-crypt";
import { GeneralRequestData } from "@phenyl/interfaces";
import { encryptPasswordInRequestData } from "../src/encrypt-password-in-request-data";

describe("encryptPasswordInRequestData", () => {
  it("does nothing if request isnt update", () => {
    const requestData: GeneralRequestData = {
      method: "get",
      payload: {
        entityName: "user",
        id: "user1"
      }
    };

    const encryptedRequestData = encryptPasswordInRequestData(
      requestData,
      "password",
      powerCrypt
    );
    expect(requestData).toStrictEqual(encryptedRequestData)
  });

  it("encrypts password if password is in request data with insertOne method", () => {
    const requestData: GeneralRequestData = {
      method: "insertOne",
      payload: {
        entityName: "user",
        value: { password: "test1234" }
      }
    };

    const encryptedRequestData = encryptPasswordInRequestData(
      requestData,
      "password",
      powerCrypt
    );

    const expectedRequestData = {
      method: "insertOne",
      payload: {
        entityName: "user",
        value: { password: "OWoroorUQ5aGLRL62r7LazdwCuPPcf08eGdU+XKQZy0=" }
      }
    };

    expect(expectedRequestData).toStrictEqual(encryptedRequestData)
  });

  it("encrypts password if password is in request data with insertMulti method", () => {
    const requestData: GeneralRequestData = {
      method: "insertMulti",
      payload: {
        entityName: "user",
        values: [{ password: "test1234" }, { name: "user1" }]
      }
    };

    const encryptedRequestData = encryptPasswordInRequestData(
      requestData,
      "password",
      powerCrypt
    );

    const expectedRequestData = {
      method: "insertMulti",
      payload: {
        entityName: "user",
        values: [
          { password: "OWoroorUQ5aGLRL62r7LazdwCuPPcf08eGdU+XKQZy0=" },
          { name: "user1" }
        ]
      }
    };

    expect(expectedRequestData).toStrictEqual(encryptedRequestData)
  });

  it("encrypts password if password is in request data with update method", () => {
    const requestData: GeneralRequestData = {
      method: "updateById",
      payload: {
        id: "foo",
        entityName: "user",
        operation: {
          $set: { password: "test1234" },
          $inc: { friends: 3 }
        }
      }
    };

    const encryptedRequestData = encryptPasswordInRequestData(
      requestData,
      "password",
      powerCrypt
    );

    const expectedRequestData = {
      method: "updateById",
      payload: {
        id: "foo",
        entityName: "user",
        operation: {
          $set: { password: "OWoroorUQ5aGLRL62r7LazdwCuPPcf08eGdU+XKQZy0=" },
          $inc: { friends: 3 }
        }
      }
    };

    expect(expectedRequestData).toStrictEqual(encryptedRequestData)
  });
});
