import { api } from './client';

export interface TimeZone {
  id: number;
  code: string;
  name: string;
  label: string;
  iana_name: string;
  observes_dst: boolean;
  current_abbreviation: string;
  utc_offset_label: string;
}

export interface TimeZonesResponse {
  time_zones: TimeZone[];
  default_timezone?: TimeZone;
}

let cachedTimeZonesResponse: TimeZonesResponse | null = null;

export const timeZonesApi = {
  getTimeZones: async (forceRefresh = false): Promise<TimeZonesResponse> => {
    if (!forceRefresh && cachedTimeZonesResponse) {
      return cachedTimeZonesResponse;
    }
    try {
      const data = await api.get<TimeZonesResponse>('/time_zones');
      if (data) {
        cachedTimeZonesResponse = data;
      }
      return data;
    } catch (error) {
      console.warn('Failed to fetch time_zones from API:', error);
      throw error;
    }
  },
};

/**
 * Maps a US 5-digit zip code to its primary time zone code:
 * AKT, HT, PT, MST, MT, CT, ET
 */
export const getTimeZoneCodeFromZipCode = (zipCode?: string | null): string | null => {
  if (!zipCode) return null;
  const digits = zipCode.replace(/\D/g, '').slice(0, 5);
  if (digits.length < 3) return null;

  const prefix3 = parseInt(digits.slice(0, 3), 10);
  if (isNaN(prefix3)) return null;

  // Alaska: 995 - 999
  if (prefix3 >= 995 && prefix3 <= 999) return 'AKT';

  // Hawaii: 967 - 968
  if (prefix3 === 967 || prefix3 === 968) return 'HT';

  // Arizona: 850 - 865 (no DST -> MST)
  if (prefix3 >= 850 && prefix3 <= 865) return 'MST';

  // Pacific (PT):
  // CA: 900-961
  // OR: 970-979
  // WA: 980-994
  // NV: 890-898
  // Northern ID: 835, 838
  if (
    (prefix3 >= 900 && prefix3 <= 961) ||
    (prefix3 >= 970 && prefix3 <= 979) ||
    (prefix3 >= 980 && prefix3 <= 994) ||
    (prefix3 >= 890 && prefix3 <= 898) ||
    prefix3 === 835 ||
    prefix3 === 838
  ) {
    return 'PT';
  }

  // Mountain (MT):
  // CO: 800-816
  // WY: 820-831
  // ID: 832-834, 836-837
  // UT: 840-847
  // NM: 870-884
  // MT: 590-599
  // West TX (El Paso): 798-799
  // Western ND/SD: 586, 577
  if (
    (prefix3 >= 800 && prefix3 <= 816) ||
    (prefix3 >= 820 && prefix3 <= 831) ||
    (prefix3 >= 832 && prefix3 <= 834) ||
    (prefix3 >= 836 && prefix3 <= 837) ||
    (prefix3 >= 840 && prefix3 <= 847) ||
    (prefix3 >= 870 && prefix3 <= 884) ||
    (prefix3 >= 590 && prefix3 <= 599) ||
    prefix3 === 798 ||
    prefix3 === 799 ||
    prefix3 === 586 ||
    prefix3 === 577
  ) {
    return 'MT';
  }

  // Central (CT):
  // AL: 350-369
  // AR: 716-729
  // IL: 600-629
  // IA: 500-528
  // KS: 660-679
  // LA: 700-715
  // MN: 550-567
  // MS: 386-397
  // MO: 630-658
  // NE: 680-693
  // ND: 580-585, 587-588
  // OK: 730-749
  // SD: 570-576
  // TN (western/middle): 370-372, 375, 380-385
  // TX: 750-797
  // WI: 530-549
  // KY (western): 420-424
  // FL (panhandle): 324
  if (
    (prefix3 >= 350 && prefix3 <= 369) ||
    (prefix3 >= 716 && prefix3 <= 729) ||
    (prefix3 >= 600 && prefix3 <= 629) ||
    (prefix3 >= 500 && prefix3 <= 528) ||
    (prefix3 >= 660 && prefix3 <= 679) ||
    (prefix3 >= 700 && prefix3 <= 715) ||
    (prefix3 >= 550 && prefix3 <= 567) ||
    (prefix3 >= 386 && prefix3 <= 397) ||
    (prefix3 >= 630 && prefix3 <= 658) ||
    (prefix3 >= 680 && prefix3 <= 693) ||
    (prefix3 >= 580 && prefix3 <= 585) ||
    prefix3 === 587 ||
    prefix3 === 588 ||
    (prefix3 >= 730 && prefix3 <= 749) ||
    (prefix3 >= 570 && prefix3 <= 576) ||
    (prefix3 >= 370 && prefix3 <= 372) ||
    prefix3 === 375 ||
    (prefix3 >= 380 && prefix3 <= 385) ||
    (prefix3 >= 750 && prefix3 <= 797) ||
    (prefix3 >= 530 && prefix3 <= 549) ||
    (prefix3 >= 420 && prefix3 <= 424) ||
    prefix3 === 324
  ) {
    return 'CT';
  }

  // Eastern (ET):
  // New England: 010-069
  // NY/NJ/PA/DE: 070-199
  // DC/MD/VA/WV: 200-269
  // NC/SC/GA/FL: 270-349
  // TN (eastern): 373-374, 376-379
  // KY (eastern): 400-419, 425-427
  // OH/IN/MI: 430-499
  if (
    (prefix3 >= 10 && prefix3 <= 349) ||
    (prefix3 >= 373 && prefix3 <= 374) ||
    (prefix3 >= 376 && prefix3 <= 379) ||
    (prefix3 >= 400 && prefix3 <= 419) ||
    (prefix3 >= 425 && prefix3 <= 427) ||
    (prefix3 >= 430 && prefix3 <= 499)
  ) {
    return 'ET';
  }

  return null;
};

export const findTimeZoneByCode = (code: string, timeZones: TimeZone[]): TimeZone | undefined => {
  return timeZones.find(tz => tz.code.toUpperCase() === code.toUpperCase());
};

