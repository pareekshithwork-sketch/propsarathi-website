import sql from './db'

// ─── LEADS ───────────────────────────────────────────────────────────────────

export async function getCRMLeads() {
  const rows = await sql`SELECT * FROM crm_leads WHERE is_deleted = FALSE ORDER BY last_updated DESC`
  return rows.map(rowToLead)
}

export async function getCRMDeletedLeads() {
  const rows = await sql`SELECT * FROM crm_leads WHERE is_deleted = TRUE ORDER BY last_updated DESC`
  return rows.map(rowToLead)
}

export async function getCRMLeadById(leadId: string) {
  const rows = await sql`SELECT * FROM crm_leads WHERE lead_id = ${leadId}`
  return rows[0] ? rowToLead(rows[0]) : null
}

export async function addCRMLead(lead: any) {
  const id = lead.leadId || `LEAD-${Date.now()}`
  await sql`
    INSERT INTO crm_leads (
      lead_id, source, sub_source, partner_id, partner_name, client_name, phone, alt_phone, landline,
      country_code, email, city, property_type, budget, min_budget, max_budget,
      assigned_rm, secondary_owner, status, sub_status, tags, notes, last_note,
      referral_name, referral_phone, referral_email,
      profession, company, designation, gender, dob, marital_status,
      sourcing_manager, closing_manager, possession_date, enquired_location,
      purpose, buyer, payment_plan, channel_partner, carpet_area, saleable_area,
      enquired_for, project_enquired, scheduled_at, is_deleted, is_duplicate
    ) VALUES (
      ${id}, ${lead.source||'Manual'}, ${lead.subSource||''}, ${lead.partnerId||''}, ${lead.partnerName||''},
      ${lead.clientName||''}, ${lead.phone||''}, ${lead.altPhone||''}, ${lead.landline||''},
      ${lead.countryCode||'+91'}, ${lead.email||''}, ${lead.city||''}, ${lead.propertyType||''},
      ${lead.budget||''}, ${lead.minBudget||''}, ${lead.maxBudget||''},
      ${lead.assignedRM||''}, ${lead.secondaryOwner||''},
      ${lead.status||'New'}, ${lead.subStatus||''}, ${lead.tags||''}, ${lead.notes||''}, ${lead.notes||''},
      ${lead.referralName||''}, ${lead.referralPhone||''}, ${lead.referralEmail||''},
      ${lead.profession||''}, ${lead.company||''}, ${lead.designation||''}, ${lead.gender||''},
      ${lead.dob||''}, ${lead.maritalStatus||''},
      ${lead.sourcingManager||''}, ${lead.closingManager||''},
      ${lead.possessionDate||''}, ${lead.enquiredLocation||''},
      ${lead.purpose||''}, ${lead.buyer||''}, ${lead.paymentPlan||''}, ${lead.channelPartner||''},
      ${lead.carpetArea||''}, ${lead.saleableArea||''},
      ${lead.enquiredFor||''}, ${lead.projectEnquired||''}, ${lead.scheduledAt||''},
      FALSE, FALSE
    )
  `
  return id
}

