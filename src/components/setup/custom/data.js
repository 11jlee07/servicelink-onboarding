/* ─── Product catalog ─────────────────────────────────────────────── */
export const PRODUCT_GROUPS = [
  {
    id: 'traditionalInterior',
    label: 'Traditional Interior Appraisals',
    subgroups: [{
      label: '',
      products: [
        '1004 Single Family Interior Group',
        'FHA 1004 Single Family Interior Group',
        '1004 Hybrid Group',
        '1073 Condo Interior Group',
        'FHA 1073 Condo Interior Group',
        'Co-Op – 2090 – Interior Group',
        'FHA Co-Op – 2090 – Interior Group',
        'Manufactured Home – 1004C',
        'FHA Manufactured Home – 1004C Group',
      ],
    }],
  },
  {
    id: 'traditionalExterior',
    label: 'Traditional Exterior Appraisals',
    subgroups: [{
      label: '',
      products: [
        '2055 Single Family Exterior Group',
        'FHA 2055 Single Family Exterior Group',
        '1075 Condo Exterior Group',
        'FHA 1075 Condo Exterior Group',
        'Co-Op – 2095 – Exterior Group',
        'FHA Co-Op – 2095 – Exterior Group',
      ],
    }],
  },
  {
    id: 'hybrid',
    label: 'Hybrid Valuation Products',
    subgroups: [{
      label: '',
      products: [
        '1004 Desktop Group',
        'BoA Desktop Valuation (Panel)',
      ],
    }],
  },
  {
    id: 'multiFamily',
    label: 'Multi-Family Appraisals',
    subgroups: [{
      label: '2–4 unit properties',
      products: [
        'Multi Unit – 1025 – 2 Unit',
        'Multi Unit – 1025 – 3 Unit',
        'Multi Unit – 1025 – 4 Unit',
        'FHA Multi-Family – 1025 – 2 Unit Group',
        'FHA Multi-Family – 1025 – 3 Unit Group',
        'FHA Multi-Family – 1025 – 4 Unit Group',
      ],
    }],
  },
  {
    id: 'landSpecial',
    label: 'Land & Special-Use Appraisals',
    subgroups: [{
      label: '',
      products: [
        'Land Appraisal Group',
        'FHA Land Appraisal Group',
        'USDA Group',
        'Plan and Specs',
      ],
    }],
  },
  {
    id: 'desktopReview',
    label: 'Desktop Reviews',
    subgroups: [{
      label: '',
      products: [
        'Field Review 2000 Group',
        'FHA Field Review 2000 Group',
        'Desk Review Group',
        'FHA Desk Review Group',
        'FHA Appraisal Update – 1004D Group',
      ],
    }],
  },
  {
    id: 'inspectionOnly',
    label: 'Inspection-Only / Condition Reports',
    subgroups: [{
      label: '',
      products: [
        'Occupancy Inspection Report',
        'Disaster Inspection Group',
      ],
    }],
  },
  {
    id: 'govAgency',
    label: 'Government / Agency-Specific Forms',
    subgroups: [{
      label: '',
      products: [
        'FNMA 2065 Group',
        'FNMA 2075 Group',
        'FHLMC 2070 Group',
        'FHLMC 704 Group',
      ],
    }],
  },
  {
    id: 'rentalIncome',
    label: 'Rental & Income Analysis Products',
    subgroups: [{
      label: '',
      products: [
        'Rental Survey / Operating Income Statement',
      ],
    }],
  },
];

export const ALL_PRODUCTS = PRODUCT_GROUPS.flatMap((g) =>
  g.subgroups.flatMap((s) => s.products)
);

/* ─── Fee category logic ──────────────────────────────────────────── */
export function categorizeProducts(selectedProducts) {
  const cats = {
    traditionalInterior: [],
    traditionalExterior: [],
    hybrid: [],
    multiFamily: [],
    landSpecial: [],
    desktopReview: [],
    inspectionOnly: [],
    govAgency: [],
    rentalIncome: [],
  };

  for (const p of selectedProducts) {
    const u = p.toLowerCase();
    if (u.includes('interior') || u.includes('hybrid') || u.includes('1004c') || u.includes('manufactured')) {
      cats.traditionalInterior.push(p);
    } else if (u.includes('exterior') || u.includes('2055') || u.includes('1075')) {
      cats.traditionalExterior.push(p);
    } else if (u.includes('desktop group') || u.includes('boa desktop')) {
      cats.hybrid.push(p);
    } else if (u.includes('1025') || u.includes('multi unit') || u.includes('multi-family')) {
      cats.multiFamily.push(p);
    } else if (u.includes('land') || u.includes('usda') || u.includes('plan and specs')) {
      cats.landSpecial.push(p);
    } else if (u.includes('field review') || u.includes('desk review') || u.includes('1004d')) {
      cats.desktopReview.push(p);
    } else if (u.includes('occupancy') || u.includes('disaster')) {
      cats.inspectionOnly.push(p);
    } else if (u.includes('fnma') || u.includes('fhlmc')) {
      cats.govAgency.push(p);
    } else if (u.includes('rental') || u.includes('operating income')) {
      cats.rentalIncome.push(p);
    }
  }

  return cats;
}

