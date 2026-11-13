// Multilingual Questionnaire Data (English / Español)
// Reference: Docketwise Intake & Client Portal (DEMO / SIMULATED)

export const MOCK_BILINGUAL_SECTIONS = [
  {
    id: 'sec-demographics',
    title_en: 'Part 1: Personal Demographics & Identity',
    title_es: 'Parte 1: Datos Demográficos e Identidad Personal',
    description_en: 'Biographical details required by Form I-130, Form I-485, and Form G-28.',
    description_es: 'Detalles biográficos requeridos por el Formulario I-130, I-485 y G-28.',
    fields: [
      {
        id: 'fullName',
        label_en: 'Legal Name (as shown on passport/birth certificate)',
        label_es: 'Nombre Legal Completo (según pasaporte o acta de nacimiento)',
        placeholder_en: 'e.g. Sofia Elena Morales-Castillo',
        placeholder_es: 'ej. Sofia Elena Morales-Castillo',
        type: 'text',
        required: true,
      },
      {
        id: 'otherNames',
        label_en: 'Other Names Used (Maiden name, aliases, previous legal names)',
        label_es: 'Otros Nombres Utilizados (Nombre de soltera, alias, nombres anteriores)',
        placeholder_en: 'e.g. Sofia Morales',
        placeholder_es: 'ej. Sofia Morales',
        type: 'text',
        required: false,
      },
      {
        id: 'dob',
        label_en: 'Date of Birth (MM/DD/YYYY)',
        label_es: 'Fecha de Nacimiento (MM/DD/AAAA)',
        type: 'date',
        required: true,
      },
      {
        id: 'countryOfBirth',
        label_en: 'Country of Birth',
        label_es: 'País de Nacimiento',
        type: 'text',
        placeholder_en: 'e.g. Mexico',
        placeholder_es: 'ej. México',
        required: true,
      },
      {
        id: 'countryOfCitizenship',
        label_en: 'Country of Citizenship or Nationality',
        label_es: 'País de Ciudadanía o Nacionalidad',
        type: 'text',
        placeholder_en: 'e.g. Mexico',
        placeholder_es: 'ej. México',
        required: true,
      },
      {
        id: 'alienNumber',
        label_en: 'USCIS Alien Registration Number (A-Number, if any)',
        label_es: 'Número de Registro de Extranjero (Número-A, si tiene)',
        placeholder_en: 'A-###-###-###',
        placeholder_es: 'A-###-###-###',
        type: 'text',
        required: false,
      }
    ]
  },
  {
    id: 'sec-residence',
    title_en: 'Part 2: 5-Year Physical Address History',
    title_es: 'Parte 2: Historial de Domicilios de los Últimos 5 Años',
    description_en: 'USCIS requires an uninterrupted chronological address history without gaps.',
    description_es: 'USCIS exige un historial cronológico continuo de domicilios sin periodos en blanco.',
    fields: [
      {
        id: 'currentAddress',
        label_en: 'Current Physical Street Address',
        label_es: 'Dirección Física Actual',
        placeholder_en: 'Street, Apt/Suite, City, State, ZIP',
        placeholder_es: 'Calle, Número, Ciudad, Estado, Código Postal',
        type: 'text',
        required: true,
      },
      {
        id: 'currentDates',
        label_en: 'Dates of Residence at Current Address',
        label_es: 'Fechas de Residencia en el Domicilio Actual',
        placeholder_en: 'e.g. March 2024 to Present',
        placeholder_es: 'ej. Marzo 2024 al Presente',
        type: 'text',
        required: true,
      },
      {
        id: 'priorAddress1',
        label_en: 'Prior Physical Address (Within Last 5 Years)',
        label_es: 'Dirección Anterior (En los últimos 5 años)',
        placeholder_en: 'Street, City, State/Province, Country',
        placeholder_es: 'Calle, Ciudad, Estado/Provincia, País',
        type: 'text',
        required: true,
      },
      {
        id: 'priorDates1',
        label_en: 'Dates of Residence at Prior Address',
        label_es: 'Fechas de Residencia en la Dirección Anterior',
        placeholder_en: 'e.g. Jan 2021 to Feb 2024',
        placeholder_es: 'ej. Enero 2021 a Febrero 2024',
        type: 'text',
        required: true,
      }
    ]
  },
  {
    id: 'sec-travel',
    title_en: 'Part 3: Last Entry into the United States (Form I-94)',
    title_es: 'Parte 3: Última Entrada a los Estados Unidos (Formulario I-94)',
    description_en: 'Details of your most recent admission to the United States.',
    description_es: 'Detalles de su más reciente admisión o entrada a los Estados Unidos.',
    fields: [
      {
        id: 'dateOfLastArrival',
        label_en: 'Date of Last Arrival in U.S.',
        label_es: 'Fecha de la Última Entrada a EE.UU.',
        type: 'date',
        required: true,
      },
      {
        id: 'placeOfEntry',
        label_en: 'Port of Entry / Airport (City & State)',
        label_es: 'Puerto de Entrada / Aeropuerto (Ciudad y Estado)',
        placeholder_en: 'e.g. Dallas Fort Worth Airport, TX',
        placeholder_es: 'ej. Aeropuerto de Dallas Fort Worth, TX',
        type: 'text',
        required: true,
      },
      {
        id: 'classOfAdmission',
        label_en: 'Visa Status or Class of Admission at Entry',
        label_es: 'Estatus de Visa o Clase de Admisión al Entrar',
        placeholder_en: 'e.g. B-2 Tourist, F-1 Student, Parole',
        placeholder_es: 'ej. B-2 Turista, F-1 Estudiante, Permiso Humanitario',
        type: 'text',
        required: true,
      },
      {
        id: 'i94Number',
        label_en: 'Form I-94 Arrival-Departure Record Number (11 digits)',
        label_es: 'Número de Registro de Entrada-Salida I-94 (11 dígitos)',
        placeholder_en: '###########',
        placeholder_es: '###########',
        type: 'text',
        required: true,
      },
      {
        id: 'passportNumber',
        label_en: 'Foreign Passport Number Used at Entry',
        label_es: 'Número de Pasaporte Extranjero Utilizado al Entrar',
        placeholder_en: 'Passport #',
        placeholder_es: 'Número de Pasaporte',
        type: 'text',
        required: true,
      }
    ]
  }
];