export async function updateCRMLead(leadId: string, updates: any) {
  const u = updates
  if (u.source !== undefined) await sql`UPDATE crm_leads SET source=${u.source}, last_updated=NOW() WHERE lead_id=${leadId}`
  if (u.subSource !== undefined) await sql`UPDATE crm_leads SET sub_source=${u.subSource}, last_updated=NOW() WHERE lead_id=${leadId}`
  if (u.clientName !== undefined) await sql`UPDATE crm_leads SET client_name=${u.clientName}, last_updated=NOW() WHERE lead_id=${leadId}`
  if (u.phone !== undefined) await sql`UPDATE crm_leads SET phone=${u.phone}, last_updated=NOW() WHERE lead_id=${leadId}`
  if (u.altPhone !== undefined) await sql`UPDATE crm_leads SET alt_phone=${u.altPhone}, last_updated=NOW() WHERE lead_id=${leadId}`
  if (u.landline !== undefined) await sql`UPDATE crm_leads SET landline=${u.landline}, last_updated=NOW() WHERE lead_id=${leadId}`
  if (u.countryCode !== undefined) await sql`UPDATE crm_leads SET country_code=${u.countryCode}, last_updated=NOW() WHERE lead_id=${leadId}`
  if (u.email !== undefined) await sql`UPDATE crm_leads SET email=${u.email}, last_updated=NOW() WHERE lead_id=${leadId}`
  if (u.city !== undefined) await sql`UPDATE crm_leads SET city=${u.city}, last_updated=NOW() WHERE lead_id=${leadId}`
  if (u.propertyType !== undefined) await sql`UPDATE crm_leads SET property_type=${u.propertyType}, last_updated=NOW() WHERE lead_id=${leadId}`
  if (u.budget !== undefined) await sql`UPDATE crm_leads SET budget=${u.budget}, last_updated=NOW() WHERE lead_id=${leadId}`
  if (u.minBudget !== undefined) await sql`UPDATE crm_leads SET min_budget=${u.minBudget}, last_updated=NOW() WHERE lead_id=${leadId}`
  if (u.maxBudget !== undefined) await sql`UPDATE crm_leads SET max_budget=${u.maxBudget}, last_updated=NOW() WHERE lead_id=${leadId}`
  if (u.assignedRM !== undefined) await sql`UPDATE crm_leads SET assigned_rm=${u.assignedRM}, last_updated=NOW() WHERE lead_id=${leadId}`
  if (u.secondaryOwner !== undefined) await sql`UPDATE crm_leads SET secondary_owner=${u.secondaryOwner}, last_updated=NOW() WHERE lead_id=${leadId}`
  if (u.status !== undefined) await sql`UPDATE crm_leads SET status=${u.status}, last_updated=NOW() WHERE lead_id=${leadId}`
  if (u.subStatus !== undefined) await sql`UPDATE crm_leads SET sub_status=${u.subStatus}, last_updated=NOW() WHERE lead_id=${leadId}`
  if (u.tags !== undefined) await sql`UPDATE crm_leads SET tags=${u.tags}, last_updated=NOW() WHERE lead_id=${leadId}`
  if (u.notes !== undefined) await sql`UPDATE crm_leads SET notes=${u.notes}, last_updated=NOW() WHERE lead_id=${leadId}`
  if (u.lastNote !== undefined) await sql`UPDATE crm_leads SET last_note=${u.lastNote}, last_updated=NOW() WHERE lead_id=${leadId}`
  if (u.referralName !== undefined) await sql`UPDATE crm_leads SET referral_name=${u.referralName}, last_updated=NOW() WHERE lead_id=${leadId}`
  if (u.referralPhone !== undefined) await sql`UPDATE crm_leads SET referral_phone=${u.referralPhone}, last_updated=NOW() WHERE lead_id=${leadId}`
  if (u.referralEmail !== undefined) await sql`UPDATE crm_leads SET referral_email=${u.referralEmail}, last_updated=NOW() WHERE lead_id=${leadId}`
  if (u.profession !== undefined) await sql`UPDATE crm_leads SET profession=${u.profession}, last_updated=NOW() WHERE lead_id=${leadId}`
  if (u.company !== undefined) await sql`UPDATE crm_leads SET company=${u.company}, last_updated=NOW() WHERE lead_id=${leadId}`
  if (u.designation !== undefined) await sql`UPDATE crm_leads SET designation=${u.designation}, last_updated=NOW() WHERE lead_id=${leadId}`
  if (u.gender !== undefined) await sql`UPDATE crm_leads SET gender=${u.gender}, last_updated=NOW() WHERE lead_id=${leadId}`
  if (u.dob !== undefined) await sql`UPDATE crm_leads SET dob=${u.dob}, last_updated=NOW() WHERE lead_id=${leadId}`
  if (u.maritalStatus !== undefined) await sql`UPDATE crm_leads SET marital_status=${u.maritalStatus}, last_updated=NOW() WHERE lead_id=${leadId}`
  if (u.sourcingManager !== undefined) await sql`UPDATE crm_leads SET sourcing_manager=${u.sourcingManager}, last_updated=NOW() WHERE lead_id=${leadId}`
  if (u.closingManager !== undefined) await sql`UPDATE crm_leads SET closing_manager=${u.closingManager}, last_updated=NOW() WHERE lead_id=${leadId}`
  if (u.possessionDate !== undefined) await sql`UPDATE crm_leads SET possession_date=${u.possessionDate}, last_updated=NOW() WHERE lead_id=${leadId}`
  if (u.enquiredLocation !== undefined) await sql`UPDATE crm_leads SET enquired_location=${u.enquiredLocation}, last_updated=NOW() WHERE lead_id=${leadId}`
  if (u.purpose !== undefined) await sql`UPDATE crm_leads SET purpose=${u.purpose}, last_updated=NOW() WHERE lead_id=${leadId}`
  if (u.buyer !== undefined) await sql`UPDATE crm_leads SET buyer=${u.buyer}, last_updated=NOW() WHERE lead_id=${leadId}`
  if (u.paymentPlan !== undefined) await sql`UPDATE crm_leads SET payment_plan=${u.paymentPlan}, last_updated=NOW() WHERE lead_id=${leadId}`
  if (u.channelPartner !== undefined) await sql`UPDATE crm_leads SET channel_partner=${u.channelPartner}, last_updated=NOW() WHERE lead_id=${leadId}`
  if (u.carpetArea !== undefined) await sql`UPDATE crm_leads SET carpet_area=${u.carpetArea}, last_updated=NOW() WHERE lead_id=${leadId}`
  if (u.saleableArea !== undefined) await sql`UPDATE crm_leads SET saleable_area=${u.saleableArea}, last_updated=NOW() WHERE lead_id=${leadId}`
  if (u.enquiredFor !== undefined) await sql`UPDATE crm_leads SET enquired_for=${u.enquiredFor}, last_updated=NOW() WHERE lead_id=${leadId}`
  if (u.projectEnquired !== undefined) await sql`UPDATE crm_leads SET project_enquired=${u.projectEnquired}, last_updated=NOW() WHERE lead_id=${leadId}`
  if (u.scheduledAt !== undefined) await sql`UPDATE crm_leads SET scheduled_at=${u.scheduledAt}, last_updated=NOW() WHERE lead_id=${leadId}`
  if (u.bookedName !== undefined) await sql`UPDATE crm_leads SET booked_name=${u.bookedName}, last_updated=NOW() WHERE lead_id=${leadId}`
  if (u.bookedDate !== undefined) await sql`UPDATE crm_leads SET booked_date=${u.bookedDate}, last_updated=NOW() WHERE lead_id=${leadId}`
  if (u.agreementValue !== undefined) await sql`UPDATE crm_leads SET agreement_value=${u.agreementValue}, last_updated=NOW() WHERE lead_id=${leadId}`
  if (u.isDeleted !== undefined) await sql`UPDATE crm_leads SET is_deleted=${u.isDeleted}, last_updated=NOW() WHERE lead_id=${leadId}`
  if (u.isDuplicate !== undefined) await sql`UPDATE crm_leads SET is_duplicate=${u.isDuplicate}, last_updated=NOW() WHERE lead_id=${leadId}`
  if (u.partnerName !== undefined) await sql`UPDATE crm_leads SET partner_name=${u.partnerName}, last_updated=NOW() WHERE lead_id=${leadId}`
}