/* ─── US states ───────────────────────────────────────────────────── */
export const US_STATES = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' }, { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' }, { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' }, { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' }, { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' }, { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' }, { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' }, { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' }, { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' },
];

/* ─── County data for major states ───────────────────────────────── */
export const COUNTIES = {
  TX: ['Harris','Dallas','Tarrant','Bexar','Travis','Collin','Hidalgo','El Paso','Denton','Fort Bend','Montgomery','Williamson','Cameron','Nueces','Brazoria','Bell','Galveston','Lubbock','Jefferson','Webb','Hays','Smith','Brazos','Johnson','McLennan','Midland','Ector','Guadalupe','Parker','Comal'],
  CA: ['Los Angeles','San Diego','Orange','Riverside','San Bernardino','Santa Clara','Alameda','Sacramento','Contra Costa','Fresno','Kern','San Francisco','Ventura','San Mateo','San Joaquin','Sonoma','Tulare','Stanislaus','Marin','Napa','Placer','Shasta','Santa Barbara','El Dorado','Yolo'],
  FL: ['Miami-Dade','Broward','Palm Beach','Hillsborough','Orange','Pinellas','Duval','Lee','Polk','Brevard','Volusia','Pasco','Seminole','Sarasota','Manatee','Collier','Osceola','St. Johns','Lake','Alachua','Marion','Escambia','St. Lucie','Flagler','Hernando'],
  NY: ['Kings','Queens','New York','Suffolk','Nassau','Bronx','Westchester','Erie','Monroe','Richmond','Onondaga','Rockland','Albany','Dutchess','Orange','Saratoga','Niagara','Oneida','Rensselaer','Ulster'],
  IL: ['Cook','DuPage','Lake','Will','Kane','McHenry','Winnebago','St. Clair','Champaign','Sangamon','Madison','Peoria','McLean','Kendall','Kankakee','Rock Island','Tazewell','DeKalb','Macon','Vermilion'],
  GA: ['Fulton','DeKalb','Gwinnett','Cobb','Clayton','Cherokee','Forsyth','Hall','Henry','Paulding','Richmond','Chatham','Clarke','Muscogee','Bibb','Columbia','Houston','Carroll','Coweta','Fayette'],
  OH: ['Franklin','Cuyahoga','Hamilton','Summit','Montgomery','Lucas','Butler','Stark','Lorain','Mahoning','Warren','Lake','Medina','Delaware','Clermont','Licking','Trumbull','Greene','Union','Wayne'],
  PA: ['Philadelphia','Allegheny','Montgomery','Bucks','Delaware','Chester','Lancaster','York','Berks','Westmoreland','Luzerne','Lehigh','Northampton','Erie','Dauphin','Lackawanna','Chester','Cambria','Cumberland','Blair'],
  NC: ['Mecklenburg','Wake','Guilford','Forsyth','Cumberland','Durham','Buncombe','Union','Cabarrus','Iredell','Gaston','Johnston','Catawba','Onslow','New Hanover','Davidson','Alamance','Randolph','Rowan','Pitt'],
  TN: ['Shelby','Davidson','Knox','Hamilton','Rutherford','Williamson','Montgomery','Sumner','Wilson','Maury','Sullivan','Blount','Washington','Bradley','Madison','Sevier','Roane','Anderson','Putnam','Murfreesboro'],
  AZ: ['Maricopa','Pima','Pinal','Yavapai','Yuma','Coconino','Mohave','Navajo','Cochise','Apache','Graham','Santa Cruz','Gila','La Paz','Greenlee'],
  CO: ['El Paso','Denver','Jefferson','Arapahoe','Adams','Larimer','Weld','Douglas','Boulder','Pueblo','Broomfield','Mesa','Garfield','Eagle','Summit','Fremont','Montrose'],
  WA: ['King','Pierce','Snohomish','Spokane','Clark','Thurston','Kitsap','Whatcom','Benton','Skagit','Yakima','Cowlitz','Grant','Franklin','Island','Lewis','Mason'],
  MI: ['Wayne','Oakland','Macomb','Kent','Genesee','Washtenaw','Ingham','Ottawa','Kalamazoo','Saginaw','Jackson','Muskegon','Bay','Berrien','Calhoun','Livingston','Monroe','St. Clair','Midland'],
  VA: ['Fairfax','Prince William','Loudoun','Chesterfield','Henrico','Virginia Beach city','Norfolk city','Arlington','Chesapeake city','Richmond city','Roanoke city','Hampton city','Newport News city','Alexandria city'],
};
