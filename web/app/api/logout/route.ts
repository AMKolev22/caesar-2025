import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

export async function PUT() {
    try {
        const token = (await cookies()).get('token')?.value;    
        (await cookies()).set('token', '', { path: '/', maxAge: 0 });
        return NextResponse.json({ success: true }, { status: 201 });
    }
    catch (err) {
        console.log(err);
    }
}
