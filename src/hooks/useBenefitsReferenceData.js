import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../lib/api';

const CACHE_DURATION_MS = 5 * 60 * 1000;

const cache = {
  disabilities: { data: null, timestamp: 0, query: null },
  contentionTypes: { data: null, timestamp: 0 },
  specialIssues: { data: null, timestamp: 0, query: null },
  categories: { data: null, timestamp: 0 }
};

function isCacheValid(cacheEntry, query = null) {
  if (!cacheEntry.data) return false;
  if (Date.now() - cacheEntry.timestamp > CACHE_DURATION_MS) return false;
  if (query !== undefined && cacheEntry.query !== query) return false;
  return true;
}

const LOCAL_FALLBACK_DISABILITIES = [
  { id: 'ptsd', code: '9411', name: 'Post-traumatic stress disorder (PTSD)', category: 'Mental Disorders' },
  { id: 'mdd', code: '9434', name: 'Major depressive disorder', category: 'Mental Disorders' },
  { id: 'gad', code: '9400', name: 'Generalized anxiety disorder', category: 'Mental Disorders' },
  { id: 'tinnitus', code: '6260', name: 'Tinnitus', category: 'Auditory' },
  { id: 'hearing_loss', code: '6100', name: 'Hearing loss, bilateral', category: 'Auditory' },
  { id: 'lumbosacral_strain', code: '5237', name: 'Lumbosacral strain', category: 'Musculoskeletal - Spine' },
  { id: 'sleep_apnea', code: '6847', name: 'Sleep apnea syndromes', category: 'Respiratory' },
  { id: 'migraine', code: '8100', name: 'Migraine headaches', category: 'Neurological' }
];

const LOCAL_FALLBACK_CONTENTION_TYPES = [
  { id: 'new', code: 'NEW', name: 'New condition claim' },
  { id: 'increase', code: 'INC', name: 'Increase claim' },
  { id: 'secondary', code: 'SEC', name: 'Secondary condition claim' }
];

export function useDisabilitySearch(initialQuery = '') {
  const [query, setQuery] = useState(initialQuery);
  const [disabilities, setDisabilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [source, setSource] = useState(null);
  const abortControllerRef = useRef(null);

  const searchDisabilities = useCallback(async (searchQuery, category = null) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const cacheKey = `${searchQuery || ''}_${category || ''}`;
    if (isCacheValid(cache.disabilities, cacheKey)) {
      setDisabilities(cache.disabilities.data);
      setSource('cache');
      return cache.disabilities.data;
    }

    setLoading(true);
    setError(null);

    try {
      const params = {};
      if (searchQuery) params.query = searchQuery;
      if (category) params.category = category;

      const response = await api.get('/benefits-reference/disabilities', {
        params,
        signal: abortControllerRef.current.signal
      });

      const data = response.data?.data || [];
      setDisabilities(data);
      setSource(response.data?.source || 'api');
      
      cache.disabilities = {
        data,
        timestamp: Date.now(),
        query: cacheKey
      };

      return data;
    } catch (err) {
      if (err.name === 'AbortError' || err.name === 'CanceledError') {
        return;
      }
      
      console.warn('Benefits reference API error, using local fallback:', err.message);
      setError(err.message);
      setSource('fallback');
      
      let fallback = LOCAL_FALLBACK_DISABILITIES;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        fallback = fallback.filter(d => 
          d.name.toLowerCase().includes(q) || 
          d.code.includes(q)
        );
      }
      setDisabilities(fallback);
      return fallback;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchDisabilities(query);
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [query, searchDisabilities]);

  return {
    query,
    setQuery,
    disabilities,
    loading,
    error,
    source,
    refresh: () => searchDisabilities(query)
  };
}

export function useContentionTypes() {
  const [contentionTypes, setContentionTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [source, setSource] = useState(null);

  const fetchContentionTypes = useCallback(async () => {
    if (isCacheValid(cache.contentionTypes)) {
      setContentionTypes(cache.contentionTypes.data);
      setSource('cache');
      return cache.contentionTypes.data;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/benefits-reference/contention-types');
      const data = response.data?.data || [];
      setContentionTypes(data);
      setSource(response.data?.source || 'api');
      
      cache.contentionTypes = {
        data,
        timestamp: Date.now()
      };

      return data;
    } catch (err) {
      console.warn('Contention types API error, using local fallback:', err.message);
      setError(err.message);
      setSource('fallback');
      setContentionTypes(LOCAL_FALLBACK_CONTENTION_TYPES);
      return LOCAL_FALLBACK_CONTENTION_TYPES;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContentionTypes();
  }, [fetchContentionTypes]);

  return {
    contentionTypes,
    loading,
    error,
    source,
    refresh: fetchContentionTypes
  };
}

export function useSpecialIssues(searchQuery = '') {
  const [specialIssues, setSpecialIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [source, setSource] = useState(null);

  const fetchSpecialIssues = useCallback(async (query = '') => {
    const cacheKey = query || '';
    if (isCacheValid(cache.specialIssues, cacheKey)) {
      setSpecialIssues(cache.specialIssues.data);
      setSource('cache');
      return cache.specialIssues.data;
    }

    setLoading(true);
    setError(null);

    try {
      const params = query ? { query } : {};
      const response = await api.get('/benefits-reference/special-issues', { params });
      const data = response.data?.data || [];
      setSpecialIssues(data);
      setSource(response.data?.source || 'api');
      
      cache.specialIssues = {
        data,
        timestamp: Date.now(),
        query: cacheKey
      };

      return data;
    } catch (err) {
      console.warn('Special issues API error:', err.message);
      setError(err.message);
      setSource('fallback');
      setSpecialIssues([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSpecialIssues(searchQuery);
  }, [searchQuery, fetchSpecialIssues]);

  return {
    specialIssues,
    loading,
    error,
    source,
    refresh: () => fetchSpecialIssues(searchQuery)
  };
}

export function useDisabilityCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    if (isCacheValid(cache.categories)) {
      setCategories(cache.categories.data);
      return cache.categories.data;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/benefits-reference/categories');
      const data = response.data?.data || [];
      setCategories(data);
      
      cache.categories = {
        data,
        timestamp: Date.now()
      };

      return data;
    } catch (err) {
      console.warn('Categories API error:', err.message);
      setError(err.message);
      const fallbackCategories = [...new Set(LOCAL_FALLBACK_DISABILITIES.map(d => d.category))];
      setCategories(fallbackCategories);
      return fallbackCategories;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    refresh: fetchCategories
  };
}

export function clearBenefitsReferenceCache() {
  cache.disabilities = { data: null, timestamp: 0, query: null };
  cache.contentionTypes = { data: null, timestamp: 0 };
  cache.specialIssues = { data: null, timestamp: 0, query: null };
  cache.categories = { data: null, timestamp: 0 };
}

export default {
  useDisabilitySearch,
  useContentionTypes,
  useSpecialIssues,
  useDisabilityCategories,
  clearBenefitsReferenceCache
};
