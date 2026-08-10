# AI Agent Task: Prepare an Ubuntu Deployment Guide

I have a newly installed copy of Ubuntu Desktop 24.04.2 LTS running on a computer named `Xeon`. The computer has an Intel Xeon E3-1246 processor and 16 GB of RAM.

Review this application and determine exactly what I need to do to deploy and run it on the Ubuntu computer.

## Objectives

Create a complete, beginner-friendly deployment procedure that covers:

1. Preparing Ubuntu with all required system packages.
2. Installing the correct supported versions of Node.js, npm, and any other required tools.
3. Transferring or cloning the application onto `Xeon`.
4. Installing the application's dependencies.
5. configuring any required environment variables or configuration files.
6. Running the application's tests and production build.
7. Serving the built application reliably on the local network.
8. Configuring the Ubuntu firewall, if necessary.
9. Making the application start automatically after a reboot.
10. Explaining how to update, restart, stop, troubleshoot, and remove the deployment.

## Deployment Expectations

- Inspect the repository before recommending commands. Base the instructions on the application's actual framework, scripts, dependencies, and build output.
- Prefer a stable production deployment suitable for Ubuntu 24.04 LTS. Use a web server such as Nginx when appropriate.
- Do not require a development server for the production deployment.
- State whether the application needs a backend, database, secrets, or environment variables.
- Use the hostname `Xeon` in examples where appropriate.
- Explain how to find the computer's local IP address and access the application from another device on the same network.
- Include exact terminal commands in the order they should be run.
- Clearly distinguish commands run as the normal user from commands requiring `sudo`.
- Do not assume that Node.js, Git, Nginx, or other development tools are already installed.
- Use current package and security guidance that is compatible with Ubuntu Desktop 24.04.2 LTS.
- Avoid destructive commands. Explain the effect of commands that change firewall rules, services, ownership, or system configuration.
- Include a rollback or uninstall procedure.

## Verification

The guide must include checks that confirm:

- Dependencies install successfully.
- Automated tests pass.
- The production build completes successfully.
- The web server is running.
- The application loads locally on `Xeon`.
- The application is reachable from another device on the local network.
- The application still works after `Xeon` is rebooted.

If multiple deployment approaches are possible, recommend one primary approach and briefly explain why it is the best fit for this application. Mention alternatives only when they provide a meaningful benefit.
