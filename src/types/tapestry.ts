// TypeScript interfaces for The Full Truth feature

export type TapestryStatus = 'draft' | 'published';
export type TapestryNodeType = 'character' | 'point';
export type TapestryNodeSide = 'left' | 'right' | 'neutral';
export type PointTagType = 'claim' | 'evidence' | 'context';

export interface ThemeConfig {
  leftColor: string;
  rightColor: string;
  dividerColor: string;
  leftGradient?: string;
  rightGradient?: string;
  leftImageUrl?: string;
  rightImageUrl?: string;
  fontFamily?: string;
  [key: string]: string | undefined; // Index signature for Json compatibility
}

export interface CharacterNodeData {
  name: string;
  title?: string;
  imageUrl?: string;
  notes?: string;
  [key: string]: string | undefined; // Index signature for Json compatibility
}

export interface SourceLink {
  label: string;
  url: string;
}

export interface PointNodeData {
  headline: string;
  detail?: string;
  tag: PointTagType;
  sources?: SourceLink[];
  [key: string]: string | PointTagType | SourceLink[] | undefined; // Index signature
}

export interface Tapestry {
  id: string;
  title: string;
  slug: string;
  status: TapestryStatus;
  thumbnail_url: string | null;
  theme_config: ThemeConfig;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TapestryNode {
  id: string;
  tapestry_id: string;
  type: TapestryNodeType;
  side: TapestryNodeSide;
  position_x: number;
  position_y: number;
  scale: number;
  rotation: number;
  data: CharacterNodeData | PointNodeData;
  scene_visibility: string[];
  created_at: string;
  updated_at: string;
}

export interface EdgeData {
  color?: string;
  animated?: boolean;
  style?: 'solid' | 'dashed' | 'dotted';
  [key: string]: string | boolean | undefined;
}

export interface TapestryEdge {
  id: string;
  tapestry_id: string;
  source_node_id: string;
  target_node_id: string;
  data: EdgeData;
  created_at: string;
}

export interface SceneConfig {
  zoom: number;
  panX: number;
  panY: number;
  visibleNodes: string[];
  [key: string]: number | string[];
}

export interface TapestryScene {
  id: string;
  tapestry_id: string;
  order_index: number;
  name: string;
  config: SceneConfig;
  created_at: string;
  updated_at: string;
}

// React Flow compatible node type
export interface FlowNode {
  id: string;
  type: TapestryNodeType;
  position: { x: number; y: number };
  data: CharacterNodeData | PointNodeData & {
    side: TapestryNodeSide;
    scale: number;
    rotation: number;
  };
}

// React Flow compatible edge type
export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  data?: EdgeData;
  animated?: boolean;
  style?: React.CSSProperties;
}

// Form types for creating/updating
export interface CreateTapestryInput {
  title: string;
  slug?: string;
  theme_config?: ThemeConfig;
}

export interface UpdateTapestryInput {
  title?: string;
  slug?: string;
  status?: TapestryStatus;
  thumbnail_url?: string;
  theme_config?: ThemeConfig;
}

export interface CreateNodeInput {
  tapestry_id: string;
  type: TapestryNodeType;
  side?: TapestryNodeSide;
  position_x?: number;
  position_y?: number;
  scale?: number;
  rotation?: number;
  data: CharacterNodeData | PointNodeData;
  scene_visibility?: string[];
}

export interface UpdateNodeInput {
  type?: TapestryNodeType;
  side?: TapestryNodeSide;
  position_x?: number;
  position_y?: number;
  scale?: number;
  rotation?: number;
  data?: CharacterNodeData | PointNodeData;
  scene_visibility?: string[];
}

export interface CreateEdgeInput {
  tapestry_id: string;
  source_node_id: string;
  target_node_id: string;
  data?: EdgeData;
}

// Full tapestry with related data
export interface TapestryWithData extends Tapestry {
  nodes: TapestryNode[];
  edges: TapestryEdge[];
  scenes: TapestryScene[];
}

// Helper type guards
export function isCharacterData(data: CharacterNodeData | PointNodeData): data is CharacterNodeData {
  return 'name' in data && !('headline' in data);
}

export function isPointData(data: CharacterNodeData | PointNodeData): data is PointNodeData {
  return 'headline' in data;
}

// Database row types (for type casting from Supabase)
export interface TapestryRow {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  thumbnail_url: string | null;
  theme_config: unknown;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TapestryNodeRow {
  id: string;
  tapestry_id: string;
  type: 'character' | 'point';
  side: 'left' | 'right' | 'neutral';
  position_x: number;
  position_y: number;
  scale: number;
  rotation: number;
  data: unknown;
  scene_visibility: unknown;
  created_at: string;
  updated_at: string;
}

export interface TapestryEdgeRow {
  id: string;
  tapestry_id: string;
  source_node_id: string;
  target_node_id: string;
  data: unknown;
  created_at: string;
}

export interface TapestrySceneRow {
  id: string;
  tapestry_id: string;
  order_index: number;
  name: string;
  config: unknown;
  created_at: string;
  updated_at: string;
}

// Transform functions
export const transformTapestry = (row: TapestryRow): Tapestry => ({
  ...row,
  theme_config: row.theme_config as ThemeConfig,
});

export const transformNode = (row: TapestryNodeRow): TapestryNode => ({
  ...row,
  data: row.data as CharacterNodeData | PointNodeData,
  scene_visibility: (row.scene_visibility as string[]) || [],
});

export const transformEdge = (row: TapestryEdgeRow): TapestryEdge => ({
  ...row,
  data: row.data as EdgeData,
});

export const transformScene = (row: TapestrySceneRow): TapestryScene => ({
  ...row,
  config: row.config as SceneConfig,
});
