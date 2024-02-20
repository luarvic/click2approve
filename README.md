# Table of Contents
1. [File manager specification.](#file-manager-specification)
2. [How to run locally.](#how-to-run-locally)
3. [How to test.](#how-to-test)
4. [Architecture and design decisions.](#architecture-and-design-decisions)
5. [To-do list.](#to-do-list)

# File Manager Specification

The File Manager is a web application that is designed to:

- Upload files of the following types:
    - PDF;
    - Excel;
    - Word;
    - Txt;
    - Images.
- Display a list of user files with the following attributes:
    - Icon;
    - Name;
    - Date of upload;
    - Size.
- Download file(s).
- Share user file(s) publicly for the specific time period.

The application consists of two main components:
- Client-side UI (frontend based on `React TypeScript v18.2.0`).
- Server-side API (backend based on `ASP.NET Core v8.0.1`).

The application uses the following third-party microservices:
- [Azure SQL Edge](https://azure.microsoft.com/en-us/products/azure-sql/edge) as a SQL database engine.

All microservises and components are containerizes with [Docker](https://docs.docker.com/).

# How to Run Locally

## Prerequisites

- You have installed the latest version of [Docker Desktop](https://docs.docker.com/get-docker/).
- You have installed a [Git client](https://git-scm.com/downloads).

## Getting Started

### 1. Clone the Repository

Run in terminal:

```bash
git clone git@github.com:luarvic/file-manager.git
```

### 2. Open `file-manager` Directory

Run in terminal:

```bash
cd file-manager
```

### 3. Build and Run Docker Images

Run in terminal:

```bash
docker-compose up
```

Wait a few minutes until all images are built / downloaded.

### 4. Verify Running Docker Containers

In a separate terminal window run:

```bash
docker ps -a
```

Wait until all of the following containers are in `Up` status:

- api;
- db.
- ui;

(Find more details about those containers below in [Architecture and design decisions](#architecture-and-design-decisions).)

### 5. Open File Manager

In the web browser open [http://localhost/](http://localhost/).

You should see a page with `File Manager` title.

Welcome to the File Manager! 🎉🎉🎉

# How to Test

TBD

# Folder Structure

```
file-manager
├── doc                         # Files required for README.md documentation.
├── src                         # API and UI code base.
│  ├── api                      # API code base.
│  │  ├── Authentication        # Authentication handler.
│  │  ├── Controllers           # Classes that implement API endpoints.
│  │  ├── Extensions            # Classes that extend other classes functionality.
│  │  ├── Models                # Entity classes.
│  │  ├── Services              # Classes that implement business logic.
│  ├── ui/src                   # UI code base.
│  │  ├── components            # React components that implement UI pieces.
│  │  ├── models                # Entity classes.
│  │  ├── stores                # Classes that manage application state plus constants. 
│  │  ├── utils                 # Set of helpful methods mostly for communication with API.
```

# Architecture and Design Decisions

The File Manager application is a set of containerized microservices that interact with each other over the network.

Those microservices are:
- `UI` is a frontend component hosted on `Nginx` web server.
- `API` is a backend component.
- `DB` is a SQL engine.

Containerization solves these main goals:
- *Platform-agnostic philosophy.* The microservices can be deployed to and run on any operating system, any cloud provider or any on-premise infrastructure.
- *Scalability.* Once deployed, the services can be scaled out horizontally by adding new instances (e.g. new pods in Kubernetes) to address performance issues. 

Microservices architecture solves these main goals:
- *Programming language agnostic philosophy*. Each microservice is written in the language that suits best for the particular purposes.
- *Independent development and deployment*. Each microservice can be managed by a separate team.
- *Replaceability*. Each microservice can be easily replaced by a new one.
- *Resilience*. If one of the microservices is down, some of the application functionality might still be working.

Let's take a closer look at each of the microservices.

## UI

Its goal is to provide a graphic interface that allows a user to interact with the application via a web browser.

It is written in [TypeScript](https://www.typescriptlang.org/) and uses:

- [React](https://react.dev/) library;
- [Material UI](https://mui.com/material-ui/) CSS framework;
- [MobX](https://mobx.js.org/react-integration.html) state management framework.

The build transforms the TypeScript code to a JavaScripts single-page application (SPA). The `ui` container hosts [Nginx](https://www.nginx.com/) web server that handles the user HTTP requests and returns the SPA that works in the user browser and interacts with the `API` microservice.

## API

Its goals are:

- To provide the HTTP endpoints that implement the File Manager business logic.

It is written in [C#](https://learn.microsoft.com/en-us/dotnet/csharp/tour-of-csharp/) and uses:

- [ASP.NET Core](https://dotnet.microsoft.com/en-us/apps/aspnet) framework.
- [Entity Framework](https://learn.microsoft.com/en-us/ef/).
- [ASP.NET Identity](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity) framework.

## DB

Its purpose to provide a storage for the relational data.

Its a third-party microservice [Azure SQL Edge](https://azure.microsoft.com/en-us/products/azure-sql/edge).

It can be replaced with any other DB engine.

# To-Do List

A list of things that might be enhanced from **technical** perspective:

- In `API` [basic authentication](https://learn.microsoft.com/en-us/aspnet/web-api/overview/security/basic-authentication) can be replaced with [JWT](https://jwt.io/introduction)-based authentication.
- Entity Framework models should be configured to use optimal SQL types and indexes.
- The `API` endpoints should be described in [Swagger UI](https://learn.microsoft.com/en-us/aspnet/core/tutorials/web-api-help-pages-using-swagger).
- [Unit](https://en.wikipedia.org/wiki/Unit_testing) and [integration tests](https://en.wikipedia.org/wiki/Integration_testing) should be added.
- [CI/CD](https://en.wikipedia.org/wiki/CI/CD) should be added.
- A [worker service](https://learn.microsoft.com/en-us/dotnet/core/extensions/workers) or a [hangfire](https://www.hangfire.io/) service should be added to remove outdated links.
- Better error handling and user input validation.
- File list pagination.
- Responsive UI that adapts to any possible screen size.
- Storage limits per user.
- Admin page for managing the application.

A list of things that might be enhanced from **user** perspective:

- More actions for the user files, e.g.:
    - Delete.
    - Sort.
    - Filter.
    - Directories.
- More sign in options (e.g. with Google account).
- More supported file types.
- Recycle bin.
