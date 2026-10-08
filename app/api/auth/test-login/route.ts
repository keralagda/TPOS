import { NextRequest, NextResponse } from 'next/server';
import { TestFixturesManager } from '@/lib/auth/test-fixtures';

/**
 * Development & Test Fast-Login API
 * 
 * Sets an authentication cookie / session for test fixtures without requiring
 * external database connectivity when in local development or demo mode.
 */
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    const testAccounts = TestFixturesManager.getTestAccounts();
    const matchedAccount = testAccounts.find(
      (a) => a.email.toLowerCase() === email.toLowerCase().trim()
    );

    const validSeedPassword = TestFixturesManager.getSeedPassword();

    // Check if test account matches
    if (matchedAccount) {
      if (password && password !== validSeedPassword) {
        return NextResponse.json(
          { success: false, error: 'Invalid password for test credential.' },
          { status: 401 }
        );
      }

      const response = NextResponse.json({
        success: true,
        user: {
          id: matchedAccount.id,
          email: matchedAccount.email,
          name: matchedAccount.fullName,
          role: matchedAccount.roles[0],
          roles: matchedAccount.roles,
          organizationId: matchedAccount.organizationId,
          workspaceId: matchedAccount.workspaceId,
        },
        message: 'Authenticated successfully with test fixture.',
      });

      // Set development session cookies
      response.cookies.set('tp_dev_user_id', matchedAccount.id, {
        path: '/',
        httpOnly: false,
        sameSite: 'lax',
      });
      response.cookies.set('tp_dev_user_email', matchedAccount.email, {
        path: '/',
        httpOnly: false,
        sameSite: 'lax',
      });
      response.cookies.set('tp_dev_user_role', matchedAccount.roles[0], {
        path: '/',
        httpOnly: false,
        sameSite: 'lax',
      });

      return response;
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Test credential not found. Please click one of the quick test badges below.',
      },
      { status: 404 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
