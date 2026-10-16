# Repository File Specification

## Overview
A repository file in **Maestro** is a dedicated Google Spreadsheet acting as the primary local data repository for a specific Banque Alimentaire (BA) branch.

## Key Characteristics & Structure

### 1. Identification & Automatic Discovery
- **Naming Convention**: `BA Repository - [BA_NAME] ([BA_ID])` (e.g., `BA Repository - BA13 (ba13)`).
- **Drive File Properties**: Tagged with a custom public Drive property:
  - Key: `BA_REPOSITORY_ID`
  - Value: The normalized BA identifier (e.g., `ba13`, `ba83`).
- **Auto-Discovery**: When a user accesses the web app, their email is parsed against `/^(ba[0-9]+)\./i`. The application checks local `UserProperties` and searches Google Drive for any existing repository matching the `baId` before creating a new one.

### 2. Permissions & Security Model
- **Ownership & Access**: Created and owned by/accessible to the branch user within their Google Workspace boundary. The developer/app author has zero access.
- **Soft Protections**: All sheets within the repository have warning-only protections applied programmatically (`protection.setWarningOnly(true)`) to prevent accidental structural edits by users while permitting script-driven data appends and manual inspection.

### 3. Configuration & Persistence
- **State Storage**: Stored in Google Apps Script `UserProperties` under the key `BA_REPOSITORIES` as a serialized JSON array of repository mappings:
  ```json
  [
    {
      "baId": "ba13",
      "baName": "BA13",
      "spreadsheetId": "1aB2c3D4e5F6g7H8i9J0_example_id"
    }
  ]
  ```

### 4. Data Usage
- Stores ingested, structured data extracted from external data sources (starting with **AssoConnect**).
