import type { LanguageExecutor, ExecutorConfig } from './types';

const _executors = new Map<string, LanguageExecutor>();
let _currentId: string = 'js';

export function register(executor: LanguageExecutor): void {
  _executors.set(executor.config.id, executor);
}

export function get(id: string): LanguageExecutor {
  const exe = _executors.get(id);
  if (!exe) throw new Error(`Executor not found: ${id}`);
  return exe;
}

export function getCurrent(): LanguageExecutor {
  return get(_currentId);
}

export function setCurrent(id: string): void {
  if (!_executors.has(id)) throw new Error(`Executor not found: ${id}`);
  _currentId = id;
}

export function getCurrentId(): string {
  return _currentId;
}

export function getAllConfigs(): ExecutorConfig[] {
  return Array.from(_executors.values()).map((e) => e.config);
}

export function terminateAll(): void {
  _executors.forEach((e) => e.terminate());
  _executors.clear();
}
