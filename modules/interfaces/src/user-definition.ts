import { Broader, Narrow } from "./type-map";

import { Entity } from "./entity";
import { EntityDefinition } from "./entity-definition";
import { LoginCommand } from "./command";
import { PreSession } from "./session";
import { Session } from "./session";

export type AuthenticationResult<E extends Entity> = {
  ok: 1;
  preSession: PreSession;
  user: E | null;
  versionId: string | null;
};

export interface AuthDefinition<
  EN extends string = string,
  Ebroader extends Broader<Entity, Entity> = [Entity, Entity],
  C extends Object = Object,
  O extends Object = Object
> {
  authenticate(
    loginCommand: LoginCommand<EN, C, O>,
    session?: Session
  ): Promise<AuthenticationResult<Narrow<Ebroader>>>;
}

export interface UserDefinition<
  EN extends string = string,
  Ebroader extends Broader<Entity, Entity> = [Entity, Entity],
  C extends Object = Object,
  O extends Object = Object
> extends AuthDefinition<EN, Ebroader, C, O>, EntityDefinition<EN, Ebroader> {}
