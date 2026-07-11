import dotenv from 'dotenv';

dotenv.config();

export interface GrowEasyLead {
  created_at: string;
  name: string;
  email: string;
  country_code: string;
  mobile_without_country_code: string;
  company: string;
  city: string;
  state: string;
  country: string;
  lead_owner: string;
  crm_status: 'GOOD_LEAD_FOLLOW_UP' | 'DID_NOT_CONNECT' | 'BAD_LEAD' | 'SALE_DONE' | '';
  crm_note: string;
  data_source: 'leads_on_demand' | 'meridian_tower' | 'eden_park' | 'varah_swamy' | 'sarjapur_plots' | '';
  possession_time: string;
  description: string;
}

export interface ProcessingResult {
  importedLeads: GrowEasyLead[];
  skippedLeads: any[]; 
  failedCount: number;
}

const GEMINI_SYSTEM_INSTRUCTION = `
You are an intelligent CRM data extraction engine.
Your job:
Convert messy lead data into GrowEasy CRM JSON.

Extract these fields:
created_at
name
email
country_code
mobile_without_country_code
company
city
state
country
lead_owner
crm_status
crm_note
data_source
possession_time
description

Rules:
1. CRM Status can ONLY be:
GOOD_LEAD_FOLLOW_UP
DID_NOT_CONNECT
BAD_LEAD
SALE_DONE
If unknown: leave blank.

2. Data source can ONLY be:
leads_on_demand
meridian_tower
eden_park
varah_swamy
sarjapur_plots
If unsure: leave blank.

3. created_at:
Must be valid JavaScript date format. It should work with: new Date(created_at)

4. CRM Notes:
Put all extra useful information here:
- remarks
- comments
- follow up notes
- extra emails
- extra phone numbers
- unmapped useful fields

5. Multiple emails:
First email: email field
Remaining emails: append into crm_note

6. Multiple phone numbers:
First number: mobile_without_country_code
Remaining numbers: append into crm_note

7. Phone formatting:
Separate: country_code
Example:
+91 9876543210
becomes:
country_code: "+91"
mobile_without_country_code: "9876543210"

8. Skip invalid leads.
If record does NOT contain: email AND does NOT contain: phone number, skip it. If you decide a lead is invalid, do not include it in the JSON array output.

9. Never hallucinate.
If information does not exist: return empty string.

10. Return ONLY valid JSON array of objects. No markdown. No explanation.
`;

const responseSchema = {
  type: "ARRAY",
  description: "List of extracted leads conforming to GrowEasy CRM format.",
  items: {
    type: "OBJECT",
    properties: {
      created_at: { type: "STRING", description: "Lead creation date, must be convertible using JavaScript new Date(created_at)." },
      name: { type: "STRING", description: "Name of the lead" },
      email: { type: "STRING", description: "Primary email address. If multiple, use the first one." },
      country_code: { type: "STRING", description: "Separate country code from phone, e.g. +91 or +1." },
      mobile_without_country_code: { type: "STRING", description: "Phone number without country code." },
      company: { type: "STRING", description: "Company name" },
      city: { type: "STRING", description: "City" },
      state: { type: "STRING", description: "State" },
      country: { type: "STRING", description: "Country" },
      lead_owner: { type: "STRING", description: "Lead owner" },
      crm_status: { 
        type: "STRING", 
        description: "Allowed: GOOD_LEAD_FOLLOW_UP, DID_NOT_CONNECT, BAD_LEAD, SALE_DONE or empty string." 
      },
      crm_note: { 
        type: "STRING", 
        description: "Remarks, follow up notes, extra email addresses, extra phone numbers, or any useful unmapped info." 
      },
      data_source: { 
        type: "STRING", 
        description: "Allowed: leads_on_demand, meridian_tower, eden_park, varah_swamy, sarjapur_plots or empty string." 
      },
      possession_time: { type: "STRING", description: "Property possession time or timeframe." },
      description: { type: "STRING", description: "Additional details or description." }
    },
    required: [
      "created_at", "name", "email", "country_code", "mobile_without_country_code",
      "company", "city", "state", "country", "lead_owner",
      "crm_status", "crm_note", "data_source", "possession_time", "description"
    ]
  }
};

/**
 * Process a batch of leads using Gemini API (or fallback local mapper if key is missing).
 */
