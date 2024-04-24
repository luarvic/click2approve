![CI status](https://github.com/luarvic/click2approve/actions/workflows/ci.yml/badge.svg)

# Table of Contents

1. [Click2approve specification.](#click2approve-specification)
2. [Demo.](#demo)
3. [How to run locally.](#how-to-run-locally)
4. [Architecture and design decisions.](#architecture-and-design-decisions)

# Click2approve Specification

Click2approve is a free open-source document approval system that allows to:

- Upload documents.
- Send documents for approval specifying a list of approvers' email addresses.
- Notify the requesting and approving parties via email.
- Keep track the approval requests.

# Demo

Please, open [click2approve.com](https://click2approve.com/) to check how it works.

# How to Run Locally

## Prerequisites

- You have installed the latest version of [Docker Desktop](https://docs.docker.com/get-docker/).
- You have installed a [Git client](https://git-scm.com/downloads).

## Getting Started

### 1. Clone the Repository

Run in terminal:

```bash
git clone git@github.com:luarvic/click2approve.git
```

### 2. Open `click2approve` Directory

Run in terminal:

```bash
cd click2approve
```

### 3. Build and Run Docker Images

Run in terminal:

```bash
docker-compose up
```

### 4. Verify Running Docker Containers

In a separate terminal window run:

```bash
docker ps -a
```

Wait until all of the following containers are up and running:

- `ui`.
- `api`.
- `db`.

(Find more details about those containers below in [Architecture and design decisions](#architecture-and-design-decisions).)

### 5. Open the Web Page

In the web browser open [http://localhost:3333/](http://localhost:3333/).

You should see a page with `click2approve` title.

Welcome to the `click2approve` service! 🎉🎉🎉

# Architecture and Design Decisions

The application consists of the following microservices:

- Client-side UI (`React TypeScript v18.2`).
- Server-side API (`ASP.NET Core v8.0`).
- Relational database (`MySQL 8.3.0`).

All microservises are containerizes with [Docker](https://docs.docker.com/).

## Client-side UI

It provides a graphic interface to allows a user to interact with the application via a web browser.

It is written in [TypeScript](https://www.typescriptlang.org/) and uses:

- [React](https://react.dev/) library;
- [Material UI](https://mui.com/material-ui/) CSS framework;
- [MobX](https://mobx.js.org/react-integration.html) state management framework.

The build transforms the TypeScript code to a JavaScripts single-page application (SPA). The `ui` container hosts [Nginx](https://www.nginx.com/) web server that handles the user HTTP requests and returns the SPA that works in the user browser and interacts with the `Server-side API` microservice.

## Server-side API

It provides HTTP endpoints that implement the business logic.

It is written in [C#](https://learn.microsoft.com/en-us/dotnet/csharp/tour-of-csharp/) and uses:

- [ASP.NET Core](https://dotnet.microsoft.com/en-us/apps/aspnet) framework.
- [Entity Framework](https://learn.microsoft.com/en-us/ef/).
- [ASP.NET Identity](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity) framework.

## Relational Database

It provides a relational data storage.