export function rowToLead(row: any) {
  return {
    leadId: row.lead_id,
    createdAt: row.created_at ? new Date(row.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : '',
    source: row.source || '',
    subSource: row.sub_source || '',
    partnerId: row.partner_id || '',
    partnerName: row.partner_name || '',
    clientName: row.client_name || '',
    phone: row.phone || '',
    altPhone: row.alt_phone || '',
    landline: row.landline || '',
    countryCode: row.country_code || '+91',
    email: row.email || '',
    city: row.city || '',
    propertyType: row.property_type || '',
    budget: row.budget || '',
    minBudget: row.min_budget || '',
    maxBudget: row.max_budget || '',
    assignedRM: row.assigned_rm || '',
    secondaryOwner: row.secondary_owner || '',
    status: row.status || 'New',
    subStatus: row.sub_status || '',
    tags: row.tags || '',
    notes: row.notes || '',
    lastNote: row.last_note || '',
    referralName: row.referral_name || '',
    referralPhone: row.referral_phone || '',
    referralEmail: row.referral_email || '',
    profession: row.profession || '',
    company: row.company || '',
    designation: row.designation || '',
    gender: row.gender || '',
    dob: row.dob || '',
    maritalStatus: row.marital_status || '',
    sourcingManager: row.sourcing_manager || '',
    closingManager: row.closing_manager || '',
    possessionDate: row.possession_date || '',
    enquiredLocation: row.enquired_location || '',
    purpose: row.purpose || '',
    buyer: row.buyer || '',
    paymentPlan: row.payment_plan || '',
    channelPartner: row.channel_partner || '',
    carpetArea: row.carpet_area || '',
    saleableArea: row.saleable_area || '',
    enquiredFor: row.enquired_for || '',
    projectEnquired: row.project_enquired || '',
    scheduledAt: row.scheduled_at || '',
    bookedName: row.booked_name || '',
    bookedDate: row.booked_date || '',
    agreementValue: row.agreement_value || '',
    isDeleted: row.is_deleted || false,
    isDuplicate: row.is_duplicate || false,
    lastUpdated: row.last_updated ? new Date(row.last_updated).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : '',
  }
}

// ─── DATA ─────────────────────────────────────────────────────────────────────

export async function getCRMData() {
  const rows = await sql`SELECT * FROM crm_data ORDER BY created_at DESC`
  return rows.map(rowToData)
}

export async function getCRMDataById(dataId: string) {
  const rows = await sql`SELECT * FROM crm_data WHERE data_id = ${dataId}`
  return rows[0] ? rowToData(rows[0]) : null
}

export async function addCRMData(data: any) {
  const id = data.dataId || `DATA-${Date.now()}`
  await sql`
    INSERT INTO crm_data (data_id, source, name, phone, country_code, email, dob, gender, sub_source, carpet_area, notes, status)
    VALUES (${id}, ${data.source||'Manual'}, ${data.name||''}, ${data.phone||''}, ${data.countryCode||'+91'}, ${data.email||''}, ${data.dob||''}, ${data.gender||''}, ${data.subSource||''}, ${data.carpetArea||''}, ${data.notes||''}, ${data.status||'New'})
  `
  return id
}

export async function updateCRMData(dataId: string, updates: any) {
  if (updates.status !== undefined) await sql`UPDATE crm_data SET status = ${updates.status}, last_updated = NOW() WHERE data_id = ${dataId}`
  if (updates.notes !== undefined) await sql`UPDATE crm_data SET notes = ${updates.notes}, last_updated = NOW() WHERE data_id = ${dataId}`
  if (updates.converted !== undefined) await sql`UPDATE crm_data SET converted = ${updates.converted === 'Yes' || updates.converted === true}, last_updated = NOW() WHERE data_id = ${dataId}`
  if (updates.convertedLeadId !== undefined) await sql`UPDATE crm_data SET converted_lead_id = ${updates.convertedLeadId}, last_updated = NOW() WHERE data_id = ${dataId}`
}

export function rowToData(row: any) {
  return {
    dataId: row.data_id,
    createdAt: row.created_at ? new Date(row.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : '',
    source: row.source || '',
    name: row.name || '',
    phone: row.phone || '',
    countryCode: row.country_code || '+91',
    email: row.email || '',
    dob: row.dob || '',
    gender: row.gender || '',
    subSource: row.sub_source || '',
    carpetArea: row.carpet_area || '',
    notes: row.notes || '',
    status: row.status || 'New',
    converted: row.converted ? 'Yes' : 'No',
    convertedLeadId: row.converted_lead_id || '',
    lastUpdated: row.last_updated ? new Date(row.last_updated).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : '',
  }
}

// ─── HISTORY ─────────────────────────────────────────────────────────────────

export async function addCRMHistory(entry: any) {
  await sql`
    INSERT INTO crm_history (record_id, record_type, action, changed_by, old_status, new_status, notes)
    VALUES (${entry.recordId||''}, ${entry.recordType||'lead'}, ${entry.action||''}, ${entry.changedBy||''}, ${entry.oldStatus||''}, ${entry.newStatus||''}, ${entry.notes||''})
  `
}

export async function getRecordHistory(recordId: string) {
  const rows = await sql`SELECT * FROM crm_history WHERE record_id = ${recordId} ORDER BY timestamp DESC`
  return rows.map(rowToHistory)
}

export async function getRecentHistory(limit = 20) {
  const rows = await sql`SELECT * FROM crm_history ORDER BY timestamp DESC LIMIT ${limit}`
  return rows.map(rowToHistory)
}

function rowToHistory(row: any) {
  return {
    recordId: row.record_id,
    recordType: row.record_type,
    timestamp: row.timestamp ? new Date(row.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : '',
    action: row.action,
    changedBy: row.changed_by,
    oldStatus: row.old_status,
    newStatus: row.new_status,
    notes: row.notes,
  }
}

// ─── SOURCE BREAKDOWN ────────────────────────────────────────────────────────

export async function getLeadsBySource() {
  const rows = await sql`SELECT source, COUNT(*) as count FROM crm_leads WHERE is_deleted = FALSE GROUP BY source`
  return rows.map((r: any) => ({ source: r.source, count: Number(r.count) }))
}
