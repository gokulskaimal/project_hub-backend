export interface IBootstrapService {
  /** Run any bootstrap tasks (e.g. create super admin) */
  run(): Promise<void>;
}
