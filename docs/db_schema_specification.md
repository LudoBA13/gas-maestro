# Database (DB) Schema Specification

## Overview
This document defines the table schemas for data stored within branch DB files. In accordance with Maestro's classic DBMS conceptual mapping:
- Each spreadsheet is a **Database (DB)**.
- Each worksheet is a **Table**.
- The first row of each worksheet represents the **Table Schema** (header row).
- All data ingestion and manipulations are performed programmatically without relying on Google Sheet formulae.

---

## AssoConnect Mirroring Policy
The schemas for **`ACStructures`** and **`ACPersonnes`** are not hardcoded; they entirely mirror AssoConnect's export file structure. 

### Guaranteed Columns
Regardless of the dynamic columns provided by AssoConnect exports, the following two columns are guaranteed to be present and indexed in both tables:
1. **`ID du Contact`**: Primary Key (unique identifier).
2. **`Nom`**: Primary label/name attribute.

---

## 1. Table: `ACStructures`
- **Source**: AssoConnect "Structures" export file.
- **Schema**: Dynamic (mirrors AssoConnect export columns).
- **Guaranteed Fields**:
  - `ID du Contact` (Primary Key)
  - `Nom`

---

## 2. Table: `ACPersonnes`
- **Source**: AssoConnect "Personnes" export file.
- **Schema**: Dynamic (mirrors AssoConnect export columns).
- **Guaranteed Fields**:
  - `ID du Contact` (Primary Key)
  - `Nom`
