# rpc-api Specification

## Purpose
TBD - created by archiving change add-hono-rpc-api. Update Purpose after archive.
## Requirements
### Requirement: Hono RPC API routing

The system SHALL expose a Hono application through a Next.js App Router route handler and serve RPC endpoints under the API base path.

#### Scenario: Route handler dispatches to Hono

- **WHEN** a request is sent to an RPC endpoint under the API base path
- **THEN** the request is handled by the Hono app and returns its response

### Requirement: Typed hc client access

The system SHALL export the Hono app type and provide a client helper that enables hc-based type inference in the frontend.

#### Scenario: Frontend consumes typed RPC client

- **WHEN** the frontend imports the client helper
- **THEN** request and response types are inferred from the Hono app type

### Requirement: Zod request validation

The system SHALL validate RPC request payloads using Zod and return a 400 response with validation details on invalid input.

#### Scenario: Validation rejects invalid payload

- **WHEN** a request payload fails Zod validation
- **THEN** the API responds with status 400 and validation error details

### Requirement: Session-based authorization

The system SHALL require a valid better-auth session for protected RPC routes and return 401 when missing.

#### Scenario: Unauthorized access is rejected

- **WHEN** a request targets a protected RPC route without a valid session
- **THEN** the API responds with status 401

### Requirement: Client error handling helper

The system SHALL provide a shared client helper for normalizing RPC error responses, including 400 validation errors and 401 unauthorized responses.

#### Scenario: Frontend handles standardized RPC errors

- **WHEN** a client request receives a 400 or 401 response
- **THEN** the helper returns a structured error with status and message

