import "reflect-metadata";
import { Container } from "inversify";
import { TYPES } from "./types";
import { ICacheService } from "../../application/interface/services/ICacheService";

import { serviceModule } from "./modules/service.module";
import { repositoryModule } from "./modules/repository.module";
import { useCaseModule } from "./modules/useCase.module";
import { controllerModule } from "./modules/controller.module";

interface IAsyncInitializable {
  connect?(): Promise<void>;
  init?(): Promise<void>;
  disconnect?(): Promise<void>;
  close?(): Promise<void>;
}

class DIContainer {
  private readonly _container: Container;
  private _initialized = false;

  constructor() {
    this._container = new Container();
    this._configureBindings();
  }

  private _configureBindings(): void {
    this._container.load(
      serviceModule,
      repositoryModule,
      useCaseModule,
      controllerModule,
    );
  }

  public async init(): Promise<void> {
    if (this._initialized) return;
    this._initialized = true;

    try {
      if (this._container.isBound(TYPES.ICacheService)) {
        const cache = this._container.get<ICacheService>(
          TYPES.ICacheService,
        ) as IAsyncInitializable;
        if (cache && typeof cache.connect === "function") {
          await cache.connect();
        }
      }
    } catch (err) {
      throw new Error("Cache service failed to start :" + err);
    }
  }

  public async dispose(): Promise<void> {}

  public get container(): Container {
    return this._container;
  }

  public get<T>(type: symbol): T {
    return this._container.get<T>(type);
  }

  public isBound(type: symbol): boolean {
    return this._container.isBound(type);
  }
}

export const diContainer = new DIContainer();
export const container = diContainer.container;
