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
    - Name;
    - Icon;
    - Preview;
    - Date of upload;
    - Number of downloads.
- Download file(s).
- Share user files publicly for the specific time period.

The application consists of two main components:
- Client-side UI (frontend based on `React TypeScript v18.2.0`).
- Server-side API (backend based on `ASP.NET Core v8.0.1`).

The application uses the following third-party microservices:
- [Azure SQL Edge](https://azure.microsoft.com/en-us/products/azure-sql/edge) as a SQL database engine.

All microservises and components are containerizes with [Docker](https://docs.docker.com/get-started/02_our_app/).

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

- ui;
- api;
- filestorage;
- jodconverter;
- db.

(Find more details about those containers below in [Architecture and design decisions](#architecture-and-design-decisions).)

### 5. Open File Manager

In the web browser open [http://localhost/](http://localhost/).

You should see the home page.

![Home page](/doc/images/home.png)

Welcome to the File Manager! 🎉🎉🎉

# How to Test

Click `Sing in` button in the main menu.

![Main menu](/doc/images/main-menu.png)

If you already have an account, type in your username and password and click `Sign in`.

![Sign in](/doc/images/sign-in.png)

Otherwise, create a new account by clicking `Sign up` link, entering the username, the password, the password confirmation, and clicking `Sign up`.

![Sign up](/doc/images/sign-up.png)

If your information is incorrect, you will be notified.

![Invalid username](/doc/images/invalid-username.png)

If your credential information is correct, a page with the user files will be open. Click `Upload` button to upload new files.

![First entrance](/doc/images/first-entrance.png)

In the dialog window choose the files you want to upload and click `Open` button.

![Choose files to upload](/doc/images/choose-filesto-upload.png)

You will be notified that the uploading is started.

![Upload started](/doc/images/upload-started.png)

> [!WARNING] 
> Files uploading might be slow because of generating file previews. Find more details in [Architecture and Design Decisions](#architecture-and-design-decisions).

Once the files are uploaded, they will appear in the table. New files (uploaded less than one minute ago) will be highlighted with green color.

![Upload completed](/doc/images/upload-completed.png)

If you hover the mouse pointer over a file, you will see the file preview in a popup window.

![File preview](/doc/images/file-preview.png)

Choose the file(s) you want to download and click `Download` button. Notice, that the number of downloads has been incremented.

![Files download](/doc/images/download.png)

Choose the file(s) you want to share and click `share` button. Choose the date and time until the shared files should be available and click `Create link`.

![Share files](/doc/images/share-files.png)

The link will appear in the dialog window. Click `Copy` button to copy it.

![Create link](/doc/images/create-link.png)

Sign out by clicking `Sign out` button in the main menu. Paste the link into the browser and click `Enter`. As you can see, the link is available publicly and you can download the archive with the shared files.

![Download shared files](/doc/images/download-shared-files.png)

Sign in again, check that the number of downloads has been incremented for the files that we just have downloaded. Sign out.

![Sign out](/doc/images/sign-out.png)

Once the time we have specified for the shared files is over, the link will stop working. If you try to open the link, you will be redirected to `page no found`.

![Page not found](/doc/images/page-not-found.png)

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
- [Semantic UI](https://semantic-ui.com/) CSS framework;
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

- Better alternative for `JOD Converter` service, because sometimes it generates pretty ugly previews (e.g. it breaks the formatting in MS Office documents).
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