export async function processBatchWithGemini(
  records: Record<string, string>[]
): Promise<GrowEasyLead[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.log('⚠️ GEMINI_API_KEY not configured. Falling back to local heuristic mapper.');
    // Mimic API delay of 500ms for realistic processing spinner
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockMapRecords(records);
  }

  const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  const prompt = `
Please extract and map the following lead records into the GrowEasy CRM JSON format.

RAW RECORDS TO EXTRACT:
${JSON.stringify(records, null, 2)}
`;

  const requestBody = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ],
    systemInstruction: {
      parts: [
        { text: GEMINI_SYSTEM_INSTRUCTION }
      ]
    },
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      temperature: 0.1
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API returned non-OK status ${response.status}: ${errorText}`);
      // Fallback to local mapper instead of throwing to avoid bubbling a 500 up
      return mockMapRecords(records);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      console.error('Gemini API response structure is invalid or candidates are empty. Falling back to local mapper.');
      return mockMapRecords(records);
    }

    let leads: any[] = [];
    try {
      leads = JSON.parse(candidateText.trim());
    } catch (parseErr) {
      console.error('Failed to parse Gemini response JSON, falling back to local mapper.', parseErr);
      return mockMapRecords(records);
    }

    return normalizeResults(leads);
  } catch (err) {
    console.error('Error calling Gemini API, falling back to local mapper.', err);
    return mockMapRecords(records);
  }
}

function normalizeResults(leads: any[]): GrowEasyLead[] {
  return leads.map(lead => {
    let crm_status: GrowEasyLead['crm_status'] = '';
    const statusMap = ['GOOD_LEAD_FOLLOW_UP', 'DID_NOT_CONNECT', 'BAD_LEAD', 'SALE_DONE'];
    if (statusMap.includes(lead.crm_status)) {
      crm_status = lead.crm_status;
    }

    let data_source: GrowEasyLead['data_source'] = '';
    const sourceMap = ['leads_on_demand', 'meridian_tower', 'eden_park', 'varah_swamy', 'sarjapur_plots'];
    if (sourceMap.includes(lead.data_source)) {
      data_source = lead.data_source;
    }

    let created_at = lead.created_at || '';
    if (created_at) {
      const parsedDate = new Date(created_at);
      if (isNaN(parsedDate.getTime())) {
        created_at = new Date().toISOString();
      } else {
        created_at = parsedDate.toISOString();
      }
    } else {
      created_at = new Date().toISOString();
    }

    return {
      created_at,
      name: lead.name || '',
      email: lead.email || '',
      country_code: lead.country_code || '',
      mobile_without_country_code: lead.mobile_without_country_code || '',
      company: lead.company || '',
      city: lead.city || '',
      state: lead.state || '',
      country: lead.country || '',
      lead_owner: lead.lead_owner || '',
      crm_status,
      crm_note: lead.crm_note || '',
      data_source,
      possession_time: lead.possession_time || '',
      description: lead.description || ''
    };
  });
}

/**
 * Local fallback mapper matching fields by keywords to ensure functionality without API keys.
 */
function mockMapRecords(records: Record<string, string>[]): GrowEasyLead[] {
  return records.map(record => {
    let name = '';
    let email = '';
    let country_code = '';
    let mobile_without_country_code = '';
    let company = '';
    let city = '';
    let state = '';
    let country = '';
    let lead_owner = 'varun@groweasy.ai';
    let crm_status: GrowEasyLead['crm_status'] = '';
    let crm_note_parts: string[] = [];
    let data_source: GrowEasyLead['data_source'] = '';
    let possession_time = '';
    let description = '';
    let created_at = new Date().toISOString();

    for (const [key, val] of Object.entries(record)) {
      const k = key.toLowerCase();
      const v = (val || '').toString().trim();
      if (!v) continue;

      if (k.includes('created') || k.includes('date')) {
        const parsed = new Date(v);
        if (!isNaN(parsed.getTime())) {
          created_at = parsed.toISOString();
        }
      } else if (k === 'name' || k.includes('full name') || k.includes('client') || k.includes('lead') || k.includes('customer name')) {
        if (!name) name = v;
        else crm_note_parts.push(`${key}: ${v}`);
      } else if (k.includes('email') || k.includes('mail')) {
        if (!email) email = v;
        else crm_note_parts.push(`${key}: ${v}`);
      } else if (k.includes('phone') || k.includes('mobile') || k.includes('whatsapp') || k.includes('contact')) {
        if (!mobile_without_country_code) {
          const cleaned = v.replace(/\s+/g, ' ');
          if (cleaned.startsWith('+')) {
            const parts = cleaned.split(' ');
            country_code = parts[0];
            mobile_without_country_code = parts.slice(1).join('').replace(/\D/g, '');
          } else {
            country_code = '';
            mobile_without_country_code = cleaned.replace(/\D/g, '');
          }
        } else {
          crm_note_parts.push(`${key}: ${v}`);
        }
      } else if (k.includes('company')) {
        company = v;
      } else if (k.includes('city')) {
        city = v;
      } else if (k.includes('state')) {
        state = v;
      } else if (k.includes('country')) {
        country = v;
      } else if (k.includes('owner')) {
        lead_owner = v;
      } else if (k.includes('status')) {
        const statusVal = v.toUpperCase();
        if (statusVal.includes('FOLLOW')) crm_status = 'GOOD_LEAD_FOLLOW_UP';
        else if (statusVal.includes('CONNECT')) crm_status = 'DID_NOT_CONNECT';
        else if (statusVal.includes('BAD') || statusVal.includes('SPAM')) crm_status = 'BAD_LEAD';
        else if (statusVal.includes('SALE') || statusVal.includes('WON') || statusVal.includes('DONE')) crm_status = 'SALE_DONE';
      } else if (k.includes('source')) {
        const sourceVal = v.toLowerCase();
        if (sourceVal.includes('demand')) data_source = 'leads_on_demand';
        else if (sourceVal.includes('tower') || sourceVal.includes('meridian')) data_source = 'meridian_tower';
        else if (sourceVal.includes('park') || sourceVal.includes('eden')) data_source = 'eden_park';
        else if (sourceVal.includes('swamy') || sourceVal.includes('varah')) data_source = 'varah_swamy';
        else if (sourceVal.includes('plots') || sourceVal.includes('sarjapur')) data_source = 'sarjapur_plots';
      } else if (k.includes('possession') || k.includes('time')) {
        possession_time = v;
      } else if (k.includes('desc')) {
        description = v;
      } else if (k.includes('note') || k.includes('remark') || k.includes('comment')) {
        crm_note_parts.push(v);
      } else {
        crm_note_parts.push(`${key}: ${v}`);
      }
    }

    return {
      created_at,
      name: name || 'Lead Record',
      email,
      country_code,
      mobile_without_country_code,
      company,
      city,
      state,
      country,
      lead_owner,
      crm_status,
      crm_note: crm_note_parts.join(', '),
      data_source,
      possession_time,
      description
    };
  });
}
