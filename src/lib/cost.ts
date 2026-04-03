import costData from '../data/cost-tiers.json';

export interface CostTier {
  tier: 1 | 2 | 3 | 4;
  label: string;
  color: string;
}

export const getCostTier = (country: string, universityName: string): CostTier | null => {
  const c = country.trim();
  const u = universityName.toLowerCase();

  let tierValue: 1 | 2 | 3 | 4 | null = null;

  // 1. Check City overrides first (e.g., if university name contains "London" or "Paris")
  for (const [city, tier] of Object.entries(costData.cities)) {
    if (u.includes(city.toLowerCase())) {
      tierValue = tier as 1 | 2 | 3 | 4;
      break;
    }
  }

  // 2. Fallback to Country
  if (!tierValue) {
    for (const [mappedCountry, tier] of Object.entries(costData.countries)) {
      if (c === mappedCountry || c.includes(mappedCountry)) {
        tierValue = tier as 1 | 2 | 3 | 4;
        break;
      }
    }
  }

  if (!tierValue) return null;

  const tierInfo = costData.tiers[tierValue.toString() as keyof typeof costData.tiers];
  
  return {
    tier: tierValue,
    label: tierInfo.label,
    color: tierInfo.color
  };
};
