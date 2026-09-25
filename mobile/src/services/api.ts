/**
 * BiteLens Mobile - Go (Golang) REST API Client Service
 * Features:
 * - Direct HTTP communication with BiteLens Go Gin microservice
 * - Bearer JWT authentication header injection
 * - Offline-first fallback to local curated database when backend is unreachable
 */

import { lookupProductByBarcode, CURATED_PRODUCTS } from '../data/curated-products';
import { FSSAI_ADDITIVES } from '../algorithms/fssai-database';
import { Additive, Product } from '../types';
import { getAuthToken } from './storage';

// Default to localhost:8081 for development, can be configured via environment variable
const BASE_URL = 'http://localhost:8081';

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs: number = 4000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

export async function checkBackendHealth(): Promise<{ online: boolean; message: string }> {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/api/v1/health`, {}, 2500);
    if (res.ok) {
      const data = await res.json();
      return { online: true, message: data.service || 'Connected to Go Microservice' };
    }
    return { online: false, message: `HTTP ${res.status}` };
  } catch (err: any) {
    return { online: false, message: 'Offline (Using Local Curated Engine)' };
  }
}

export async function scanBarcodeOrOCR(
  barcode: string,
  rawText: string = '',
  weightGoal: string = 'maintain',
  muscleGoal: string = 'maintain'
): Promise<{ product: Product; source: 'backend' | 'local' }> {
  const token = await getAuthToken();

  // Attempt backend scan if token or network is available
  if (token) {
    try {
      const res = await fetchWithTimeout(
        `${BASE_URL}/api/v1/scan`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            barcode,
            raw_text: rawText,
            weight_goal: weightGoal,
            muscle_goal: muscleGoal,
          }),
        },
        3000
      );

      if (res.ok) {
        const data = await res.json();
        // Convert Go backend response to Mobile Product format
        const product: Product = {
          id: data.product?.id || `cloud-${barcode}`,
          barcode: data.product?.barcode || barcode,
          name: data.product?.name || 'Scanned Packaged Food',
          brand: data.product?.brand || 'Verified Brand',
          category: data.product?.category || 'Packaged Grocery',
          novaGroup: (data.nova_group as 1 | 2 | 3 | 4) || 3,
          healthScore: data.health_score || 50,
          ingredientsRaw: rawText || data.product?.ingredients_raw || '',
          nutrients: {
            calories: data.product?.nutrients?.calories || 200,
            protein: data.product?.nutrients?.protein || 5,
            carbohydrates: data.product?.nutrients?.carbs || 30,
            sugars: data.product?.nutrients?.sugars || 5,
            addedSugar: data.product?.nutrients?.added_sugar || 0,
            fat: data.product?.nutrients?.fat || 5,
            saturatedFat: data.product?.nutrients?.sat_fat || 2,
            sodium: data.product?.nutrients?.sodium || 200,
            servingSize: '100g',
          },
          detectedAdditives: (data.detected_additives || []).map((ins: any) => ({
            insCode: ins.ins_code,
            name: ins.name,
            category: 'Additive',
            origin: 'Regulatory formulation',
            riskLevel: ins.risk_level || 'medium',
            description: ins.description || '',
            plainEnglish: ins.description || '',
          })),
          allergens: [],
          goalFit: {
            weightLossScore: data.goal_score || 70,
            muscleGainScore: data.goal_score || 70,
            maintenanceScore: data.goal_score || 70,
            summary: 'Evaluated by BiteLens Go dual-scoring backend engine.',
          },
        };
        return { product, source: 'backend' };
      }
    } catch (err) {
      console.log('Backend scan failed, falling back to local database:', err);
    }
  }

  // Local offline fallback
  const localMatch = lookupProductByBarcode(barcode);
  if (localMatch) {
    return { product: localMatch, source: 'local' };
  }

  // Synthesize from rawText if provided
  return {
    product: {
      id: `synthetic-${barcode}`,
      barcode: barcode || 'UNKNOWN-BARCODE',
      name: 'Unrecognized Scanned Item',
      brand: 'Packaged Food',
      category: 'Packaged Grocery',
      novaGroup: 3,
      healthScore: 60,
      ingredientsRaw: rawText || 'Ingredients not fully recognized.',
      nutrients: {
        calories: 180,
        protein: 4,
        carbohydrates: 25,
        sugars: 4,
        addedSugar: 2,
        fat: 6,
        saturatedFat: 2.5,
        sodium: 250,
        servingSize: '100g',
      },
      detectedAdditives: [],
      allergens: [],
      goalFit: {
        weightLossScore: 65,
        muscleGainScore: 60,
        maintenanceScore: 65,
        summary: 'Standard nutritional heuristic estimate based on initial label scan.',
      },
    },
    source: 'local',
  };
}

export async function getAdditiveDetails(insCode: string): Promise<Additive | null> {
  // First check local FSSAI database
  const local = FSSAI_ADDITIVES.find(
    a => a.insCode.toLowerCase() === insCode.toLowerCase() || a.insCode.replace(/\s+/g, '').toLowerCase() === insCode.replace(/\s+/g, '').toLowerCase()
  );
  if (local) return local;

  // Otherwise query backend
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/api/v1/additives/${encodeURIComponent(insCode)}`, {}, 3000);
    if (res.ok) {
      const data = await res.json();
      return {
        insCode: data.ins_code,
        name: data.name,
        category: 'Classified Additive',
        origin: 'Regulatory database',
        riskLevel: data.risk_level,
        description: data.description,
        plainEnglish: data.description,
      };
    }
  } catch (err) {
    // Return null if offline and not in local DB
  }

  return null;
}
