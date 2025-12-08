import { NextResponse } from 'next/server';
import supabase from '../lib/db';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('infoar')
      .select('*');
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: data
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}