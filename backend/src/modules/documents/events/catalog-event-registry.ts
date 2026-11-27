/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Catalog Event Registry — Maps all 300 Document Automation Catalog triggers
 * to canonical event keys (`catalog.<snake_case_trigger>`) and resolves
 * matching catalog items with practice-area awareness.
 */

import { AutomationCatalogService, CatalogAutomationItem } from '../catalog/automation-catalog.service.js';
import { DOCUMENT_EVENT } from './event.types.js';

export interface CatalogEventDefinition {
  eventKey: string;
  trigger: string;
  items: CatalogAutomationItem[];
  isSpecializedHandler: boolean;
}

const SPECIALIZED_EVENT_TO_TRIGGER: Record<string, string> = {
  [DOCUMENT_EVENT.INTAKE_CONSULTATION_BOOKED]: 'Consultation booked',
  [DOCUMENT_EVENT.INTAKE_CONSULTATION_RESCHEDULED]: 'Consultation booked',
  [DOCUMENT_EVENT.INTAKE_PROSPECT_SAVED]: 'Prospect saved',
  [DOCUMENT_EVENT.INTAKE_CONFLICT_SEARCH_COMPLETED]: 'Conflict search completed',
  [DOCUMENT_EVENT.MATTER_CREATED_FROM_INTAKE]: 'Matter opened',
  [DOCUMENT_EVENT.PI_ACCIDENT_SAVED]: 'PI client and accident record saved',
  [DOCUMENT_EVENT.PI_PROVIDER_ADDED]: 'Provider and authorization available',
  [DOCUMENT_EVENT.PI_MISSING_RECORDS]: 'Received packet marked incomplete',
  [DOCUMENT_EVENT.PI_DEMAND_READY]: 'Demand draft event recorded',
  [DOCUMENT_EVENT.PI_LIEN_PAYOFF_RECORDED]: 'Proposed payoff agreement recorded',
  [DOCUMENT_EVENT.EVICTION_CLOSURE_REVIEWED]: 'Judgment or settlement closure reviewed',
};

const SPECIALIZED_TRIGGER_SET = new Set(
  Object.values(SPECIALIZED_EVENT_TO_TRIGGER).map((t) => t.toLowerCase().trim())
);

export function toCatalogEventKey(trigger: string): string {
  const slug = trigger
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return `catalog.${slug}`;
}

export class CatalogEventRegistry {
  private static definitionsCache: CatalogEventDefinition[] | null = null;
  private static byEventKeyCache: Map<string, CatalogAutomationItem[]> | null = null;

  private static ensureBuilt(): void {
    if (this.definitionsCache && this.byEventKeyCache) {
      return;
    }

    const catalog = AutomationCatalogService.loadCatalog();
    const byKey = new Map<string, { trigger: string; items: CatalogAutomationItem[] }>();

    for (const item of catalog.items) {
      const eventKey = toCatalogEventKey(item.trigger);
      const entry = byKey.get(eventKey);
      if (entry) {
        entry.items.push(item);
      } else {
        byKey.set(eventKey, { trigger: item.trigger, items: [item] });
      }
    }

    const definitions: CatalogEventDefinition[] = [];
    const itemsMap = new Map<string, CatalogAutomationItem[]>();

    for (const [eventKey, group] of byKey.entries()) {
      itemsMap.set(eventKey, group.items);
      definitions.push({
        eventKey,
        trigger: group.trigger,
        items: group.items,
        isSpecializedHandler: SPECIALIZED_TRIGGER_SET.has(group.trigger.toLowerCase().trim()),
      });
    }

    this.definitionsCache = definitions;
    this.byEventKeyCache = itemsMap;
  }

  /**
   * Returns all unique catalog event definitions covering all 300 automations.
   */
  static getAllCatalogEventDefinitions(): CatalogEventDefinition[] {
    this.ensureBuilt();
    return this.definitionsCache!;
  }

  /**
   * Resolves matching catalog items for a given event key, catalog ID, template code,
   * or human-readable trigger label. Optionally filters by practiceAreaId (+ global items).
   */
  static findMatchingCatalogItems(
    eventOrTrigger: string,
    practiceAreaId?: string | null
  ): CatalogAutomationItem[] {
    this.ensureBuilt();
    const raw = String(eventOrTrigger || '').trim();
    if (!raw) return [];

    const lower = raw.toLowerCase();
    const catalog = AutomationCatalogService.loadCatalog();

    // 1. Exact catalogId or templateCode match (e.g. "CAT-028")
    const directItem = catalog.items.find(
      (i) => i.catalogId.toLowerCase() === lower || i.templateCode.toLowerCase() === lower
    );
    if (directItem) {
      return [directItem];
    }

    // 2. Specialized domain event alias
    const aliasedTrigger = SPECIALIZED_EVENT_TO_TRIGGER[raw] || SPECIALIZED_EVENT_TO_TRIGGER[lower];
    const normalizedKey = aliasedTrigger
      ? toCatalogEventKey(aliasedTrigger)
      : lower.startsWith('catalog.')
        ? lower
        : toCatalogEventKey(raw);

    const matched = this.byEventKeyCache!.get(normalizedKey) || [];
    if (matched.length === 0) return [];

    if (!practiceAreaId) {
      return matched;
    }

    const paMatches = matched.filter((i) => i.isGlobal || i.practiceAreaId === practiceAreaId);
    return paMatches.length > 0 ? paMatches : matched;
  }
}
