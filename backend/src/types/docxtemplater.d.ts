declare module 'pizzip' {
  export default class PizZip {
    constructor(content?: Buffer | string | ArrayBuffer | Uint8Array, options?: any);
    load(content: Buffer | string | ArrayBuffer | Uint8Array, options?: any): this;
    file(name: string, content?: any, options?: any): any;
    generate(options?: any): Buffer | Uint8Array | string;
  }
}

declare module 'docxtemplater' {
  export default class Docxtemplater {
    constructor(zip?: any, options?: any);
    loadZip(zip: any): this;
    setData(data: Record<string, any>): this;
    render(data?: Record<string, any>): this;
    getZip(): any;
  }
}
