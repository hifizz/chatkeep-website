# Update Pricing Checkout Flow

## Goal
Simplify the pricing page by removing the manual selection of payment providers (Stripe vs Creem) and ensuring users are authenticated before initiating a checkout session.

## Context
Currently, users can choose between Stripe and Creem on the pricing page. The checkout button attempts to start a session immediately. The requirement is to remove this choice (defaulting to Creem) and enforce a login/registration step if the user is not authenticated.

## Proposed Changes
1.  **Remove Provider Selection**: Eliminate the UI element allowing users to switch between Stripe and Creem. Hardcode the provider to `creem`.
2.  **Enforce Authentication**: Update the `handleCheckout` function to check for an active user session. If no session exists, redirect the user to the login page instead of calling the checkout RPC.
