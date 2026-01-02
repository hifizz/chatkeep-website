# Manual Test Cases: Billing (Stripe + Creem)

> Scope: subscription checkout, trial/grace logic, refunds, access control, webhook sync, and shared pricing.

## A. Configuration & Health

1. Environment validation
- Setup: unset `CREEM_API_KEY` or `STRIPE_SECRET_KEY`
- Steps: boot the app and open pricing/checkout
- Expected: provider reported unavailable, clear error response

2. Trial and past due defaults
- Setup: unset `SUBSCRIPTION_TRIAL_DAYS` and `PAST_DUE_GRACE_DAYS`
- Steps: boot server and read config
- Expected: trial defaults to 7 days, past due grace defaults to 5 days

3. Shared pricing
- Setup: `src/lib/pricing.ts` has monthly=9.9, annual=99
- Steps: load pricing page and create checkout
- Expected: UI price and backend amount match

## B. Checkout Creation & Price Integrity

4. Stripe checkout (monthly)
- Steps: select `monthly + stripe`
- Expected: Stripe checkout URL, amount $9.9

5. Creem checkout (annual)
- Steps: select `annual + creem`
- Expected: Creem checkout URL, amount $99

6. Invalid provider
- Steps: send `provider=invalid`
- Expected: 400 with validation error

7. Amount tampering
- Steps: send request with forged amount
- Expected: backend ignores client amount, uses pricing config

8. Free plan checkout blocked
- Steps: attempt `planKey=free`
- Expected: checkout rejected

## C. Subscription Status & Access

9. Trial grants access
- Steps: create trial subscription, call `/api/rpc/me`
- Expected: `plan.status=trial`, `isPro=true`

10. Trial converts to paid
- Steps: trial ends with successful payment
- Expected: `plan.status=active`, `isPro=true`

11. Trial ends unpaid
- Steps: trial ends without payment
- Expected: `plan.status=canceled`, `isPro=false`

12. Active subscription access
- Steps: paid user calls `/api/rpc/me`
- Expected: `isPro=true`, `plan.status=active`

13. Cancel at period end
- Steps: cancel subscription before end
- Expected: `plan.status=grace`, `isPro=true`

14. Period ends
- Steps: wait until period end
- Expected: `plan.status=canceled`, `isPro=false`

15. Past due grace window
- Steps: force payment failure -> `past_due`
- Expected: within 5 days `isPro=true`

16. Past due timeout
- Steps: exceed grace window
- Expected: `plan.status=canceled`, `isPro=false`

## D. Webhook Sync

17. Stripe subscription created
- Steps: finish Stripe checkout
- Expected: local subscription record created

18. Stripe payment failed -> past_due
- Steps: use failing payment method
- Expected: local status `past_due`

19. Stripe refund
- Steps: issue refund
- Expected: status `refunded`, `isPro=false`

20. Creem webhook sync
- Steps: finish Creem checkout
- Expected: local subscription record updated

21. Webhook idempotency
- Steps: resend same webhook event
- Expected: no duplicate state change

22. Invalid webhook signature
- Steps: send webhook with bad signature
- Expected: 401/400 rejection

## E. Frontend Flow

23. Pricing page display
- Steps: open `/pricing`
- Expected: Free/Monthly/Annual displayed with correct prices

24. Provider selection
- Steps: toggle Stripe/Creem
- Expected: checkout uses selected provider

25. Success redirect
- Steps: complete checkout
- Expected: redirect to success page, `/api/rpc/me` updated

26. Grace access
- Steps: cancel subscription, access Pro
- Expected: access granted until period end

## F. Security & Edge Cases

27. Unauthenticated checkout
- Steps: call checkout without session
- Expected: 401

28. Invalid planKey
- Steps: send unknown planKey
- Expected: 400

29. Cross-user access
- Steps: attempt to fetch another user's subscription
- Expected: 403/401

30. Partial provider config
- Steps: only Stripe configured
- Expected: Stripe works, Creem fails gracefully
