import { Outfit, Rule, RuleEvaluationResult, RuleHit, Item, Matcher, Slot } from './types';
import { getItem } from './data';
import defaultRulesJson from '../data/rules.json';

function matchesMatcher(item: Item, matcher: Matcher): boolean {
  if ('kind' in matcher) {
    return item.kind === matcher.kind;
  }
  if ('attr' in matcher) {
    return Boolean(item[matcher.attr]);
  }
  if ('set' in matcher) {
    return item.set === matcher.set;
  }
  return false;
}

function findComboMatch(matchers: Matcher[], items: Item[]): Item[] | null {
  const k = matchers.length;
  if (items.length < k) return null;

  function search(mIndex: number, usedIndices: Set<number>): number[] | null {
    if (mIndex === k) return [];
    const m = matchers[mIndex];
    for (let i = 0; i < items.length; i++) {
      if (!usedIndices.has(i) && matchesMatcher(items[i], m)) {
        usedIndices.add(i);
        const rest = search(mIndex + 1, usedIndices);
        if (rest !== null) {
          return [i, ...rest];
        }
        usedIndices.delete(i);
      }
    }
    return null;
  }

  const matchedIndices = search(0, new Set<number>());
  if (!matchedIndices) return null;

  return matchedIndices.map((idx) => items[idx]);
}

export function evaluate(
  outfit: Outfit,
  rulesOverride?: Rule[],
  itemLookup?: (id: string) => Item | undefined
): RuleEvaluationResult {
  const rules = (rulesOverride ?? defaultRulesJson) as Rule[];
  const lookup = itemLookup ?? getItem;

  // Resolve items for outfit. Keep distinct items.
  const resolvedItems: Item[] = [];
  const seenIds = new Set<string>();

  for (const id of outfit.itemIds) {
    if (seenIds.has(id)) continue;
    seenIds.add(id);
    const item = lookup(id);
    if (item) {
      resolvedItems.push(item);
    }
  }

  const block: RuleHit[] = [];
  const warn: RuleHit[] = [];
  const suggest: RuleHit[] = [];

  for (const rule of rules) {
    let matchedItemIds: string[] | null = null;

    if (rule.type === 'duplicate_slot') {
      const slotItems = resolvedItems.filter((item) => item.slot === rule.slot);
      if (slotItems.length >= 2) {
        matchedItemIds = slotItems.map((i) => i.id);
      }
    } else if (rule.type === 'combo') {
      const matchedItems = findComboMatch(rule.all, resolvedItems);
      if (matchedItems) {
        matchedItemIds = matchedItems.map((i) => i.id);
      }
    }

    if (matchedItemIds) {
      const hit: RuleHit = {
        ruleId: rule.id,
        level: rule.level,
        message_key: rule.message_key,
        message_vi: rule.message_vi,
        itemIds: matchedItemIds,
      };

      if (rule.level === 'block') {
        block.push(hit);
      } else if (rule.level === 'warn') {
        warn.push(hit);
      } else if (rule.level === 'suggest') {
        suggest.push(hit);
      }
    }
  }

  return {
    block,
    warn,
    suggest,
    canConfirm: block.length === 0,
  };
}
