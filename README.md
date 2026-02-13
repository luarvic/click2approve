![Dev build status](https://github.com/luarvic/click2approve/actions/workflows/dev-build.yml/badge.svg)

# Table of Contents

1. [Product overview.](#product-overview)
2. [Demo.](#demo)
3. [How to run locally.](#how-to-run-locally)
4. [Architecture and design decisions.](#architecture-and-design-decisions)

# Product Overview

`click2approve` is a free, open-source, cross-platform document approval system with a responsive user interface that allows you to:

- Upload documents.
- Send documents for approval by specifying a list of approvers' email addresses.
- Notify requesting and approving parties via email.
- Keep track of approval requests.

# Demo

Please visit [click2approve.com](https://click2approve.com/) to see how it works.

# How to Run Locally

## Prerequisites

- You have installed the latest version of [Docker Desktop](https://docs.docker.com/get-docker/).
- You have installed a [Git client](https://git-scm.com/downloads).

## Getting Started

### 1. Clone the Repository

Run in a terminal:

```bash
git clone git@github.com:luarvic/click2approve.git
```

### 2. Open `click2approve` Directory

Run in a terminal:

```bash
cd click2approve
```

### 3. Build and Run Docker Images

Run in a terminal:

```bash
docker compose build --no-cache
docker compose up -d
```

Wait until you see:

```
 ✔ Network click2approve_default  Created
 ✔ Container db                   Created
 ✔ Container api                  Created
 ✔ Container ui                   Created
```

### 4. Verify Running Docker Containers

Run in a terminal:

```bash
docker ps -a
```

Make sure all of the following containers are up and running:

- `api`.
- `db`.
- `ui`.

(Find more details about those containers below in [Architecture and design decisions](#architecture-and-design-decisions).)

### 5. Open the Web Page

In the web browser open [http://localhost:3333/](http://localhost:3333/).

You should see a page with the `click2approve` title.

Welcome to the `click2approve` service! 🎉🎉🎉

# Architecture and Design Decisions

The application consists of the following microservices:

- Client-side UI (`React TypeScript v18.2`).
- Server-side API (`ASP.NET Core v8.0`).
- Relational database (`MySQL 8.3.0`).

All microservices are containerized with [Docker](https://docs.docker.com/).

## Client-side UI

It provides a graphical interface, allowing users to interact with the application via a web browser.

It is written in [TypeScript](https://www.typescriptlang.org/) and uses:

- [React](https://react.dev/) library;
- [Material UI](https://mui.com/material-ui/) CSS framework;
- [MobX](https://mobx.js.org/react-integration.html) state management framework.

The build transforms the TypeScript code into a JavaScript single-page application (SPA). The `ui` container hosts [Nginx](https://www.nginx.com/) web server that returns the SPA to the users. The SPA handles HTTP requests coming from the users and interacts with the `Server-side API` microservice.

## Server-side API

It provides HTTP endpoints that implement business logic.

It is written in [C#](https://learn.microsoft.com/en-us/dotnet/csharp/tour-of-csharp/) and uses:

- [ASP.NET Core](https://dotnet.microsoft.com/en-us/apps/aspnet) framework.
- [Entity Framework](https://learn.microsoft.com/en-us/ef/).
- [ASP.NET Identity](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity) framework.

The build compiles the C# code into a self-hosted web API application that handles HTTP requests coming from the UI.
The application interacts with the relational database and the filesystem to manage user data.

## Relational Database

It provides the relational data storage required for system operation.
