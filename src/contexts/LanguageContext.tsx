import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ar' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'zh';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Home page
    'home.title': 'Emergency Care Finder',
    'home.subtitle': 'Find the fastest A&E or Urgent Treatment Centre',
    'home.safetyCheck': 'Safety Check',
    'home.safetyQuestion': 'Are you experiencing any of these severe symptoms?',
    'home.chestPain': 'Severe chest pain',
    'home.heavyBleeding': 'Heavy bleeding',
    'home.breathing': 'Difficulty breathing',
    'home.visionLoss': 'Sudden vision loss',
    'home.yes': 'Yes',
    'home.no': 'No',
    'home.emergency.title': 'Call 999 Immediately',
    'home.emergency.message': 'These symptoms require immediate emergency attention. Please call 999 or go to your nearest A&E department right away.',
    'home.emergency.call': 'Call 999',
    'home.emergency.back': 'Go Back',
    'home.findCare': 'Find Nearest Care',
    
    // Results page
    'results.title': 'Nearby Emergency Care',
    'results.insuranceType': 'Insurance Type',
    'results.nhs': 'NHS',
    'results.ihs': 'IHS',
    'results.private': 'Private',
    'results.recommendedNow': 'Recommended now',
    'results.recommendedExplanation': 'Fastest overall based on travel and crowding.',
    'results.waitTime': 'Wait Time',
    'results.travelTime': 'Travel Time',
    'results.totalTime': 'Total Time',
    'results.minutes': 'min',
    'results.viewDetails': 'View Details',
    'results.showMap': 'Show Map',
    'results.showList': 'Show List',
    'results.disclaimer': 'Wait times are estimates based on recent patterns.',
    
    // Hospital details
    'details.title': 'Hospital Details',
    'details.address': 'Address',
    'details.phone': 'Phone',
    'details.hours': 'Opening Hours',
    'details.acceptedInsurance': 'Accepted Insurance',
    'details.currentWait': 'Current Wait Time',
    'details.whatToBring': 'What to Bring',
    'details.ae.item1': 'ID or passport',
    'details.ae.item2': 'List of current medications',
    'details.ae.item3': 'Insurance proof',
    'details.ae.item4': 'Emergency contact details',
    'details.ae.item5': 'Phone charger',
    'details.utc.item1': 'ID or passport',
    'details.utc.item2': 'List of current medications',
    'details.utc.item3': 'Insurance proof',
    'details.utc.item4': 'Recent medical records (if applicable)',
    'details.getDirections': 'Get Directions',
    'details.back': 'Back to Results',
    
    // After visit
    'afterVisit.title': 'After Your Visit',
    'afterVisit.subtitle': 'Important steps to complete',
    'afterVisit.gp': 'Register with a GP',
    'afterVisit.gpDesc': 'If you don\'t have a GP, register with one near you for follow-up care',
    'afterVisit.prescription': 'Collect Prescriptions',
    'afterVisit.prescriptionDesc': 'Take any prescriptions to your local pharmacy',
    'afterVisit.followup': 'Follow-up Care',
    'afterVisit.followupDesc': 'Attend any scheduled follow-up appointments',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error loading data',
  },
  ar: {
    // Home page
    'home.title': 'محدد الرعاية الطارئة',
    'home.subtitle': 'اعثر على أسرع قسم طوارئ أو مركز علاج عاجل',
    'home.safetyCheck': 'فحص السلامة',
    'home.safetyQuestion': 'هل تعاني من أي من هذه الأعراض الشديدة؟',
    'home.chestPain': 'ألم شديد في الصدر',
    'home.heavyBleeding': 'نزيف شديد',
    'home.breathing': 'صعوبة في التنفس',
    'home.visionLoss': 'فقدان مفاجئ للبصر',
    'home.yes': 'نعم',
    'home.no': 'لا',
    'home.emergency.title': 'اتصل بـ 999 فوراً',
    'home.emergency.message': 'تتطلب هذه الأعراض عناية طارئة فورية. يرجى الاتصال بـ 999 أو الذهاب إلى أقرب قسم طوارئ على الفور.',
    'home.emergency.call': 'اتصل بـ 999',
    'home.emergency.back': 'رجوع',
    'home.findCare': 'ابحث عن أقرب رعاية',
    
    // Results page
    'results.title': 'الرعاية الطارئة القريبة',
    'results.insuranceType': 'نوع التأمين',
    'results.nhs': 'NHS',
    'results.ihs': 'IHS',
    'results.private': 'خاص',
    'results.recommendedNow': 'موصى به الآن',
    'results.recommendedExplanation': 'الأسرع إجمالاً بناءً على السفر والازدحام.',
    'results.waitTime': 'وقت الانتظار',
    'results.travelTime': 'وقت السفر',
    'results.totalTime': 'الوقت الإجمالي',
    'results.minutes': 'دقيقة',
    'results.viewDetails': 'عرض التفاصيل',
    'results.showMap': 'عرض الخريطة',
    'results.showList': 'عرض القائمة',
    'results.disclaimer': 'أوقات الانتظار تقديرات بناءً على الأنماط الأخيرة.',
    
    // Hospital details
    'details.title': 'تفاصيل المستشفى',
    'details.address': 'العنوان',
    'details.phone': 'الهاتف',
    'details.hours': 'ساعات العمل',
    'details.acceptedInsurance': 'التأمين المقبول',
    'details.currentWait': 'وقت الانتظار الحالي',
    'details.whatToBring': 'ما يجب إحضاره',
    'details.ae.item1': 'الهوية أو جواز السفر',
    'details.ae.item2': 'قائمة الأدوية الحالية',
    'details.ae.item3': 'إثبات التأمين',
    'details.ae.item4': 'تفاصيل جهة الاتصال في حالات الطوارئ',
    'details.ae.item5': 'شاحن الهاتف',
    'details.utc.item1': 'الهوية أو جواز السفر',
    'details.utc.item2': 'قائمة الأدوية الحالية',
    'details.utc.item3': 'إثبات التأمين',
    'details.utc.item4': 'السجلات الطبية الحديثة (إن وجدت)',
    'details.getDirections': 'احصل على الاتجاهات',
    'details.back': 'العودة إلى النتائج',
    
    // After visit
    'afterVisit.title': 'بعد زيارتك',
    'afterVisit.subtitle': 'خطوات مهمة للإكمال',
    'afterVisit.gp': 'التسجيل مع طبيب عام',
    'afterVisit.gpDesc': 'إذا لم يكن لديك طبيب عام، سجل مع طبيب قريب منك للرعاية اللاحقة',
    'afterVisit.prescription': 'استلام الوصفات الطبية',
    'afterVisit.prescriptionDesc': 'خذ أي وصفات طبية إلى الصيدلية المحلية',
    'afterVisit.followup': 'الرعاية اللاحقة',
    'afterVisit.followupDesc': 'احضر أي مواعيد متابعة مجدولة',
    
    // Common
    'common.loading': 'جارٍ التحميل...',
    'common.error': 'خطأ في تحميل البيانات',
  },
  es: {
    // Home page
    'home.title': 'Buscador de Atención de Emergencia',
    'home.subtitle': 'Encuentra el A&E o Centro de Tratamiento Urgente más rápido',
    'home.safetyCheck': 'Verificación de Seguridad',
    'home.safetyQuestion': '¿Está experimentando alguno de estos síntomas graves?',
    'home.chestPain': 'Dolor de pecho severo',
    'home.heavyBleeding': 'Sangrado abundante',
    'home.breathing': 'Dificultad para respirar',
    'home.visionLoss': 'Pérdida repentina de la visión',
    'home.yes': 'Sí',
    'home.no': 'No',
    'home.emergency.title': 'Llame al 999 Inmediatamente',
    'home.emergency.message': 'Estos síntomas requieren atención de emergencia inmediata. Por favor llame al 999 o diríjase al departamento de A&E más cercano de inmediato.',
    'home.emergency.call': 'Llamar al 999',
    'home.emergency.back': 'Volver',
    'home.findCare': 'Encontrar Atención Más Cercana',
    
    // Results page
    'results.title': 'Atención de Emergencia Cercana',
    'results.insuranceType': 'Tipo de Seguro',
    'results.nhs': 'NHS',
    'results.ihs': 'IHS',
    'results.private': 'Privado',
    'results.recommendedNow': 'Recomendado ahora',
    'results.recommendedExplanation': 'Más rápido en general basado en viaje y congestión.',
    'results.waitTime': 'Tiempo de Espera',
    'results.travelTime': 'Tiempo de Viaje',
    'results.totalTime': 'Tiempo Total',
    'results.minutes': 'min',
    'results.viewDetails': 'Ver Detalles',
    'results.showMap': 'Mostrar Mapa',
    'results.showList': 'Mostrar Lista',
    'results.disclaimer': 'Los tiempos de espera son estimados basados en patrones recientes.',
    
    // Hospital details
    'details.title': 'Detalles del Hospital',
    'details.address': 'Dirección',
    'details.phone': 'Teléfono',
    'details.hours': 'Horario de Apertura',
    'details.acceptedInsurance': 'Seguro Aceptado',
    'details.currentWait': 'Tiempo de Espera Actual',
    'details.whatToBring': 'Qué Traer',
    'details.ae.item1': 'DNI o pasaporte',
    'details.ae.item2': 'Lista de medicamentos actuales',
    'details.ae.item3': 'Comprobante de seguro',
    'details.ae.item4': 'Detalles de contacto de emergencia',
    'details.ae.item5': 'Cargador de teléfono',
    'details.utc.item1': 'DNI o pasaporte',
    'details.utc.item2': 'Lista de medicamentos actuales',
    'details.utc.item3': 'Comprobante de seguro',
    'details.utc.item4': 'Registros médicos recientes (si aplica)',
    'details.getDirections': 'Obtener Direcciones',
    'details.back': 'Volver a Resultados',
    
    // After visit
    'afterVisit.title': 'Después de su Visita',
    'afterVisit.subtitle': 'Pasos importantes a completar',
    'afterVisit.gp': 'Registrarse con un Médico de Cabecera',
    'afterVisit.gpDesc': 'Si no tiene un médico de cabecera, regístrese con uno cerca de usted para atención de seguimiento',
    'afterVisit.prescription': 'Recoger Recetas',
    'afterVisit.prescriptionDesc': 'Lleve cualquier receta a su farmacia local',
    'afterVisit.followup': 'Atención de Seguimiento',
    'afterVisit.followupDesc': 'Asista a cualquier cita de seguimiento programada',
    
    // Common
    'common.loading': 'Cargando...',
    'common.error': 'Error al cargar datos',
  },
  fr: {
    // Home page
    'home.title': 'Localisateur de Soins d\'Urgence',
    'home.subtitle': 'Trouvez les urgences ou le centre de traitement urgent le plus rapide',
    'home.safetyCheck': 'Vérification de Sécurité',
    'home.safetyQuestion': 'Ressentez-vous l\'un de ces symptômes graves?',
    'home.chestPain': 'Douleur thoracique sévère',
    'home.heavyBleeding': 'Saignement abondant',
    'home.breathing': 'Difficulté à respirer',
    'home.visionLoss': 'Perte soudaine de vision',
    'home.yes': 'Oui',
    'home.no': 'Non',
    'home.emergency.title': 'Appelez le 999 Immédiatement',
    'home.emergency.message': 'Ces symptômes nécessitent une attention d\'urgence immédiate. Veuillez appeler le 999 ou vous rendre au service des urgences le plus proche immédiatement.',
    'home.emergency.call': 'Appeler le 999',
    'home.emergency.back': 'Retour',
    'home.findCare': 'Trouver les Soins les Plus Proches',
    
    // Results page
    'results.title': 'Soins d\'Urgence à Proximité',
    'results.insuranceType': 'Type d\'Assurance',
    'results.nhs': 'NHS',
    'results.ihs': 'IHS',
    'results.private': 'Privé',
    'results.recommendedNow': 'Recommandé maintenant',
    'results.recommendedExplanation': 'Le plus rapide globalement basé sur le trajet et l\'affluence.',
    'results.waitTime': 'Temps d\'Attente',
    'results.travelTime': 'Temps de Trajet',
    'results.totalTime': 'Temps Total',
    'results.minutes': 'min',
    'results.viewDetails': 'Voir Détails',
    'results.showMap': 'Afficher Carte',
    'results.showList': 'Afficher Liste',
    'results.disclaimer': 'Les temps d\'attente sont des estimations basées sur les tendances récentes.',
    
    // Hospital details
    'details.title': 'Détails de l\'Hôpital',
    'details.address': 'Adresse',
    'details.phone': 'Téléphone',
    'details.hours': 'Heures d\'Ouverture',
    'details.acceptedInsurance': 'Assurance Acceptée',
    'details.currentWait': 'Temps d\'Attente Actuel',
    'details.whatToBring': 'Quoi Apporter',
    'details.ae.item1': 'Pièce d\'identité ou passeport',
    'details.ae.item2': 'Liste des médicaments actuels',
    'details.ae.item3': 'Preuve d\'assurance',
    'details.ae.item4': 'Coordonnées d\'urgence',
    'details.ae.item5': 'Chargeur de téléphone',
    'details.utc.item1': 'Pièce d\'identité ou passeport',
    'details.utc.item2': 'Liste des médicaments actuels',
    'details.utc.item3': 'Preuve d\'assurance',
    'details.utc.item4': 'Dossiers médicaux récents (le cas échéant)',
    'details.getDirections': 'Obtenir l\'Itinéraire',
    'details.back': 'Retour aux Résultats',
    
    // After visit
    'afterVisit.title': 'Après Votre Visite',
    'afterVisit.subtitle': 'Étapes importantes à compléter',
    'afterVisit.gp': 'S\'inscrire auprès d\'un Médecin Généraliste',
    'afterVisit.gpDesc': 'Si vous n\'avez pas de médecin généraliste, inscrivez-vous auprès d\'un proche pour les soins de suivi',
    'afterVisit.prescription': 'Récupérer les Ordonnances',
    'afterVisit.prescriptionDesc': 'Apportez toutes les ordonnances à votre pharmacie locale',
    'afterVisit.followup': 'Soins de Suivi',
    'afterVisit.followupDesc': 'Assistez à tous les rendez-vous de suivi programmés',
    
    // Common
    'common.loading': 'Chargement...',
    'common.error': 'Erreur de chargement des données',
  },
  de: {
    // Home page
    'home.title': 'Notfall-Suche',
    'home.subtitle': 'Finden Sie die schnellste Notaufnahme oder Notfallzentrum',
    'home.safetyCheck': 'Sicherheitsüberprüfung',
    'home.safetyQuestion': 'Haben Sie eines dieser schweren Symptome?',
    'home.chestPain': 'Starke Brustschmerzen',
    'home.heavyBleeding': 'Starke Blutung',
    'home.breathing': 'Atembeschwerden',
    'home.visionLoss': 'Plötzlicher Sehverlust',
    'home.yes': 'Ja',
    'home.no': 'Nein',
    'home.emergency.title': 'Rufen Sie sofort 999 an',
    'home.emergency.message': 'Diese Symptome erfordern sofortige Notfallversorgung. Bitte rufen Sie 999 an oder gehen Sie sofort zur nächsten Notaufnahme.',
    'home.emergency.call': '999 anrufen',
    'home.emergency.back': 'Zurück',
    'home.findCare': 'Nächste Versorgung finden',
    
    // Results page
    'results.title': 'Notfallversorgung in der Nähe',
    'results.insuranceType': 'Versicherungstyp',
    'results.nhs': 'NHS',
    'results.ihs': 'IHS',
    'results.private': 'Privat',
    'results.recommendedNow': 'Jetzt empfohlen',
    'results.recommendedExplanation': 'Am schnellsten insgesamt basierend auf Reise und Auslastung.',
    'results.waitTime': 'Wartezeit',
    'results.travelTime': 'Reisezeit',
    'results.totalTime': 'Gesamtzeit',
    'results.minutes': 'min',
    'results.viewDetails': 'Details ansehen',
    'results.showMap': 'Karte anzeigen',
    'results.showList': 'Liste anzeigen',
    'results.disclaimer': 'Wartezeiten sind Schätzungen basierend auf aktuellen Mustern.',
    
    // Hospital details
    'details.title': 'Krankenhausdetails',
    'details.address': 'Adresse',
    'details.phone': 'Telefon',
    'details.hours': 'Öffnungszeiten',
    'details.acceptedInsurance': 'Akzeptierte Versicherung',
    'details.currentWait': 'Aktuelle Wartezeit',
    'details.whatToBring': 'Was mitzubringen ist',
    'details.ae.item1': 'Ausweis oder Reisepass',
    'details.ae.item2': 'Liste der aktuellen Medikamente',
    'details.ae.item3': 'Versicherungsnachweis',
    'details.ae.item4': 'Notfallkontaktdaten',
    'details.ae.item5': 'Telefonladegerät',
    'details.utc.item1': 'Ausweis oder Reisepass',
    'details.utc.item2': 'Liste der aktuellen Medikamente',
    'details.utc.item3': 'Versicherungsnachweis',
    'details.utc.item4': 'Aktuelle medizinische Unterlagen (falls zutreffend)',
    'details.getDirections': 'Wegbeschreibung',
    'details.back': 'Zurück zu Ergebnissen',
    
    // After visit
    'afterVisit.title': 'Nach Ihrem Besuch',
    'afterVisit.subtitle': 'Wichtige Schritte zum Abschluss',
    'afterVisit.gp': 'Bei einem Hausarzt registrieren',
    'afterVisit.gpDesc': 'Wenn Sie keinen Hausarzt haben, registrieren Sie sich bei einem in Ihrer Nähe für Folgebehandlungen',
    'afterVisit.prescription': 'Rezepte abholen',
    'afterVisit.prescriptionDesc': 'Bringen Sie alle Rezepte zu Ihrer örtlichen Apotheke',
    'afterVisit.followup': 'Nachsorge',
    'afterVisit.followupDesc': 'Nehmen Sie an allen geplanten Folgeterminen teil',
    
    // Common
    'common.loading': 'Lädt...',
    'common.error': 'Fehler beim Laden der Daten',
  },
  it: {
    // Home page
    'home.title': 'Ricerca Cure di Emergenza',
    'home.subtitle': 'Trova il Pronto Soccorso o Centro di Cura Urgente più veloce',
    'home.safetyCheck': 'Controllo di Sicurezza',
    'home.safetyQuestion': 'Stai manifestando uno di questi sintomi gravi?',
    'home.chestPain': 'Dolore toracico severo',
    'home.heavyBleeding': 'Emorragia abbondante',
    'home.breathing': 'Difficoltà respiratorie',
    'home.visionLoss': 'Perdita improvvisa della vista',
    'home.yes': 'Sì',
    'home.no': 'No',
    'home.emergency.title': 'Chiama subito il 999',
    'home.emergency.message': 'Questi sintomi richiedono attenzione di emergenza immediata. Si prega di chiamare il 999 o andare al pronto soccorso più vicino immediatamente.',
    'home.emergency.call': 'Chiama il 999',
    'home.emergency.back': 'Indietro',
    'home.findCare': 'Trova Cure Più Vicine',
    
    // Results page
    'results.title': 'Cure di Emergenza Vicine',
    'results.insuranceType': 'Tipo di Assicurazione',
    'results.nhs': 'NHS',
    'results.ihs': 'IHS',
    'results.private': 'Privato',
    'results.recommendedNow': 'Consigliato ora',
    'results.recommendedExplanation': 'Il più veloce in generale in base a viaggio e affollamento.',
    'results.waitTime': 'Tempo di Attesa',
    'results.travelTime': 'Tempo di Viaggio',
    'results.totalTime': 'Tempo Totale',
    'results.minutes': 'min',
    'results.viewDetails': 'Vedi Dettagli',
    'results.showMap': 'Mostra Mappa',
    'results.showList': 'Mostra Lista',
    'results.disclaimer': 'I tempi di attesa sono stime basate su modelli recenti.',
    
    // Hospital details
    'details.title': 'Dettagli Ospedale',
    'details.address': 'Indirizzo',
    'details.phone': 'Telefono',
    'details.hours': 'Orari di Apertura',
    'details.acceptedInsurance': 'Assicurazione Accettata',
    'details.currentWait': 'Tempo di Attesa Attuale',
    'details.whatToBring': 'Cosa Portare',
    'details.ae.item1': 'Documento d\'identità o passaporto',
    'details.ae.item2': 'Elenco dei farmaci attuali',
    'details.ae.item3': 'Prova di assicurazione',
    'details.ae.item4': 'Dettagli contatto di emergenza',
    'details.ae.item5': 'Caricabatterie del telefono',
    'details.utc.item1': 'Documento d\'identità o passaporto',
    'details.utc.item2': 'Elenco dei farmaci attuali',
    'details.utc.item3': 'Prova di assicurazione',
    'details.utc.item4': 'Cartelle mediche recenti (se applicabile)',
    'details.getDirections': 'Ottieni Indicazioni',
    'details.back': 'Torna ai Risultati',
    
    // After visit
    'afterVisit.title': 'Dopo la Tua Visita',
    'afterVisit.subtitle': 'Passi importanti da completare',
    'afterVisit.gp': 'Registrati con un Medico di Base',
    'afterVisit.gpDesc': 'Se non hai un medico di base, registrati con uno vicino a te per le cure di follow-up',
    'afterVisit.prescription': 'Ritira Prescrizioni',
    'afterVisit.prescriptionDesc': 'Porta qualsiasi prescrizione alla tua farmacia locale',
    'afterVisit.followup': 'Cure di Follow-up',
    'afterVisit.followupDesc': 'Partecipa a qualsiasi appuntamento di follow-up programmato',
    
    // Common
    'common.loading': 'Caricamento...',
    'common.error': 'Errore nel caricamento dei dati',
  },
  pt: {
    // Home page
    'home.title': 'Localizador de Cuidados de Emergência',
    'home.subtitle': 'Encontre o Pronto Socorro ou Centro de Tratamento Urgente mais rápido',
    'home.safetyCheck': 'Verificação de Segurança',
    'home.safetyQuestion': 'Você está experimentando algum destes sintomas graves?',
    'home.chestPain': 'Dor no peito severa',
    'home.heavyBleeding': 'Sangramento intenso',
    'home.breathing': 'Dificuldade para respirar',
    'home.visionLoss': 'Perda súbita de visão',
    'home.yes': 'Sim',
    'home.no': 'Não',
    'home.emergency.title': 'Ligue 999 Imediatamente',
    'home.emergency.message': 'Estes sintomas requerem atenção de emergência imediata. Por favor ligue 999 ou vá para o pronto socorro mais próximo imediatamente.',
    'home.emergency.call': 'Ligar 999',
    'home.emergency.back': 'Voltar',
    'home.findCare': 'Encontrar Cuidados Mais Próximos',
    
    // Results page
    'results.title': 'Cuidados de Emergência Próximos',
    'results.insuranceType': 'Tipo de Seguro',
    'results.nhs': 'NHS',
    'results.ihs': 'IHS',
    'results.private': 'Privado',
    'results.recommendedNow': 'Recomendado agora',
    'results.recommendedExplanation': 'Mais rápido no geral baseado em viagem e lotação.',
    'results.waitTime': 'Tempo de Espera',
    'results.travelTime': 'Tempo de Viagem',
    'results.totalTime': 'Tempo Total',
    'results.minutes': 'min',
    'results.viewDetails': 'Ver Detalhes',
    'results.showMap': 'Mostrar Mapa',
    'results.showList': 'Mostrar Lista',
    'results.disclaimer': 'Tempos de espera são estimativas baseadas em padrões recentes.',
    
    // Hospital details
    'details.title': 'Detalhes do Hospital',
    'details.address': 'Endereço',
    'details.phone': 'Telefone',
    'details.hours': 'Horário de Funcionamento',
    'details.acceptedInsurance': 'Seguro Aceito',
    'details.currentWait': 'Tempo de Espera Atual',
    'details.whatToBring': 'O Que Trazer',
    'details.ae.item1': 'Documento de identidade ou passaporte',
    'details.ae.item2': 'Lista de medicamentos atuais',
    'details.ae.item3': 'Comprovante de seguro',
    'details.ae.item4': 'Detalhes de contato de emergência',
    'details.ae.item5': 'Carregador de telefone',
    'details.utc.item1': 'Documento de identidade ou passaporte',
    'details.utc.item2': 'Lista de medicamentos atuais',
    'details.utc.item3': 'Comprovante de seguro',
    'details.utc.item4': 'Registros médicos recentes (se aplicável)',
    'details.getDirections': 'Obter Direções',
    'details.back': 'Voltar aos Resultados',
    
    // After visit
    'afterVisit.title': 'Após Sua Visita',
    'afterVisit.subtitle': 'Passos importantes a completar',
    'afterVisit.gp': 'Registrar com um Médico de Família',
    'afterVisit.gpDesc': 'Se você não tem um médico de família, registre-se com um próximo de você para cuidados de acompanhamento',
    'afterVisit.prescription': 'Recolher Prescrições',
    'afterVisit.prescriptionDesc': 'Leve quaisquer prescrições à sua farmácia local',
    'afterVisit.followup': 'Cuidados de Acompanhamento',
    'afterVisit.followupDesc': 'Compareça a quaisquer consultas de acompanhamento agendadas',
    
    // Common
    'common.loading': 'Carregando...',
    'common.error': 'Erro ao carregar dados',
  },
  zh: {
    // Home page
    'home.title': '紧急护理查找器',
    'home.subtitle': '找到最快的急诊室或紧急治疗中心',
    'home.safetyCheck': '安全检查',
    'home.safetyQuestion': '您是否出现以下严重症状？',
    'home.chestPain': '严重胸痛',
    'home.heavyBleeding': '大量出血',
    'home.breathing': '呼吸困难',
    'home.visionLoss': '突然失明',
    'home.yes': '是',
    'home.no': '否',
    'home.emergency.title': '立即拨打999',
    'home.emergency.message': '这些症状需要立即紧急护理。请立即拨打999或前往最近的急诊室。',
    'home.emergency.call': '拨打999',
    'home.emergency.back': '返回',
    'home.findCare': '查找最近的护理',
    
    // Results page
    'results.title': '附近的紧急护理',
    'results.insuranceType': '保险类型',
    'results.nhs': 'NHS',
    'results.ihs': 'IHS',
    'results.private': '私人',
    'results.recommendedNow': '现在推荐',
    'results.recommendedExplanation': '根据旅行和拥挤情况，总体最快。',
    'results.waitTime': '等待时间',
    'results.travelTime': '旅行时间',
    'results.totalTime': '总时间',
    'results.minutes': '分钟',
    'results.viewDetails': '查看详情',
    'results.showMap': '显示地图',
    'results.showList': '显示列表',
    'results.disclaimer': '等待时间是基于最近模式的估计。',
    
    // Hospital details
    'details.title': '医院详情',
    'details.address': '地址',
    'details.phone': '电话',
    'details.hours': '营业时间',
    'details.acceptedInsurance': '接受的保险',
    'details.currentWait': '当前等待时间',
    'details.whatToBring': '需要携带',
    'details.ae.item1': '身份证或护照',
    'details.ae.item2': '当前药物清单',
    'details.ae.item3': '保险证明',
    'details.ae.item4': '紧急联系人详情',
    'details.ae.item5': '手机充电器',
    'details.utc.item1': '身份证或护照',
    'details.utc.item2': '当前药物清单',
    'details.utc.item3': '保险证明',
    'details.utc.item4': '最近的医疗记录（如适用）',
    'details.getDirections': '获取路线',
    'details.back': '返回结果',
    
    // After visit
    'afterVisit.title': '就诊后',
    'afterVisit.subtitle': '需要完成的重要步骤',
    'afterVisit.gp': '注册全科医生',
    'afterVisit.gpDesc': '如果您没有全科医生，请在您附近注册一位以进行后续护理',
    'afterVisit.prescription': '领取处方',
    'afterVisit.prescriptionDesc': '将任何处方带到您当地的药房',
    'afterVisit.followup': '后续护理',
    'afterVisit.followupDesc': '参加任何计划的后续预约',
    
    // Common
    'common.loading': '加载中...',
    'common.error': '加载数据错误',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    // Update document direction based on language
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ar' : 'en');
  };

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
