declare module 'three/examples/jsm/loaders/FBXLoader' {
  import { Group, Loader, LoadingManager } from 'three';
  export class FBXLoader extends Loader {
    constructor(manager?: LoadingManager);
    load(url: string, onLoad: (object: Group) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void): void;
    parse(FBXBuffer: ArrayBuffer | string, path: string): Group;
  }
}

declare module 'three/examples/jsm/loaders/OBJLoader' {
  import { Group, Loader, LoadingManager } from 'three';
  export class OBJLoader extends Loader {
    constructor(manager?: LoadingManager);
    load(url: string, onLoad: (object: Group) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void): void;
    parse(data: string): Group;
  }
}
