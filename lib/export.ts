import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Treatment, Dentist, UserProfile, Tooth } from '../types';

export type ExportMode = 'dentist' | 'personal';

interface ExportData {
  userProfile: UserProfile;
  treatments: Treatment[];
  dentists: Dentist[];
  teeth: Tooth[];
  mode: ExportMode;
  language: string;
}

export const generatePDF = async (data: ExportData) => {
  const { userProfile, treatments, dentists, teeth, mode, language } = data;
  const isUkrainian = language === 'uk';

  // Create new PDF document
  const doc = new jsPDF();
  let yPosition = 20;

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  const title = mode === 'dentist' 
    ? (isUkrainian ? 'Стоматологічний Паспорт' : 'Dental Passport')
    : (isUkrainian ? 'Особистий Стоматологічний Звіт' : 'Personal Dental Report');
  doc.text(title, 105, yPosition, { align: 'center' });
  yPosition += 15;

  // Patient Information
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(isUkrainian ? 'Інформація про Пацієнта' : 'Patient Information', 14, yPosition);
  yPosition += 7;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  const patientInfo = [
    [`${isUkrainian ? 'Ім\'я' : 'Name'}:`, userProfile.name || 'N/A'],
    [`${isUkrainian ? 'Дата народження' : 'Date of Birth'}:`, userProfile.dob || 'N/A'],
    [`${isUkrainian ? 'Група крові' : 'Blood Type'}:`, userProfile.bloodType || 'N/A'],
    [`${isUkrainian ? 'Алергії' : 'Allergies'}:`, userProfile.allergies || 'None'],
  ];

  if (userProfile.medicalNotes) {
    patientInfo.push([`${isUkrainian ? 'Медичні примітки' : 'Medical Notes'}:`, userProfile.medicalNotes]);
  }

  patientInfo.forEach(([label, value]) => {
    doc.text(label, 14, yPosition);
    doc.text(value, 55, yPosition);
    yPosition += 6;
  });

  yPosition += 10;

  // Tooth Map Summary
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(isUkrainian ? 'Карта Зубів' : 'Tooth Map', 14, yPosition);
  yPosition += 7;

  // Count teeth by status
  const statusCounts: Record<string, number> = {};
  teeth.forEach(tooth => {
    statusCounts[tooth.status] = (statusCounts[tooth.status] || 0) + 1;
  });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const statusLabels: Record<string, { en: string; uk: string }> = {
    HEALTHY: { en: 'Healthy', uk: 'Здорові' },
    FILLED: { en: 'Filled', uk: 'Запломбовані' },
    TREATED: { en: 'Treated', uk: 'Лікувані' },
    CROWN: { en: 'Crown', uk: 'Коронки' },
    VENEER: { en: 'Veneer', uk: 'Віниры' },
    MISSING: { en: 'Missing', uk: 'Відсутні' },
    IMPLANT: { en: 'Implant', uk: 'Імпланти' },
    ATTENTION: { en: 'Needs Attention', uk: 'Потребують уваги' },
  };

  Object.entries(statusCounts).forEach(([status, count]) => {
    const label = isUkrainian ? statusLabels[status]?.uk : statusLabels[status]?.en;
    if (label) {
      doc.text(`${label}: ${count}`, 14, yPosition);
      yPosition += 5;
    }
  });

  yPosition += 10;

  // Treatment History
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(isUkrainian ? 'Історія Лікування' : 'Treatment History', 14, yPosition);
  yPosition += 7;

  if (treatments.length === 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(isUkrainian ? 'Немає записів про лікування' : 'No treatment records', 14, yPosition);
  } else {
    // Prepare treatment table data
    const treatmentHeaders = [
      isUkrainian ? 'Дата' : 'Date',
      isUkrainian ? 'Зуб' : 'Tooth',
      isUkrainian ? 'Процедура' : 'Procedure',
      mode === 'personal' ? (isUkrainian ? 'Лікар' : 'Dentist') : (isUkrainian ? 'Клініка' : 'Clinic'),
      isUkrainian ? 'Вартість' : 'Cost',
    ];

    const typeLabels: Record<string, { en: string; uk: string }> = {
      FILLING: { en: 'Filling', uk: 'Пломба' },
      ROOT_CANAL: { en: 'Root Canal', uk: 'Кореневий канал' },
      CROWN: { en: 'Crown', uk: 'Коронка' },
      EXTRACTION: { en: 'Extraction', uk: 'Видалення' },
      VENEER: { en: 'Veneer', uk: 'Вінір' },
      IMPLANT: { en: 'Implant', uk: 'Імплант' },
      BRACES: { en: 'Braces', uk: 'Брекети' },
      HYGIENE: { en: 'Hygiene', uk: 'Чистка' },
      CHECKUP: { en: 'Checkup', uk: 'Огляд' },
      OTHER: { en: 'Other', uk: 'Інше' },
    };

    const treatmentRows = treatments.map(t => {
      const dentist = dentists.find(d => d.id === t.dentistId);
      const dentistInfo = mode === 'personal'
        ? (dentist ? `${dentist.name}${dentist.phone ? ' (' + dentist.phone + ')' : ''}` : 'N/A')
        : (dentist?.clinicName || 'N/A');

      const procedureLabel = isUkrainian ? typeLabels[t.type]?.uk : typeLabels[t.type]?.en;

      return [
        new Date(t.date).toLocaleDateString(isUkrainian ? 'uk-UA' : 'en-US'),
        t.toothId?.toString() || (isUkrainian ? 'Загальна' : 'General'),
        procedureLabel || t.type,
        dentistInfo,
        `${t.cost || 0} ${t.currency || 'UAH'}`,
      ];
    });

    autoTable(doc, {
      startY: yPosition,
      head: [treatmentHeaders],
      body: treatmentRows,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [14, 165, 233], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 249, 255] },
      margin: { left: 14, right: 14 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }

  // Add dentist details in personal mode
  if (mode === 'personal' && dentists.length > 0) {
    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(isUkrainian ? 'Мої Лікарі' : 'My Dentists', 14, yPosition);
    yPosition += 7;

    dentists.forEach(dentist => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(dentist.name, 14, yPosition);
      yPosition += 6;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      if (dentist.clinicName) {
        doc.text(`${isUkrainian ? 'Клініка' : 'Clinic'}: ${dentist.clinicName}`, 14, yPosition);
        yPosition += 5;
      }
      
      if (dentist.phone) {
        doc.text(`${isUkrainian ? 'Телефон' : 'Phone'}: ${dentist.phone}`, 14, yPosition);
        yPosition += 5;
      }
      
      if (dentist.type) {
        doc.text(`${isUkrainian ? 'Спеціалізація' : 'Type'}: ${dentist.type}`, 14, yPosition);
        yPosition += 5;
      }
      
      if (dentist.notes) {
        doc.text(`${isUkrainian ? 'Примітки' : 'Notes'}: ${dentist.notes}`, 14, yPosition);
        yPosition += 5;
      }

      yPosition += 5;
    });
  }

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150);
    const footerText = `${isUkrainian ? 'Створено за допомогою' : 'Generated by'} DentTrack - ${new Date().toLocaleDateString(isUkrainian ? 'uk-UA' : 'en-US')}`;
    doc.text(footerText, 105, 285, { align: 'center' });
    doc.text(`${isUkrainian ? 'Сторінка' : 'Page'} ${i} ${isUkrainian ? 'з' : 'of'} ${pageCount}`, 105, 290, { align: 'center' });
  }

  // Generate filename
  const modeStr = mode === 'dentist' ? 'for-dentist' : 'personal';
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `denttrack-${modeStr}-${dateStr}.pdf`;

  // Save the PDF
  doc.save(filename);
};
