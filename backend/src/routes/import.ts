import { Router, Request, Response } from 'express';
import { parseCSV, csvToRecords } from '../utils/csv.js';
import { processBatchWithGemini, GrowEasyLead } from '../services/gemini.js';

const router = Router();

// Helper to delay execution (for rate limit backoff)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface FailedBatch {
  batchIndex: number;
  records: Record<string, string>[];
  errorMessage: string;
}

/**
 * POST /api/import
 * Expects { csv: string, batchSize?: number, failedBatchesOnly?: Record<string, string>[][] }
 */
router.post('/import', async (req: Request, res: Response): Promise<void> => {
  try {
    const { csv, batchSize = 15, failedBatchesOnly } = req.body;
    let records: Record<string, string>[] = [];

    if (failedBatchesOnly && Array.isArray(failedBatchesOnly)) {
      // If we are retrying specific failed batches, flatten them
      records = failedBatchesOnly.flat();
    } else {
      if (!csv || typeof csv !== 'string') {
        res.status(400).json({ error: 'CSV data is required as a string.' });
        return;
      }

      // 1. Parse CSV
      const rows = parseCSV(csv);
      if (rows.length < 2) {
        res.status(400).json({ error: 'CSV must contain a header and at least one data row.' });
        return;
      }

      // 2. Convert CSV rows to key-value record objects
      records = csvToRecords(rows);
    }

    const totalRecords = records.length;
    if (totalRecords === 0) {
      res.status(200).json({
        success: true,
        summary: { totalRows: 0, imported: 0, skipped: 0, failed: 0 },
        importedLeads: [],
        skippedLeads: [],
        failedBatches: []
      });
      return;
    }

    // 3. Split records into batches
    const batches: Record<string, string>[][] = [];
    for (let i = 0; i < records.length; i += batchSize) {
      batches.push(records.slice(i, i + batchSize));
    }

    const importedLeads: GrowEasyLead[] = [];
    const skippedLeads: Record<string, string>[] = [];
    const failedBatches: FailedBatch[] = [];

    // 4. Send batches to AI model with retry logic
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      let attempts = 3;
      let success = false;
      let lastError = '';

      while (attempts > 0 && !success) {
        try {
          const batchResults = await processBatchWithGemini(batch);
          
          // Separate valid leads from skipped leads
          // Rule 8: Skip if it does NOT contain email AND does NOT contain phone
          for (const rawRecord of batch) {
            // Find matched lead based on name / email / mobile matches
            const email = (rawRecord.email || rawRecord.Email || rawRecord['Email Address'] || rawRecord['Primary Email'] || '').toString().toLowerCase().trim();
            const phoneKeys = ['phone', 'mobile', 'whatsapp', 'contact', 'phone number', 'mobile number', 'whatsapp number', 'contact number'];
            let phone = '';
            for (const key of Object.keys(rawRecord)) {
              if (phoneKeys.some(pk => key.toLowerCase().includes(pk))) {
                phone = rawRecord[key];
                break;
              }
            }

            // Let's also check if Gemini extracted a valid lead
            const matchedLead = batchResults.find((lead: GrowEasyLead) => {
              // Match by name and phone/email
              const leadEmail = lead.email.toLowerCase().trim();
              const leadPhone = lead.mobile_without_country_code.trim();
              return (email && leadEmail === email) || (phone && leadPhone.includes(phone.replace(/\D/g, '')));
            });

            if (matchedLead) {
              // Verify rule 8: email AND mobile must not both be blank
              if (!matchedLead.email && !matchedLead.mobile_without_country_code) {
                skippedLeads.push(rawRecord);
              } else {
                importedLeads.push(matchedLead);
              }
            } else {
              // If Gemini skipped it or didn't return, verify if it is indeed invalid
              const rawHasEmail = !!email;
              const rawHasPhone = !!phone.replace(/\D/g, '');
              if (!rawHasEmail && !rawHasPhone) {
                skippedLeads.push(rawRecord);
              } else {
                // It was valid but AI missed it or filtered it out. Let's create a placeholder lead or treat it as skipped.
                skippedLeads.push(rawRecord);
              }
            }
          }

          success = true;
        } catch (error: any) {
          attempts--;
          lastError = error.message || 'Unknown error';
          if (attempts > 0) {
            // Wait 2 seconds before retrying
            await delay(2000);
          }
        }
      }

      if (!success) {
        failedBatches.push({
          batchIndex,
          records: batch,
          errorMessage: lastError
        });
      }
    }

    // Return normalized JSON
    res.status(200).json({
      success: true,
      summary: {
        totalRows: totalRecords,
        imported: importedLeads.length,
        skipped: skippedLeads.length,
        failed: failedBatches.reduce((acc, curr) => acc + curr.records.length, 0)
      },
      importedLeads,
      skippedLeads,
      failedBatches
    });

  } catch (error: any) {
    console.error('Error in /api/import:', error);
    res.status(500).json({ error: error.message || 'An internal server error occurred.' });
  }
});

export default router;
