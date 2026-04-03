"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import Fuse from 'fuse.js';
import { University } from '../types/university';

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
}

const UniversityContext = createContext<UniversityContextProps | undefined>(undefined);

export const UniversityProvider = ({ children }: { children: ReactNode }) => {
  const [universities, setUniversities] = useState<University[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedUniversityId, setSelectedUniversityId] = useState<string | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<string>('');

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
      } catch (err: any) {
        setError(err.message || 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUniversities();
    setSelectedUniversityId(null); // Clear selection when school changes
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
    if (!searchQuery.trim()) {
      return universities;
    }
    const results = fuse.search(searchQuery);
    return results.map(result => result.item);
  }, [searchQuery, universities, fuse]);

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

