import { NextResponse } from 'next/server';
import { getSalesData } from '../../../dataService.js';

export async function GET() {
    try {
        const data = await getSalesData();
        return NextResponse.json(data);
    } catch (err) {
        console.error("Error fetching sales data:", err);
        return NextResponse.json({ error: "Failed to fetch data from data source." }, { status: 500 });
    }
}
