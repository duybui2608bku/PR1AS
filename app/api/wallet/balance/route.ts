/**
 * Wallet Balance API
 * GET /api/wallet/balance - Get user's wallet balance and summary
 */

import { NextRequest, NextResponse } from "next/server";
import { WalletService } from "@/lib/wallet/service";
import { getAuthenticatedUser } from "@/lib/wallet/auth-helper";

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const {
      user,
      supabase,
      error: authError,
    } = await getAuthenticatedUser(request);

    if (authError || !user.id) {
      return NextResponse.json(
        { error: authError || "Unauthorized" },
        { status: 401 }
      );
    }

    // Get wallet and summary
    const walletService = new WalletService(supabase);
    const wallet = await walletService.getOrCreateWallet(user.id);
    const summary = await walletService.getWalletSummary(user.id);

    return NextResponse.json({
      success: true,
      wallet,
      summary,
    });
  } catch (error: any) {
    console.error("[Wallet Balance] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch wallet balance",
      },
      { status: 500 }
    );
  }
}
