import { useState } from "react";
import { Filters, Perfume } from "../types";

const defaultFilters: Filters = {
    gender: 'tous',
    intensity: 'tous',
    brand: 'tous',
};

interface UseFilters {
    filters: Filters;
    setGender: (gender: Filters['gender']) => void;
    setIntensity: (intensity: Filters['intensity']) => void;
    setBrand: (brand: string) => void;
    resetFilters: () => void;
    applyFilters: (perfumes: Perfume[]) => Perfume[];
    activeCount: number;
}

export const useFilters = (): UseFilters => {
    const [filters, setFilters] = useState<Filters>(defaultFilters);
    const setGender = (gender: Filters['gender']) => setFilters(prev => ({ ...prev, gender }));
    const setIntensity = (intensity: Filters['intensity']) => setFilters(prev => ({ ...prev, intensity }));
    const setBrand = (brand: string) => setFilters(prev => ({ ...prev, brand }));
    const resetFilters = () => setFilters(defaultFilters);
    const applyFilters = (perfumes: Perfume[]) => {
        return perfumes.filter(perfume => {
            const genderMatch = filters.gender === 'tous' || perfume.gender === filters.gender;
            const intensityMatch = filters.intensity === 'tous' || perfume.intensity === filters.intensity;
            const brandMatch = filters.brand === 'tous' || perfume.brand.toLowerCase().includes(filters.brand.toLowerCase());
            return genderMatch && intensityMatch && brandMatch;
        });
    };

    const activeCount = [
        filters.gender !== 'tous',
        filters.intensity !== 'tous',
        filters.brand !== 'tous',
    ].filter(Boolean).length;

    return {
        filters,
        setGender,
        setIntensity,
        setBrand,
        resetFilters,
        applyFilters,
        activeCount
    };
}