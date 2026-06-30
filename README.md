# Infraedge

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.1.0.

# Project Setup

## Running the Server

To start the server, run:

```bash
npm run server
```

The server configuration and port are defined in `package.json`.

---

## Running the Client

To start the client application, run:

```bash
npm start
```

---

# Notes

The application was inspired by the reference images that were provided.

Due to the available time, there are a few features shown in the reference images that were not implemented, along with several smaller UI refinements.

The styling is also only partially organized. While the color palette has been unified, the following improvements are still pending:

- Consistent typography
- Shared styling for common controls
- Centralized spacing (padding and margins)
- Additional UI polish and layout refinements

---

# Technical Notes

The project uses a proxy configuration to enable shorter API URLs.

It also includes:

- HTTP interceptors
- Route authentication guards

These were implemented even though the mock authentication server does not fully follow security best practices.