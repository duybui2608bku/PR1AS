-- =============================================================================
-- CREATE FAKE TRANSACTIONS FOR TESTING
-- =============================================================================
-- This script creates fake wallet transactions for UI testing purposes
-- Run this in Supabase SQL Editor to populate test data
-- =============================================================================

-- IMPORTANT: Replace 'YOUR_USER_ID' with actual user ID from auth.users table
-- Get user ID: SELECT id, email FROM auth.users;

-- Variables (replace these before running)
-- USER_ID: Get from auth.users table
-- WALLET_ID: Get from wallets table WHERE user_id = 'YOUR_USER_ID'

-- =============================================================================
-- STEP 1: Get User ID and Wallet ID (Run this first)
-- =============================================================================
SELECT 
  u.id as user_id,
  u.email,
  w.id as wallet_id,
  w.balance_usd
FROM auth.users u
LEFT JOIN wallets w ON w.user_id = u.id
ORDER BY u.created_at DESC
LIMIT 5;

-- Copy the user_id and wallet_id from results above, then use in Step 2

-- =============================================================================
-- STEP 2: Insert Fake Transactions (Replace USER_ID and WALLET_ID)
-- =============================================================================

DO $$
DECLARE
  v_user_id UUID := 'YOUR_USER_ID'; -- Replace with actual user ID
  v_wallet_id UUID := 'YOUR_WALLET_ID'; -- Replace with actual wallet ID
  v_current_balance DECIMAL(15,2) := 0.00;
  v_transaction_id UUID;
