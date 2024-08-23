# MongoDB Setup for MSYS2/UCRT64 with Laragon

This README provides the steps to configure MongoDB in the Laragon environment and make it accessible from the MSYS2/UCRT64 terminal.

## Prerequisites

- Laragon installed in `D:\laragon\`
- MongoDB downloaded to `D:\laragon\bin\mongodb\mongodb-win32-x86_64-windows-7.0.12`

## Step 1: Configuring MongoDB

Ensure the `mongod.conf` file is configured correctly. In this setup, we removed the deprecated `journal.enabled` option.

**mongod.conf:**

```yaml
# mongod.conf

# where to write logging data.
systemLog:
  destination: file
  logAppend: true
  path: D:\laragon\bin\mongodb\mongodb-win32-x86_64-windows-7.0.12\mongod.log

# Where and how to store data.
storage:
  dbPath: D:\laragon\data\mongodb

# how the process runs
processManagement:
  pidFilePath: mongod.pid

# network interfaces
net:
  port: 27017
  bindIp: 127.0.0.1



# Step 2: Setting Up MongoDB in MSYS2/UCRT64

To make MongoDB tools like mongod and mongosh available in the MSYS2/UCRT64 terminal, add the following to your .bashrc file:

```bash
export MONGO_HOME=$(cygpath -u "D:\laragon\bin\mongodb\mongodb-win32-x86_64-windows-7.0.12\bin")
export PATH="$MONGO_HOME:$PATH"
```

## Verify Installation

After adding the above to your `.bashrc`, restart your terminal or source the `.bashrc` file:

```bash
source ~/.bashrc
```

Then verify that the commands are available:

```bash
which mongod
which mongosh
```

Both commands should return paths like:

```bash
/d/laragon/bin/mongodb/mongodb-win32-x86_64-windows-7.0.12/bin/mongod
/d/laragon/bin/mongodb/mongodb-win32-x86_64-windows-7.0.12/bin/mongosh
```

# Step 3: Download and Add mongosh

Starting from MongoDB 6.0, mongo shell is replaced by mongosh. If mongosh is not included in your MongoDB installation, download it from [MongoDB Shell Downloads](https://www.mongodb.com/try/download/shell) and place it in the bin directory: `D:\laragon\bin\mongodb\mongodb-win32-x86_64-windows-7.0.12\bin\`


# Step 4: Start and test MongoDB connection

You can now start MongoDB from the Laragon GUI.

In the MSYS2 terminal, check for the connection:

```bash
$ mongosh
Current Mongosh Log ID: 66c8d151ee5fa582ea2710bb
Connecting to:          mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.3.0
Using MongoDB:          7.0.12
Using Mongosh:          2.3.0

For mongosh info see: https://www.mongodb.com/docs/mongodb-shell/


To help improve our products, anonymous usage data is collected and sent to MongoDB periodically (https://www.mongodb.com/legal/privacy-policy).
You can opt-out by running the disableTelemetry() command.

------
   The server generated these startup warnings when booting
   2024-08-23T22:07:49.944+04:00: Access control is not enabled for the database. Read and write access to data and configuration is unrestricted
------

test>
```


# Running the backend application

Make sure you're in the server/ directory and run:

```
nodemon index.js
```