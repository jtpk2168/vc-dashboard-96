import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Determine Data Source
const DATA_SOURCE = process.env.DATA_SOURCE || 'csv';

export async function getSalesData() {
    if (DATA_SOURCE === 'supabase') {
        if (!supabase) {
            throw new Error("Supabase credentials are not configured in your .env file.");
        }

        // Fetch from Supabase
        const { data, error } = await supabase
            .from('sales_data')
            .select('*');

        if (error) {
            console.error("Supabase fetch error:", error);
            throw error;
        }

        return data;
    } else {
        // Fetch from Local CSV
        return new Promise((resolve, reject) => {
            const csvFilePath = path.join(process.cwd(), 'public', 'data', 'sales_data.csv');
            fs.readFile(csvFilePath, 'utf8', (err, data) => {
                if (err) {
                    console.error("Error reading CSV:", err);
                    return reject(new Error("Failed to read data file"));
                }

                Papa.parse(data, {
                    header: true,
                    dynamicTyping: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        resolve(results.data);
                    },
                    error: (error) => {
                        console.error("Error parsing CSV:", error);
                        reject(new Error("Failed to parse data file"));
                    }
                });
            });
        });
    }
}
