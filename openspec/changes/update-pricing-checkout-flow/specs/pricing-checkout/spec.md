# Pricing Checkout Specification

## MODIFIED Requirements

### Requirement: Checkout Authentication
The system MUST require users to be authenticated before initiating a checkout session.

#### Scenario: Unauthenticated user clicks checkout
- **Given** an unauthenticated user is on the pricing page
- **When** they click "Start monthly" or any plan CTA button
- **Then** they are redirected to the `/login` page
- **And** the checkout process is not initiated

#### Scenario: Authenticated user clicks checkout
- **Given** an authenticated user is on the pricing page
- **When** they click a plan CTA button
- **Then** the checkout process is initiated immediately

### Requirement: Payment Provider
The system MUST use Creem as the exclusive payment provider for new checkout sessions initiated from the pricing page.

#### Scenario: Provider Selection
- **Given** a user is on the pricing page
- **Then** no option to select "Stripe" or "Creem" is displayed
- **And** "Creem" is used as the default provider for all requests