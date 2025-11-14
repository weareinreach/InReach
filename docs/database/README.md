# Database Documentation

This folder contains documentation for the database schema, models, relationships, and business logic in the project. It is intended for developers, data engineers, and anyone who needs to understand how the database is structured and how certain fields are computed.

## Contents

### 1. Data Models Overview
- **`data-models.md`**  
  Provides an overview of all database models, their fields, and relationships. Includes ER diagrams and explanations of how the main entities relate to each other.

### 2. Business Logic Documentation
- **`organization_claimed.md`**  
  Explains how the `isClaimed` status for organizations is computed. Includes details on which tables and fields are used (`OrganizationPermission`, `UserToOrganization`) and the business rules involved.

### 3. Schema References
- **Other model-specific docs** (optional)  
  For example:
  - `user_permissions.md` – Documentation for user roles, permissions, and their relationships to the database.  
  - `locations.md` – Documentation of location-related tables, including `OrgLocation` and address handling.

## How to Use

1. **Start with `data-models.md`** to get a high-level understanding of the schema.
2. **Reference business logic docs** (like `organization_claimed.md`) to see how computed fields or flags are determined.
3. **Link these documents** in Jira tickets or pull requests to provide context for schema-related changes.

## Guidelines

- Keep this folder **version-controlled** and update it whenever the schema or business logic changes.
- Use diagrams and tables wherever possible to make relationships and computed fields easy to understand.
- Document any **computed fields** or **derived business logic** here to help developers understand how values like `isClaimed` are determined.

---

This README serves as the **entry point** for all database documentation and should remain high-level while linking to more detailed files as needed.
This is the top level Readme to capture database details
