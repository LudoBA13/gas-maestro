# Maestro

## Overview
Maestro is a Google Apps Script (GAS) web application serving as a centralized control center for extracting, managing, and exploiting data from external sources, starting with AssoConnect.

## Architecture & Design
- **Execution Context**: Runs as the current user (`USER_DEPLOYED`), leveraging Google Workspace permissions to ensure access security and privacy. The application author cannot access user data without explicit permission.
- **Data Storage ("DB")**: Google Sheets is used as the storage backend. Storage files are referred to as **"DB"** (Database) rather than "Repository" to avoid confusion with Git repositories and signal that data storage is backend-agnostic.
- **No Google Sheet Formulae**: The application strictly avoids relying on Google Sheet formulae to prevent needlessly introducing another programming language (formulas). All computations and processing are performed in application code (`Maestro`).
- **Configuration**: Spreadsheet IDs are stored in User Properties.
- **Multi-DB Support**: Users can configure and manage multiple data DBs, while single-DB usage remains the default for the vast majority of users.
- **Namespacing & Global Scope**: To prevent name collisions and global namespace pollution, Google Apps Script evaluates `.gs` files alphabetically. The alphabetically first file (`_Maestro.gs`) declares the single global symbol `const Maestro = {};`. All application logic, classes, and helper functions are attached as properties of `Maestro`.

## Architecture Diagram
```mermaid
graph TD
    Author([App Author]) -->|Can read or modify| SourceCode[Source Code]
    Author -.-x|No Access|UserBoundary
    
    User([User]) -->|Can only read| SourceCode
    User -->|Accesses Web App <br/> Executes as Current User| WebApp(WebApp)
    SourceCode -->|Deployment| WebApp
    WebApp -->|Reads/Writes Data| Sheets[(Google Sheets<br/><i>Data Repository</i>)]
    WebApp -->|Accesses Properties| UserProps[(User Properties<br/><i>Spreadsheet IDs</i>)]
    
    subgraph UserBoundary [Google Workspace - User Boundary]
        UserProps
        Sheets
    end

    classDef authorStyle stroke:#0000ff;
    classDef userStyle stroke:#ff0000;
    classDef userBoundaryStyle stroke:#ff0000;
    class Author authorStyle;
    class User userStyle;
    class UserBoundary userBoundaryStyle;

    linkStyle 0,1,4 stroke:#0000ff
    linkStyle 2,3,5,6 stroke:#ff0000
```

## Development Notes
- **AI Assistance**: Development is assisted and/or augmented using Gemini.
- **Languages**: All development resources (code, comments, and technical documentation) are maintained in English, whereas the user interface (UI) is localized in French.
