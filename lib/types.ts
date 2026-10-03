export type Gender = 'male' | 'female';
export type SetCode = 'A' | 'B' | 'C' | 'MIX' | 'COMMON';
export type Slot = 'top' | 'bottom' | 'shoes' | 'neck' | 'head';
export type FabricClass = 'fitted' | 'draping' | 'structured' | null;

export const ITEM_KINDS = [
  'ao_ngu_than',
  'ao_giao_linh',
  'ao_tac',
  'ao_nhat_binh',
  'quan_lua_trang',
  'vay_dai',
  'quan_hien_dai',
  'giay_vai_den',
  'giay_sneaker',
  'non_la',
  'tram_cai',
  'vong_co_bac',
] as const;

export type ItemKind = (typeof ITEM_KINDS)[number];

export interface Item {
  id: string;
  gender: Gender;
  set: SetCode;
  slot: Slot;
  kind: ItemKind;
  name_vi: string;
  name_en: string;
  fabric_class: FabricClass;
  modern: boolean;
  stand_collar: boolean;
  ceremonial: boolean;
  image_file: string;
  region: string | null;
  period: string | null;
  sources: string[];
  needs_review: boolean;
}

export type PresetType = 'set' | 'remix';

export interface Preset {
  id: string;
  name_vi: string;
  gender: Gender;
  type: PresetType;
  item_ids: string[];
}

export interface Scene {
  id: string;
  name_vi: string;
  remix_cap: number;
  suggested_sets: string[];
}

export type RuleLevel = 'block' | 'warn' | 'suggest';

export type Matcher =
  | { kind: ItemKind }
  | { attr: 'stand_collar' | 'ceremonial' | 'modern' }
  | { set: SetCode };

export interface DuplicateSlotRule {
  id: string;
  level: RuleLevel;
  type: 'duplicate_slot';
  slot: Slot;
  message_key: string;
  message_vi: string;
  needs_review: boolean;
}

export interface ComboRule {
  id: string;
  level: RuleLevel;
  type: 'combo';
  all: Matcher[];
  message_key: string;
  message_vi: string;
  needs_review: boolean;
}

export type Rule = DuplicateSlotRule | ComboRule;

export interface Outfit {
  gender: Gender;
  itemIds: string[];
}

export interface RuleHit {
  ruleId: string;
  level: RuleLevel;
  message_key: string;
  message_vi: string;
  itemIds: string[];
}

export interface RuleEvaluationResult {
  block: RuleHit[];
  warn: RuleHit[];
  suggest: RuleHit[];
  canConfirm: boolean;
}
