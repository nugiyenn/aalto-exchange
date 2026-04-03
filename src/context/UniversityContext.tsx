"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode, useRef } from 'react';
import Fuse from 'fuse.js';
import { useRouter, useSearchParams } from 'next/navigation';
import { University } from '../types/university';
import { getContinent } from '../lib/continents';

interface UniversityContextProps {
  universities: University[];
  filteredUniversities: University[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedUniversityId: string | null;
  setSelectedUniversityId: (id: string | null) => void;
  selectedSchool: string;
  setSelectedSchool: (schoolId: string) => void;
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
  shortlist: string[];
  addToShortlist: (id: string) => void;
  removeFromShortlist: (id: string) => void;
  clearShortlist: () => void;
}

const UniversityContext = createContext<UniversityContextProps | undefined>(undefined);

export const UniversityProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uniParam = searchParams.get('uni');
  const topParam = searchParams.get('top');

  const [universities, setUniversities] = useState<University[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Initialize from URL if present
  const [selectedUniversityId, setSelectedUniversityIdState] = useState<string | null>(uniParam);
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [shortlist, setShortlist] = useState<string[]>(
    topParam ? topParam.split(',').filter(Boolean) : []
  );
  
  const isFirstRender = useRef(true);

  // Update URL when selected university changes
  const setSelectedUniversityId = (id: string | null) => {
    setSelectedUniversityIdState(id);
    
    // Update the URL without a hard reload
    if (id) {
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set('uni', id);
      router.push(`/?${newParams.toString()}`, { scroll: false });
    } else {
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete('uni');
      // If there are no other params, just go to root
      const paramString = newParams.toString();
      router.push(paramString ? `/?${paramString}` : '/', { scroll: false });
    }
  };

  // Sync state if URL changes (e.g., user hits Back button)
  useEffect(() => {
    if (uniParam !== selectedUniversityId) {
      setSelectedUniversityIdState(uniParam);
    }
  }, [uniParam, selectedUniversityId]);

  useEffect(() => {
    const currentTop = topParam ? topParam.split(',').filter(Boolean) : [];
    if (currentTop.join(',') !== shortlist.join(',')) {
      setShortlist(currentTop);
    }
  }, [topParam, shortlist]);

  const updateShortlistUrl = (newShortlist: string[]) => {
    const newParams = new URLSearchParams(searchParams.toString());
    if (newShortlist.length > 0) {
      newParams.set('top', newShortlist.join(','));
    } else {
      newParams.delete('top');
    }
    const paramString = newParams.toString();
    router.push(paramString ? `/?${paramString}` : '/', { scroll: false });
  };

  const addToShortlist = (id: string) => {
    if (shortlist.length < 3 && !shortlist.includes(id)) {
      const newShortlist = [...shortlist, id];
      setShortlist(newShortlist);
      updateShortlistUrl(newShortlist);
    }
  };

  const removeFromShortlist = (id: string) => {
    const newShortlist = shortlist.filter(item => item !== id);
    setShortlist(newShortlist);
    updateShortlistUrl(newShortlist);
  };

  const clearShortlist = () => {
    setShortlist([]);
    updateShortlistUrl([]);
  };

  useEffect(() => {
    const fetchUniversities = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/fetch-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ schoolId: selectedSchool || undefined }),
        });
        if (!response.ok) {
          throw new Error('Failed to fetch university data');
        }
        const data: University[] = await response.json();
        setUniversities(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || 'An unknown error occurred');
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUniversities();
    
    if (isFirstRender.current) {
      isFirstRender.current = false;
    } else {
      setSelectedUniversityId(null); // Clear selection when school changes
    }
  }, [selectedSchool]);

  // Initialize Fuse instance when universities load
  const fuse = useMemo(() => {
    return new Fuse(universities, {
      keys: [
        'universityname',
        'country_fullname',
        // According to the MoveON data shape, City is stored deep in institutions.
        // Fuse can automatically search nested arrays of objects.
        'informatics.institutions.fullname',
        'studyOpportunity'
      ],
      threshold: 0.3, // 0.0 is perfect match, 1.0 is anything
      ignoreLocation: true,
      includeScore: true,
    });
  }, [universities]);

  const filteredUniversities = useMemo(() => {
    let results = universities;

    if (searchQuery.trim()) {
      results = fuse.search(searchQuery).map(result => result.item);
    }

    if (selectedRegion) {
      results = results.filter(uni => {
        const country = uni.country_fullname || uni.country;
        return getContinent(country) === selectedRegion;
      });
    }

    return results;
  }, [searchQuery, universities, fuse, selectedRegion]);

  return (
    <UniversityContext.Provider
      value={{
        universities,
        filteredUniversities,
        isLoading,
        error,
        searchQuery,
        setSearchQuery,
        selectedUniversityId,
        setSelectedUniversityId,
        selectedSchool,
        setSelectedSchool,
        selectedRegion,
        setSelectedRegion,
        shortlist,
        addToShortlist,
        removeFromShortlist,
        clearShortlist,
      }}
    >
      {children}
    </UniversityContext.Provider>
  );
};

export const useUniversityContext = () => {
  const context = useContext(UniversityContext);
  if (context === undefined) {
    throw new Error('useUniversityContext must be used within a UniversityProvider');
  }
  return context;
};