BEGIN

  -- =============================================================================
  -- 1. DEPOSIT via Bank Transfer (Completed)
  -- =============================================================================
  v_current_balance := 0.00;
  
  INSERT INTO transactions (
    user_id,
    wallet_id,
    type,
    amount_usd,
    balance_before_usd,
    balance_after_usd,
    payment_method,
    payment_gateway_id,
    status,
    description,
    created_at,
    completed_at
  ) VALUES (
    v_user_id,
    v_wallet_id,
    'deposit',
    100.00,
    v_current_balance,
    v_current_balance + 100.00,
    'bank_transfer',
    'ND' || floor(random() * 1000000000)::text,
    'completed',
    'Bank transfer deposit',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days' + INTERVAL '3 minutes'
  ) RETURNING id INTO v_transaction_id;
  
  v_current_balance := v_current_balance + 100.00;

  RAISE NOTICE 'Created deposit transaction: %', v_transaction_id;

  -- =============================================================================
  -- 2. DEPOSIT via PayPal (Completed)
  -- =============================================================================
  
  INSERT INTO transactions (
    user_id,
    wallet_id,
    type,
    amount_usd,
    balance_before_usd,
    balance_after_usd,
    payment_method,
    payment_gateway_id,
    status,
    description,
    created_at,
    completed_at
  ) VALUES (
    v_user_id,
    v_wallet_id,
    'deposit',
    50.00,
    v_current_balance,
    v_current_balance + 50.00,
    'paypal',
    'PAYPAL_' || substr(md5(random()::text), 1, 10),
    'completed',
    'PayPal deposit',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days' + INTERVAL '1 minute'
  );
  
  v_current_balance := v_current_balance + 50.00;

  -- =============================================================================
  -- 3. PAYMENT to Worker (Completed - for client)
  -- =============================================================================
  
  INSERT INTO transactions (
    user_id,
    wallet_id,
    type,
    amount_usd,
    balance_before_usd,
    balance_after_usd,
    payment_method,
    status,
    description,
    created_at,
    completed_at
  ) VALUES (
    v_user_id,
    v_wallet_id,
    'payment',
    30.00,
    v_current_balance,
    v_current_balance - 30.00,
    'internal',
    'completed',
    'Payment for job #1234',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days' + INTERVAL '5 minutes'
  );
  
  v_current_balance := v_current_balance - 30.00;

  -- =============================================================================
  -- 4. PLATFORM FEE (Completed)
  -- =============================================================================
  
  INSERT INTO transactions (
    user_id,
    wallet_id,
    type,
    amount_usd,
    balance_before_usd,
    balance_after_usd,
    payment_method,
    status,
    description,
    created_at,
    completed_at
  ) VALUES (
    v_user_id,
    v_wallet_id,
    'platform_fee',
    3.00,
    v_current_balance,
    v_current_balance - 3.00,
    'internal',
    'completed',
    'Platform fee (10%)',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
  );
  
  v_current_balance := v_current_balance - 3.00;

  -- =============================================================================
  -- 5. WITHDRAWAL to Bank (Processing)
  -- =============================================================================
  
  INSERT INTO transactions (
    user_id,
    wallet_id,
    type,
    amount_usd,
    balance_before_usd,
    balance_after_usd,
    payment_method,
    status,
    description,
    metadata,
    created_at
  ) VALUES (
    v_user_id,
    v_wallet_id,
    'withdrawal',
    50.00,
    v_current_balance,
    v_current_balance - 50.00,
    'bank_transfer',
    'processing',
    'Withdrawal to bank account',
    jsonb_build_object(
      'bank_name', 'Vietcombank',
      'account_number', '1234567890',
      'account_holder', 'Test User'
    ),
    NOW() - INTERVAL '1 day'
  );
  
  v_current_balance := v_current_balance - 50.00;

  -- =============================================================================
  -- 6. EARNING from Job (Completed - for worker)
  -- =============================================================================
  
  INSERT INTO transactions (
    user_id,
    wallet_id,
    type,
    amount_usd,
    balance_before_usd,
    balance_after_usd,
    payment_method,
    status,
    description,
    created_at,
    completed_at
  ) VALUES (
    v_user_id,
    v_wallet_id,
    'earning',
    45.00,
    v_current_balance,
    v_current_balance + 45.00,
    'internal',
    'completed',
    'Earned from job #5678',
    NOW() - INTERVAL '6 hours',
    NOW() - INTERVAL '6 hours'
  );
  
  v_current_balance := v_current_balance + 45.00;

  -- =============================================================================
  -- 7. DEPOSIT (Pending)
  -- =============================================================================
  
  INSERT INTO transactions (
    user_id,
    wallet_id,
    type,
    amount_usd,
    balance_before_usd,
    balance_after_usd,
    payment_method,
    payment_gateway_id,
    status,
    description,
    created_at
  ) VALUES (
    v_user_id,
    v_wallet_id,
    'deposit',
    75.00,
    v_current_balance,
    v_current_balance + 75.00,
    'bank_transfer',
    'ND' || floor(random() * 1000000000)::text,
    'pending',
    'Bank transfer deposit (pending confirmation)',
    NOW() - INTERVAL '2 hours'
  );

  -- =============================================================================
  -- 8. REFUND (Completed)
  -- =============================================================================
  
  INSERT INTO transactions (
    user_id,
    wallet_id,
    type,
    amount_usd,
    balance_before_usd,
    balance_after_usd,
    payment_method,
    status,
    description,
    created_at,
    completed_at
  ) VALUES (
    v_user_id,
    v_wallet_id,
    'refund',
    20.00,
    v_current_balance,
    v_current_balance + 20.00,
    'internal',
    'completed',
    'Refund for cancelled job',
    NOW() - INTERVAL '12 hours',
    NOW() - INTERVAL '12 hours'
  );
  
  v_current_balance := v_current_balance + 20.00;

  -- =============================================================================
  -- 9. WITHDRAWAL (Failed)
  -- =============================================================================
  
  INSERT INTO transactions (
    user_id,
    wallet_id,
    type,
    amount_usd,
    balance_before_usd,
    balance_after_usd,
    payment_method,
    status,
    description,
    created_at,
    failed_at
  ) VALUES (
    v_user_id,
    v_wallet_id,
    'withdrawal',
    100.00,
    v_current_balance,
    v_current_balance,
    'paypal',
    'failed',
    'Withdrawal failed - Invalid PayPal account',
    NOW() - INTERVAL '8 hours',
    NOW() - INTERVAL '7 hours'
  );

  -- =============================================================================
  -- 10. Update Wallet Balance
  -- =============================================================================
  
  UPDATE wallets
  SET 
    balance_usd = v_current_balance,
    total_earned_usd = (
      SELECT COALESCE(SUM(amount_usd), 0)
      FROM transactions
      WHERE user_id = v_user_id
        AND type IN ('deposit', 'earning', 'refund')
        AND status = 'completed'
    ),
    total_spent_usd = (
      SELECT COALESCE(SUM(amount_usd), 0)
      FROM transactions
      WHERE user_id = v_user_id
        AND type IN ('payment', 'withdrawal', 'platform_fee', 'insurance_fee')
        AND status = 'completed'
    ),
    pending_usd = (
      SELECT COALESCE(SUM(amount_usd), 0)
      FROM transactions
      WHERE user_id = v_user_id
        AND status IN ('pending', 'processing')
    ),
    updated_at = NOW()
  WHERE user_id = v_user_id;

  RAISE NOTICE 'Successfully created fake transactions!';
  RAISE NOTICE 'Final balance: %', v_current_balance;

END $$;

-- =============================================================================
-- STEP 3: Verify Transactions
-- =============================================================================
SELECT 
  t.created_at,
  t.type,
  t.amount_usd,
  t.status,
  t.payment_method,
  t.description,
  t.balance_after_usd
FROM transactions t
WHERE t.user_id = 'YOUR_USER_ID' -- Replace with actual user ID
ORDER BY t.created_at DESC;

-- =============================================================================
-- STEP 4: Check Wallet Balance
-- =============================================================================
SELECT 
  w.balance_usd,
  w.pending_usd,
  w.total_earned_usd,
  w.total_spent_usd,
  w.status,
  w.updated_at
FROM wallets w
WHERE w.user_id = 'YOUR_USER_ID'; -- Replace with actual user ID

-- =============================================================================
-- CLEANUP: Delete All Fake Transactions (Optional)
-- =============================================================================
-- Uncomment to delete all transactions for testing user

/*
DELETE FROM transactions 
WHERE user_id = 'YOUR_USER_ID'; -- Replace with actual user ID

UPDATE wallets
SET 
  balance_usd = 0,
  pending_usd = 0,
  total_earned_usd = 0,
  total_spent_usd = 0,
  updated_at = NOW()
WHERE user_id = 'YOUR_USER_ID'; -- Replace with actual user ID
*/

