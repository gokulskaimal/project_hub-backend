import 'reflect-metadata';
import { Container } from 'inversify';
declare class DIContainer {
    private readonly _container;
    constructor();
    /**
     * Services -> Repositories -> Use Cases -> Controllers
     */
    private _configureBindings;
    private _bindServices;
    private _bindRepositories;
    private _bindUseCases;
    private _bindControllers;
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