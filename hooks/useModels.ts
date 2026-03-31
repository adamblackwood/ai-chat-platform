// خطاف النماذج: جلب النماذج المتاحة حسب المنصة ونوع المفتاح مع التخزين المؤقت
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { usePlatformStore } from '@/stores/platformStore';
import type { Model } from '@/types/platform';

interface CacheEntry {
  models: Model[];
  timestamp: number;
}

const CACHE_DURATION = 60 * 60 * 1000; // ساعة واحدة
const modelCache = new Map<string, CacheEntry>();

interface UseModelsReturn {
  models: Model[];
  isLoading: boolean;
  selectedModel: string;
  setSelectedModel: (id: string) => void;
  refreshModels: () => Promise<void>;
}

export function useModels(): UseModelsReturn {
  const { activePlatform, activeModel, apiType, setModel, setAvailableModels } =
    usePlatformStore();

  const [models, setModels] = useState<Model[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const lastFetchRef = useRef<string>('');

  /**
   * جلب النماذج
   */
  const fetchModels = useCallback(async () => {
    const cacheKey = `${activePlatform}:${apiType}`;

    // التحقق من التخزين المؤقت
    const cached = modelCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setModels(cached.models);
      setAvailableModels(cached.models);
      if (!activeModel && cached.models.length > 0) {
        const first = cached.models[0];
        if (first) setModel(first.id);
      }
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/models?platform=${activePlatform}&apiType=${apiType}`
      );

      if (!response.ok) {
        setModels([]);
        return;
      }

      const data = await response.json();

      let fetchedModels: Model[];

      if (Array.isArray(data)) {
        fetchedModels = data as Model[];
      } else {
        fetchedModels = [];
      }

      // تحديث التخزين المؤقت
      modelCache.set(cacheKey, {
        models: fetchedModels,
        timestamp: Date.now(),
      });

      setModels(fetchedModels);
      setAvailableModels(fetchedModels);

      // تحديد النموذج الأول إذا لم يكن هناك نموذج نشط
      if (!activeModel && fetchedModels.length > 0) {
        const first = fetchedModels[0];
        if (first) setModel(first.id);
      }
    } catch {
      setModels([]);
    } finally {
      setIsLoading(false);
    }
  }, [activePlatform, apiType, activeModel, setModel, setAvailableModels]);

  /**
   * تحديث النماذج (مسح الكاش)
   */
  const refreshModels = useCallback(async () => {
    const cacheKey = `${activePlatform}:${apiType}`;
    modelCache.delete(cacheKey);
    await fetchModels();
  }, [activePlatform, apiType, fetchModels]);

  /**
   * تحميل النماذج عند تغيير المنصة أو نوع المفتاح
   */
  useEffect(() => {
    const key = `${activePlatform}:${apiType}`;
    if (lastFetchRef.current !== key) {
      lastFetchRef.current = key;
      fetchModels();
    }
    return () => {};
  }, [activePlatform, apiType, fetchModels]);

  const setSelectedModel = useCallback(
    (id: string) => {
      setModel(id);
    },
    [setModel]
  );

  return {
    models,
    isLoading,
    selectedModel: activeModel,
    setSelectedModel,
    refreshModels,
  };
}
