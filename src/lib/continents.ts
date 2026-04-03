export const getContinent = (country: string): string => {
  const mapping: Record<string, string> = {
    // Africa
    'Morocco': 'Africa',
    'Namibia': 'Africa',
    'Ghana': 'Africa',
    'Malawi': 'Africa',
    'South Africa': 'Africa',
    'Egypt': 'Africa',
    'Kenya': 'Africa',
    
    // Asia
    'China': 'Asia',
    "China (People's Republic of)": 'Asia',
    'Hong Kong': 'Asia',
    'India': 'Asia',
    'Indonesia': 'Asia',
    'Japan': 'Asia',
    'Korea, Republic of': 'Asia',
    'South Korea': 'Asia',
    'Malaysia': 'Asia',
    'Philippines': 'Asia',
    'Singapore': 'Asia',
    'Taiwan': 'Asia',
    'Thailand': 'Asia',
    'Bhutan': 'Asia',
    'Vietnam': 'Asia',

    // Europe
    'Austria': 'Europe',
    'Belgium': 'Europe',
    'Bulgaria': 'Europe',
    'Croatia': 'Europe',
    'Cyprus': 'Europe',
    'Czech Republic': 'Europe',
    'Denmark': 'Europe',
    'Estonia': 'Europe',
    'Finland': 'Europe',
    'France': 'Europe',
    'Germany': 'Europe',
    'Greece': 'Europe',
    'Hungary': 'Europe',
    'Iceland': 'Europe',
    'Ireland': 'Europe',
    'Italy': 'Europe',
    'Latvia': 'Europe',
    'Liechtenstein': 'Europe',
    'Lithuania': 'Europe',
    'Luxembourg': 'Europe',
    'Malta': 'Europe',
    'Netherlands': 'Europe',
    'Norway': 'Europe',
    'Poland': 'Europe',
    'Portugal': 'Europe',
    'Romania': 'Europe',
    'Serbia': 'Europe',
    'Slovakia': 'Europe',
    'Slovenia': 'Europe',
    'Spain': 'Europe',
    'Sweden': 'Europe',
    'Switzerland': 'Europe',
    'Türkiye': 'Europe',
    'United Kingdom': 'Europe',

    // North America
    'Canada': 'North America',
    'Mexico': 'North America',
    'United States': 'North America',
    'Panama': 'North America',
    'Costa Rica': 'North America',

    // South America
    'Argentina': 'South America',
    'Brazil': 'South America',
    'Chile': 'South America',
    'Colombia': 'South America',
    'Peru': 'South America',
    'Uruguay': 'South America',

    // Oceania
    'Australia': 'Oceania',
    'New Zealand': 'Oceania'
  };

  return mapping[country] || 'Other';
};
