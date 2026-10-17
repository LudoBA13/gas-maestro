# Repository File Specification

## Overview
A repository file in **Maestro** is a dedicated Google Sheet acting as the primary local data repository for a specific Banque Alimentaire (BA) branch. The specific document is referred to using its Google Sheet document ID.

## Key Characteristics & Structure

### 1. Identification & Relationship
- **Document Reference**: Identified and referred to by its Google Sheet document ID.
- **BA Association**: The repository is related to a BA via `baId`. The `baId` usually matches `/^ba\d{3}$/`, although exceptions may exist.
- **Naming Convention**: `BA Repository - [BA_NAME] ([BA_ID])` (e.g., `BA Repository - BA13 (ba13)`).
- **Drive File Properties**: Tagged with a custom public Drive property:
  - Key: `BA_REPOSITORY_ID`
  - Value: The normalized BA identifier (e.g., `ba13`, `ba83`).

### 2. Sheet Structure & Initial State
- **Empty Repository State**: An empty repository consists of a single sheet named `Parameters`.
- **Parameters Sheet**: Features two columns serving to store key/value pairs. By default, key/value pairs for `baId` and `baName` are set at creation time.

### 3. Permissions & Security Model
- **Ownership & Access**: Created and owned by/accessible to the branch user within their Google Workspace boundary. The developer/app author has zero access.
- **Soft Protections**: All sheets within the repository have warning-only protections applied programmatically (`protection.setWarningOnly(true)`) to prevent accidental structural edits by users while permitting script-driven data appends and manual inspection.

### 4. Configuration & Persistence
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

### 5. Data Usage
- Stores ingested, structured data extracted from external data sources (starting with **AssoConnect**).
