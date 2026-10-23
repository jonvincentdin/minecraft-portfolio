export interface Scene { mesh?: { positions: number[][]; normals: number[][]; colors: number[][]; indices: number[]; edges: number[][] }; boxes?: { p: number[]; s: number[]; c: string }[] }
export class VoxelView {
 constructor(canvas: HTMLCanvasElement, scene: Scene, options?: { character?: boolean; world?: boolean; rotate?: boolean; paused?: () => boolean });
 gl: WebGLRenderingContext | null;
 set(scene: Scene): void;
 turn(delta: number): void; reset(): void; setWire(value: boolean): void; destroy(): void;
}
export function dragRotation(dx: number, dy: number): { yaw: number; elevation: number };
