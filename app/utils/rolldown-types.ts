// Simplified rolldown type definitions for Monaco Editor
// This provides basic type safety for the REPL without needing to load the full type definitions

export const rolldownTypeDefs = `declare module 'rolldown' {
  // Core types
  export interface RolldownOptions extends InputOptions {
    output?: OutputOptions | OutputOptions[];
  }

  export interface InputOptions {
    input?: string | string[] | Record<string, string>;
    plugins?: RolldownPlugin | RolldownPlugin[];
    external?: (string | RegExp)[] | ((source: string, importer: string | undefined) => boolean);
    resolve?: {
      alias?: Record<string, string[] | string | false>;
      aliasFields?: string[][];
      conditionNames?: string[];
      extensionAlias?: Record<string, string[]>;
      exportsFields?: string[][];
      extensions?: string[];
      mainFields?: string[];
      mainFiles?: string[];
      modules?: string[];
      symlinks?: boolean;
      tsconfigFilename?: string;
    };
    cwd?: string;
    platform?: 'node' | 'browser' | 'neutral';
    shimMissingExports?: boolean;
    treeshake?: boolean | TreeshakingOptions;
    logLevel?: 'silent' | 'warn' | 'info' | 'debug';
    onLog?: (level: string, log: any) => void;
    onwarn?: (warning: any) => void;
    moduleTypes?: Record<string, 'js' | 'jsx' | 'ts' | 'tsx' | 'json' | 'text' | 'base64' | 'dataurl' | 'binary' | 'empty'>;
    define?: Record<string, string>;
    inject?: Record<string, string | [string, string]>;
    transform?: {
      define?: Record<string, string>;
      jsx?: JsxOptions;
    };
  }

  export interface OutputOptions {
    dir?: string;
    file?: string;
    format?: 'esm' | 'cjs' | 'iife' | 'umd' | 'app';
    exports?: 'auto' | 'named' | 'default' | 'none';
    sourcemap?: boolean | 'inline' | 'hidden';
    sourcemapIgnoreList?: boolean | ((source: string) => boolean);
    sourcemapPathTransform?: (source: string) => string;
    banner?: string | (() => string | Promise<string>);
    footer?: string | (() => string | Promise<string>);
    intro?: string | (() => string | Promise<string>);
    outro?: string | (() => string | Promise<string>);
    esModule?: boolean | 'if-default-prop';
    extend?: boolean;
    name?: string;
    globals?: Record<string, string> | ((id: string) => string);
    entryFileNames?: string;
    chunkFileNames?: string;
    assetFileNames?: string;
    minify?: boolean;
    externalLiveBindings?: boolean;
    inlineDynamicImports?: boolean;
    advancedChunks?: {
      minSize?: number;
      minShareCount?: number;
      groups?: Array<{
        name: string;
        test?: string | RegExp;
        priority?: number;
        minSize?: number;
        minShareCount?: number;
      }>;
    };
  }

  export interface TreeshakingOptions {
    moduleSideEffects?: boolean | 'no-external' | string[] | ((id: string) => boolean);
  }

  export interface JsxOptions {
    mode?: 'classic' | 'automatic';
    factory?: string;
    fragment?: string;
    importSource?: string;
    jsxImportSource?: string;
    runtime?: 'classic' | 'automatic';
    development?: boolean;
  }

  export interface RolldownPlugin {
    name: string;
    buildStart?: (this: PluginContext) => void | Promise<void>;
    resolveId?: (
      this: PluginContext,
      source: string,
      importer: string | undefined,
      options: any
    ) => string | null | { id: string; external?: boolean } | Promise<string | null | { id: string; external?: boolean }>;
    load?: (
      this: PluginContext,
      id: string
    ) => string | null | { code: string; map?: any } | Promise<string | null | { code: string; map?: any }>;
    transform?: (
      this: TransformPluginContext,
      code: string,
      id: string
    ) => string | null | { code: string; map?: any } | Promise<string | null | { code: string; map?: any }>;
    buildEnd?: (this: PluginContext, error?: Error) => void | Promise<void>;
    renderChunk?: (
      this: PluginContext,
      code: string,
      chunk: any,
      options: OutputOptions
    ) => string | null | { code: string; map?: any } | Promise<string | null | { code: string; map?: any }>;
    generateBundle?: (
      this: PluginContext,
      options: OutputOptions,
      bundle: any
    ) => void | Promise<void>;
    writeBundle?: (
      this: PluginContext,
      options: OutputOptions,
      bundle: any
    ) => void | Promise<void>;
  }

  export interface PluginContext {
    meta: { rolldownVersion: string };
    parse(code: string, options?: any): any;
    resolve(
      source: string,
      importer?: string,
      options?: any
    ): Promise<{ id: string; external: boolean } | null>;
    getModuleInfo(id: string): ModuleInfo | null;
    getModuleIds(): IterableIterator<string>;
    emitFile(file: { type: 'asset' | 'chunk'; name?: string; source?: string | Uint8Array; fileName?: string }): string;
    getFileName(referenceId: string): string;
    setAssetSource(referenceId: string, source: string | Uint8Array): void;
    warn(warning: string | { message: string }): void;
    error(error: string | { message: string }): never;
  }

  export interface TransformPluginContext extends PluginContext {
    getCombinedSourcemap(): any;
  }

  export interface ModuleInfo {
    id: string;
    isEntry: boolean;
    isExternal: boolean;
    importers: string[];
    dynamicImporters: string[];
    importedIds: string[];
    dynamicallyImportedIds: string[];
    code: string | null;
  }

  // Main API functions
  export function rolldown(options: RolldownOptions): Promise<RolldownBuild>;
  export function build(options: RolldownOptions): Promise<RolldownOutput>;
  export function watch(options: RolldownOptions & { watch?: WatchOptions }): RolldownWatcher;
  export function defineConfig(config: RolldownOptions): RolldownOptions;
  export function defineConfig(config: RolldownOptions[]): RolldownOptions[];
  export function defineConfig(config: (args: any) => RolldownOptions | Promise<RolldownOptions>): (args: any) => RolldownOptions | Promise<RolldownOptions>;

  export interface RolldownBuild {
    generate(outputOptions?: OutputOptions): Promise<RolldownOutput>;
    write(outputOptions?: OutputOptions): Promise<RolldownOutput>;
    close(): Promise<void>;
  }

  export interface RolldownOutput {
    output: Array<OutputChunk | OutputAsset>;
  }

  export interface OutputChunk {
    type: 'chunk';
    code: string;
    fileName: string;
    name: string;
    isEntry: boolean;
    isDynamicEntry: boolean;
    imports: string[];
    dynamicImports: string[];
    modules: Record<string, any>;
    exports: string[];
    map?: any;
  }

  export interface OutputAsset {
    type: 'asset';
    fileName: string;
    name?: string;
    source: string | Uint8Array;
  }

  export interface WatchOptions {
    include?: string | RegExp | (string | RegExp)[];
    exclude?: string | RegExp | (string | RegExp)[];
    chokidar?: any;
  }

  export interface RolldownWatcher {
    on(event: 'event', listener: (event: any) => void): this;
    on(event: 'change', listener: (id: string, change: any) => void): this;
    on(event: 'restart' | 'close', listener: () => void): this;
    close(): Promise<void>;
  }

  export const VERSION: string;
}

declare module 'rolldown/experimental' {
  export * from 'rolldown';
}

declare module 'rolldown/plugins' {
  export * from 'rolldown';
}
`
