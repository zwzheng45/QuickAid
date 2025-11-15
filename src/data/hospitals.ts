export interface Hospital {
  id: string;
  name: string;
  type: 'A&E' | 'UTC';
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  acceptedInsurances: string[]; // Array of accepted insurance names
  currentWaitTime: number; // in minutes
  openingHours: string;
  phone: string;
}

export const mockHospitals: Hospital[] = [
  {
    id: '1',
    name: "St Thomas' Hospital",
    type: 'A&E',
    address: 'Westminster Bridge Road, London SE1 7EH',
    coordinates: { lat: 51.4989, lng: -0.1179 },
    acceptedInsurances: ['IHS'],
    currentWaitTime: 255,
    openingHours: '24/7',
    phone: '020 7188 7188'
  },
  {
    id: '2',
    name: 'Chelsea and Westminster Hospital',
    type: 'A&E',
    address: '369 Fulham Road, London SW10 9NH',
    coordinates: { lat: 51.4811, lng: -0.1836 },
    acceptedInsurances: ['IHS', 'Bupa', 'Aviva'],
    currentWaitTime: 240,
    openingHours: '24/7',
    phone: '020 3315 8000'
  },
  {
    id: '3',
    name: "King's College Hospital",
    type: 'A&E',
    address: 'Denmark Hill, London SE5 9RS',
    coordinates: { lat: 51.4686, lng: -0.0933 },
    acceptedInsurances: ['IHS'],
    currentWaitTime: 465,
    openingHours: '24/7',
    phone: '020 3299 9000'
  },
  {
    id: '4',
    name: "St George's Hospital",
    type: 'A&E',
    address: 'Blackshaw Road, Tooting, London SW17 0QT',
    coordinates: { lat: 51.4275, lng: -0.1732 },
    acceptedInsurances: ['IHS'],
    currentWaitTime: 375,
    openingHours: '24/7',
    phone: '020 8672 1255'
  },
  {
    id: '5',
    name: 'Wandsworth Urgent Treatment Centre',
    type: 'UTC',
    address: 'St John\'s Hill, Wandsworth, London SW11 1SA',
    coordinates: { lat: 51.4616, lng: -0.1747 },
    acceptedInsurances: ['IHS'],
    currentWaitTime: 225,
    openingHours: '08:00 - 20:00',
    phone: '020 3513 6900'
  },
  {
    id: '6',
    name: "Guy's Hospital",
    type: 'A&E',
    address: 'Great Maze Pond, London SE1 9RT',
    coordinates: { lat: 51.5033, lng: -0.0878 },
    acceptedInsurances: ['IHS'],
    currentWaitTime: 285,
    openingHours: '24/7',
    phone: '020 7188 7188'
  },
  {
    id: '7',
    name: 'Royal Free Hospital',
    type: 'A&E',
    address: 'Pond Street, Hampstead, London NW3 2QG',
    coordinates: { lat: 51.5506, lng: -0.1656 },
    acceptedInsurances: ['IHS', 'Bupa', 'Aviva'],
    currentWaitTime: 420,
    openingHours: '24/7',
    phone: '020 7794 0500'
  },
  {
    id: '8',
    name: 'University College Hospital',
    type: 'A&E',
    address: '235 Euston Road, London NW1 2BU',
    coordinates: { lat: 51.5246, lng: -0.1340 },
    acceptedInsurances: ['IHS'],
    currentWaitTime: 300,
    openingHours: '24/7',
    phone: '020 3456 7890'
  },
  {
    id: '9',
    name: 'Whittington Hospital',
    type: 'A&E',
    address: 'Magdala Avenue, London N19 5NF',
    coordinates: { lat: 51.5648, lng: -0.1365 },
    acceptedInsurances: ['IHS'],
    currentWaitTime: 225,
    openingHours: '24/7',
    phone: '020 7272 3070'
  },
  {
    id: '10',
    name: 'North Middlesex Hospital',
    type: 'A&E',
    address: 'Sterling Way, London N18 1QX',
    coordinates: { lat: 51.6157, lng: -0.0726 },
    acceptedInsurances: ['IHS'],
    currentWaitTime: 540,
    openingHours: '24/7',
    phone: '020 8887 2000'
  },
  {
    id: '11',
    name: 'Hammersmith Hospital',
    type: 'A&E',
    address: 'Du Cane Road, London W12 0HS',
    coordinates: { lat: 51.5174, lng: -0.2358 },
    acceptedInsurances: ['IHS', 'Bupa', 'Aviva'],
    currentWaitTime: 280,
    openingHours: '24/7',
    phone: '020 3313 1000'
  },
  {
    id: '12',
    name: 'Newham University Hospital',
    type: 'A&E',
    address: 'Glen Road, London E13 8SL',
    coordinates: { lat: 51.5244, lng: 0.0331 },
    acceptedInsurances: ['IHS'],
    currentWaitTime: 420,
    openingHours: '24/7',
    phone: '020 7476 4000'
  },
  {
    id: '13',
    name: 'Ealing Urgent Care Centre',
    type: 'UTC',
    address: 'Uxbridge Road, Southall UB1 3HW',
    coordinates: { lat: 51.5077, lng: -0.3782 },
    acceptedInsurances: ['IHS'],
    currentWaitTime: 195,
    openingHours: '08:00 - 22:00',
    phone: '020 8967 5000'
  },
  {
    id: '14',
    name: 'Barking Hospital',
    type: 'UTC',
    address: 'Upney Lane, Barking IG11 9LX',
    coordinates: { lat: 51.5393, lng: 0.1199 },
    acceptedInsurances: ['IHS'],
    currentWaitTime: 180,
    openingHours: '07:00 - 21:00',
    phone: '020 8983 8000'
  },
  {
    id: '15',
    name: 'Queen Elizabeth Hospital',
    type: 'A&E',
    address: 'Stadium Road, London SE18 4QH',
    coordinates: { lat: 51.4897, lng: 0.0533 },
    acceptedInsurances: ['IHS'],
    currentWaitTime: 320,
    openingHours: '24/7',
    phone: '020 8836 6000'
  },
  {
    id: '16',
    name: 'Lewisham Hospital',
    type: 'A&E',
    address: 'Lewisham High Street, London SE13 6LH',
    coordinates: { lat: 51.4646, lng: -0.0145 },
    acceptedInsurances: ['IHS'],
    currentWaitTime: 390,
    openingHours: '24/7',
    phone: '020 8333 3000'
  },
  {
    id: '17',
    name: 'St Mary\'s Hospital',
    type: 'A&E',
    address: 'Praed Street, London W2 1NY',
    coordinates: { lat: 51.5173, lng: -0.1755 },
    acceptedInsurances: ['IHS', 'Bupa', 'Aviva'],
    currentWaitTime: 270,
    openingHours: '24/7',
    phone: '020 3312 6666'
  },
  {
    id: '18',
    name: 'Croydon University Hospital',
    type: 'A&E',
    address: '530 London Road, Croydon CR7 7YE',
    coordinates: { lat: 51.3738, lng: -0.0977 },
    acceptedInsurances: ['IHS'],
    currentWaitTime: 490,
    openingHours: '24/7',
    phone: '020 8401 3000'
  },
  {
    id: '19',
    name: 'Kingston Hospital',
    type: 'A&E',
    address: 'Galsworthy Road, Kingston upon Thames KT2 7QB',
    coordinates: { lat: 51.4145, lng: -0.2934 },
    acceptedInsurances: ['IHS', 'Bupa', 'Aviva'],
    currentWaitTime: 270,
    openingHours: '24/7',
    phone: '020 8546 7711'
  },
  {
    id: '20',
    name: 'Hillingdon Hospital',
    type: 'A&E',
    address: 'Pield Heath Road, Uxbridge UB8 3NN',
    coordinates: { lat: 51.5335, lng: -0.4638 },
    acceptedInsurances: ['IHS'],
    currentWaitTime: 405,
    openingHours: '24/7',
    phone: '020 8895 5000'
  },
  {
    id: '21',
    name: 'Charing Cross Hospital',
    type: 'A&E',
    address: 'Fulham Palace Road, London W6 8RF',
    coordinates: { lat: 51.4888, lng: -0.2178 },
    acceptedInsurances: ['IHS'],
    currentWaitTime: 330,
    openingHours: '24/7',
    phone: '020 3311 1234'
  },
  {
    id: '22',
    name: 'Bromley Urgent Care Centre',
    type: 'UTC',
    address: 'Cromwell Avenue, Bromley BR2 9AJ',
    coordinates: { lat: 51.4072, lng: 0.0170 },
    acceptedInsurances: ['IHS'],
    currentWaitTime: 225,
    openingHours: '08:00 - 20:00',
    phone: '020 8466 6600'
  },
  {
    id: '23',
    name: 'Central Middlesex Hospital',
    type: 'UTC',
    address: 'Acton Lane, London NW10 7NS',
    coordinates: { lat: 51.5383, lng: -0.2604 },
    acceptedInsurances: ['IHS'],
    currentWaitTime: 225,
    openingHours: '08:00 - 22:00',
    phone: '020 8965 5733'
  },
  {
    id: '24',
    name: 'Homerton Hospital',
    type: 'A&E',
    address: 'Homerton Row, London E9 6SR',
    coordinates: { lat: 51.5485, lng: -0.0425 },
    acceptedInsurances: ['IHS'],
    currentWaitTime: 360,
    openingHours: '24/7',
    phone: '020 8510 5555'
  },
  {
    id: '25',
    name: 'West Middlesex Hospital',
    type: 'A&E',
    address: 'Twickenham Road, Isleworth TW7 6AF',
    coordinates: { lat: 51.4731, lng: -0.3273 },
    acceptedInsurances: ['IHS'],
    currentWaitTime: 315,
    openingHours: '24/7',
    phone: '020 8560 2121'
  }
];
