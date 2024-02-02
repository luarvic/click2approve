# Table of Contents
1. [File Manager Specification](#file-manager-specification)
2. [How to Run Locally](#how-to-run-locally)
3. [How to Test](#how-to-test)
4. [Architecture and Design Decisions](#architecture-and-design-decisions)
5. [To-Do List](#to-do-list)

# File Manager Specification

The File Manager is a web application that allows to:

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
- [Azure SQL Edge](https://azure.microsoft.com/en-us/products/azure-sql/edge) as a SQL database engine
- [JOD Converter](https://github.com/jodconverter) to create thumbnails (preview images).
- [rumkin/file-storage](https://github.com/rumkin/file-storage) as a file storage with REST interface.

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

- `ui` (frontend component hosted in `Nginx` web server).
- `api` (backend component)
- `filestorage` (file storage microservice).
- `jodconverter` (thumbnail microservice).
- `db` (SQL engine).

### 5. Open File Manager

In the web browser open [http://localhost/](http://localhost/).

You should see the home page.

![Home page](/doc/images/home.png)

Welcome to the File Manager! 🎉🎉🎉

# How to Test

## Singing Up and Signing In

Click `Sing in` button in the main menu.

![Main menu](/doc/images/main-menu.png)

If you already have an account, type in your username and password and click `Sign in`.

![Sign in](/doc/images/sign-in.png)

Otherwise, create a new account. Click `Sign up` link, enter the username, the password, the password confirmation, and click `Sign up`.

![Sign up](/doc/images/sign-up.png)

If your information is incorrect, you will be notified.

![Invalid username](/doc/images/invalid-username.png)

If your credential information is correct, a page with the user files will be open. Click `Upload` button to upload new files.

![First entrance](/doc/images/first-entrance.png)

In the dialog window choose the files you want to upload and click `Open` button.

![Choose files to upload](/doc/images/choose-filesto-upload.png)

You will be notified that the uploading is started.

![Uploading started](/doc/images/uploading-started.png)

> [!WARNING] 
> File uploading might be slow because of generating file previews. Find more details in [Architecture and Design Decisions](#architecture-and-design-decisions).

# Folder Structure

# Architecture and Design Decisions

# To-Do List
