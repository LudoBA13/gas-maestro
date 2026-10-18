# DB File Specification

## Overview
A DB file in **Maestro** is a dedicated Google Sheet acting as the primary local data store for a specific Banque Alimentaire (BA) branch. 

### Core Design Decisions
- **Terminology ("DB")**: Storage targets are referred to as **"DB"** (Database) rather than "Repository" to avoid confusion with Git repositories and to signal that while Google Sheets is currently used for data storage, data could be stored in any underlying database backend.
- **No Google Sheet Formulae**: The system strictly avoids relying on Google Sheet formulae to prevent needlessly introducing another programming language (formulas). All data formatting, computations, and processing are handled entirely within the application code (`Maestro`).
- **Classic DBMS Mapping**:
  - **Spreadsheet = Database (DB)**: Each Google Sheet file represents an isolated DB instance for a specific branch.
  - **Sheet = Table**: Individual worksheets within the spreadsheet represent database tables.
  - **Header Row = Table Schema**: Each table starts with a mandatory header row defining column fields.
  - **DBMS-Compatible Abstraction**: DB operations are designed with semantic interfaces (table creation, schema alteration, row insertion/querying) to mirror classic DBMS concepts and simplify future migration to a full DBMS stack.

## Key Characteristics & Structure

### 1. Identification & Relationship
- **Document Reference**: Identified and referred to by its Google Sheet document ID.
- **BA Association**: The DB is related to a BA via `baId`. The `baId` usually matches `/^ba\d{3}$/`, although exceptions may exist.
- **Naming Convention**: `BA DB - [BA_NAME] ([BA_ID])` (e.g., `BA DB - BA13 (ba13)`).
- **Drive File Properties**: Tagged with a custom public Drive property:
  - Key: `BA_REPOSITORY_ID`
  - Value: The normalized BA identifier (e.g., `ba13`, `ba83`).

### 2. Sheet Structure & Initial State
- **Empty DB State**: An empty DB consists of a single sheet named `Parameters`.
- **Parameters Sheet**: Features two columns serving to store key/value pairs. By default, key/value pairs for `baId` and `baName` are set at creation time.

### 3. Permissions & Security Model
- **Ownership & Access**: Created and owned by/accessible to the branch user within their Google Workspace boundary. The developer/app author has zero access.
- **Soft Protections**: All sheets within the DB have warning-only protections applied programmatically (`protection.setWarningOnly(true)`) to prevent accidental structural edits by users while permitting script-driven data appends and manual inspection.

### 4. Configuration & Persistence
- **State Storage**: Stored in Google Apps Script `UserProperties` under the key `BA_REPOSITORIES` as a serialized JSON array of DB mappings:
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
