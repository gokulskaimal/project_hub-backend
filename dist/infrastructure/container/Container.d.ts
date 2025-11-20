import "reflect-metadata";
import { Container } from "inversify";
/**
 * DIContainer
 *
 * - Binds services, repositories, use-cases, and controllers.
 * - Provides an async init() method to initialize async services (e.g., Redis).
 * - Provides dispose() for tests/graceful shutdown.
 */
declare class DIContainer {
    private readonly _container;
    private _initialized;
    constructor();
    /**
     * Bindings (unchanged)
     */
    private _configureBindings;
    private _bindServices;
    private _bindRepositories;
    private _bindUseCases;
    private _bindControllers;
    /**
     * Initialize async services if required.
     * - Ensures initialization runs only once.
     * - Looks for services that expose an async `connect()` or `init()` method and invokes it.
     */
    init(): Promise<void>;
    /**
     * Dispose / cleanup helpers (useful in tests or graceful shutdown)
     */
    dispose(): Promise<void>;
    get container(): Container;
    get<T>(serviceIdentifier: symbol): T;
    isBound(serviceIdentifier: symbol): boolean;
    unbind(serviceIdentifier: symbol): void;
    rebind<T>(serviceIdentifier: symbol): import("inversify").interfaces.BindingToSyntax<T>;
}
export declare const diContainer: DIContainer;
export declare const container: Container;
export {};
//# sourceMappingURL=Container.d.ts.map